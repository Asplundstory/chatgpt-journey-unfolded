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

    // Fetch data from Systembolaget API
    const response = await fetch('https://susbolaget.emrik.org/v1/products');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Systembolaget API: ${response.status}`);
    }

    const products: SystembolagetProduct[] = await response.json();
    console.log(`Fetched ${products.length} products from Systembolaget`);

    // Filter for wines and interesting products
    const wines = products.filter(product => 
      product.categoryLevel1?.toLowerCase().includes('vin') ||
      product.categoryLevel1?.toLowerCase().includes('mousserande') ||
      (product.price > 200 && product.alcoholPercentage && product.alcoholPercentage > 10)
    );

    console.log(`Filtered to ${wines.length} wine products`);

    const wineRecords = wines.map(product => {
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
        projected_return_1y: baseReturn * 0.8,
        projected_return_3y: baseReturn * 2.2,
        projected_return_5y: baseReturn * 4.5,
        projected_return_10y: baseReturn * 12,
        storage_time_months: product.vintage ? Math.max(12, (2025 - product.vintage) * 12) : 60,
        drinking_window_start: product.vintage ? product.vintage + 2 : 2025,
        drinking_window_end: product.vintage ? product.vintage + 15 : 2035,
        value_appreciation: Math.random() * 15 + 2 // Random between 2-17%
      };
    });

    // Insert wines in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < wineRecords.length; i += batchSize) {
      const batch = wineRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabaseClient
        .from('wines')
        .upsert(batch, { 
          onConflict: 'product_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${i / batchSize + 1}, total: ${insertedCount} wines`);
    }

    console.log(`Successfully synced ${insertedCount} wines to database`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} wines from Systembolaget`,
        totalProducts: products.length,
        winesFound: wines.length,
        winesInserted: insertedCount
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
});