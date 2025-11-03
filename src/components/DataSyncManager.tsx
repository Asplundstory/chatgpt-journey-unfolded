import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Database, 
  Globe, 
  Loader2, 
  Download,
  Zap,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { SyncProgressCard } from "./SyncProgressCard";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useSystembolagetSync } from "@/hooks/useSystembolagetSync";
import { useVinmonopoletSync } from "@/hooks/useVinmonopoletSync";
import { useAlkoSync } from "@/hooks/useAlkoSync";
import { supabase } from "@/integrations/supabase/client";

interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const DataSyncManager = () => {
  const { toast } = useToast();
  const { isRunning } = useSyncStatus();
  const { syncData: syncSystembolaget, syncing: systembolagetSyncing } = useSystembolagetSync();
  const { syncData: syncVinmonopolet, syncing: vinmonopoletSyncing } = useVinmonopoletSync();
  const { syncData: syncAlko, syncing: alkoSyncing } = useAlkoSync();
  
  // Loading states for different sync operations
  const [loadingStates, setLoadingStates] = useState({
    fullSync: false,
    githubSync: false,
    firecrawlSync: false,
    batchSync: false,
  });

  const updateLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const handleFullSync = async () => {
    updateLoadingState('fullSync', true);
    try {
      toast({
        title: "Fullständig synkning startad!",
        description: "Synkroniserar från alla datakällor...",
      });

      // Start all sync processes
      const [systembolagetResult, firecrawlResult, vinmonopoletResult, alkoResult] = await Promise.allSettled([
        // Systembolaget data sync
        supabase.functions.invoke('sync-systembolaget-data', { body: {} }),
        // Firecrawl launch plans sync  
        supabase.functions.invoke('firecrawl-launch-sync', { body: {} }),
        // Vinmonopolet API sync
        supabase.functions.invoke('sync-vinmonopolet', { body: {} }),
        // Alko API sync
        supabase.functions.invoke('sync-alko', { body: {} }),
      ]);

      let successCount = 0;
      let errorMessages: string[] = [];

      if (systembolagetResult.status === 'fulfilled' && !systembolagetResult.value.error) {
        successCount++;
      } else {
        errorMessages.push("Systembolaget sync misslyckades");
      }

      if (firecrawlResult.status === 'fulfilled' && !firecrawlResult.value.error) {
        successCount++;
      } else {
        errorMessages.push("Firecrawl sync misslyckades");
      }

      if (vinmonopoletResult.status === 'fulfilled' && !vinmonopoletResult.value.error) {
        successCount++;
      } else {
        errorMessages.push("Vinmonopolet sync misslyckades");
      }

      if (alkoResult.status === 'fulfilled' && !alkoResult.value.error) {
        successCount++;
      } else {
        errorMessages.push("Alko sync misslyckades");
      }

      if (successCount === 4) {
        toast({
          title: "Fullständig synkning slutförd!",
          description: "Alla datakällor har synkroniserats framgångsrikt.",
        });
      } else if (successCount > 0) {
        toast({
          title: "Delvis synkning slutförd",
          description: `${successCount}/4 datakällor synkroniserade. ${errorMessages.join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Synkning misslyckades",
          description: errorMessages.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Full sync error:', error);
      toast({
        title: "Synkning misslyckades",
        description: "Kunde inte starta fullständig synkning",
        variant: "destructive",
      });
    } finally {
      updateLoadingState('fullSync', false);
    }
  };

  const handleSystembolagetSync = async () => {
    try {
      toast({
        title: "Systembolaget synkning startad!",
        description: "Hämtar alla produkter från Systembolaget...",
      });

      const result = await syncSystembolaget();
      
      if (result?.success) {
        toast({
          title: "Systembolaget synkning slutförd!",
          description: `${result.winesInserted || 0} viner har synkroniserats från Systembolaget.`,
        });
      } else {
        throw new Error(result?.error || 'Synkning misslyckades');
      }
    } catch (error) {
      console.error('Systembolaget sync error:', error);
      toast({
        title: "Systembolaget synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    }
  };

  const handleFirecrawlSync = async () => {
    updateLoadingState('firecrawlSync', true);
    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-launch-sync', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Firecrawl synkning startad!",
        description: "Lansering planer från Systembolaget hämtas...",
      });
    } catch (error) {
      console.error('Firecrawl sync error:', error);
      toast({
        title: "Firecrawl synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    } finally {
      updateLoadingState('firecrawlSync', false);
    }
  };

  const handleBatchSync = async () => {
    updateLoadingState('batchSync', true);
    try {
      let totalWines = 0;
      let batchNumber = 1;
      let hasMore = true;
      
      toast({
        title: "Batch-synkning startad!",
        description: "Processar alla viner i stora batchar...",
      });
      
      while (hasMore && batchNumber <= 50) {
        const { data, error } = await supabase.functions.invoke('batch-sync-systembolaget', {
          body: { batchNumber, batchSize: 500 }
        });
        
        if (error) throw error;
        
        totalWines += data.winesInserted || 0;
        hasMore = data.hasMore;
        batchNumber = data.nextBatch || batchNumber + 1;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Batch-synkning slutförd!",
        description: `${totalWines} viner har processats och lagts till.`,
      });
    } catch (error) {
      console.error('Batch sync error:', error);
      toast({
        title: "Batch-synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte slutföra batch-synkning",
        variant: "destructive",
      });
    } finally {
      updateLoadingState('batchSync', false);
    }
  };

  const handleVinmonopoletSync = async () => {
    try {
      toast({
        title: "Vinmonopolet synkning startad!",
        description: "Hämtar alla produkter från Vinmonopolets API...",
      });

      const result = await syncVinmonopolet();
      
      if (result?.success) {
        toast({
          title: "Vinmonopolet synkning slutförd!",
          description: `${result.wines_inserted || 0} viner har synkroniserats från Vinmonopolet.`,
        });
      } else {
        throw new Error(result?.error || 'Synkning misslyckades');
      }
    } catch (error) {
      console.error('Vinmonopolet sync error:', error);
      toast({
        title: "Vinmonopolet synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    }
  };

  const handleAlkoSync = async () => {
    try {
      toast({
        title: "Alko synkning startad!",
        description: "Hämtar alla produkter från Alko...",
      });

      const result = await syncAlko();
      
      if (result?.success) {
        toast({
          title: "Alko synkning slutförd!",
          description: `${result.wines_inserted || 0} viner har synkroniserats från Alko.`,
        });
      } else {
        throw new Error(result?.error || 'Synkning misslyckades');
      }
    } catch (error) {
      console.error('Alko sync error:', error);
      toast({
        title: "Alko synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    }
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean) || isRunning || systembolagetSyncing || vinmonopoletSyncing || alkoSyncing;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datasynkronisering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Sync Option */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Synkronisera allt</h3>
            <p className="text-sm text-muted-foreground">
              Hämta data från alla källor samtidigt (Systembolaget + Vinmonopolet + Alko + Firecrawl)
            </p>
            <Button
              onClick={handleFullSync}
              disabled={isAnyLoading}
              className="w-full"
              size="lg"
            >
              {loadingStates.fullSync ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Synkroniserar alla källor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Synkronisera alla datakällor
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Individual Source Sync */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Synkronisera per datakälla</h3>
            <p className="text-sm text-muted-foreground">
              Välj vilken datakälla du vill synkronisera separat för mer kontroll
            </p>
            
            <div className="grid gap-3">
              {/* Systembolaget Data Source */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇸🇪</span>
                  <div>
                    <p className="font-medium">Systembolaget API</p>
                    <p className="text-sm text-muted-foreground">Alla viner från Sverige</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSystembolagetSync}
                  disabled={isAnyLoading}
                >
                  {systembolagetSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Firecrawl Data Source */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Firecrawl</p>
                    <p className="text-sm text-muted-foreground">Lansering planer från Systembolaget</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleFirecrawlSync}
                  disabled={isAnyLoading}
                >
                  {loadingStates.firecrawlSync ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Batch Sync Option */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Batch Sync</p>
                    <p className="text-sm text-muted-foreground">Stora batchar för bättre prestanda</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBatchSync}
                  disabled={isAnyLoading}
                >
                  {loadingStates.batchSync ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Vinmonopolet Data Source */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇳🇴</span>
                  <div>
                    <p className="font-medium">Vinmonopolet API</p>
                    <p className="text-sm text-muted-foreground">Alla viner från Norge</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleVinmonopoletSync}
                  disabled={isAnyLoading}
                >
                  {vinmonopoletSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Alko Data Source */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇫🇮</span>
                  <div>
                    <p className="font-medium">Alko API</p>
                    <p className="text-sm text-muted-foreground">Alla viner från Finland</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAlkoSync}
                  disabled={isAnyLoading}
                >
                  {alkoSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SyncProgressCard />
    </div>
  );
};