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
  
  // Filter for wine products only
  const wineProducts = products.filter(product => {
    const cat1 = product.categoryLevel1?.toLowerCase() || '';
    const cat2 = product.categoryLevel2?.toLowerCase() || '';
    const cat3 = product.categoryLevel3?.toLowerCase() || '';
    
    return cat1.includes('vin') || 
           cat2.includes('rött') || cat2.includes('vitt') || 
           cat2.includes('rosé') || cat2.includes('mousserande') ||
           cat3.includes('rött') || cat3.includes('vitt') || 
           cat3.includes('rosé') || cat3.includes('mousserande');
  });

  console.log(`Found ${wineProducts.length} wine products in this chunk`);

  if (wineProducts.length === 0) {
    return 0;
  }

  // Process wines in smaller sub-batches to prevent memory buildup
  let totalInserted = 0;
  const subBatchSize = 50; // Optimized batch size
  
  for (let i = 0; i < wineProducts.length; i += subBatchSize) {
    const subBatch = wineProducts.slice(i, i + subBatchSize);
    
    // Transform products for database insertion
    const transformedWines = subBatch.map(product => {
      const reviewMatch = matchWineWithReviews(product);
      const metrics = generateInvestmentMetrics(product, reviewMatch);
      
      let description = `${product.taste || product.color || ''} ${product.style || ''}`.trim() || null;
      
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

    try {
      const { error } = await supabase
        .from('wines')
        .upsert(transformedWines, { onConflict: 'product_id' });

      if (error) {
        console.error('Error inserting wine sub-batch:', error);
        continue;
      }

      totalInserted += transformedWines.length;
      console.log(`Inserted sub-batch of ${transformedWines.length} wines. Running total: ${totalInserted}`);
      
      // Clear transformed data from memory
      transformedWines.length = 0;
      
    } catch (error) {
      console.error('Error processing wine sub-batch:', error);
    }
  }

  return totalInserted;
}

async function streamProcessProducts(supabase: any, syncId: string) {
  console.log('Starting memory-efficient wine data sync...');
  let totalWinesInserted = 0;
  let processedCount = 0;

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

    console.log('Testing API endpoints...');
    
    // Try multiple API endpoints with pagination support
    const endpoints = [
      {
        url: 'https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search',
        type: 'paginated' as const,
        params: { categoryLevel1: 'Vin', size: 1000 }
      },
      {
        url: 'https://raw.githubusercontent.com/AlexGustafsson/systembolaget-api-data/main/data/assortment.json',
        type: 'single' as const
      }
    ];

    let allProducts: SystembolagetProduct[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        if (endpoint.type === 'paginated') {
          console.log(`Trying paginated endpoint: ${endpoint.url}`);
          
          // Fetch multiple pages to get more products
          let page = 1;
          let hasMore = true;
          
          while (hasMore && page <= 10) { // Limit to 10 pages to prevent infinite loops
            const params = new URLSearchParams({
              ...Object.fromEntries(
                Object.entries(endpoint.params).map(([key, value]) => [key, String(value)])
              ),
              page: page.toString()
            });
            
            const response = await fetch(`${endpoint.url}?${params}`, {
              headers: {
                'User-Agent': 'WineInvestmentApp/1.0',
                'Accept': 'application/json'
              }
            });
            
            if (!response.ok) {
              console.log(`Page ${page} failed: ${response.status} ${response.statusText}`);
              break;
            }
            
            const data = await response.json();
            let pageProducts = [];
            
            if (data.productSearchResult && data.productSearchResult.products) {
              pageProducts = data.productSearchResult.products;
              hasMore = data.productSearchResult.totalPages > page;
            } else if (data.products && Array.isArray(data.products)) {
              pageProducts = data.products;
              hasMore = endpoint.params ? pageProducts.length === endpoint.params.size : false;
            }
            
            if (pageProducts.length === 0) {
              hasMore = false;
            } else {
              allProducts = allProducts.concat(pageProducts);
              console.log(`Page ${page}: ${pageProducts.length} products, total: ${allProducts.length}`);
              page++;
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          if (allProducts.length > 0) {
            successfulEndpoint = endpoint.url;
            console.log(`Successfully fetched ${allProducts.length} products from paginated endpoint`);
            break;
          }
          
        } else {
          console.log(`Trying single endpoint: ${endpoint.url}`);
          
          const response = await fetch(endpoint.url, {
            headers: {
              'User-Agent': 'WineInvestmentApp/1.0',
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.log(`Endpoint failed: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          
          // Handle different response structures
          if (Array.isArray(data)) {
            allProducts = data;
          } else if (data.products && Array.isArray(data.products)) {
            allProducts = data.products;
          } else if (data.data && Array.isArray(data.data)) {
            allProducts = data.data;
          } else {
            console.log('Unknown response structure:', Object.keys(data));
            continue;
          }
          
          if (allProducts.length > 0) {
            successfulEndpoint = endpoint.url;
            console.log(`Successfully fetched ${allProducts.length} products from ${endpoint.url}`);
            break;
          }
        }
        
      } catch (error) {
        console.log(`Error with endpoint ${endpoint.url}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    if (!allProducts || allProducts.length === 0) {
      throw new Error('No products found from any API endpoint');
    }

    const totalProductCount = allProducts.length;
    console.log(`Found ${totalProductCount} total products from ${successfulEndpoint}`);
    
    // Update sync status with total count
    await supabase
      .from('sync_status')
      .update({
        total_products: totalProductCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    // Process in smaller chunks to prevent memory issues
    const chunkSize = 100; // Optimized chunk size
    const chunks = Math.ceil(totalProductCount / chunkSize);
    
    for (let i = 0; i < totalProductCount; i += chunkSize) {
      const chunk = allProducts.slice(i, i + chunkSize);
      const chunkNum = Math.floor(i / chunkSize) + 1;
      
      console.log(`Processing chunk ${chunkNum}/${chunks} (${chunk.length} products)`);
      
      try {
        const insertedCount = await processProductChunk(supabase, chunk, syncId);
        totalWinesInserted += insertedCount;
        processedCount += chunk.length;
        
        // Update progress
        await supabase
          .from('sync_status')
          .update({
            processed_products: processedCount,
            wines_inserted: totalWinesInserted,
            last_product_processed: `Chunk ${chunkNum}/${chunks}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', syncId);
          
        console.log(`Progress: ${processedCount}/${totalProductCount} processed, ${totalWinesInserted} wines inserted`);
        
        // Memory cleanup break every 5 chunks
        if (chunkNum % 5 === 0) {
          console.log('Memory cleanup break...');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
      } catch (chunkError) {
        console.error(`Error processing chunk ${chunkNum}:`, chunkError);
        // Continue with next chunk instead of failing completely
        continue;
      }
    }

    return { totalProductCount, totalWinesInserted, processedCount };
    
  } catch (error) {
    console.error('Error in streamProcessProducts:', error);
    throw error;
  }
}

async function syncLaunchPlans(supabase: any) {
  console.log('Syncing launch plans...');
  
  try {
    // Try to fetch launch plans from Systembolaget
    const launchPlanEndpoints = [
      'https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?assortment=FS&size=1000',
      'https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?assortment=TSE&size=1000'
    ];
    
    let totalLaunches = 0;
    
    for (const endpoint of launchPlanEndpoints) {
      try {
        console.log(`Fetching launch plans from: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'WineInvestmentApp/1.0',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.log(`Launch plan endpoint failed: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        let products = [];
        
        if (data.productSearchResult && data.productSearchResult.products) {
          products = data.productSearchResult.products;
        } else if (data.products) {
          products = data.products;
        }
        
        // Transform to launch plans
        const launchPlans = products
          .filter((product: SystembolagetProduct) => product.saleStartDate && new Date(product.saleStartDate) > new Date())
          .map((product: SystembolagetProduct) => {
            const saleDate = new Date(product.saleStartDate);
            return {
              title: `${product.productNameThin || product.productNameBold} - ${product.producer}`,
              url: `https://www.systembolaget.se/produkt/${product.productId}`,
              date: product.saleStartDate,
              quarter: Math.ceil((saleDate.getMonth() + 1) / 3),
              year: saleDate.getFullYear()
            };
          });
        
        if (launchPlans.length > 0) {
          const { error } = await supabase
            .from('launch_plans')
            .upsert(launchPlans, { onConflict: 'url' });
          
          if (error) {
            console.error('Error inserting launch plans:', error);
          } else {
            totalLaunches += launchPlans.length;
            console.log(`Inserted ${launchPlans.length} launch plans`);
          }
        }
        
      } catch (error) {
        console.error('Error fetching launch plans:', error);
      }
    }
    
    return totalLaunches;
    
  } catch (error) {
    console.error('Error in syncLaunchPlans:', error);
    return 0;
  }
}

async function performFullSync(supabase: any, syncId: string) {
  try {
    const result = await streamProcessProducts(supabase, syncId);
    
    // Also sync launch plans
    console.log('Syncing launch plans...');
    const launchPlansCount = await syncLaunchPlans(supabase);

    // Mark sync as completed
    await supabase
      .from('sync_status')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        wines_inserted: result.totalWinesInserted,
        processed_products: result.processedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    console.log('Memory-efficient sync completed successfully!');
    return {
      success: true,
      message: `Sync completed: ${result.totalWinesInserted} wines and ${launchPlansCount} launch plans`,
      totalProducts: result.totalProductCount,
      winesInserted: result.totalWinesInserted,
      launchPlansInserted: launchPlansCount
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Sync initiated');

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

    // Start background sync process with better memory management
    performFullSync(supabase, syncRecord.id).catch(error => {
      console.error('Background sync failed:', error);
    });

    // Return immediate response
    return new Response(JSON.stringify({
      success: true,
      message: 'Memory-efficient sync started in background',
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