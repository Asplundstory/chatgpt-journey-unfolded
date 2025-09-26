import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Wine {
  id: string;
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
  image_url?: string;
  sales_start_date?: string;
  assortment?: string;
  investment_score?: number;
  projected_return_1y?: number;
  projected_return_3y?: number;
  projected_return_5y?: number;
  projected_return_10y?: number;
  storage_time_months?: number;
  drinking_window_start?: number;
  drinking_window_end?: number;
  value_appreciation?: number;
  created_at?: string;
  updated_at?: string;
}

export const useWines = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWines = async () => {
    try {
      setLoading(true);
      console.log('Fetching wines from Supabase...');
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        throw error;
      }

      console.log('Setting wines:', data?.length || 0, 'wines found');
      setWines(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching wines:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWines();
  }, []);

  const refetch = () => {
    fetchWines();
  };

  return { wines, loading, error, refetch };
};