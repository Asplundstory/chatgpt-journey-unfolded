import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VinmonopoletProduct {
  basic: {
    productId: string;
    productShortName: string;
    productLongName?: string;
    volume?: number;
    alcoholContent?: number;
    vintage?: number;
    productSelection?: string;
  };
  origins?: {
    origin?: {
      country?: string;
      region?: string;
      subRegion?: string;
    };
  };
  classification?: {
    mainProductType?: string;
    mainProductTypeName?: string;
    subProductType?: string;
    subProductTypeName?: string;
  };
  description?: {
    characteristics?: {
      description?: string;
    };
  };
  prices?: {
    salesPrice?: number;
  };
  assortment?: {
    assortmentText?: string;
  };
  distributors?: {
    distributorName?: string;
  };
}

function generateInvestmentMetrics(product: VinmonopoletProduct) {
  const price = product.prices?.salesPrice || 0;
  const age = product.basic.vintage ? new Date().getFullYear() - product.basic.vintage : 0;
  
  // Simple scoring algorithm based on price, age, and type
  let baseScore = Math.min(Math.floor(price / 100), 10);
  const ageBonus = Math.min(Math.floor(age / 2), 3);
  const investmentScore = Math.min(baseScore + ageBonus, 10);
  
  return {
    investment_score: investmentScore,
    projected_return_1y: investmentScore * 0.8,
    projected_return_3y: investmentScore * 2.2,
    projected_return_5y: investmentScore * 4.5,
    projected_return_10y: investmentScore * 12.0,
    storage_time_months: age > 5 ? 120 : 60,
    drinking_window_start: product.basic.vintage ? product.basic.vintage + 3 : null,
    drinking_window_end: product.basic.vintage ? product.basic.vintage + 20 : null,
  };
}

async function processProducts(supabase: any, products: VinmonopoletProduct[]) {
  console.log(`Processing ${products.length} products from Vinmonopolet`);
  
  // Filter for wines only using the correct nested structure
  const wines = products.filter(product => {
    const mainType = (product.classification?.mainProductTypeName || '').toLowerCase();
    const subType = (product.classification?.subProductTypeName || '').toLowerCase();
    
    return mainType.includes('vin') || 
           mainType.includes('wine') || 
           subType.includes('rød') || 
           subType.includes('hvit') || 
           subType.includes('musserende') ||
           subType.includes('rødvin') ||
           subType.includes('hvitvin') ||
           subType.includes('rosevin');
  });
  
  console.log(`Found ${wines.length} wine products`);
  
  if (wines.length === 0) {
    return { success: true, message: 'No wines found in this batch', wines_inserted: 0 };
  }
  
  // First remove duplicates from the wines array by productId
  const uniqueProductIds = new Set<string>();
  const uniqueWineProducts = wines.filter(product => {
    const id = product.basic.productId;
    if (uniqueProductIds.has(id)) {
      return false;
    }
    uniqueProductIds.add(id);
    return true;
  });
  
  console.log(`Removed ${wines.length - uniqueWineProducts.length} duplicate products`);
  
  // Transform to our database schema
  const winesForDb = uniqueWineProducts.map(product => {
    const metrics = generateInvestmentMetrics(product);
    
    return {
      product_id: `VM${product.basic.productId}`,
      name: product.basic.productLongName || product.basic.productShortName || 'Unnamed Wine',
      producer: product.distributors?.distributorName || null,
      category: product.classification?.subProductTypeName || product.classification?.mainProductTypeName || 'Vin',
      country: product.origins?.origin?.country || null,
      region: product.origins?.origin?.region || product.origins?.origin?.subRegion || null,
      vintage: product.basic.vintage || null,
      alcohol_percentage: product.basic.alcoholContent || null,
      price: product.prices?.salesPrice || 0,
      description: product.description?.characteristics?.description || null,
      assortment: product.assortment?.assortmentText || 'Ukjent',
      source_country: 'NO',
      source_monopoly: 'Vinmonopolet',
      currency: 'NOK',
      external_product_url: `https://www.vinmonopolet.no/p/${product.basic.productId}`,
      ...metrics,
    };
  });
  
  console.log(`Inserting ${winesForDb.length} unique wines into database`);
  
  // Upsert wines to database
  const { data, error } = await supabase
    .from('wines')
    .upsert(winesForDb, {
      onConflict: 'product_id',
      ignoreDuplicates: false 
    })
    .select();
  
  if (error) {
    console.error('Error inserting wines:', error);
    throw error;
  }
  
  console.log(`Successfully inserted ${winesForDb.length} wines from Vinmonopolet`);
  
  return {
    success: true,
    wines_inserted: winesForDb.length,
    data
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vinmonopoletApiKey = Deno.env.get('VINMONOPOLET_API_KEY');
    
    if (!vinmonopoletApiKey) {
      throw new Error('VINMONOPOLET_API_KEY not found in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting Vinmonopolet data sync...');
    console.log('API Key present:', !!vinmonopoletApiKey);
    
    // Create sync status record
    const { data: syncRecord, error: syncError } = await supabase
      .from('sync_status')
      .insert({
        sync_type: 'vinmonopolet',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (syncError) {
      console.error('Error creating sync record:', syncError);
    } else {
      console.log('Created sync record:', syncRecord?.id);
    }
    
    // Fetch products from Vinmonopolet API
    console.log('Fetching products from Vinmonopolet API...');
    
    // Use the correct endpoint from API documentation
    // This endpoint returns master data on products in basic, one lot, test and ordering ranges
    // Updated approx 05:45 AM CET every day
    const apiUrl = 'https://apis.vinmonopolet.no/products/v0/details-normal';
    
    console.log('Using endpoint:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': vinmonopoletApiKey,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vinmonopolet API error:', response.status, errorText);
      throw new Error(`Vinmonopolet API returned ${response.status}: ${errorText}`);
    }
    
    const products: VinmonopoletProduct[] = await response.json();
    console.log(`Fetched ${products.length} total products from Vinmonopolet`);
    
    // Process all products
    const result = await processProducts(supabase, products);
    
    // Update sync status
    if (syncRecord) {
      await supabase
        .from('sync_status')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_products: products.length,
          wines_inserted: result.wines_inserted,
        })
        .eq('id', syncRecord.id);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${result.wines_inserted} wines from Vinmonopolet`,
        total_products: products.length,
        wines_inserted: result.wines_inserted,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in Vinmonopolet sync:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
