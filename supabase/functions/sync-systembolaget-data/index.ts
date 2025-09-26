import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Realistisk vindata baserad på verkliga Systembolaget-produkter
const wineTemplates = [
  {
    name: "Château Margaux", producer: "Château Margaux", category: "Rött vin", country: "Frankrike", region: "Bordeaux",
    vintage: 2018, alcohol: 13.5, price: 4200, description: "Elegant Bordeaux med komplex smak av svarta bär, kryddor och ek."
  },
  {
    name: "Barolo DOCG", producer: "Giuseppe Rinaldi", category: "Rött vin", country: "Italien", region: "Piemonte", 
    vintage: 2019, alcohol: 14.0, price: 650, description: "Kraftfull italiensk Nebbiolo med toner av körsbär och rosor."
  },
  {
    name: "Dom Pérignon Vintage", producer: "Moët & Chandon", category: "Mousserande vin", country: "Frankrike", region: "Champagne",
    vintage: 2013, alcohol: 12.5, price: 2100, description: "Prestigefylld champagne med brioche, citrus och mineralitet."
  },
  {
    name: "Opus One", producer: "Opus One Winery", category: "Rött vin", country: "USA", region: "Napa Valley",
    vintage: 2019, alcohol: 14.5, price: 3100, description: "Kultigt Bordeaux-blend från Californien med svarta bär och vanilj."
  },
  {
    name: "Sancerre Les Monts Damnés", producer: "Henri Bourgeois", category: "Vitt vin", country: "Frankrike", region: "Loire",
    vintage: 2022, alcohol: 12.5, price: 280, description: "Mineralisk Sauvignon Blanc med citrus och gräsliga toner."
  },
  {
    name: "Rioja Gran Reserva", producer: "Marqués de Riscal", category: "Rött vin", country: "Spanien", region: "Rioja",
    vintage: 2016, alcohol: 13.5, price: 340, description: "Traditionell spansk reserva med vanilj, läder och mörka frukter."
  },
  {
    name: "Chablis Premier Cru", producer: "William Fèvre", category: "Vitt vin", country: "Frankrike", region: "Bourgogne",
    vintage: 2021, alcohol: 13.0, price: 420, description: "Elegant Chardonnay med mineraler, citrus och en viss komplexitet."
  },
  {
    name: "Amarone della Valpolicella", producer: "Allegrini", category: "Rött vin", country: "Italien", region: "Veneto",
    vintage: 2018, alcohol: 15.5, price: 580, description: "Kraftfull Amarone med torkade druvor, mörka frukter och kryddor."
  },
  {
    name: "Puligny-Montrachet", producer: "Louis Jadot", category: "Vitt vin", country: "Frankrike", region: "Bourgogne",
    vintage: 2020, alcohol: 13.0, price: 850, description: "Premium Chardonnay med hasselnötter, citrus och mineralitet."
  },
  {
    name: "Châteauneuf-du-Pape", producer: "Domaine de la Côte", category: "Rött vin", country: "Frankrike", region: "Rhône",
    vintage: 2019, alcohol: 14.5, price: 480, description: "Kraftfull Rhône-blend med mörka bär, kryddor och lavendel."
  },
  {
    name: "Riesling Kabinett", producer: "Dr. Loosen", category: "Vitt vin", country: "Tyskland", region: "Mosel",
    vintage: 2022, alcohol: 8.5, price: 195, description: "Lätt och fruktig Riesling med äpple, citrus och mineralitet."
  },
  {
    name: "Brunello di Montalcino", producer: "Biondi-Santi", category: "Rött vin", country: "Italien", region: "Toscana",
    vintage: 2017, alcohol: 14.0, price: 1200, description: "Elegant Sangiovese med lång lagringspotential och komplex smak."
  },
  {
    name: "Hermitage Rouge", producer: "E. Guigal", category: "Rött vin", country: "Frankrike", region: "Rhône",
    vintage: 2018, alcohol: 13.5, price: 950, description: "Prestigefylld Syrah med svarta oliver, kryddor och rök."
  },
  {
    name: "Mosel Spätlese", producer: "Egon Müller", category: "Vitt vin", country: "Tyskland", region: "Mosel",
    vintage: 2021, alcohol: 7.5, price: 380, description: "Söt Riesling med persika, honung och livlig syra."
  },
  {
    name: "Gevrey-Chambertin", producer: "Domaine Faiveley", category: "Rött vin", country: "Frankrike", region: "Bourgogne",
    vintage: 2019, alcohol: 13.0, price: 720, description: "Elegant Pinot Noir med röda bär, jord och delikata kryddor."
  }
];

function generateWineData(template: any, index: number) {
  const priceVariation = 0.9 + Math.random() * 0.2; // ±10% price variation
  const finalPrice = Math.round(template.price * priceVariation);
  
  // Generate investment score based on price
  let investmentScore = 5;
  if (finalPrice > 800) investmentScore = 7;
  if (finalPrice > 1500) investmentScore = 8;
  if (finalPrice > 2500) investmentScore = 9;
  
  const baseReturn = Math.max(2, (finalPrice / 400) * 1.8);
  
  return {
    product_id: `SB_${Date.now()}_${index}`,
    name: template.name,
    producer: template.producer,
    category: template.category,
    country: template.country,
    region: template.region,
    vintage: template.vintage,
    alcohol_percentage: template.alcohol,
    price: finalPrice,
    description: template.description,
    image_url: undefined,
    assortment: finalPrice > 1000 ? "Beställningssortiment" : "Ordinarie sortiment",
    sales_start_date: undefined,
    investment_score: investmentScore,
    projected_return_1y: Math.round(baseReturn * 0.9 * 10) / 10,
    projected_return_3y: Math.round(baseReturn * 2.4 * 10) / 10,
    projected_return_5y: Math.round(baseReturn * 4.8 * 10) / 10,
    projected_return_10y: Math.round(baseReturn * 13 * 10) / 10,
    storage_time_months: Math.max(24, (2025 - template.vintage) * 12),
    drinking_window_start: template.vintage + 2,
    drinking_window_end: template.vintage + 18,
    value_appreciation: Math.round((Math.random() * 12 + 4) * 10) / 10
  };
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

    console.log('Generating realistic wine data...');

    // Generate variations of each wine template
    const wineRecords = [];
    
    for (let i = 0; i < wineTemplates.length; i++) {
      const template = wineTemplates[i];
      
      // Create 2-3 variations of each wine (different vintages/prices)
      for (let variation = 0; variation < 2; variation++) {
        const vintageVariation = variation === 0 ? 0 : -1; // Current year and previous year
        const modifiedTemplate = {
          ...template,
          vintage: template.vintage + vintageVariation,
          price: template.price * (variation === 0 ? 1 : 0.85) // Older vintage slightly cheaper
        };
        
        const wineRecord = generateWineData(modifiedTemplate, i * 10 + variation);
        wineRecords.push(wineRecord);
      }
    }

    console.log(`Generated ${wineRecords.length} wine records`);

    // Insert in small batches
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < wineRecords.length; i += batchSize) {
      const batch = wineRecords.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`);
      
      const { error } = await supabaseClient
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
      console.log(`Inserted ${batch.length} wines. Total: ${insertedCount}`);
    }

    console.log(`Successfully generated and inserted ${insertedCount} wines`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${insertedCount} realistic wines based on Systembolaget data`,
        totalProducts: wineRecords.length,
        winesFound: wineRecords.length,
        winesInserted: insertedCount,
        note: "Generated from curated premium wine templates with realistic pricing and investment data"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating wine data:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})