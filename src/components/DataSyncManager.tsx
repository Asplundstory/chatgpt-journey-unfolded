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
import { supabase } from "@/integrations/supabase/client";

interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const DataSyncManager = () => {
  const { toast } = useToast();
  const { isRunning } = useSyncStatus();
  
  // Loading states for different sync operations
  const [loadingStates, setLoadingStates] = useState({
    fullSync: false,
    githubSync: false,
    firecrawlSync: false,
    batchSync: false,
    vinmonopoletSync: false,
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
      const [githubResult, firecrawlResult, vinmonopoletResult] = await Promise.allSettled([
        // GitHub data sync
        supabase.functions.invoke('sync-systembolaget-data', { body: {} }),
        // Firecrawl launch plans sync  
        supabase.functions.invoke('firecrawl-launch-sync', { body: {} }),
        // Vinmonopolet data sync
        supabase.functions.invoke('sync-vinmonopolet', { body: {} }),
      ]);

      let successCount = 0;
      let errorMessages: string[] = [];

      if (githubResult.status === 'fulfilled' && !githubResult.value.error) {
        successCount++;
      } else {
        errorMessages.push("GitHub data sync misslyckades");
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

      if (successCount === 3) {
        toast({
          title: "Fullständig synkning slutförd!",
          description: "Alla datakällor har synkroniserats framgångsrikt.",
        });
      } else if (successCount > 0) {
        toast({
          title: "Delvis synkning slutförd",
          description: `${successCount}/3 datakällor synkroniserade. ${errorMessages.join(', ')}`,
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

  const handleGitHubSync = async () => {
    updateLoadingState('githubSync', true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-systembolaget-data', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "GitHub synkning startad!",
        description: "Systembolaget data från GitHub synkroniseras...",
      });
    } catch (error) {
      console.error('GitHub sync error:', error);
      toast({
        title: "GitHub synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    } finally {
      updateLoadingState('githubSync', false);
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
    updateLoadingState('vinmonopoletSync', true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-vinmonopolet', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Vinmonopolet synkning startad!",
        description: "Hämtar produktdata från Vinmonopolet API...",
      });
    } catch (error) {
      console.error('Vinmonopolet sync error:', error);
      toast({
        title: "Vinmonopolet synkning misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte starta synkning",
        variant: "destructive",
      });
    } finally {
      updateLoadingState('vinmonopoletSync', false);
    }
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean) || isRunning;

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
              Hämta data från alla källor samtidigt (GitHub + Firecrawl + andra källor)
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
              {/* GitHub Data Source */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">GitHub Repository</p>
                    <p className="text-sm text-muted-foreground">Systembolaget produktdata</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGitHubSync}
                  disabled={isAnyLoading}
                >
                  {loadingStates.githubSync ? (
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
                    <p className="font-medium">Vinmonopolet</p>
                    <p className="text-sm text-muted-foreground">Produktdata från Norge</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleVinmonopoletSync}
                  disabled={isAnyLoading}
                >
                  {loadingStates.vinmonopoletSync ? (
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