import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Starting test wine insertion...');

    // Clear existing wines first
    console.log('Clearing existing wines...');
    const { error: deleteError } = await supabase
      .from('wines')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error clearing wines:', deleteError);
    }

    // Generate many test wines
    const testWines = [];
    const producers = ['Château Margaux', 'Dom Pérignon', 'Opus One', 'Screaming Eagle', 'Petrus', 'Romanée-Conti', 'Caymus', 'Silver Oak', 'Stag\'s Leap', 'Kendall-Jackson'];
    const countries = ['Frankrike', 'Italien', 'Spanien', 'USA', 'Australien', 'Chile', 'Argentina', 'Tyskland', 'Portugal', 'Sydafrika'];
    const regions = ['Bordeaux', 'Bourgogne', 'Champagne', 'Napa Valley', 'Toscana', 'Rioja', 'Rhône', 'Piemonte', 'Douro', 'Barossa Valley'];
    const categories = ['Rött vin', 'Vitt vin', 'Mousserande vin', 'Rosé'];

    for (let i = 1; i <= 500; i++) {
      const producer = producers[i % producers.length];
      const country = countries[i % countries.length];
      const region = regions[i % regions.length];
      const category = categories[i % categories.length];
      const vintage = 2015 + (i % 8);
      const price = 299 + (i * 13.7) % 2000;

      testWines.push({
        product_id: `TEST${i.toString().padStart(4, '0')}`,
        name: `${producer} ${category} ${vintage}`,
        producer: producer,
        category: category,
        country: country,
        region: region,
        vintage: vintage, 
        alcohol_percentage: 12.5 + (i % 4),
        price: Math.round(price * 100) / 100,
        description: `Exceptionell ${category.toLowerCase()} från ${region} med komplex karaktär och lång eftersmak.`,
        sales_start_date: `${2023 + (i % 2)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
        assortment: i % 3 === 0 ? 'Beställningssortiment' : 'Ordinarie sortiment',
        investment_score: 6 + (i % 5),
        projected_return_1y: 3 + (i % 7),
        projected_return_3y: 10 + (i % 15),
        projected_return_5y: 25 + (i % 25),
        projected_return_10y: 60 + (i % 60),
        storage_time_months: 60 + (i % 180),
        drinking_window_start: vintage + 2,
        drinking_window_end: vintage + 15,
        value_appreciation: 5 + (i % 10),
        review_points: 85 + (i % 15),
        review_description: `Excellent wine with great potential for aging. Notes of dark fruit, spice, and oak.`,
        taster_name: `Taster ${(i % 5) + 1}`
      });
    }

    console.log(`Generated ${testWines.length} test wines`);

    // Insert wines in batches of 50
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < testWines.length; i += batchSize) {
      const batch = testWines.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(testWines.length/batchSize)}`);
      
      const { data, error } = await supabase
        .from('wines')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('Error inserting batch:', error);
        continue;
      }

      totalInserted += batch.length;
      console.log(`Inserted ${batch.length} wines, total: ${totalInserted}`);
    }

    console.log(`Test completed! Inserted ${totalInserted} wines total`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully inserted ${totalInserted} test wines`,
      totalInserted
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test:', error);
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