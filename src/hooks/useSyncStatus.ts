import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncStatus {
  id: string;
  sync_type: string;
  status: string;
  total_products: number;
  processed_products: number;
  wines_inserted: number;
  wines_updated: number;
  last_product_processed: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useSyncStatus = () => {
  const [currentSync, setCurrentSync] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestSync = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sync status:', error);
        return;
      }

      setCurrentSync(data || null);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLatestSync();

    // Set up real-time subscription
    const channel = supabase
      .channel('sync_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_status'
        },
        (payload) => {
          console.log('Sync status update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentSync(payload.new as SyncStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProgressPercentage = () => {
    if (!currentSync || !currentSync.total_products) return 0;
    return Math.round((currentSync.processed_products / currentSync.total_products) * 100);
  };

  const getStatusMessage = () => {
    if (!currentSync) return 'Ingen sync-status tillgänglig';
    
    switch (currentSync.status) {
      case 'running':
        return `Synkar... ${currentSync.processed_products}/${currentSync.total_products} produkter processade`;
      case 'completed':
        return `Sync slutförd! ${currentSync.wines_inserted} viner importerade`;
      case 'failed':
        return `Sync misslyckades: ${currentSync.error_message}`;
      case 'paused':
        return 'Sync pausad';
      default:
        return 'Okänd status';
    }
  };

  const isRunning = currentSync?.status === 'running';
  const isCompleted = currentSync?.status === 'completed';
  const isFailed = currentSync?.status === 'failed';

  return {
    currentSync,
    loading,
    progressPercentage: getProgressPercentage(),
    statusMessage: getStatusMessage(),
    isRunning,
    isCompleted,
    isFailed,
    refetch: fetchLatestSync
  };
};