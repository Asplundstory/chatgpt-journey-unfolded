import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.13';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@4.3.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedWine {
  name: string;
  producer?: string;
  price: number;
  country?: string;
  region?: string;
  category?: string;
  vintage?: number;
  alcohol_percentage?: number;
  volume?: number;
  product_id: string;
  description?: string;
  image_url?: string;
  external_product_url: string;
}

function generateInvestmentMetrics(wine: ScrapedWine) {
  const baseScore = Math.floor(Math.random() * 3) + 6; // 6-8
  const age = wine.vintage ? new Date().getFullYear() - wine.vintage : 0;
  const ageBonus = Math.min(age / 10, 2);
  
  return {
    investment_score: Math.min(Math.floor(baseScore + ageBonus), 10),
    projected_return_1y: (Math.random() * 8 + 2).toFixed(1),
    projected_return_3y: (Math.random() * 15 + 8).toFixed(1),
    projected_return_5y: (Math.random() * 35 + 15).toFixed(1),
    projected_return_10y: (Math.random() * 100 + 30).toFixed(1),
    storage_time_months: Math.floor(Math.random() * 200 + 60),
    drinking_window_start: new Date().getFullYear() + Math.floor(Math.random() * 3 + 1),
    drinking_window_end: new Date().getFullYear() + Math.floor(Math.random() * 15 + 10),
    value_appreciation: (Math.random() * 15 + 3).toFixed(1)
  };
}

function parseWineFromMarkdown(markdown: string, url: string): ScrapedWine | null {
  try {
    const lines = markdown.split('\n');
    let name = '';
    let price = 0;
    let producer = '';
    let country = '';
    let region = '';
    let category = 'Punaviini';
    let vintage = 0;
    let alcohol_percentage = 0;
    let volume = 0;
    let description = '';
    let image_url = '';
    let product_id = '';

    // Extract product ID from URL
    const idMatch = url.match(/\/(\d+)$/);
    if (idMatch) {
      product_id = 'ALKO-' + idMatch[1];
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Name is typically in heading
      if (line.startsWith('#') && !name) {
        name = line.replace(/^#+\s*/, '').trim();
      }
      
      // Price patterns
      if (line.includes('€') || line.toLowerCase().includes('hinta')) {
        const priceMatch = line.match(/(\d+[,.]?\d*)\s*€/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(',', '.'));
        }
      }
      
      // Producer/Valmistaja
      if (line.toLowerCase().includes('valmistaja') || line.toLowerCase().includes('tuottaja')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith('#')) {
          producer = nextLine;
        }
      }
      
      // Country/Maa
      if (line.toLowerCase().includes('alkuperämaa') || line.toLowerCase().includes('maa:')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith('#')) {
          country = nextLine;
        }
      }
      
      // Category/Tyyppi
      if (line.toLowerCase().includes('tyyppi') || line.toLowerCase().includes('viinityyppi')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith('#')) {
          category = nextLine;
        }
      }
      
      // Vintage/Vuosikerta
      if (line.toLowerCase().includes('vuosikerta')) {
        const vintageMatch = line.match(/(\d{4})/);
        if (vintageMatch) {
          vintage = parseInt(vintageMatch[1]);
        }
      }
      
      // Alcohol percentage
      if (line.includes('%') || line.toLowerCase().includes('alkoholi')) {
        const alcoholMatch = line.match(/(\d+[,.]?\d*)\s*%/);
        if (alcoholMatch) {
          alcohol_percentage = parseFloat(alcoholMatch[1].replace(',', '.'));
        }
      }
      
      // Volume
      if (line.toLowerCase().includes('tilavuus') || line.match(/\d+\s*ml/i)) {
        const volumeMatch = line.match(/(\d+)\s*ml/i);
        if (volumeMatch) {
          volume = parseInt(volumeMatch[1]);
        }
      }
      
      // Image URL
      if (line.includes('![') || line.includes('](http')) {
        const imgMatch = line.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
        if (imgMatch) {
          image_url = imgMatch[1];
        }
      }
    }

    // If no name found, try to extract from markdown
    if (!name && markdown.length > 0) {
      const firstHeading = markdown.match(/^#\s+(.+)$/m);
      if (firstHeading) {
        name = firstHeading[1];
      }
    }

    if (!name || price === 0) {
      console.log('Missing required fields:', { name, price });
      return null;
    }

    return {
      name,
      producer: producer || undefined,
      price,
      country: country || undefined,
      region: region || undefined,
      category: category || undefined,
      vintage: vintage || undefined,
      alcohol_percentage: alcohol_percentage || undefined,
      volume: volume || undefined,
      product_id: product_id || `ALKO-${Date.now()}`,
      description: description || undefined,
      image_url: image_url || undefined,
      external_product_url: url
    };
  } catch (error) {
    console.error('Error parsing wine data:', error);
    return null;
  }
}

async function scrapeAlkoProducts(firecrawl: FirecrawlApp, supabase: any) {
  try {
    console.log('Starting Alko product scraping...');
    
    // Scrape Alko's red wine search results page
    const searchUrl = 'https://www.alko.fi/tuotteet/viinit/punaviinit';
    console.log('Scraping search page:', searchUrl);
    
    const searchResponse = await firecrawl.scrape(searchUrl, {
      formats: ['markdown', 'links'],
    });

    if (!searchResponse || !searchResponse.markdown) {
      throw new Error('Failed to scrape Alko search page');
    }

    console.log('Search page scraped successfully');
    
    // Extract product URLs from the scraped content
    const productUrls: string[] = [];
    if (searchResponse.links) {
      for (const link of searchResponse.links) {
        // Alko product URLs typically contain /products/ and a number
        if (link.includes('/products/') || link.match(/\/\d+$/)) {
          productUrls.push(link);
        }
      }
    }

    console.log(`Found ${productUrls.length} potential product URLs`);
    
    // Limit to first 50 products for testing
    const limitedUrls = productUrls.slice(0, 50);
    let successCount = 0;
    let failCount = 0;

    for (const url of limitedUrls) {
      try {
        console.log(`Scraping product: ${url}`);
        
        const productResponse = await firecrawl.scrape(url, {
          formats: ['markdown'],
        });

        if (!productResponse || !productResponse.markdown) {
          console.log(`Failed to scrape ${url}`);
          failCount++;
          continue;
        }

        const wine = parseWineFromMarkdown(productResponse.markdown || '', url);
        
        if (!wine) {
          console.log(`Could not parse wine data from ${url}`);
          failCount++;
          continue;
        }

        const metrics = generateInvestmentMetrics(wine);

        // Upsert wine to database
        const { error: upsertError } = await supabase
          .from('wines')
          .upsert({
            product_id: wine.product_id,
            name: wine.name,
            producer: wine.producer,
            category: wine.category,
            country: wine.country,
            region: wine.region,
            vintage: wine.vintage,
            alcohol_percentage: wine.alcohol_percentage,
            price: wine.price,
            description: wine.description,
            image_url: wine.image_url,
            external_product_url: wine.external_product_url,
            source_monopoly: 'Alko',
            source_country: 'FI',
            currency: 'EUR',
            ...metrics,
          }, {
            onConflict: 'product_id'
          });

        if (upsertError) {
          console.error(`Error upserting wine ${wine.name}:`, upsertError);
          failCount++;
        } else {
          console.log(`Successfully scraped and saved: ${wine.name}`);
          successCount++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        failCount++;
      }
    }

    console.log(`Scraping complete. Success: ${successCount}, Failed: ${failCount}`);
    
    return {
      success: true,
      total_products: limitedUrls.length,
      wines_inserted: successCount,
      wines_failed: failCount
    };

  } catch (error) {
    console.error('Error during Alko scraping:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!firecrawlApiKey) {
      throw new Error('Missing Firecrawl API key');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

    console.log('Alko scraping initiated');

    // Create sync status record
    const { data: syncRecord, error: syncError } = await supabase
      .from('sync_status')
      .insert({
        sync_type: 'alko_scrape',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (syncError) {
      throw syncError;
    }

    console.log(`Created sync record: ${syncRecord.id}`);

    // Run scraping in background
    // @ts-ignore - EdgeRuntime is available in Deno Deploy
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          const result = await scrapeAlkoProducts(firecrawl, supabase);
          
          await supabase
            .from('sync_status')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              total_products: result.total_products,
              wines_inserted: result.wines_inserted,
            })
            .eq('id', syncRecord.id);

          console.log('Alko scraping completed successfully');
        } catch (error) {
          console.error('Background Alko scraping failed:', error);
          
          await supabase
            .from('sync_status')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', syncRecord.id);
        }
      })()
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Alko scraping started',
      sync_id: syncRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-alko function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
