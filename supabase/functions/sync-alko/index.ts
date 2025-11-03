import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlkoProduct {
  Numero: string;
  Nimi: string;
  Valmistaja: string;
  Pullokoko: string;
  Hinta: string;
  'Alkoholi-%': string;
  Tyyppi: string;
  Valmistusmaa: string;
  Alue: string;
  Vuosikerta: string;
  Luonnehdinta: string;
  Valikoima: string;
}

// Parse Alko TXT file (tab-delimited format)
function parseAlkoTxt(text: string): AlkoProduct[] {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Find header row (starts with "Numero")
    let headerIndex = -1;
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      if (lines[i].includes('Numero\t')) {
        headerIndex = i;
        break;
      }
    }
    
    if (headerIndex === -1) {
      console.error('Could not find header row in TXT file');
      return [];
    }
    
    const headers = lines[headerIndex].split('\t');
    const products: AlkoProduct[] = [];
    
    // Parse data rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      if (values.length < headers.length - 5) continue; // Skip invalid rows
      
      const product: any = {};
      headers.forEach((header, index) => {
        product[header] = values[index] || '';
      });
      
      products.push(product as AlkoProduct);
    }
    
    console.log(`Parsed ${products.length} products from Excel`);
    return products;
  } catch (error) {
    console.error('Error parsing Alko TXT file:', error);
    return [];
  }
}

function generateInvestmentMetrics(product: AlkoProduct) {
  const price = parseFloat(product.Hinta.replace(',', '.')) || 0;
  const vintage = parseInt(product.Vuosikerta) || new Date().getFullYear();
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
  
  // Filter for wines only and transform to database format
  const wineProducts = products
    .filter(p => {
      const categoryLower = (p.Tyyppi || '').toLowerCase();
      return categoryLower.includes('viini') || 
             categoryLower.includes('wine') ||
             categoryLower.includes('punaviinit') ||
             categoryLower.includes('valkoviinit') ||
             categoryLower.includes('roseeviinit') ||
             categoryLower.includes('kuohuviinit');
    })
    .map(product => {
      const vintage = product.Vuosikerta ? parseInt(product.Vuosikerta) : null;
      const price = parseFloat(product.Hinta.replace(',', '.'));
      const alcohol = product['Alkoholi-%'] ? parseFloat(product['Alkoholi-%'].replace(',', '.')) : null;
      
      return {
        product_id: `ALKO-${product.Numero}`,
        name: product.Nimi,
        producer: product.Valmistaja || null,
        category: product.Tyyppi || null,
        country: product.Valmistusmaa || null,
        region: product.Alue || null,
        vintage: vintage,
        alcohol_percentage: alcohol,
        price: price,
        description: product.Luonnehdinta || null,
        external_product_url: `https://www.alko.fi/tuotteet/${product.Numero}`,
        source_monopoly: 'Alko',
        source_country: 'FI',
        currency: 'EUR',
        assortment: product.Valikoima || null,
        ...generateInvestmentMetrics(product)
      };
    });

  console.log(`Found ${wineProducts.length} wine products to process`);

  if (wineProducts.length === 0) {
    return 0;
  }

  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < wineProducts.length; i += batchSize) {
    const batch = wineProducts.slice(i, i + batchSize);

    try {
      const { error } = await supabase
        .from('wines')
        .upsert(batch, { onConflict: 'product_id' });

      if (error) {
        console.error('Error inserting Alko wines:', error);
        continue;
      }

      totalInserted += batch.length;
      console.log(`Inserted ${batch.length} Alko wines. Total: ${totalInserted}`);
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
    
    // Use the TXT file URL (tab-delimited version)
    const url = 'https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Alkon%20Hinnasto%20Tekstitiedostona/alkon-hinnasto-tekstitiedostona.txt';
    
    console.log('Downloading TXT file from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download TXT file: ${response.status}`);
    }
    
    // Get the file as text (tab-delimited)
    const text = await response.text();
    const allProducts = parseAlkoTxt(text);
    
    if (allProducts.length === 0) {
      throw new Error('No products found in TXT file');
    }
    
    console.log(`Successfully parsed ${allProducts.length} products`);

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
