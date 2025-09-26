import { useState, useEffect } from 'react';

export interface SystembolagetProduct {
  productId: string;
  productNameThin: string;
  productNameBold: string;
  category1: string;
  category2?: string;
  price: number;
  alcohol: number;
  volume: number;
  country: string;
  productGroup: string;
  taste?: string;
  color?: string;
  vintage?: number;
  assortmentText?: string;
  // Additional fields we'll calculate/estimate
  investmentScore?: number;
  valueAppreciation?: number;
  projectedReturns?: {
    oneYear: number;
    threeYears: number;
    fiveYears: number;
    tenYears: number;
  };
  drinkingWindow?: {
    start: number;
    end: number;
  };
  storageTime?: number;
}

// Transform Systembolaget data to our Wine interface
export interface Wine {
  id: number;
  name: string;
  producer: string;
  category: string;
  price: number;
  alcoholContent: number;
  country: string;
  region: string;
  vintage: number;
  description: string;
  image: string;
  drinkingWindow: {
    start: number;
    end: number;
  };
  storageTime: number;
  investmentScore?: number;
  valueAppreciation?: number;
  projectedReturns: {
    oneYear: number;
    threeYears: number;
    fiveYears: number;
    tenYears: number;
  };
}

// Calculate investment metrics based on product data
const calculateInvestmentMetrics = (product: SystembolagetProduct): Partial<Wine> => {
  const currentYear = new Date().getFullYear();
  const vintage = product.vintage || currentYear - 2;
  
  // Simple heuristic for investment scoring based on category, price, and vintage
  let investmentScore = 5; // Base score
  
  // Premium categories get higher scores
  if (product.category1?.toLowerCase().includes('rött vin') && product.price > 500) {
    investmentScore += 2;
  }
  if (product.category1?.toLowerCase().includes('champagne') || 
      product.category1?.toLowerCase().includes('mousserande vin')) {
    investmentScore += 1;
  }
  if (product.price > 1000) investmentScore += 2;
  if (product.price > 2000) investmentScore += 1;
  
  // Vintage wines from good years get bonus
  if (vintage && vintage < currentYear - 5) {
    investmentScore += 1;
  }
  
  investmentScore = Math.min(10, Math.max(1, investmentScore));
  
  // Calculate projected returns (simplified model)
  const baseReturn = (investmentScore - 5) * 2; // -10% to +10%
  const projectedReturns = {
    oneYear: baseReturn + Math.random() * 6 - 3, // Add some randomness
    threeYears: baseReturn * 2 + Math.random() * 10 - 5,
    fiveYears: baseReturn * 3 + Math.random() * 15 - 7.5,
    tenYears: baseReturn * 5 + Math.random() * 25 - 12.5
  };
  
  // Calculate drinking window and storage time
  const drinkingWindow = {
    start: Math.max(currentYear, vintage + 2),
    end: vintage + (product.price > 500 ? 25 : 10)
  };
  
  const storageTime = drinkingWindow.end - currentYear;
  
  return {
    investmentScore,
    valueAppreciation: Math.random() * 15 - 2.5, // -2.5% to +12.5%
    projectedReturns,
    drinkingWindow,
    storageTime: Math.max(1, storageTime)
  };
};

const transformProduct = (product: SystembolagetProduct, index: number): Wine => {
  const metrics = calculateInvestmentMetrics(product);
  const currentYear = new Date().getFullYear();
  
  return {
    id: parseInt(product.productId) || index,
    name: product.productNameThin || 'Okänt vin',
    producer: product.productNameBold || 'Okänd producent',
    category: product.category1 || 'Okänd kategori',
    price: product.price || 0,
    alcoholContent: product.alcohol || 0,
    country: product.country || 'Okänt land',
    region: product.productGroup || 'Okänd region',
    vintage: product.vintage || currentYear - 2,
    description: product.taste || product.assortmentText || 'Ingen beskrivning tillgänglig',
    image: '/placeholder.svg',
    drinkingWindow: metrics.drinkingWindow || { start: currentYear, end: currentYear + 5 },
    storageTime: metrics.storageTime || 5,
    investmentScore: metrics.investmentScore,
    valueAppreciation: metrics.valueAppreciation,
    projectedReturns: metrics.projectedReturns || {
      oneYear: 0,
      threeYears: 0,
      fiveYears: 0,
      tenYears: 0
    }
  };
};

export const useSystembolagetData = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try the main API endpoint first
        let response;
        try {
          response = await fetch('https://susbolaget.emrik.org/v1/products');
        } catch (apiError) {
          // Fallback: use a smaller sample or local data
          console.warn('Could not fetch from main API, using fallback data');
          throw new Error('API not available');
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SystembolagetProduct[] = await response.json();
        
        // Filter for wine products and limit to first 1000 for performance
        const wineProducts = data
          .filter(product => 
            product.category1?.toLowerCase().includes('vin') ||
            product.category1?.toLowerCase().includes('champagne') ||
            product.category1?.toLowerCase().includes('mousserande')
          )
          .slice(0, 1000); // Limit for performance
        
        const transformedWines = wineProducts.map(transformProduct);
        setWines(transformedWines);
        
      } catch (err) {
        console.error('Error fetching Systembolaget data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        
        // Use fallback mock data
        const fallbackWines: Wine[] = [
          {
            id: 1,
            name: "Château Margaux 2015",
            producer: "Château Margaux",
            category: "Rött vin",
            price: 4500,
            alcoholContent: 13.5,
            country: "Frankrike",
            region: "Bordeaux",
            vintage: 2015,
            description: "Ett exceptionellt rött vin från Bordeaux med komplex smak av svarta bär och kryddor.",
            image: "/placeholder.svg",
            drinkingWindow: { start: 2025, end: 2045 },
            storageTime: 25,
            investmentScore: 9,
            valueAppreciation: 12.5,
            projectedReturns: {
              oneYear: 8.5,
              threeYears: 22.0,
              fiveYears: 45.5,
              tenYears: 125.0
            }
          },
          {
            id: 2,
            name: "Sancerre Les Monts Damnés",
            producer: "Henri Bourgeois",
            category: "Vitt vin",
            price: 250,
            alcoholContent: 12.5,
            country: "Frankrike",
            region: "Loire",
            vintage: 2022,
            description: "Elegant Sauvignon Blanc med mineraler och citrusnoter.",
            image: "/placeholder.svg",
            drinkingWindow: { start: 2024, end: 2028 },
            storageTime: 6,
            investmentScore: 6,
            valueAppreciation: 3.2,
            projectedReturns: {
              oneYear: 2.1,
              threeYears: 8.5,
              fiveYears: 15.2,
              tenYears: 28.0
            }
          }
        ];
        
        setWines(fallbackWines);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { wines, loading, error };
};