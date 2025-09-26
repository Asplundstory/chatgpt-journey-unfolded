import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { useSystembolagetSync } from "@/hooks/useSystembolagetSync";
import { useToast } from "@/components/ui/use-toast";

export const SystembolagetSyncButton = () => {
  const { syncData, syncing, result, clearResult } = useSystembolagetSync();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = async () => {
    const syncResult = await syncData();
    
    if (syncResult.success) {
      toast({
        title: "Synkning lyckades!",
        description: `${syncResult.winesInserted} viner importerade från Systembolaget`,
      });
    } else {
      toast({
        title: "Synkning misslyckades",
        description: syncResult.error || "Okänt fel uppstod",
        variant: "destructive",
      });
    }
    
    setShowDetails(true);
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2"
        variant="default"
      >
        {syncing ? (
          <>
            <Clock className="h-4 w-4 animate-spin" />
            Synkroniserar...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Importera från Systembolaget
          </>
        )}
      </Button>

      {result && showDetails && (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Synkning lyckades
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    Synkning misslyckades
                  </>
                )}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowDetails(false);
                  clearResult();
                }}
              >
                ×
              </Button>
            </div>
            {result.message && (
              <CardDescription>{result.message}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {result.success ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Totalt produkter:</span>
                  <Badge variant="secondary">{result.totalProducts}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Viner hittade:</span>
                  <Badge variant="secondary">{result.winesFound}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Viner importerade:</span>
                  <Badge variant="default">{result.winesInserted}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                {result.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};