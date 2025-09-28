import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { X } from "lucide-react";

interface Filters {
  category: string[];
  priceRange: number[];
  country: string[];
  vintage: string[];
  drinkingWindowStart: string;
  drinkingWindowEnd: string;
  assortment: string[];
  storageTimeRange: number[];
  investmentPotential: number[];
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
      category: [],
      priceRange: [0, 10000],
      country: [],
      vintage: [],
      drinkingWindowStart: "",
      drinkingWindowEnd: "",
      assortment: [],
      storageTimeRange: [0, 30],
      investmentPotential: [1, 10]
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
        {/* First row - 3 columns */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Assortment Filter - Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="assortment">Sortiment</Label>
            <MultiSelect
              options={[
                { value: "Beställningssortiment", label: "Beställningssortiment" },
                { value: "Tillfälligt sortiment", label: "Tillfälligt sortiment" },
                { value: "Ordinarie sortiment", label: "Ordinarie sortiment" },
                { value: "Lokalproducerat", label: "Lokalproducerat" },
                { value: "Presentförpackning", label: "Presentförpackning" },
              ]}
              value={filters.assortment}
              onChange={(value) => updateFilter("assortment", value)}
              placeholder="Alla sortiment"
            />
          </div>

          {/* Category Filter - Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <MultiSelect
              options={[
                { value: "rött vin", label: "Rött vin" },
                { value: "vitt vin", label: "Vitt vin" },
                { value: "rosé", label: "Rosé" },
                { value: "mousserande", label: "Mousserande" },
                { value: "starkvin", label: "Starkvin" },
              ]}
              value={filters.category}
              onChange={(value) => updateFilter("category", value)}
              placeholder="Alla kategorier"
            />
          </div>

          {/* Country Filter - Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="country">Land</Label>
            <MultiSelect
              options={[
                { value: "frankrike", label: "Frankrike" },
                { value: "italien", label: "Italien" },
                { value: "spanien", label: "Spanien" },
                { value: "tyskland", label: "Tyskland" },
                { value: "sverige", label: "Sverige" },
                { value: "chile", label: "Chile" },
                { value: "australien", label: "Australien" },
                { value: "usa", label: "USA" },
                { value: "argentina", label: "Argentina" },
                { value: "portugal", label: "Portugal" },
              ]}
              value={filters.country}
              onChange={(value) => updateFilter("country", value)}
              placeholder="Alla länder"
            />
          </div>
        </div>

        {/* Second row - 3 columns */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Vintage Filter - Multi-select */}
          <div className="space-y-2">
            <Label htmlFor="vintage">Årgång</Label>
            <MultiSelect
              options={[
                { value: "2023", label: "2023" },
                { value: "2022", label: "2022" },
                { value: "2021", label: "2021" },
                { value: "2020", label: "2020" },
                { value: "2019", label: "2019" },
                { value: "2018", label: "2018" },
                { value: "2017", label: "2017" },
                { value: "2016", label: "2016" },
                { value: "2015", label: "2015" },
                { value: "2014", label: "2014" },
                { value: "2013", label: "2013" },
              ]}
              value={filters.vintage}
              onChange={(value) => updateFilter("vintage", value)}
              placeholder="Alla årgångar"
            />
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
              <SelectContent className="bg-popover z-50">
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
              <SelectContent className="bg-popover z-50">
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
          <Label>Prisintervall: {filters.priceRange[0]} → {filters.priceRange[1] >= 10000 ? `>${filters.priceRange[1]}` : filters.priceRange[1]} kr</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter("priceRange", value)}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
        </div>

        {/* Storage Time Slider */}
        <div className="space-y-3">
          <Label>Lagringstid: {filters.storageTimeRange[0]} → {filters.storageTimeRange[1] >= 30 ? `>${filters.storageTimeRange[1]}` : filters.storageTimeRange[1]} år</Label>
          <Slider
            value={filters.storageTimeRange}
            onValueChange={(value) => updateFilter("storageTimeRange", value)}
            max={30}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Investment Potential Slider */}
        <div className="space-y-3">
          <Label>Investeringspotential: {filters.investmentPotential[0]} → {filters.investmentPotential[1]} (1-10)</Label>
          <Slider
            value={filters.investmentPotential}
            onValueChange={(value) => updateFilter("investmentPotential", value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};