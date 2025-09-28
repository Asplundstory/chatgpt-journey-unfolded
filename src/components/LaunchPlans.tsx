import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Download, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { useLaunchPlansDB, LaunchPlan } from "@/hooks/useLaunchPlansDB";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const LaunchPlans = () => {
  const { launchPlans, loading, error } = useLaunchPlansDB();
  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const displayPlans = expanded ? launchPlans : launchPlans.slice(0, 3);
  const currentYear = new Date().getFullYear();
  const upcomingPlans = launchPlans.filter(plan => plan.year >= currentYear);

  const handleDownload = (plan: LaunchPlan) => {
    if (plan.url || plan.excel_url) {
      window.open(plan.url || plan.excel_url!, '_blank');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('firecrawl-launch-sync');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Synkronisering slutförd",
        description: "Lanseringsplaner har uppdaterats från Systembolaget",
      });

      // Refresh the data (the hook should automatically update)
      window.location.reload();
    } catch (error) {
      console.error('Error syncing launch plans:', error);
      toast({
        title: "Synkroniseringsfel",
        description: "Kunde inte hämta lanseringsplaner från Systembolaget",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Laddar lanseringsplaner...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Kunde ej ladda lanseringsplaner</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Kommande Lanseringar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="h-8 px-3"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synkar...' : 'Uppdatera'}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {upcomingPlans.length} kommande
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Systembolagets officiella lanseringsplaner - identifiera nya investeringsmöjligheter tidigt
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayPlans.map((plan, index) => {
          const isUpcoming = plan.year >= currentYear;
          
          return (
            <div 
              key={plan.url}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                isUpcoming 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/30 border-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${
                  isUpcoming 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Calendar className="h-4 w-4" />
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">{plan.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(plan.date).toLocaleDateString('sv-SE')}
                    </span>
                    {plan.quarter && (
                      <Badge variant="outline" className="text-xs h-5">
                        Q{plan.quarter}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs h-5">
                      {plan.source === 'firecrawl' ? 'Live' : plan.source === 'firecrawl_excel' ? 'Excel' : 'Statisk'}
                    </Badge>
                    {isUpcoming && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          Kommande
                        </span>
                      </div>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>
              
              {(plan.url || plan.excel_url) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(plan)}
                  className="h-8 px-3"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {plan.source === 'firecrawl_excel' || plan.excel_url ? 'Excel' : 'Info'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
        
        {launchPlans.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-sm"
          >
            {expanded ? 'Visa färre' : `Visa alla ${launchPlans.length} lanseringsplaner`}
          </Button>
        )}
        
        <div className="mt-4 p-3 bg-accent/20 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Investeringstips</p>
              <p className="text-xs text-muted-foreground mt-1">
                Kommande lanseringar kan innehålla exklusiva viner med hög investeringspotential. 
                Ladda ner Excel-filerna för att analysera vilka kategorier som kommer lanseras.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};