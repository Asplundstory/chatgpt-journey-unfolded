import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WineRecord {
  product_id: string;
  name: string;
  producer?: string;
  category?: string;
  country?: string;
  region?: string;
  vintage?: number;
  alcohol_percentage?: number;
  price: number;
  description?: string;
  image_url?: string;
  assortment?: string;
  sales_start_date?: string;
  investment_score?: number;
  projected_return_1y?: number;
  projected_return_3y?: number;
  projected_return_5y?: number;
  projected_return_10y?: number;
  storage_time_months?: number;
  drinking_window_start?: number;
  drinking_window_end?: number;
  value_appreciation?: number;
}

function processProduct(product: any): WineRecord | null {
  // Quick filter - only process wine products
  if (!product.categoryLevel1?.toLowerCase().includes('vin') || 
      !product.price || product.price < 200 || 
      !product.alcoholPercentage || product.alcoholPercentage < 10) {
    return null;
  }

  const fullName = product.productNameThin 
    ? `${product.productNameBold} ${product.productNameThin}`
    : product.productNameBold;

  // Simple investment scoring
  let investmentScore = 5;
  if (product.price > 800) investmentScore = 7;
  if (product.price > 1500) investmentScore = 8;
  if (product.price > 3000) investmentScore = 9;

  const baseReturn = Math.max(2, (product.price / 400) * 1.5);
  
  return {
    product_id: product.productId,
    name: fullName?.substring(0, 200) || 'Unknown Wine',
    producer: product.producerName?.substring(0, 100),
    category: product.categoryLevel1?.substring(0, 50),
    country: product.country?.substring(0, 50),
    region: (product.originLevel1 || product.originLevel2)?.substring(0, 100),
    vintage: product.vintage,
    alcohol_percentage: product.alcoholPercentage,
    price: product.price,
    description: (product.taste || product.usage)?.substring(0, 300),
    image_url: product.images?.[0]?.imageUrl?.substring(0, 300),
    assortment: product.assortmentText?.substring(0, 50),
    sales_start_date: product.productLaunchDate ? new Date(product.productLaunchDate).toISOString().split('T')[0] : undefined,
    investment_score: investmentScore,
    projected_return_1y: Math.round(baseReturn * 0.8 * 10) / 10,
    projected_return_3y: Math.round(baseReturn * 2.2 * 10) / 10,
    projected_return_5y: Math.round(baseReturn * 4.5 * 10) / 10,
    projected_return_10y: Math.round(baseReturn * 12 * 10) / 10,
    storage_time_months: product.vintage ? Math.max(12, (2025 - product.vintage) * 12) : 60,
    drinking_window_start: product.vintage ? product.vintage + 2 : 2025,
    drinking_window_end: product.vintage ? product.vintage + 15 : 2035,
    value_appreciation: Math.round((Math.random() * 15 + 2) * 10) / 10
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting chunked Systembolaget data sync...');

    // Fetch the data but process it in chunks to avoid memory issues
    console.log('Fetching from Systembolaget API...');
    const response = await fetch('https://susbolaget.emrik.org/v1/products');
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    console.log('Got response, parsing JSON...');
    const products = await response.json();
    console.log(`Got ${products.length} products, starting chunked processing...`);

    let totalProcessed = 0;
    let totalInserted = 0;
    const chunkSize = 500; // Process in chunks of 500 products
    const batchSize = 15; // Insert in batches of 15 wines

    // Process products in chunks to avoid memory buildup
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(products.length / chunkSize)}...`);
      
      const wineRecords: WineRecord[] = [];
      
      // Process this chunk
      for (const product of chunk) {
        totalProcessed++;
        const wineRecord = processProduct(product);
        if (wineRecord) {
          wineRecords.push(wineRecord);
        }
      }

      console.log(`Found ${wineRecords.length} wines in this chunk`);

      // Insert wines from this chunk in small batches
      for (let j = 0; j < wineRecords.length; j += batchSize) {
        const batch = wineRecords.slice(j, j + batchSize);
        
        const { error } = await supabaseClient
          .from('wines')
          .upsert(batch, { 
            onConflict: 'product_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Error inserting batch:', error);
          throw error;
        }

        totalInserted += batch.length;
        console.log(`Inserted batch of ${batch.length} wines. Total inserted: ${totalInserted}`);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clear chunk data from memory and add delay between chunks
      console.log(`Completed chunk ${Math.floor(i / chunkSize) + 1}, processed ${totalProcessed} total products`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Sync completed: ${totalInserted} wines inserted from ${totalProcessed} products`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalInserted} wines from Systembolaget`,
        totalProducts: totalProcessed,
        winesFound: totalInserted,
        winesInserted: totalInserted,
        processingMethod: "chunked processing"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error syncing data:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})