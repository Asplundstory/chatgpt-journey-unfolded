import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VinmonopoletProduct {
  productId: string;
  productName: string;
  productNameFull?: string;
  alcoholContent?: number;
  price?: number;
  country?: string;
  district?: string;
  subDistrict?: string;
  year?: number;
  productType?: string;
  productSubType?: string;
  productSelection?: string;
  description?: string;
  wholesaler?: string;
  distributor?: string;
  url?: string;
}

function generateInvestmentMetrics(product: VinmonopoletProduct) {
  const price = product.price || 0;
  const age = product.year ? new Date().getFullYear() - product.year : 0;
  
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
    drinking_window_start: product.year ? product.year + 3 : null,
    drinking_window_end: product.year ? product.year + 20 : null,
  };
}

async function processProducts(supabase: any, products: VinmonopoletProduct[]) {
  console.log(`Processing ${products.length} products from Vinmonopolet`);
  
  // Filter for wines only
  const wines = products.filter(product => 
    product.productType?.toLowerCase().includes('vin') ||
    product.productType?.toLowerCase().includes('wine') ||
    product.productSubType?.toLowerCase().includes('rød') ||
    product.productSubType?.toLowerCase().includes('hvit') ||
    product.productSubType?.toLowerCase().includes('musserende')
  );
  
  console.log(`Found ${wines.length} wine products`);
  
  if (wines.length === 0) {
    return { success: true, message: 'No wines found in this batch', wines_inserted: 0 };
  }
  
  // Transform to our database schema
  const winesForDb = wines.map(product => {
    const metrics = generateInvestmentMetrics(product);
    
    return {
      product_id: `VM${product.productId}`, // Prefix with VM for Vinmonopolet
      name: product.productName || product.productNameFull || 'Unnamed Wine',
      producer: product.wholesaler || product.distributor || null,
      category: product.productSubType || product.productType || 'Vin',
      country: product.country || null,
      region: product.district || product.subDistrict || null,
      vintage: product.year || null,
      alcohol_percentage: product.alcoholContent || null,
      price: product.price || 0,
      description: product.description || null,
      assortment: product.productSelection || 'Ukjent',
      source_country: 'NO',
      source_monopoly: 'Vinmonopolet',
      currency: 'NOK',
      external_product_url: product.url || null,
      ...metrics,
    };
  });
  
  console.log(`Inserting ${winesForDb.length} wines into database`);
  
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
    
    // Try the basic products endpoint
    const apiUrl = 'https://api.vinmonopolet.no/products';
    
    console.log('Trying endpoint:', apiUrl);
    
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
