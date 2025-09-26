import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Clock, TestTube } from "lucide-react";
import { useSystembolagetSync } from "@/hooks/useSystembolagetSync";
import { useToast } from "@/components/ui/use-toast";
import { SyncProgressCard } from "./SyncProgressCard";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { supabase } from "@/integrations/supabase/client";

export const SystembolagetSyncButton = () => {
  const { syncData, syncing } = useSystembolagetSync();
  const { toast } = useToast();
  const { isRunning } = useSyncStatus();
  const [testLoading, setTestLoading] = useState(false);

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

  const handleTestInsert = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-wine-insert');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Test genomförd!",
        description: `${data.totalInserted} testviner har lagts till i databasen.`,
      });
    } catch (error) {
      console.error('Test insert error:', error);
      toast({
        title: "Test misslyckades",
        description: error instanceof Error ? error.message : "Kunde inte köra test",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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

        <Button 
          onClick={handleTestInsert}
          disabled={testLoading || syncing || isRunning}
          className="flex items-center gap-2"
          variant="outline"
        >
          {testLoading ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Testar...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4" />
              Test: Lägg till 500 viner
            </>
          )}
        </Button>
      </div>

      <SyncProgressCard />
    </div>
  );
};