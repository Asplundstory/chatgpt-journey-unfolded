import { useState, useMemo } from "react";
import { Search, Wine, Filter, RotateCcw, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WineList } from "@/components/WineList";
import { WineFilters } from "@/components/WineFilters";
import { useWines } from "@/hooks/useWines";
import { SystembolagetSyncButton } from "@/components/SystembolagetSyncButton";

const Index = () => {
  const { wines: systembolagetWines, loading, error, refetch } = useWines();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    country: "",
    vintage: "",
    drinkingWindowStart: "",
    drinkingWindowEnd: "",
    storageTimeRange: [0, 30],
    investmentScore: [0, 10]
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    country: "",
    vintage: "",
    drinkingWindowStart: "",
    drinkingWindowEnd: "",
    storageTimeRange: [0, 30],
    investmentScore: [0, 10]
  });
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      valueAppreciation: 12.5,
      projectedReturns: {
        oneYear: 8.5,
        threeYears: 22.0,
        fiveYears: 45.5,
        tenYears: 125.0
      }
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
      valueAppreciation: 3.2,
      projectedReturns: {
        oneYear: 2.1,
        threeYears: 8.5,
        fiveYears: 15.2,
        tenYears: 28.0
      }
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
      valueAppreciation: 8.7,
      projectedReturns: {
        oneYear: 5.2,
        threeYears: 18.8,
        fiveYears: 35.0,
        tenYears: 78.5
      }
    }
  ];

  // Filtered wines based on applied search and filters
  const filteredWines = useMemo(() => {
    let wines = systembolagetWines;

    // If suggestions mode is active, show top investment opportunities
    if (showSuggestions) {
      return [...systembolagetWines]
        .sort((a, b) => {
          // Sort by investment score first, then by 5-year projected returns
          const scoreA = (a.investment_score || 0) * 10 + (a.projected_return_5y || 0);
          const scoreB = (b.investment_score || 0) * 10 + (b.projected_return_5y || 0);
          return scoreB - scoreA;
        })
        .slice(0, 10); // Show top 10 suggestions
    }

    return wines.filter(wine => {
      // Search filter
      const matchesSearch = !appliedSearchQuery || 
        wine.name?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        wine.producer?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        wine.country?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        wine.region?.toLowerCase().includes(appliedSearchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !appliedFilters.category || 
        wine.category?.toLowerCase().includes(appliedFilters.category.toLowerCase());

      // Price filter
      const matchesPrice = wine.price >= appliedFilters.priceRange[0] && 
        wine.price <= appliedFilters.priceRange[1];

      // Country filter
      const matchesCountry = !appliedFilters.country || 
        wine.country?.toLowerCase().includes(appliedFilters.country.toLowerCase());

      // Vintage filter
      const matchesVintage = !appliedFilters.vintage || 
        wine.vintage?.toString() === appliedFilters.vintage;

      // Drinking window filters
      const matchesDrinkingStart = !appliedFilters.drinkingWindowStart || 
        !wine.drinking_window_start ||
        wine.drinking_window_start >= parseInt(appliedFilters.drinkingWindowStart);
      
      const matchesDrinkingEnd = !appliedFilters.drinkingWindowEnd || 
        !wine.drinking_window_end ||
        wine.drinking_window_end <= parseInt(appliedFilters.drinkingWindowEnd.replace('+', ''));

      // Storage time filter (converted from months to years for display)
      const storageTimeYears = wine.storage_time_months ? wine.storage_time_months / 12 : 0;
      const matchesStorageTime = storageTimeYears >= appliedFilters.storageTimeRange[0] && 
        storageTimeYears <= appliedFilters.storageTimeRange[1];

      // Investment score filter
      const matchesInvestmentScore = !wine.investment_score || 
        (wine.investment_score >= appliedFilters.investmentScore[0] && 
         wine.investment_score <= appliedFilters.investmentScore[1]);

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesCountry && matchesVintage && matchesDrinkingStart && 
             matchesDrinkingEnd && matchesStorageTime && matchesInvestmentScore;
    });
  }, [appliedSearchQuery, appliedFilters, systembolagetWines, showSuggestions]);

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setAppliedSearchQuery(searchQuery);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      priceRange: [0, 1000],
      country: "",
      vintage: "",
      drinkingWindowStart: "",
      drinkingWindowEnd: "",
      storageTimeRange: [0, 30],
      investmentScore: [0, 10]
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setShowSuggestions(false);
  };

  const showHotInvestments = () => {
    setShowSuggestions(true);
  };

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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Systembolaget Data
              </Badge>
              {loading && (
                <Badge variant="outline" className="text-sm">
                  Laddar...
                </Badge>
              )}
              {error && (
                <Badge variant="destructive" className="text-sm">
                  Fallback data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök efter vin, producent, land..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <WineFilters filters={filters} onFiltersChange={setFilters} />

            {/* Filter Control Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button 
                onClick={applyFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Applicera filter
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Rensa val
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={showHotInvestments}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Föreslå hetaste investeringar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={refetch}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Uppdatera data
              </Button>
              
              <SystembolagetSyncButton />
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {loading ? (
                <>Laddar vindata från Systembolaget...</>
              ) : showSuggestions ? (
                <>Hottest investeringar just nu (Topp 10)</>
              ) : (
                <>Visar {filteredWines.length} viner</>
              )}
            </h2>
            {showSuggestions && (
              <p className="text-sm text-muted-foreground mt-1">
                Sorterat efter investeringsbetyg och 5-års prognostiserad avkastning
              </p>
            )}
            {error && (
              <p className="text-sm text-muted-foreground mt-1">
                Kunde ej ladda från Systembolaget API - använder fallback-data
              </p>
            )}
          </div>

          {/* Wine List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Hämtar vindata...</p>
              </div>
            </div>
          ) : (
            <WineList wines={filteredWines} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
