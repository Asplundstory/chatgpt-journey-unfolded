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

async function processProductBatch(
  supabase: any, 
  products: VinmonopoletProduct[], 
  syncId: string,
  batchNumber: number,
  totalBatches: number
): Promise<number> {
  console.log(`Processing batch ${batchNumber}/${totalBatches} with ${products.length} products`);
  
  if (products.length === 0) {
    return 0;
  }
  
  // Remove duplicates within batch
  const uniqueProductIds = new Set<string>();
  const uniqueWineProducts = products.filter(product => {
    const id = product.basic.productId;
    if (uniqueProductIds.has(id)) {
      return false;
    }
    uniqueProductIds.add(id);
    return true;
  });
  
  console.log(`Batch ${batchNumber}: Removed ${products.length - uniqueWineProducts.length} duplicates`);
  
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
  
  console.log(`Batch ${batchNumber}: Inserting ${winesForDb.length} wines`);
  
  // Upsert wines to database
  const { error } = await supabase
    .from('wines')
    .upsert(winesForDb, {
      onConflict: 'product_id',
      ignoreDuplicates: false 
    });
  
  if (error) {
    console.error(`Batch ${batchNumber} error:`, error);
    throw error;
  }
  
  // Update sync status
  await supabase
    .from('sync_status')
    .update({
      processed_products: batchNumber * 500,
      wines_inserted: batchNumber * 500,
      last_product_processed: winesForDb[winesForDb.length - 1]?.name || 'Unknown',
    })
    .eq('id', syncId);
  
  console.log(`Batch ${batchNumber}: Successfully processed ${winesForDb.length} wines`);
  
  return winesForDb.length;
}

async function processAllProducts(
  supabase: any, 
  products: VinmonopoletProduct[], 
  syncId: string
): Promise<{ total_inserted: number }> {
  console.log(`Starting batch processing of ${products.length} total products`);
  
  const BATCH_SIZE = 500;
  const batches = [];
  
  // Split products into batches
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    batches.push(products.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Created ${batches.length} batches of size ${BATCH_SIZE}`);
  
  let totalInserted = 0;
  
  // Process batches sequentially to avoid overwhelming the database
  for (let i = 0; i < batches.length; i++) {
    const inserted = await processProductBatch(
      supabase, 
      batches[i], 
      syncId, 
      i + 1, 
      batches.length
    );
    totalInserted += inserted;
  }
  
  console.log(`Finished processing all batches. Total wines inserted: ${totalInserted}`);
  
  return { total_inserted: totalInserted };
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
    
    // Update initial sync status
    if (syncRecord) {
      await supabase
        .from('sync_status')
        .update({
          total_products: products.length,
        })
        .eq('id', syncRecord.id);
    }
    
    // Process all products in batches
    const result = await processAllProducts(supabase, products, syncRecord.id);
    
    // Update final sync status
    if (syncRecord) {
      await supabase
        .from('sync_status')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          wines_inserted: result.total_inserted,
          processed_products: products.length,
        })
        .eq('id', syncRecord.id);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${result.total_inserted} wines from Vinmonopolet`,
        total_products: products.length,
        wines_inserted: result.total_inserted,
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
