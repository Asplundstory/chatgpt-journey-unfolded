import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LaunchPlan {
  id: string;
  title: string;
  date: string;
  url?: string;
  year?: number;
  quarter?: number;
  created_at?: string;
  source?: string;
  scraped_at?: string;
  excel_url?: string;
  product_count?: number;
  description?: string;
}

export const useLaunchPlansDB = () => {
  const [launchPlans, setLaunchPlans] = useState<LaunchPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaunchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('launch_plans')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        setLaunchPlans(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching launch plans:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchPlans();
  }, []);

  return { launchPlans, loading, error };
};