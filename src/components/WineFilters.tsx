import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Filters {
  category: string;
  priceRange: number[];
  country: string;
  vintage: string;
  drinkingWindowStart: string;
  drinkingWindowEnd: string;
  storageTimeRange: number[];
  projectedReturn1y: number[];
  projectedReturn3y: number[];
  projectedReturn5y: number[];
  projectedReturn10y: number[];
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
      country: "",
      vintage: "",
      drinkingWindowStart: "",
      drinkingWindowEnd: "",
      storageTimeRange: [0, 30],
      projectedReturn1y: [0, 100],
      projectedReturn3y: [0, 300],
      projectedReturn5y: [0, 500],
      projectedReturn10y: [0, 1000]
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alla kategorier" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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
                <SelectValue placeholder="Alla länder" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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
                <SelectValue placeholder="Alla årgångar" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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

          {/* Drinking Window Start */}
          <div className="space-y-2">
            <Label htmlFor="drinkingStart">Drick från år</Label>
            <Select
              value={filters.drinkingWindowStart}
              onValueChange={(value) => updateFilter("drinkingWindowStart", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alla startår" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                <SelectItem value="2030">2030+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drinking Window End */}
          <div className="space-y-2">
            <Label htmlFor="drinkingEnd">Drick till år</Label>
            <Select
              value={filters.drinkingWindowEnd}
              onValueChange={(value) => updateFilter("drinkingWindowEnd", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alla slutår" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
                <SelectItem value="2035">2035</SelectItem>
                <SelectItem value="2040">2040</SelectItem>
                <SelectItem value="2045">2045</SelectItem>
                <SelectItem value="2050">2050+</SelectItem>
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

        {/* Storage Time Slider */}
        <div className="space-y-3">
          <Label>Lagringstid: {filters.storageTimeRange[0]} - {filters.storageTimeRange[1]} år</Label>
          <Slider
            value={filters.storageTimeRange}
            onValueChange={(value) => updateFilter("storageTimeRange", value)}
            max={30}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Projected Return Sliders */}
        <div className="space-y-3">
          <Label>Avkastning 1 år: {filters.projectedReturn1y[0]} - {filters.projectedReturn1y[1]}%</Label>
          <Slider
            value={filters.projectedReturn1y}
            onValueChange={(value) => updateFilter("projectedReturn1y", value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label>Avkastning 3 år: {filters.projectedReturn3y[0]} - {filters.projectedReturn3y[1]}%</Label>
          <Slider
            value={filters.projectedReturn3y}
            onValueChange={(value) => updateFilter("projectedReturn3y", value)}
            max={300}
            min={0}
            step={10}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label>Avkastning 5 år: {filters.projectedReturn5y[0]} - {filters.projectedReturn5y[1]}%</Label>
          <Slider
            value={filters.projectedReturn5y}
            onValueChange={(value) => updateFilter("projectedReturn5y", value)}
            max={500}
            min={0}
            step={25}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label>Avkastning 10 år: {filters.projectedReturn10y[0]} - {filters.projectedReturn10y[1]}%</Label>
          <Slider
            value={filters.projectedReturn10y}
            onValueChange={(value) => updateFilter("projectedReturn10y", value)}
            max={1000}
            min={0}
            step={50}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};