import { useState } from "react";
import { Search, Filter, Wine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WineCard } from "@/components/WineCard";
import { WineFilters } from "@/components/WineFilters";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    alcoholContent: [0, 20],
    country: "",
    vintage: "",
    drinkingWindowStart: "",
    drinkingWindowEnd: "",
    storageTimeRange: [0, 30],
    investmentScore: [0, 10]
  });

  // Mock wine data - will be replaced with Systembolaget API data
  const mockWines = [
    {
      id: 1,
      name: "Château Margaux 2015",
      producer: "Château Margaux",
      category: "Rött vin",
      price: 4500,
      alcoholContent: 13.5,
      country: "Frankrike",
      region: "Bordeaux",
      vintage: 2015,
      description: "Ett exceptionellt rött vin från Bordeaux med komplex smak av svarta bär och kryddor.",
      image: "/placeholder.svg",
      drinkingWindow: { start: 2025, end: 2045 },
      storageTime: 25,
      investmentScore: 9,
      valueAppreciation: 12.5
    },
    {
      id: 2,
      name: "Sancerre Les Monts Damnés",
      producer: "Henri Bourgeois",
      category: "Vitt vin",
      price: 250,
      alcoholContent: 12.5,
      country: "Frankrike",
      region: "Loire",
      vintage: 2022,
      description: "Elegant Sauvignon Blanc med mineraler och citrusnoter.",
      image: "/placeholder.svg",
      drinkingWindow: { start: 2024, end: 2028 },
      storageTime: 6,
      investmentScore: 6,
      valueAppreciation: 3.2
    },
    {
      id: 3,
      name: "Barolo DOCG 2018",
      producer: "Giuseppe Rinaldi",
      category: "Rött vin",
      price: 680,
      alcoholContent: 14.0,
      country: "Italien",
      region: "Piemonte",
      vintage: 2018,
      description: "Kraftfullt rött vin med toner av körsbär, rosor och tryffel.",
      image: "/placeholder.svg",
      drinkingWindow: { start: 2026, end: 2038 },
      storageTime: 15,
      investmentScore: 8,
      valueAppreciation: 8.7
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wine className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">The Story – Vinguide</h1>
            </div>
            <Badge variant="secondary" className="text-sm">
              Systembolaget Data
            </Badge>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök efter vin, producent, land..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {showFilters && (
            <WineFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Visar {mockWines.length} viner
          </h2>
        </div>

        {/* Wine Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
