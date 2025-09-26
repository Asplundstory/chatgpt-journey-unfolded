import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Percent } from "lucide-react";

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
        <div className="flex items-center justify-between">
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
              <Percent className="h-3 w-3" />
              <span>{wine.alcoholContent}%</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {wine.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-primary">
            {wine.price} kr
          </div>
          <Badge variant="outline" className="text-xs">
            {wine.region}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};