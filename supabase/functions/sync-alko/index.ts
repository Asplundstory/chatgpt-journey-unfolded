import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlkoProduct {
  id: string;
  name: string;
  producer: string;
  volume: string;
  price: string;
  pricePerLiter: string;
  isNew: string;
  categoryCode: string;
  type: string;
  specialGroup: string;
  country: string;
  region: string;
  vintage: string;
  grapes: string;
  description: string;
  alcoholPercentage: string;
  selection: string;
}

function parseAlkoTextFile(text: string): AlkoProduct[] {
  const lines = text.split('\n');
  const products: AlkoProduct[] = [];
  
  // Skip first 2 lines (headers)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split('\t');
    if (parts.length < 10) continue;
    
    products.push({
      id: parts[0] || '',
      name: parts[1] || '',
      producer: parts[2] || '',
      volume: parts[3] || '',
      price: parts[4] || '',
      pricePerLiter: parts[5] || '',
      isNew: parts[6] || '',
      categoryCode: parts[7] || '',
      type: parts[8] || '',
      specialGroup: parts[9] || '',
      country: parts[10] || '',
      region: parts[11] || '',
      vintage: parts[12] || '',
      grapes: parts[16] || '',
      description: parts[17] || '',
      alcoholPercentage: parts[20] || '',
      selection: parts[28] || ''
    });
  }
  
  return products;
}

function generateInvestmentMetrics(product: AlkoProduct) {
  const price = parseFloat(product.price.replace(',', '.')) || 0;
  const vintage = parseInt(product.vintage) || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - vintage;

  let investmentScore = Math.floor(Math.random() * 3) + 6;
  
  if (price > 50) investmentScore += 1;
  if (price > 100) investmentScore += 1;
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
    value_appreciation: Math.random() * 15 + 3
  };
}

async function processProductBatch(supabase: any, products: AlkoProduct[], syncId: string) {
  console.log(`Processing batch of ${products.length} Alko products...`);
  
  // Filter for wine products only
  const wineProducts = products.filter(product => {
    const type = product.type?.toLowerCase() || '';
    return type.includes('viini') || type.includes('wine') || 
           type.includes('punaviini') || type.includes('valkoviini') ||
           type.includes('roseeviini') || type.includes('kuohuviini');
  });

  console.log(`Found ${wineProducts.length} wine products in this batch`);

  if (wineProducts.length === 0) {
    return 0;
  }

  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < wineProducts.length; i += batchSize) {
    const batch = wineProducts.slice(i, i + batchSize);
    
    const transformedWines = batch.map(product => {
      const metrics = generateInvestmentMetrics(product);
      const price = parseFloat(product.price.replace(',', '.')) || 0;
      const alcoholPercentage = parseFloat(product.alcoholPercentage.replace(',', '.')) || null;
      const vintage = parseInt(product.vintage) || null;
      
      return {
        product_id: `ALKO-${product.id}`,
        name: product.name,
        producer: product.producer,
        category: product.type,
        country: product.country,
        region: product.region,
        vintage: vintage,
        alcohol_percentage: alcoholPercentage,
        price: price,
        description: product.description || null,
        source_monopoly: 'Alko',
        currency: 'EUR',
        source_country: 'FI',
        assortment: product.selection,
        ...metrics
      };
    });

    try {
      const { error } = await supabase
        .from('wines')
        .upsert(transformedWines, { onConflict: 'product_id' });

      if (error) {
        console.error('Error inserting Alko wines:', error);
        continue;
      }

      totalInserted += transformedWines.length;
      console.log(`Inserted ${transformedWines.length} Alko wines. Total: ${totalInserted}`);
    } catch (error) {
      console.error('Error processing Alko batch:', error);
    }
  }

  return totalInserted;
}

async function performSync(supabase: any, syncId: string) {
  try {
    await supabase
      .from('sync_status')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    console.log('Fetching Alko product data...');
    
    // Try current date-based URL format used by Alko
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    
    // Generate URLs for current date and previous few days
    const urls: string[] = [];
    for (let daysBack = 0; daysBack < 7; daysBack++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - daysBack);
      const d = checkDate.getDate();
      const m = checkDate.getMonth() + 1;
      urls.push(`https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Muut%20ladattavat%20tiedostot/Hinnastot/alkon-hinnasto-tekstitiedostona-${d}-${m}.txt`);
    }
    
    let allProducts: AlkoProduct[] = [];
    let fetchSuccess = false;
    
    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.log(`Failed with status: ${response.status}`);
          continue;
        }
        
        const text = await response.text();
        allProducts = parseAlkoTextFile(text);
        
        if (allProducts.length > 0) {
          console.log(`Successfully fetched ${allProducts.length} products from ${url}`);
          fetchSuccess = true;
          break;
        }
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
      }
    }
    
    if (!fetchSuccess || allProducts.length === 0) {
      throw new Error('Failed to fetch Alko product data. The file might have been moved or the date format changed.');
    }

    await supabase
      .from('sync_status')
      .update({
        total_products: allProducts.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    const totalInserted = await processProductBatch(supabase, allProducts, syncId);

    await supabase
      .from('sync_status')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        wines_inserted: totalInserted,
        processed_products: allProducts.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', syncId);

    console.log('Alko sync completed successfully!');
    return {
      success: true,
      message: `Alko sync completed: ${totalInserted} wines inserted`,
      total_products: allProducts.length,
      wines_inserted: totalInserted
    };

  } catch (error) {
    console.error('Error during Alko sync:', error);
    
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Alko sync initiated');

    const { data: syncRecord, error: syncError } = await supabase
      .from('sync_status')
      .insert({
        sync_type: 'alko_import',
        status: 'running'
      })
      .select()
      .single();

    if (syncError || !syncRecord) {
      throw new Error(`Failed to create sync record: ${syncError?.message}`);
    }

    console.log(`Created sync record: ${syncRecord.id}`);

    performSync(supabase, syncRecord.id).catch(error => {
      console.error('Background Alko sync failed:', error);
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Alko sync started in background',
      syncId: syncRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting Alko sync:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
