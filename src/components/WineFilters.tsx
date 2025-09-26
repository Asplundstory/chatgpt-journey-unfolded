import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Filters {
  category: string;
  priceRange: number[];
  alcoholContent: number[];
  country: string;
  vintage: string;
}

interface WineFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const WineFilters = ({ filters, onFiltersChange }: WineFiltersProps) => {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      priceRange: [0, 1000],
      alcoholContent: [0, 20],
      country: "",
      vintage: ""
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg">Filter</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Rensa
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="">Alla kategorier</SelectItem>
                <SelectItem value="rött vin">Rött vin</SelectItem>
                <SelectItem value="vitt vin">Vitt vin</SelectItem>
                <SelectItem value="rosé">Rosé</SelectItem>
                <SelectItem value="mousserande">Mousserande</SelectItem>
                <SelectItem value="starkvin">Starkvin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <Label htmlFor="country">Land</Label>
            <Select
              value={filters.country}
              onValueChange={(value) => updateFilter("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj land" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="">Alla länder</SelectItem>
                <SelectItem value="frankrike">Frankrike</SelectItem>
                <SelectItem value="italien">Italien</SelectItem>
                <SelectItem value="spanien">Spanien</SelectItem>
                <SelectItem value="tyskland">Tyskland</SelectItem>
                <SelectItem value="sverige">Sverige</SelectItem>
                <SelectItem value="chile">Chile</SelectItem>
                <SelectItem value="australien">Australien</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vintage Filter */}
          <div className="space-y-2">
            <Label htmlFor="vintage">Årgång</Label>
            <Select
              value={filters.vintage}
              onValueChange={(value) => updateFilter("vintage", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj årgång" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="">Alla årgångar</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2018">2018</SelectItem>
                <SelectItem value="2017">2017</SelectItem>
                <SelectItem value="2016">2016</SelectItem>
                <SelectItem value="2015">2015</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="space-y-3">
          <Label>Prisintervall: {filters.priceRange[0]} - {filters.priceRange[1]} kr</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter("priceRange", value)}
            max={2000}
            min={0}
            step={50}
            className="w-full"
          />
        </div>

        {/* Alcohol Content Slider */}
        <div className="space-y-3">
          <Label>Alkoholhalt: {filters.alcoholContent[0]}% - {filters.alcoholContent[1]}%</Label>
          <Slider
            value={filters.alcoholContent}
            onValueChange={(value) => updateFilter("alcoholContent", value)}
            max={20}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};