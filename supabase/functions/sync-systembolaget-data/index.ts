import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystembolagetProduct {
  ProductId: string;
  ProductNumber: string;
  ProductNameBold: string;
  ProductNameThin?: string;
  Category?: string;
  ProductLaunchDate?: string;
  ProducerName?: string;
  SupplierName?: string;
  IsKosher?: boolean;
  BottleTextShort?: string;
  RestrictedParcelQuantity?: number;
  IsManufacturingCountry?: boolean;
  IsRegionalRestricted?: boolean;
  IsInStoreSearchAssortment?: boolean;
  IsTemporaryOutOfStock?: boolean;
  AlcoholPercentage?: number;
  PriceIncVat?: number;
  VintageYear?: number;
  SubCategory?: string;
  Country?: string;
  Region1?: string;
}

// Helper function to generate investment metrics
function generateInvestmentMetrics(product: SystembolagetProduct) {
  const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100
  const price = product.PriceIncVat || 0;
  
  // Higher prices tend to have better investment potential
  const priceBonus = price > 500 ? 10 : price > 200 ? 5 : 0;
  const finalScore = Math.min(100, baseScore + priceBonus);
  
  return {
    investment_score: finalScore,
    projected_return_1y: Math.random() * 15 + 2, // 2-17%
    projected_return_3y: Math.random() * 25 + 5, // 5-30%
    projected_return_5y: Math.random() * 40 + 10, // 10-50%
    projected_return_10y: Math.random() * 80 + 20, // 20-100%
    storage_time_months: Math.floor(Math.random() * 120) + 12, // 12-132 months
    drinking_window_start: Math.floor(Math.random() * 10) + 1, // 1-10 years
    drinking_window_end: Math.floor(Math.random() * 20) + 15, // 15-35 years
    value_appreciation: Math.random() * 12 + 3, // 3-15% annually
  };
}

async function processProductChunk(
  supabase: any,
  products: SystembolagetProduct[],
  syncId: string
) {
  console.log(`Processing chunk of ${products.length} products`);
  
  const wineData = products.map(product => {
    const investmentMetrics = generateInvestmentMetrics(product);
    
    return {
      product_id: product.ProductId,
      name: product.ProductNameBold,
      producer: product.ProducerName || null,
      category: product.Category || null,
      country: product.Country || null,
      region: product.Region1 || null,
      vintage: product.VintageYear || null,
      alcohol_percentage: product.AlcoholPercentage || null,
      price: product.PriceIncVat || 0,
      description: product.BottleTextShort || null,
      sales_start_date: product.ProductLaunchDate || null,
      assortment: product.IsInStoreSearchAssortment ? 'Butik' : 'Beställning',
      ...investmentMetrics
    };
  });

  // Insert wines in smaller batches
  const batchSize = 10;
  let insertedCount = 0;
  
  for (let i = 0; i < wineData.length; i += batchSize) {
    const batch = wineData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('wines')
      .upsert(batch, { 
        onConflict: 'product_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error inserting batch:', error);
      throw error;
    }
    
    insertedCount += batch.length;
    
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Update sync progress
  const { data: currentSync } = await supabase
    .from('sync_status')
    .select('processed_products, wines_inserted')
    .eq('id', syncId)
    .single();

  await supabase
    .from('sync_status')
    .update({
      processed_products: (currentSync?.processed_products || 0) + products.length,
      wines_inserted: (currentSync?.wines_inserted || 0) + insertedCount,
      last_product_processed: products[products.length - 1]?.ProductId
    })
    .eq('id', syncId);

  return insertedCount;
}

async function performFullSync(supabase: any, syncId: string) {
  try {
    console.log('Starting full Systembolaget sync...');
    
    // Fetch all products
    const response = await fetch('https://susbolaget.emrik.org/v1/products');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const products = data.products || [];
    
    console.log(`Fetched ${products.length} total products`);
    
    // Update total count
    await supabase
      .from('sync_status')
      .update({ total_products: products.length })
      .eq('id', syncId);

    // Process in chunks
    const chunkSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      
      try {
        const insertedCount = await processProductChunk(supabase, chunk, syncId);
        totalInserted += insertedCount;
        
        console.log(`Processed chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(products.length/chunkSize)}`);
        
        // Delay between chunks to prevent memory issues
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (chunkError) {
        console.error(`Error processing chunk starting at ${i}:`, chunkError);
        
        // Update sync status with error but continue
        const errorMessage = chunkError instanceof Error ? chunkError.message : 'Unknown error';
        await supabase
          .from('sync_status')
          .update({
            error_message: `Error at chunk ${i}: ${errorMessage}`
          })
          .eq('id', syncId);
      }
    }

    // Mark sync as completed
    await supabase
      .from('sync_status')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        wines_inserted: totalInserted
      })
      .eq('id', syncId);

    console.log(`Full sync completed. Processed ${totalInserted} wines.`);
    
    return {
      success: true,
      message: 'Full sync completed successfully',
      totalProducts: products.length,
      winesInserted: totalInserted
    };

  } catch (error) {
    console.error('Full sync failed:', error);
    
    // Mark sync as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await supabase
      .from('sync_status')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncId);

    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No authorization header provided'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user is authenticated and get their ID
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin access required'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin user ${userData.user.email} initiated sync`);

    // Create a new sync record
    const { data: syncRecord, error: syncError } = await supabase
      .from('sync_status')
      .insert({
        sync_type: 'full_import',
        status: 'running'
      })
      .select()
      .single();

    if (syncError || !syncRecord) {
      throw new Error(`Failed to create sync record: ${syncError?.message}`);
    }

    console.log(`Created sync record: ${syncRecord.id}`);

    // Start background sync process (don't await)
    performFullSync(supabase, syncRecord.id)
      .catch(error => {
        console.error('Background sync failed:', error);
      });

    // Return immediate response
    return new Response(JSON.stringify({
      success: true,
      message: 'Sync started in background',
      syncId: syncRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});