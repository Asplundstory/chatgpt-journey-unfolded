import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Target, Clock } from "lucide-react";
import { Wine } from "@/hooks/useWines";

interface WineRecommendationsProps {
  wines: Wine[];
  isVisible: boolean;
}

export const WineRecommendations = ({ wines, isVisible }: WineRecommendationsProps) => {
  if (!isVisible) return null;

  // Categorize recommendations
  const topInvestments = wines
    .filter(wine => wine.investment_score && wine.investment_score >= 8)
    .slice(0, 3);
    
  const highReturns = wines
    .filter(wine => wine.projected_return_5y && wine.projected_return_5y >= 30)
    .slice(0, 3);
    
  const shortTermOpportunities = wines
    .filter(wine => 
      wine.projected_return_1y && wine.projected_return_1y >= 5 && 
      wine.drinking_window_start && wine.drinking_window_start <= new Date().getFullYear() + 2
    )
    .slice(0, 3);

  const categories = [
    {
      title: "Topbetyg för investering",
      icon: Star,
      wines: topInvestments,
      description: "Viner med högst investeringsbetyg (8+/10)",
      color: "bg-yellow-500"
    },
    {
      title: "Högst prognostiserad avkastning",
      icon: TrendingUp,
      wines: highReturns,
      description: "Viner med över 30% förväntad 5-årsavkastning",
      color: "bg-green-500"
    },
    {
      title: "Kortsiktiga möjligheter",
      icon: Clock,
      wines: shortTermOpportunities,
      description: "Redo att dricka inom 2 år med god 1-års potential",
      color: "bg-blue-500"
    }
  ];

  if (wines.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Inga vinförslag tillgängliga</h3>
                <p className="text-muted-foreground text-sm">
                  Kör synkronisering för att hämta vindata med investeringsmetriker
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investeringsöversikt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{wines.length}</div>
              <div className="text-sm text-muted-foreground">Totala förslag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(wines.reduce((acc, wine) => acc + (wine.projected_return_5y || 0), 0) / wines.length) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Snitt 5-års avkastning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(wines.reduce((acc, wine) => acc + (wine.investment_score || 0), 0) / wines.length * 10) / 10 || 0}
              </div>
              <div className="text-sm text-muted-foreground">Snitt investeringsbetyg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(wines.reduce((acc, wine) => acc + (wine.price || 0), 0) / wines.length) || 0} kr
              </div>
              <div className="text-sm text-muted-foreground">Snitt pris</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorized Recommendations */}
      {categories.map((category, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <category.icon className="h-5 w-5" />
              {category.title}
              <Badge variant="secondary" className="ml-auto">
                {category.wines.length} viner
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.wines.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Inga viner uppfyller kriterierna för denna kategori
              </p>
            ) : (
              category.wines.map((wine, wineIndex) => (
                <div key={wineIndex} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{wine.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {wine.producer} • {wine.country} • {wine.vintage}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{wine.price?.toLocaleString()} kr</div>
                        <div className="text-xs text-muted-foreground">Pris</div>
                      </div>
                      {wine.investment_score && (
                        <div className="text-right">
                          <div className="text-sm font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {wine.investment_score}/10
                          </div>
                          <div className="text-xs text-muted-foreground">Betyg</div>
                        </div>
                      )}
                      {wine.projected_return_5y && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            +{wine.projected_return_5y.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">5 år</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};