import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface Wine {
  id: number;
  name: string;
  producer: string;
  category: string;
  price: number;
  alcoholContent: number;
  country: string;
  region: string;
  vintage: number;
  description: string;
  image: string;
  drinkingWindow: {
    start: number;
    end: number;
  };
  storageTime: number; // years
  investmentScore?: number; // 1-10 scale from Wine-Searcher analysis
  valueAppreciation?: number; // percentage
  projectedReturns: {
    oneYear: number;
    threeYears: number;
    fiveYears: number;
    tenYears: number;
  };
}

interface WineCardProps {
  wine: Wine;
}

export const WineCard = ({ wine }: WineCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
              {wine.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{wine.producer}</p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {wine.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{wine.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{wine.vintage}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{wine.alcoholContent}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Drick: {wine.drinkingWindow.start}-{wine.drinkingWindow.end}</span>
            </div>
            {wine.investmentScore && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-primary font-medium">
                  Investering: {wine.investmentScore}/10
                </span>
              </div>
            )}
          </div>

          {/* Projected Returns */}
          <div className="grid grid-cols-4 gap-2 p-2 bg-accent/20 rounded-md">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">1år</div>
              <div className="text-sm font-semibold text-primary">
                {wine.projectedReturns.oneYear > 0 ? '+' : ''}{wine.projectedReturns.oneYear}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">3år</div>
              <div className="text-sm font-semibold text-primary">
                {wine.projectedReturns.threeYears > 0 ? '+' : ''}{wine.projectedReturns.threeYears}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">5år</div>
              <div className="text-sm font-semibold text-primary">
                {wine.projectedReturns.fiveYears > 0 ? '+' : ''}{wine.projectedReturns.fiveYears}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">10år</div>
              <div className="text-sm font-semibold text-primary">
                {wine.projectedReturns.tenYears > 0 ? '+' : ''}{wine.projectedReturns.tenYears}%
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {wine.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="text-xl font-bold text-primary">
              {wine.price} kr
            </div>
            {wine.valueAppreciation && (
              <div className="text-xs text-green-600 font-medium">
                +{wine.valueAppreciation}% värdeökning
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <Badge variant="outline" className="text-xs">
              {wine.region}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Lagra: {wine.storageTime} år
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};