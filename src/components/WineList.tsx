import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, TrendingUp, BarChart3, Package, ShoppingCart } from "lucide-react";

import { Wine } from "@/hooks/useWines";

interface WineListProps {
  wines: Wine[];
}

export const WineList = ({ wines }: WineListProps) => {
  if (wines.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Inga viner matchade dina sökkriterier.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {wines.map((wine) => (
        <Card key={wine.id} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Wine Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                      {wine.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{wine.producer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge variant="secondary">
                      {wine.category}
                    </Badge>
                    {wine.assortment && (
                      <Badge variant={wine.assortment === 'Kommande lansering' ? 'default' : 'outline'}>
                        {wine.assortment}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{wine.country}, {wine.region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{wine.vintage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{wine.alcohol_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Drick: {wine.drinking_window_start || 'N/A'}-{wine.drinking_window_end || 'N/A'}</span>
                  </div>
                  {wine.sales_start_date && (
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      <span>Säljstart: {new Date(wine.sales_start_date).toLocaleDateString('sv-SE')}</span>
                    </div>
                  )}
                  {wine.investment_score && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-primary font-medium">
                        {wine.investment_score}/10
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {wine.description}
                </p>
              </div>

              {/* Price and Returns */}
              <div className="lg:w-80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {wine.price} kr
                  </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Lagra</div>
                      <div className="text-sm font-medium">{wine.storage_time_months ? Math.round(wine.storage_time_months / 12) : 0} år</div>
                    </div>
                </div>

                {wine.value_appreciation && (
                  <div className="text-xs text-green-600 font-medium">
                    +{wine.value_appreciation.toFixed(1)}% värdeökning senaste året
                  </div>
                )}

                {/* Projected Returns Grid */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-accent/20 rounded-md">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">1år</div>
                    <div className="text-sm font-semibold text-primary">
                      {wine.projected_return_1y && wine.projected_return_1y > 0 ? '+' : ''}{wine.projected_return_1y?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">3år</div>
                    <div className="text-sm font-semibold text-primary">
                      {wine.projected_return_3y && wine.projected_return_3y > 0 ? '+' : ''}{wine.projected_return_3y?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">5år</div>
                    <div className="text-sm font-semibold text-primary">
                      {wine.projected_return_5y && wine.projected_return_5y > 0 ? '+' : ''}{wine.projected_return_5y?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">10år</div>
                    <div className="text-sm font-semibold text-primary">
                      {wine.projected_return_10y && wine.projected_return_10y > 0 ? '+' : ''}{wine.projected_return_10y?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};