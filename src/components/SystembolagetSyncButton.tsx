import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Clock } from "lucide-react";
import { useSystembolagetSync } from "@/hooks/useSystembolagetSync";
import { useToast } from "@/components/ui/use-toast";
import { SyncProgressCard } from "./SyncProgressCard";
import { useSyncStatus } from "@/hooks/useSyncStatus";

export const SystembolagetSyncButton = () => {
  const { syncData, syncing } = useSystembolagetSync();
  const { toast } = useToast();
  const { isRunning } = useSyncStatus();

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

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSync}
        disabled={syncing || isRunning}
        className="flex items-center gap-2"
        variant="default"
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
      </Button>

      <SyncProgressCard />
    </div>
  );
};