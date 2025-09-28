import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Clock, ChevronDown, Database, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSystembolagetSync } from "@/hooks/useSystembolagetSync";
import { useToast } from "@/components/ui/use-toast";
import { SyncProgressCard } from "./SyncProgressCard";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { supabase } from "@/integrations/supabase/client";

export const SystembolagetSyncButton = () => {
  const { syncData, syncing } = useSystembolagetSync();
  const { toast } = useToast();
  const { isRunning } = useSyncStatus();
  const [batchLoading, setBatchLoading] = useState(false);

  const handleSync = async () => {
    const syncResult = await syncData();
    
    if (syncResult.success) {
      toast({
        title: "Synkning startad!",
        description: "Import körs i bakgrunden. Du kan följa framstegen nedan.",
      });
    } else {
      toast({
        title: "Synkning misslyckades",
        description: syncResult.error || "Kunde inte starta synkning",
        variant: "destructive",
      });
    }
  };

  const handleBatchSync = async () => {
    setBatchLoading(true);
    try {
      let totalWines = 0;
      let batchNumber = 1;
      let hasMore = true;
      
      toast({
        title: "Batch-synkning startad!",
        description: "Processar alla viner i batchar...",
      });
      
      while (hasMore && batchNumber <= 50) { // Limit to 50 batches max
        console.log(`Running batch ${batchNumber}...`);
        
        const { data, error } = await supabase.functions.invoke('batch-sync-systembolaget', {
          body: { batchNumber, batchSize: 500 }
        });
        
        if (error) {
          throw error;
        }
        
        totalWines += data.winesInserted || 0;
        hasMore = data.hasMore;
        batchNumber = data.nextBatch || batchNumber + 1;
        
        console.log(`Batch ${batchNumber - 1} completed: ${data.winesInserted} wines inserted`);
        
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
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Synkronisering
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={handleSync}
            disabled={syncing || isRunning || batchLoading}
            className="flex items-center gap-2 cursor-pointer"
          >
            {syncing || isRunning ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                {syncing ? 'Startar synkning...' : 'Synkning pågår...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Importera från Systembolaget
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleBatchSync}
            disabled={batchLoading || syncing || isRunning}
            className="flex items-center gap-2 cursor-pointer"
          >
            {batchLoading ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Batch-synkar...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Batch Sync (Alla Viner)
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <SyncProgressCard />
    </div>
  );
};