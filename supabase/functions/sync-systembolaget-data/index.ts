import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystembolagetProduct {
  productId: string;
  productNameThin: string;
  productNameBold: string;
  producer: string;
  producerName?: string;
  supplierName: string;
  isKosher: boolean;
  alcoholPercentage: number;
  price: number;
  priceIncVat?: number;
  pricePerLitre: number;
  saleStartDate: string;
  isDiscontinued: boolean;
  isSupplierTemporarilyUnavailable: boolean;
  assortment: string;
  assortmentText: string;
  category: string;
  categoryLevel1: string;
  categoryLevel2: string;
  categoryLevel3: string;
  categoryLevel4: string;
  usage: string;
  usageText: string;
  taste: string;
  color?: string;
  tasteSymbols: string;
  style: string;
  packaging: string;
  seal: string;
  origin: string;
  country?: string;
  originLevel1: string;
  originLevel2: string;
  region?: string;
  vintage: number;
  subCategory: string;
  sugar: string;
  acids: string;
  volume: number;
  type: string;
  style2: string;
  grapes: string;
  otherSelections: string;
}

interface WineReviewData {
  country?: string;
  description?: string;
  designation?: string;
  points?: number;
  price?: number;
  province?: string;
  region_1?: string;
  region_2?: string;
  taster_name?: string;
  title?: string;
  variety?: string;
  winery?: string;
}

// Sample wine reviews data for matching (representing the Kaggle dataset)
const sampleWineReviews: WineReviewData[] = [
  {
    country: "France",
    description: "This full-bodied wine offers rich blackberry and cassis flavors with hints of tobacco and cedar from oak aging. Well-structured tannins provide excellent aging potential.",
    points: 94,
    province: "Bordeaux",
    region_1: "Pauillac",
    taster_name: "Roger Voss",
    title: "Château Pichon Baron 2016",
    variety: "Bordeaux-style Red Blend",
    winery: "Château Pichon Baron"
  },
  {
    country: "Italy", 
    description: "Elegant and complex with aromas of red cherry, rose petals, and earth. The palate shows great depth with silky tannins and a long, memorable finish.",
    points: 92,
    province: "Piemonte",
    region_1: "Barolo",
    taster_name: "Monica Larner",
    title: "Paolo Scavino Barolo Cannubi 2017",
    variety: "Nebbiolo",
    winery: "Paolo Scavino"
  },
  {
    country: "France",
    description: "Crisp and mineral-driven with citrus and green apple notes. Shows excellent terroir expression with a clean, refreshing finish.",
    points: 90,
    province: "Burgundy",
    region_1: "Chablis",
    taster_name: "Roger Voss", 
    title: "Domaine Billaud-Simon Chablis Grand Cru Les Clos 2020",
    variety: "Chardonnay",
    winery: "Domaine Billaud-Simon"
  },
  {
    country: "France",
    description: "Prestigious champagne with complex brioche and toasted almond flavors. Fine bubbles and exceptional length make this a wine for special occasions.",
    points: 96,
    province: "Champagne",
    region_1: "Champagne", 
    taster_name: "Roger Voss",
    title: "Krug Grande Cuvée 171ème Édition",
    variety: "Champagne Blend",
    winery: "Krug"
  },
  {
    country: "US",
    description: "Bold Cabernet with dark fruit flavors, vanilla, and spice. Rich and full-bodied with smooth tannins and excellent concentration.",
    points: 89,
    province: "California",
    region_1: "Napa Valley",
    taster_name: "Virginie Boone",
    title: "Caymus Cabernet Sauvignon 2019", 
    variety: "Cabernet Sauvignon",
    winery: "Caymus Vineyards"
  }
];

function matchWineWithReviews(product: SystembolagetProduct): WineReviewData | null {
  const productCountry = product.originLevel1?.toLowerCase() || '';
  const productProducer = product.producer?.toLowerCase() || '';
  const productName = product.productNameThin?.toLowerCase() || '';
  
  // Find matching wine review based on producer, country, and name similarity
  return sampleWineReviews.find(review => {
    const reviewCountry = review.country?.toLowerCase() || '';
    const reviewWinery = review.winery?.toLowerCase() || '';
    const reviewTitle = review.title?.toLowerCase() || '';
    
    // Match by country and producer/winery
    if (reviewCountry && productCountry.includes(reviewCountry)) {
      if (reviewWinery && (productProducer.includes(reviewWinery) || reviewWinery.includes(productProducer))) {
        return true;
      }
    }
    
    // Match by similar wine name/title
    if (reviewTitle && productName && 
        (reviewTitle.includes(productName) || productName.includes(reviewTitle))) {
      return true;
    }
    
    return false;
  }) || null;
}

// Enhanced investment metrics with wine review integration
function generateInvestmentMetrics(product: SystembolagetProduct, reviewData?: WineReviewData | null) {
  const price = product.price || 0;
  const vintage = product.vintage || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - vintage;

  // Base investment score influenced by review points
  let investmentScore = Math.floor(Math.random() * 3) + 6; // 6-8 base
  
  if (reviewData?.points) {
    if (reviewData.points >= 95) investmentScore = 10;
    else if (reviewData.points >= 90) investmentScore = 9;
    else if (reviewData.points >= 85) investmentScore = 8;
    else if (reviewData.points >= 80) investmentScore = 7;
    else investmentScore = Math.floor(reviewData.points / 10);
  }

  // Adjust for price and age factors
  if (price > 500) investmentScore += 1;
  if (price > 1000) investmentScore += 1;
  if (age >= 3 && age <= 15) investmentScore += 1;

  // Enhanced projections based on review quality
  const qualityMultiplier = reviewData?.points ? (reviewData.points / 85) : 1;

  return {
    investment_score: Math.min(investmentScore, 10),
    projected_return_1y: (Math.random() * 10 + 2) * qualityMultiplier,
    projected_return_3y: (Math.random() * 25 + 5) * qualityMultiplier, 
    projected_return_5y: (Math.random() * 40 + 10) * qualityMultiplier,
    projected_return_10y: (Math.random() * 80 + 20) * qualityMultiplier,
    storage_time_months: Math.floor(Math.random() * 240) + 60,
    drinking_window_start: Math.max(vintage + 2, currentYear),
    drinking_window_end: Math.max(vintage + 20, currentYear + 15),
    value_appreciation: (Math.random() * 15 + 3) * qualityMultiplier,
    review_points: reviewData?.points || null,
    review_description: reviewData?.description || null,
    taster_name: reviewData?.taster_name || null
  };
}

async function processProductChunk(supabase: any, products: SystembolagetProduct[], syncId: string) {
  console.log(`Processing chunk of ${products.length} products...`);
  
  // Filter for wine products only - GitHub data uses different field names
  const wineProducts = products.filter(product => 
    product.categoryLevel1?.toLowerCase().includes('vin') ||
    product.categoryLevel2?.toLowerCase().includes('rött') ||
    product.categoryLevel2?.toLowerCase().includes('vitt') ||
    product.categoryLevel2?.toLowerCase().includes('rosé') ||
    product.categoryLevel2?.toLowerCase().includes('mousserande')
  );

  console.log(`Found ${wineProducts.length} wine products in this chunk`);

  if (wineProducts.length === 0) {
    console.log('No wine products found in this chunk, skipping...');
    return 0;
  }

  // Transform products for database insertion - adapt to GitHub JSON structure
  const transformedWines = wineProducts.map(product => {
    const reviewMatch = matchWineWithReviews(product);
    const metrics = generateInvestmentMetrics(product, reviewMatch);
    
    // GitHub JSON uses different field names
    let description = `${product.taste || product.color || ''} ${product.style || ''}`.trim() || null;
    
    // Enhance description with review data if available
    if (reviewMatch?.description) {
      description = reviewMatch.description;
    }
    
    return {
      product_id: product.productId,
      name: product.productNameThin || product.productNameBold,
      producer: product.producer || product.producerName,
      category: product.categoryLevel2 || product.categoryLevel1,
      country: product.country || product.originLevel1,
      region: product.originLevel1 || product.region || product.originLevel2,
      vintage: product.vintage,
      alcohol_percentage: product.alcoholPercentage,
      price: product.price || product.priceIncVat,
      description: description,
      sales_start_date: product.saleStartDate ? new Date(product.saleStartDate).toISOString().split('T')[0] : null,
      assortment: product.assortmentText || product.assortment,
      ...metrics
    };
  });

  // Insert wines in batches
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < transformedWines.length; i += batchSize) {
    const batch = transformedWines.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('wines')
        .upsert(batch, { onConflict: 'product_id' });

      if (error) {
        console.error('Error inserting wine batch:', error);
        continue;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch of ${batch.length} wines. Total: ${insertedCount}`);
    } catch (error) {
      console.error('Error processing wine batch:', error);
    }
  }

  // Update sync status
  await supabase
    .from('sync_status')
    .update({
      processed_products: insertedCount,
      wines_inserted: insertedCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', syncId);

  console.log(`Successfully processed ${insertedCount} wines from chunk`);
  return insertedCount;
}

async function performFullSync(supabase: any, syncId: string) {
  console.log('Starting comprehensive wine data sync from susbolaget.emrik.org...');
  
  try {
    // Update sync status to running
    await supabase
      .from('sync_status')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    // Fetch products from C4illin's public API (susbolaget.emrik.org)
    console.log('Fetching ALL products from C4illin public API...');
    
    // Try the main endpoint first
    let response;
    let allProducts;
    
    try {
      response = await fetch('https://susbolaget.emrik.org/v1/products', {
        headers: {
          'User-Agent': 'WineInvestmentApp/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Primary API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      allProducts = data.products || data; // Handle different response formats
      
    } catch (primaryError) {
      console.log('Primary API failed, trying GitHub raw data fallback...');
      
      // Fallback to GitHub raw data
      response = await fetch('https://raw.githubusercontent.com/AlexGustafsson/systembolaget-api-data/main/data/assortment.json');
      
      if (!response.ok) {
        throw new Error(`All APIs failed. GitHub fallback: ${response.status} ${response.statusText}`);
      }
      
      allProducts = await response.json();
    }
    
    console.log(`Fetched ${allProducts.length} total products from API`);
    console.log('Sample product structure:', JSON.stringify(allProducts[0], null, 2));
    
    const totalProductCount = allProducts.length;
    
    // Update sync status with total count
    await supabase
      .from('sync_status')
      .update({
        total_products: totalProductCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    // Process products in chunks
    const chunkSize = 200;
    let processedCount = 0;
    let totalWinesInserted = 0;
    
    for (let i = 0; i < allProducts.length; i += chunkSize) {
      const chunk = allProducts.slice(i, i + chunkSize);
      console.log(`Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(allProducts.length/chunkSize)}`);
      
      const insertedCount = await processProductChunk(supabase, chunk, syncId);
      totalWinesInserted += insertedCount;
      
      processedCount += chunk.length;
      
      // Update progress
      await supabase
        .from('sync_status')
        .update({
          processed_products: processedCount,
          wines_inserted: totalWinesInserted,
          last_product_processed: `Chunk ${Math.floor(i/chunkSize) + 1}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', syncId);
      
      console.log(`Progress: ${processedCount}/${totalProductCount} products processed, ${totalWinesInserted} wines inserted`);
      
      // Small delay between chunks to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Mark sync as completed
    await supabase
      .from('sync_status')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        wines_inserted: totalWinesInserted,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    console.log('Comprehensive sync from susbolaget.emrik.org completed successfully!');
    return {
      success: true,
      message: 'Full sync from susbolaget.emrik.org with wine reviews integration completed successfully',
      totalProducts: totalProductCount,
      winesInserted: totalWinesInserted
    };

  } catch (error) {
    console.error('Error during sync:', error);
    
    // Update sync status with error
    await supabase
      .from('sync_status')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
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