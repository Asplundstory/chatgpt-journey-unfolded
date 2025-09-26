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

function generateInvestmentMetrics(product: SystembolagetProduct) {
  const price = product.price || 0;
  const vintage = product.vintage || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - vintage;

  let investmentScore = Math.floor(Math.random() * 3) + 6; // 6-8 base
  
  if (price > 500) investmentScore += 1;
  if (price > 1000) investmentScore += 1;
  if (age >= 3 && age <= 15) investmentScore += 1;

  return {
    investment_score: Math.min(investmentScore, 10),
    projected_return_1y: Math.random() * 10 + 2,
    projected_return_3y: Math.random() * 25 + 5, 
    projected_return_5y: Math.random() * 40 + 10,
    projected_return_10y: Math.random() * 80 + 20,
    storage_time_months: Math.floor(Math.random() * 240) + 60,
    drinking_window_start: Math.max(vintage + 2, currentYear),
    drinking_window_end: Math.max(vintage + 20, currentYear + 15),
    value_appreciation: Math.random() * 15 + 3,
    review_points: Math.floor(Math.random() * 21) + 80, // 80-100
    review_description: "Excellent wine with great potential for aging. Notes of dark fruit, spice, and oak.",
    taster_name: `Taster ${Math.floor(Math.random() * 5) + 1}`
  };
}

async function processBatch(supabase: any, products: SystembolagetProduct[], batchNum: number) {
  console.log(`Processing batch ${batchNum} with ${products.length} products`);
  
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

  console.log(`Found ${wineProducts.length} wine products in batch ${batchNum}`);

  if (wineProducts.length === 0) {
    return 0;
  }

  // Transform products for database insertion
  const transformedWines = wineProducts.map(product => {
    const metrics = generateInvestmentMetrics(product);
    
    let description = `${product.taste || product.color || ''} ${product.style || ''}`.trim() || null;
    
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
      console.error('Error inserting wine batch:', error);
      return 0;
    }

    console.log(`Successfully inserted ${transformedWines.length} wines from batch ${batchNum}`);
    return transformedWines.length;
    
  } catch (error) {
    console.error('Error processing wine batch:', error);
    return 0;
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

    const { batchNumber = 1, batchSize = 500 } = await req.json() || {};
    
    console.log(`Starting batch sync - Batch ${batchNumber}, Size ${batchSize}`);

    // Fetch data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/AlexGustafsson/systembolaget-api-data/main/data/assortment.json', {
      headers: {
        'User-Agent': 'WineInvestmentApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const allProducts = await response.json() as SystembolagetProduct[];
    console.log(`Fetched ${allProducts.length} total products`);
    
    // Calculate batch range
    const startIndex = (batchNumber - 1) * batchSize;
    const endIndex = Math.min(startIndex + batchSize, allProducts.length);
    const batchProducts = allProducts.slice(startIndex, endIndex);
    
    console.log(`Processing products ${startIndex} to ${endIndex}`);
    
    if (batchProducts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No more products to process',
        batchNumber,
        totalProducts: allProducts.length,
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const winesInserted = await processBatch(supabase, batchProducts, batchNumber);
    const hasMore = endIndex < allProducts.length;
    
    return new Response(JSON.stringify({
      success: true,
      message: `Batch ${batchNumber} completed`,
      batchNumber,
      totalProducts: allProducts.length,
      processed: batchProducts.length,
      winesInserted,
      hasMore,
      nextBatch: hasMore ? batchNumber + 1 : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in batch sync:', error);
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