import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SystembolagetProduct {
  productId: string;
  productNumber: string;
  productNameBold: string;
  productNameThin?: string;
  categoryLevel1?: string;
  categoryLevel2?: string;
  categoryLevel3?: string;
  producerName?: string;
  country?: string;
  originLevel1?: string;
  originLevel2?: string;
  vintage?: number;
  alcoholPercentage?: number;
  price: number;
  taste?: string;
  usage?: string;
  assortmentText?: string;
  productLaunchDate?: string;
  images?: { imageUrl: string }[];
  volumeText?: string;
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

    console.log('Starting Systembolaget data sync...');

    // Fetch data from Systembolaget API with streaming
    const response = await fetch('https://susbolaget.emrik.org/v1/products');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Systembolaget API: ${response.status}`);
    }

    const products: SystembolagetProduct[] = await response.json();
    console.log(`Fetched ${products.length} products from Systembolaget`);

    // Filter for wines and interesting products - be more selective to reduce memory usage
    const wines = products.filter(product => {
      const isWine = product.categoryLevel1?.toLowerCase().includes('vin') ||
                     product.categoryLevel1?.toLowerCase().includes('mousserande');
      const isExpensive = product.price > 300; // Focus on investment-worthy wines
      const hasVintage = product.vintage && product.vintage > 2000;
      
      return isWine && isExpensive && product.alcoholPercentage && product.alcoholPercentage > 10;
    }).slice(0, 500); // Limit to 500 wines initially to avoid memory issues

    console.log(`Filtered to ${wines.length} wine products`);

    // Process wines in smaller batches to avoid memory issues
    const wineRecords = [];
    const batchSize = 50;

    for (let i = 0; i < wines.length; i += batchSize) {
      const batch = wines.slice(i, i + batchSize);
      
      const processedBatch = batch.map(product => {
        const fullName = product.productNameThin 
          ? `${product.productNameBold} ${product.productNameThin}`
          : product.productNameBold;

        // Generate simple investment metrics based on price and category
        let investmentScore = 5;
        if (product.price > 1000) investmentScore = 8;
        if (product.price > 2000) investmentScore = 9;
        if (product.categoryLevel3?.toLowerCase().includes('premier') || 
            product.categoryLevel3?.toLowerCase().includes('grand')) investmentScore += 1;

        const baseReturn = Math.max(2, (product.price / 500) * 2);
        
        return {
          product_id: product.productId,
          name: fullName,
          producer: product.producerName,
          category: product.categoryLevel1,
          country: product.country,
          region: product.originLevel1 || product.originLevel2,
          vintage: product.vintage,
          alcohol_percentage: product.alcoholPercentage,
          price: product.price,
          description: product.taste || product.usage,
          image_url: product.images?.[0]?.imageUrl,
          assortment: product.assortmentText,
          sales_start_date: product.productLaunchDate ? new Date(product.productLaunchDate).toISOString().split('T')[0] : null,
          investment_score: Math.min(10, investmentScore),
          projected_return_1y: Math.round(baseReturn * 0.8 * 10) / 10,
          projected_return_3y: Math.round(baseReturn * 2.2 * 10) / 10,
          projected_return_5y: Math.round(baseReturn * 4.5 * 10) / 10,
          projected_return_10y: Math.round(baseReturn * 12 * 10) / 10,
          storage_time_months: product.vintage ? Math.max(12, (2025 - product.vintage) * 12) : 60,
          drinking_window_start: product.vintage ? product.vintage + 2 : 2025,
          drinking_window_end: product.vintage ? product.vintage + 15 : 2035,
          value_appreciation: Math.round((Math.random() * 15 + 2) * 10) / 10
        };
      });

      wineRecords.push(...processedBatch);
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, total processed: ${wineRecords.length}`);
    }

    // Insert wines in smaller batches
    let insertedCount = 0;
    const insertBatchSize = 25; // Smaller batch size for inserts

    for (let i = 0; i < wineRecords.length; i += insertBatchSize) {
      const batch = wineRecords.slice(i, i + insertBatchSize);
      
      const { data, error } = await supabaseClient
        .from('wines')
        .upsert(batch, { 
          onConflict: 'product_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / insertBatchSize) + 1}:`, error);
        throw error;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / insertBatchSize) + 1}, total: ${insertedCount} wines`);
    }

    console.log(`Successfully synced ${insertedCount} wines to database`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} investment-worthy wines from Systembolaget`,
        totalProducts: products.length,
        winesFound: wines.length,
        winesInserted: insertedCount,
        note: "Limited to 500 premium wines (>300kr) to optimize performance"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error syncing Systembolaget data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})