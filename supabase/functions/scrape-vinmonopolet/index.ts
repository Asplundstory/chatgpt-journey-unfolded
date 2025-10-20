import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@4.3.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedWine {
  product_id: string;
  name: string;
  producer?: string;
  category?: string;
  country?: string;
  region?: string;
  vintage?: number;
  alcohol_percentage?: number;
  price: number;
  description?: string;
  assortment?: string;
}

function generateInvestmentMetrics(wine: ScrapedWine) {
  const price = wine.price || 0;
  const age = wine.vintage ? new Date().getFullYear() - wine.vintage : 0;
  
  let baseScore = Math.min(Math.floor(price / 100), 10);
  const ageBonus = Math.min(Math.floor(age / 2), 3);
  const investmentScore = Math.min(baseScore + ageBonus, 10);
  
  return {
    investment_score: investmentScore,
    projected_return_1y: investmentScore * 0.8,
    projected_return_3y: investmentScore * 2.2,
    projected_return_5y: investmentScore * 4.5,
    projected_return_10y: investmentScore * 12.0,
    storage_time_months: age > 5 ? 120 : 60,
    drinking_window_start: wine.vintage ? wine.vintage + 3 : null,
    drinking_window_end: wine.vintage ? wine.vintage + 20 : null,
  };
}

function parseWineFromMarkdown(markdown: string, url: string): ScrapedWine | null {
  try {
    // Extract product ID from URL
    const productIdMatch = url.match(/\/p\/(\d+)/);
    if (!productIdMatch) return null;
    
    const productId = `VM${productIdMatch[1]}`;
    
    // Extract wine name (usually in h1 or strong title)
    const nameMatch = markdown.match(/#{1,2}\s+([^\n]+)/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown Wine';
    
    // Extract price (looking for NOK or kr patterns)
    // Norwegian format uses comma as decimal separator and space/period as thousand separator
    const priceMatch = markdown.match(/(?:kr|NOK)\s*([0-9\s.]+[,.]?[0-9]{0,2})/i) || 
                       markdown.match(/([0-9\s.]+[,.]?[0-9]{0,2})\s*(?:kr|NOK)/i);
    let price = 0;
    if (priceMatch) {
      // Remove spaces and convert Norwegian decimal format (comma) to standard (dot)
      const cleanPrice = priceMatch[1]
        .replace(/\s/g, '')  // Remove spaces
        .replace(/\./g, '')  // Remove thousand separators (periods)
        .replace(',', '.');  // Convert decimal comma to dot
      price = parseFloat(cleanPrice) || 0;
    }
    
    // Extract country
    const countryMatch = markdown.match(/Land[:\s]+([^\n,]+)/i);
    const country = countryMatch ? countryMatch[1].trim() : undefined;
    
    // Extract region
    const regionMatch = markdown.match(/Region[:\s]+([^\n,]+)/i) || 
                       markdown.match(/Område[:\s]+([^\n,]+)/i);
    const region = regionMatch ? regionMatch[1].trim() : undefined;
    
    // Extract vintage
    const vintageMatch = markdown.match(/(?:Årgang|Vintage)[:\s]+(\d{4})/i) ||
                        markdown.match(/\b(19\d{2}|20[0-2]\d)\b/);
    const vintage = vintageMatch ? parseInt(vintageMatch[1]) : undefined;
    
    // Extract alcohol percentage
    const alcoholMatch = markdown.match(/(?:Alkohol|Alcohol)[:\s]+([0-9.]+)\s*%/i);
    const alcohol_percentage = alcoholMatch ? parseFloat(alcoholMatch[1]) : undefined;
    
    // Extract category/type
    const categoryMatch = markdown.match(/(?:Type|Varetype)[:\s]+([^\n,]+)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : 'Vin';
    
    // Extract producer
    const producerMatch = markdown.match(/(?:Produsent|Producer)[:\s]+([^\n,]+)/i);
    const producer = producerMatch ? producerMatch[1].trim() : undefined;
    
    // Extract description (first paragraph after title)
    const descMatch = markdown.match(/#{1,2}\s+[^\n]+\n+([^\n]{50,})/);
    const description = descMatch ? descMatch[1].trim().substring(0, 500) : undefined;
    
    return {
      product_id: productId,
      name,
      producer,
      category,
      country,
      region,
      vintage,
      alcohol_percentage,
      price,
      description,
      assortment: 'Sortiment',
    };
  } catch (error) {
    console.error('Error parsing wine from markdown:', error);
    return null;
  }
}

async function scrapeVinmonopoletProducts(firecrawl: any, supabase: any) {
  console.log('Starting Vinmonopolet product scraping...');
  
  // Scrape the main wine listing page
  const searchUrl = 'https://www.vinmonopolet.no/search?q=:relevance:mainCategory:rødvin';
  
  console.log('Scraping search page:', searchUrl);
  const searchResponse = await firecrawl.scrape(searchUrl, {
    formats: ['markdown', 'links'],
  }) as any;
  
  console.log('Search response structure:', Object.keys(searchResponse));
  
  // Firecrawl v4 returns data directly, not wrapped in success
  if (!searchResponse.markdown && !searchResponse.data) {
    console.error('Firecrawl error:', searchResponse);
    throw new Error(`Failed to scrape Vinmonopolet search page: No markdown data received`);
  }
  
  // Extract product URLs from the search results
  const productUrls: string[] = [];
  const links = searchResponse.links || searchResponse.data?.links || [];
  
  for (const link of links) {
    if (link.includes('/p/') && link.includes('vinmonopolet.no')) {
      productUrls.push(link);
    }
  }
  
  console.log(`Found ${productUrls.length} product URLs to scrape`);
  
  // Limit to first 10 products to avoid edge function timeouts
  const limitedUrls = productUrls.slice(0, 10);
  const scrapedWines: ScrapedWine[] = [];
  
  // Scrape individual product pages
  for (const url of limitedUrls) {
    try {
      console.log('Scraping product:', url);
      const productResponse = await firecrawl.scrape(url, {
        formats: ['markdown'],
        timeout: 15000, // 15 second timeout
      }) as any;
      
      const markdown = productResponse.markdown || productResponse.data?.markdown;
      if (markdown) {
        const wine = parseWineFromMarkdown(markdown, url);
        if (wine && wine.price > 0) {
          scrapedWines.push(wine);
        }
      }
      
      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      // Continue with next product even if this one fails
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
  }
  
  console.log(`Successfully scraped ${scrapedWines.length} wines`);
  
  // Transform and insert into database
  const winesForDb = scrapedWines.map(wine => {
    const metrics = generateInvestmentMetrics(wine);
    
    return {
      ...wine,
      source_country: 'NO',
      source_monopoly: 'Vinmonopolet',
      currency: 'NOK',
      external_product_url: `https://www.vinmonopolet.no/p/${wine.product_id.replace('VM', '')}`,
      ...metrics,
    };
  });
  
  // Upsert wines to database
  const { data, error } = await supabase
    .from('wines')
    .upsert(winesForDb, {
      onConflict: 'product_id',
      ignoreDuplicates: false,
    })
    .select();
  
  if (error) {
    console.error('Error inserting wines:', error);
    throw error;
  }
  
  console.log(`Successfully inserted ${winesForDb.length} wines from Vinmonopolet`);
  
  return {
    success: true,
    wines_inserted: winesForDb.length,
    data,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not found in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
    
    console.log('Starting Vinmonopolet scraping with Firecrawl...');
    
    // Create sync status record
    const { data: syncRecord, error: syncError } = await supabase
      .from('sync_status')
      .insert({
        sync_type: 'vinmonopolet_scrape',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (syncError) {
      console.error('Error creating sync record:', syncError);
    } else {
      console.log('Created sync record:', syncRecord?.id);
    }
    
    // Scrape products
    const result = await scrapeVinmonopoletProducts(firecrawl, supabase);
    
    // Update sync status
    if (syncRecord) {
      await supabase
        .from('sync_status')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          wines_inserted: result.wines_inserted,
        })
        .eq('id', syncRecord.id);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and inserted ${result.wines_inserted} wines from Vinmonopolet`,
        wines_inserted: result.wines_inserted,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in Vinmonopolet scraping:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
