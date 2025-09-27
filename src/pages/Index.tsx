import { useState, useMemo } from "react";
import { Search, Wine, Filter, RotateCcw, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { WineTable, SortField, SortDirection } from "@/components/WineTable";
import { WineFilters } from "@/components/WineFilters";
import { WineRecommendations } from "@/components/WineRecommendations";
import { useWines } from "@/hooks/useWines";
import { SystembolagetSyncButton } from "@/components/SystembolagetSyncButton";

const Index = () => {
  const { wines: systembolagetWines, loading, error, refetch } = useWines();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 75000],
    country: "",
    vintage: "",
    drinkingWindowStart: "",
    drinkingWindowEnd: "",
    assortment: "",
    storageTimeRange: [0, 30],
    projectedReturn1y: [0, 100],
    projectedReturn3y: [0, 300],
    projectedReturn5y: [0, 500],
    projectedReturn10y: [0, 1000]
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    priceRange: [0, 75000],
    country: "",
    vintage: "",
    drinkingWindowStart: "",
    drinkingWindowEnd: "",
    assortment: "",
    storageTimeRange: [0, 30],
    projectedReturn1y: [0, 100],
    projectedReturn3y: [0, 300],
    projectedReturn5y: [0, 500],
    projectedReturn10y: [0, 1000]
  });
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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
      const winesWithInvestmentData = systembolagetWines.filter(wine => 
        wine.investment_score && wine.projected_return_5y
      );
      
      if (winesWithInvestmentData.length === 0) {
        return [];
      }
      
      return [...winesWithInvestmentData]
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

      // Category filter - improved null handling
      const matchesCategory = !appliedFilters.category || 
        wine.category?.toLowerCase().includes(appliedFilters.category.toLowerCase());

      // Price filter - handle "greater than" when at max value
      const winePrice = wine.price || 0;
      const priceMaxValue = 75000;
      const matchesPrice = winePrice >= appliedFilters.priceRange[0] && 
        (appliedFilters.priceRange[1] >= priceMaxValue ? true : winePrice <= appliedFilters.priceRange[1]);

      // Country filter
      const matchesCountry = !appliedFilters.country || 
        wine.country?.toLowerCase().includes(appliedFilters.country.toLowerCase());

      // Vintage filter
      const matchesVintage = !appliedFilters.vintage || 
        wine.vintage?.toString() === appliedFilters.vintage;

      // Drinking window filters - improved null handling
      const matchesDrinkingStart = !appliedFilters.drinkingWindowStart || 
        (wine.drinking_window_start && wine.drinking_window_start >= parseInt(appliedFilters.drinkingWindowStart));
      
      const matchesDrinkingEnd = !appliedFilters.drinkingWindowEnd || 
        (wine.drinking_window_end && wine.drinking_window_end <= parseInt(appliedFilters.drinkingWindowEnd.replace('+', '')));

      // Storage time filter - handle "greater than" when at max value
      const storageTimeYears = wine.storage_time_months ? wine.storage_time_months / 12 : 0;
      const storageMaxValue = 30;
      const matchesStorageTime = storageTimeYears >= appliedFilters.storageTimeRange[0] && 
        (appliedFilters.storageTimeRange[1] >= storageMaxValue ? true : storageTimeYears <= appliedFilters.storageTimeRange[1]);

      // Assortment filter - fixed logic to not exclude wines with missing assortment
      const matchesAssortment = !appliedFilters.assortment || 
        (wine.assortment && wine.assortment.toLowerCase().includes(appliedFilters.assortment.toLowerCase()));

      // Projected return filters - handle "greater than" when at max values
      const return1yMaxValue = 100;
      const return3yMaxValue = 300;
      const return5yMaxValue = 500;
      const return10yMaxValue = 1000;

      const matchesReturn1y = appliedFilters.projectedReturn1y[0] === 0 || 
        (wine.projected_return_1y && wine.projected_return_1y >= appliedFilters.projectedReturn1y[0] &&
         (appliedFilters.projectedReturn1y[1] >= return1yMaxValue ? true : wine.projected_return_1y <= appliedFilters.projectedReturn1y[1]));

      const matchesReturn3y = appliedFilters.projectedReturn3y[0] === 0 || 
        (wine.projected_return_3y && wine.projected_return_3y >= appliedFilters.projectedReturn3y[0] &&
         (appliedFilters.projectedReturn3y[1] >= return3yMaxValue ? true : wine.projected_return_3y <= appliedFilters.projectedReturn3y[1]));

      const matchesReturn5y = appliedFilters.projectedReturn5y[0] === 0 || 
        (wine.projected_return_5y && wine.projected_return_5y >= appliedFilters.projectedReturn5y[0] &&
         (appliedFilters.projectedReturn5y[1] >= return5yMaxValue ? true : wine.projected_return_5y <= appliedFilters.projectedReturn5y[1]));

      const matchesReturn10y = appliedFilters.projectedReturn10y[0] === 0 || 
        (wine.projected_return_10y && wine.projected_return_10y >= appliedFilters.projectedReturn10y[0] &&
         (appliedFilters.projectedReturn10y[1] >= return10yMaxValue ? true : wine.projected_return_10y <= appliedFilters.projectedReturn10y[1]));

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesCountry && matchesVintage && matchesDrinkingStart && 
             matchesDrinkingEnd && matchesStorageTime && matchesAssortment &&
             matchesReturn1y && matchesReturn3y && matchesReturn5y && matchesReturn10y;
    });
  }, [appliedSearchQuery, appliedFilters, systembolagetWines, showSuggestions]);

  // Sorted wines
  const sortedWines = useMemo(() => {
    if (!sortField || !sortDirection) {
      return filteredWines;
    }

    return [...filteredWines].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'country':
          aValue = a.country || '';
          bValue = b.country || '';
          break;
        case 'region':
          aValue = a.region || '';
          bValue = b.region || '';
          break;
        case 'vintage':
          aValue = a.vintage || 0;
          bValue = b.vintage || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'assortment':
          aValue = a.assortment || '';
          bValue = b.assortment || '';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'investment_score':
          aValue = a.investment_score || 0;
          bValue = b.investment_score || 0;
          break;
        case 'projected_return_1y':
          aValue = a.projected_return_1y || 0;
          bValue = b.projected_return_1y || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'sv') 
          : bValue.localeCompare(aValue, 'sv');
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredWines, sortField, sortDirection]);

  // Paginated wines
  const paginatedWines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedWines.slice(startIndex, endIndex);
  }, [sortedWines, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedWines.length / itemsPerPage);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setAppliedSearchQuery(searchQuery);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      priceRange: [0, 75000],
      country: "",
      vintage: "",
      drinkingWindowStart: "",
      drinkingWindowEnd: "",
      assortment: "",
      storageTimeRange: [0, 30],
      projectedReturn1y: [0, 100],
      projectedReturn3y: [0, 300],
      projectedReturn5y: [0, 500],
      projectedReturn10y: [0, 1000]
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setShowSuggestions(false);
  };

  const showHotInvestments = () => {
    // Check if we have wines with investment data
    const winesWithInvestmentData = systembolagetWines.filter(wine => 
      wine.investment_score && wine.projected_return_5y
    );
    
    if (winesWithInvestmentData.length === 0) {
      // Show a toast or alert that no investment data is available
      alert('Inga viner med investeringsdata tillgängliga. Kör synkronisering för att hämta data.');
      return;
    }
    
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
                variant="default" 
                onClick={() => {
                  setSearchQuery("");
                  setAppliedSearchQuery("");
                  const showAllFilters = {
                    category: "",
                    priceRange: [0, 75000],
                    country: "",
                    vintage: "",
                    drinkingWindowStart: "",
                    drinkingWindowEnd: "",
                    assortment: "",
                    storageTimeRange: [0, 30],
                    projectedReturn1y: [0, 100],
                    projectedReturn3y: [0, 300],
                    projectedReturn5y: [0, 500],
                    projectedReturn10y: [0, 1000]
                  };
                  setFilters(showAllFilters);
                  setAppliedFilters(showAllFilters);
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-2"
              >
                <Wine className="h-4 w-4" />
                Visa alla viner
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={showHotInvestments}
                className="flex items-center gap-2"
                disabled={systembolagetWines.filter(w => w.investment_score && w.projected_return_5y).length === 0}
              >
                <TrendingUp className="h-4 w-4" />
                {systembolagetWines.length === 0 
                  ? 'Inga viner laddade' 
                  : systembolagetWines.filter(w => w.investment_score && w.projected_return_5y).length === 0
                  ? 'Investeringsdata saknas'
                  : 'Föreslå hetaste investeringar'
                }
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
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {loading ? (
                  <>Laddar vindata från Systembolaget...</>
                ) : showSuggestions ? (
                  <>🔥 Hetaste investeringarna just nu</>
                 ) : (
                   <>Visar {paginatedWines.length} av {sortedWines.length} viner (totalt {systembolagetWines.length})</>
                 )}
              </h2>
              {!loading && !showSuggestions && (
                <div className="text-sm text-muted-foreground">
                  {totalPages > 1 && (
                    <p>Sida {currentPage} av {totalPages} ({itemsPerPage} viner per sida)</p>
                  )}
                  {filteredWines.length < systembolagetWines.length && (
                    <p>{systembolagetWines.length - sortedWines.length} viner filtrerade bort</p>
                  )}
                  {Object.entries(appliedFilters).some(([key, value]) => {
                    if (key === 'priceRange') return (value as number[])[0] > 0 || (value as number[])[1] < 75000;
                    if (key.includes('Range')) return (value as number[])[0] > 0 || (value as number[])[1] < (key.includes('storage') ? 30 : 1000);
                    return value && value !== "";
                  }) && (
                    <p>
                      Aktiva filter: {Object.entries(appliedFilters).filter(([key, value]) => {
                        if (key === 'priceRange') return (value as number[])[0] > 0 || (value as number[])[1] < 75000;
                        if (key.includes('Range')) return (value as number[])[0] > 0 || (value as number[])[1] < (key.includes('storage') ? 30 : 1000);
                        return value && value !== "";
                      }).length}
                    </p>
                  )}
                </div>
              )}
            </div>
            {showSuggestions && (
              <p className="text-sm text-muted-foreground mt-1">
                Sorterat efter investeringsbetyg och 5-års prognostiserad avkastning
                {filteredWines.length === 0 && 
                  " - Inga viner med investeringsdata tillgängliga än. Kör synkronisering först."
                }
              </p>
            )}
            {error && (
              <p className="text-sm text-muted-foreground mt-1">
                Kunde ej ladda från Systembolaget API - använder fallback-data
              </p>
            )}
          </div>

          {/* Wine Results or Recommendations */}
          {showSuggestions ? (
            <WineRecommendations 
              wines={filteredWines} 
              isVisible={showSuggestions} 
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Hämtar vindata...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <WineTable 
                wines={paginatedWines} 
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
