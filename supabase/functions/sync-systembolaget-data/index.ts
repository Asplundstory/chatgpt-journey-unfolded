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

    console.log('Starting Systembolaget data sync (memory-optimized)...');

    // Fetch data from Systembolaget API
    const response = await fetch('https://susbolaget.emrik.org/v1/products');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Systembolaget API: ${response.status}`);
    }

    console.log('Parsing API response...');
    const products: SystembolagetProduct[] = await response.json();
    console.log(`Fetched ${products.length} products from Systembolaget`);

    // Be extremely selective to minimize memory usage - only premium wines
    console.log('Filtering for premium wines...');
    const wines = products.filter(product => {
      const isWine = product.categoryLevel1?.toLowerCase().includes('vin') && 
                     !product.categoryLevel1?.toLowerCase().includes('öl');
      const isPremium = product.price > 500; // Only expensive wines
      const hasAlcohol = product.alcoholPercentage && product.alcoholPercentage > 11;
      const hasProducer = product.producerName && product.producerName.length > 0;
      
      return isWine && isPremium && hasAlcohol && hasProducer;
    }).slice(0, 100); // Limit to only 100 wines

    console.log(`Filtered to ${wines.length} premium wine products`);

    // Process wines one by one to minimize memory usage
    let insertedCount = 0;
    const insertBatchSize = 10; // Very small batches

    for (let i = 0; i < wines.length; i += insertBatchSize) {
      const batch = wines.slice(i, i + insertBatchSize);
      
      // Process batch into wine records
      const wineRecords = batch.map(product => {
        const fullName = product.productNameThin 
          ? `${product.productNameBold} ${product.productNameThin}`
          : product.productNameBold;

        // Simple investment scoring
        let investmentScore = 6; // Start higher for premium wines
        if (product.price > 1000) investmentScore = 8;
        if (product.price > 2000) investmentScore = 9;
        if (product.price > 3000) investmentScore = 10;

        const baseReturn = Math.max(3, (product.price / 400) * 2);
        
        return {
          product_id: product.productId,
          name: fullName.substring(0, 200), // Limit string length
          producer: product.producerName?.substring(0, 100),
          category: product.categoryLevel1?.substring(0, 50),
          country: product.country?.substring(0, 50),
          region: (product.originLevel1 || product.originLevel2)?.substring(0, 100),
          vintage: product.vintage,
          alcohol_percentage: product.alcoholPercentage,
          price: product.price,
          description: (product.taste || product.usage)?.substring(0, 500),
          image_url: product.images?.[0]?.imageUrl?.substring(0, 500),
          assortment: product.assortmentText?.substring(0, 100),
          sales_start_date: product.productLaunchDate ? new Date(product.productLaunchDate).toISOString().split('T')[0] : null,
          investment_score: investmentScore,
          projected_return_1y: Math.round(baseReturn * 0.9 * 10) / 10,
          projected_return_3y: Math.round(baseReturn * 2.5 * 10) / 10,
          projected_return_5y: Math.round(baseReturn * 5.0 * 10) / 10,
          projected_return_10y: Math.round(baseReturn * 15 * 10) / 10,
          storage_time_months: product.vintage ? Math.max(24, (2025 - product.vintage) * 12) : 120,
          drinking_window_start: product.vintage ? product.vintage + 3 : 2026,
          drinking_window_end: product.vintage ? product.vintage + 20 : 2040,
          value_appreciation: Math.round((Math.random() * 12 + 5) * 10) / 10 // 5-17%
        };
      });

      // Insert this small batch
      console.log(`Inserting batch ${Math.floor(i / insertBatchSize) + 1} of ${Math.ceil(wines.length / insertBatchSize)}...`);
      
      const { data, error } = await supabaseClient
        .from('wines')
        .upsert(wineRecords, { 
          onConflict: 'product_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error inserting batch:`, error);
        throw error;
      }

      insertedCount += wineRecords.length;
      console.log(`Successfully inserted ${wineRecords.length} wines. Total: ${insertedCount}`);
      
      // Small delay to help with memory management
      if (i + insertBatchSize < wines.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Successfully synced ${insertedCount} premium wines to database`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} premium wines from Systembolaget`,
        totalProducts: products.length,
        winesFound: wines.length,
        winesInserted: insertedCount,
        note: "Limited to 100 premium wines (>500kr) for optimal performance"
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
        error: errorMessage,
        details: "Memory-optimized version failed. Try again or contact support."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})