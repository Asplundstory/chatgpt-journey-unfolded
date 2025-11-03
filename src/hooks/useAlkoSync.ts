import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  message?: string;
  total_products?: number;
  wines_inserted?: number;
  error?: string;
}

export const useAlkoSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const syncData = async () => {
    try {
      setSyncing(true);
      setResult(null);

      console.log('Starting Alko data sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-alko', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('Sync completed:', data);
      setResult(data);
      
      return data;
    } catch (error) {
      console.error('Error syncing data:', error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncData,
    syncing,
    result,
    clearResult: () => setResult(null)
  };
};
