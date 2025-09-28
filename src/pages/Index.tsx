import { useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Search, Wine, Filter, RotateCcw, TrendingUp, Download, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VirtualizedWineTable, SortField, SortDirection } from "@/components/VirtualizedWineTable";
import { WineFilters } from "@/components/WineFilters";
import { WineRecommendations } from "@/components/WineRecommendations";
import { WineListManager } from "@/components/WineListManager";
import { AboutService } from "@/components/AboutService";
import { useWines } from "@/hooks/useWines";
import { useWineExport } from "@/hooks/useWineExport";
import { SystembolagetSyncButton } from "@/components/SystembolagetSyncButton";
import { useFilterStore } from "@/stores/filterStore";

const Index = () => {
  const { wines: systembolagetWines, loading, error, refetch } = useWines();
  const { exportToCSV, exportToJSON } = useWineExport();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialLoad = useRef(true);
  
  // Zustand store for filters and state management
  const {
    searchQuery,
    filters,
    appliedFilters,
    appliedSearchQuery,
    showSuggestions,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    setSearchQuery,
    setFilters,
    setAppliedFilters,
    setAppliedSearchQuery,
    setShowSuggestions,
    setCurrentPage,
    setSorting,
    applyFilters: storeApplyFilters,
    clearFilters: storeClearFilters,
    resetPagination
  } = useFilterStore();

  // Debounced search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Use debounced search query for filtering  
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
      // Search filter using debounced search query
      const searchToUse = appliedSearchQuery || debouncedSearchQuery;
      const matchesSearch = !searchToUse || 
        wine.name?.toLowerCase().includes(searchToUse.toLowerCase()) ||
        wine.producer?.toLowerCase().includes(searchToUse.toLowerCase()) ||
        wine.country?.toLowerCase().includes(searchToUse.toLowerCase()) ||
        wine.region?.toLowerCase().includes(searchToUse.toLowerCase());

      // Category filter - improved to handle arrays
      const matchesCategory = appliedFilters.category.length === 0 || 
        appliedFilters.category.some(cat => 
          wine.category?.toLowerCase().includes(cat.toLowerCase())
        );

      // Price filter - handle "greater than" when at max value
      const winePrice = wine.price || 0;
      const priceMaxValue = 10000;
      const matchesPrice = winePrice >= appliedFilters.priceRange[0] && 
        (appliedFilters.priceRange[1] >= priceMaxValue ? true : winePrice <= appliedFilters.priceRange[1]);

      // Country filter - improved to handle arrays
      const matchesCountry = appliedFilters.country.length === 0 || 
        appliedFilters.country.some(country => 
          wine.country?.toLowerCase().includes(country.toLowerCase())
        );

      // Vintage filter - improved to handle arrays
      const matchesVintage = appliedFilters.vintage.length === 0 || 
        appliedFilters.vintage.some(vintage => 
          wine.vintage?.toString() === vintage
        );

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

      // Assortment filter - improved to handle arrays
      const matchesAssortment = appliedFilters.assortment.length === 0 || 
        appliedFilters.assortment.some(assort => 
          wine.assortment?.toLowerCase().includes(assort.toLowerCase())
        );

      // Investment potential filter
      const matchesInvestmentPotential = appliedFilters.investmentPotential[0] === 1 || 
        (wine.investment_score && wine.investment_score >= appliedFilters.investmentPotential[0] &&
         wine.investment_score <= appliedFilters.investmentPotential[1]);

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesCountry && matchesVintage && matchesDrinkingStart && 
             matchesDrinkingEnd && matchesStorageTime && matchesAssortment &&
             matchesInvestmentPotential;
    });
  }, [appliedSearchQuery, debouncedSearchQuery, appliedFilters, systembolagetWines, showSuggestions]);

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

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSorting(field, direction);
  };

  // URL synchronization functions
  const updateURLFromFilters = (filtersToSync: typeof filters, searchToSync: string) => {
    const params = new URLSearchParams();
    
    // Add search query if present
    if (searchToSync) {
      params.set('search', searchToSync);
    }
    
    // Add array filters if they have values
    if (filtersToSync.category.length > 0) {
      params.set('category', filtersToSync.category.join(','));
    }
    if (filtersToSync.country.length > 0) {
      params.set('country', filtersToSync.country.join(','));
    }
    if (filtersToSync.vintage.length > 0) {
      params.set('vintage', filtersToSync.vintage.join(','));
    }
    if (filtersToSync.assortment.length > 0) {
      params.set('assortment', filtersToSync.assortment.join(','));
    }
    
    // Add range filters if not default values
    if (filtersToSync.priceRange[0] !== 0 || filtersToSync.priceRange[1] !== 10000) {
      params.set('priceRange', `${filtersToSync.priceRange[0]}-${filtersToSync.priceRange[1]}`);
    }
    if (filtersToSync.storageTimeRange[0] !== 0 || filtersToSync.storageTimeRange[1] !== 30) {
      params.set('storageTimeRange', `${filtersToSync.storageTimeRange[0]}-${filtersToSync.storageTimeRange[1]}`);
    }
    
    // Add drinking window filters if present
    if (filtersToSync.drinkingWindowStart) {
      params.set('drinkingStart', filtersToSync.drinkingWindowStart);
    }
    if (filtersToSync.drinkingWindowEnd) {
      params.set('drinkingEnd', filtersToSync.drinkingWindowEnd);
    }
    
    // Add investment potential filter if not default values
    if (filtersToSync.investmentPotential[0] !== 1 || filtersToSync.investmentPotential[1] !== 10) {
      params.set('investmentPotential', `${filtersToSync.investmentPotential[0]}-${filtersToSync.investmentPotential[1]}`);
    }
    
    setSearchParams(params);
  };

  const loadFiltersFromURL = () => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category')?.split(',').filter(Boolean) || [];
    const country = searchParams.get('country')?.split(',').filter(Boolean) || [];
    const vintage = searchParams.get('vintage')?.split(',').filter(Boolean) || [];
    const assortment = searchParams.get('assortment')?.split(',').filter(Boolean) || [];
    
    const priceRange: [number, number] = searchParams.get('priceRange')?.split('-').map(Number) as [number, number] || [0, 10000];
    const storageTimeRange: [number, number] = searchParams.get('storageTimeRange')?.split('-').map(Number) as [number, number] || [0, 30];
    
    const drinkingWindowStart = searchParams.get('drinkingStart') || '';
    const drinkingWindowEnd = searchParams.get('drinkingEnd') || '';
    
    const investmentPotential: [number, number] = searchParams.get('investmentPotential')?.split('-').map(Number) as [number, number] || [1, 10];
    
    const urlFilters = {
      category,
      priceRange,
      country,
      vintage,
      drinkingWindowStart,
      drinkingWindowEnd,
      assortment,
      storageTimeRange,
      investmentPotential
    };
    
    setSearchQuery(search);
    setAppliedSearchQuery(search);
    setFilters(urlFilters);
    setAppliedFilters(urlFilters);
  };

  // Load filters from URL on component mount
  useEffect(() => {
    loadFiltersFromURL();
    isInitialLoad.current = false;
  }, []);

  // Update URL when applied filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      console.log('About to update URL with filters:', appliedFilters);
      console.log('About to update URL with search:', appliedSearchQuery);
      
      // Create new URL params
      const params = new URLSearchParams(window.location.search);
      
      // Clear all existing params first
      params.delete('search');
      params.delete('category');
      params.delete('country');
      params.delete('vintage');
      params.delete('assortment');
      params.delete('priceRange');
      params.delete('storageTimeRange');
      params.delete('drinkingStart');
      params.delete('drinkingEnd');
      params.delete('investmentPotential');
      
      // Add search query if present
      if (appliedSearchQuery) {
        params.set('search', appliedSearchQuery);
      }
      
      // Add array filters if they have values
      if (appliedFilters.category.length > 0) {
        params.set('category', appliedFilters.category.join(','));
      }
      if (appliedFilters.country.length > 0) {
        params.set('country', appliedFilters.country.join(','));
      }
      if (appliedFilters.vintage.length > 0) {
        params.set('vintage', appliedFilters.vintage.join(','));
      }
      if (appliedFilters.assortment.length > 0) {
        params.set('assortment', appliedFilters.assortment.join(','));
      }
      
      // Add range filters if not default values
      if (appliedFilters.priceRange[0] !== 0 || appliedFilters.priceRange[1] !== 10000) {
        params.set('priceRange', `${appliedFilters.priceRange[0]}-${appliedFilters.priceRange[1]}`);
      }
      if (appliedFilters.storageTimeRange[0] !== 0 || appliedFilters.storageTimeRange[1] !== 30) {
        params.set('storageTimeRange', `${appliedFilters.storageTimeRange[0]}-${appliedFilters.storageTimeRange[1]}`);
      }
      
      // Add drinking window filters if present
      if (appliedFilters.drinkingWindowStart) {
        params.set('drinkingStart', appliedFilters.drinkingWindowStart);
      }
      if (appliedFilters.drinkingWindowEnd) {
        params.set('drinkingEnd', appliedFilters.drinkingWindowEnd);
      }
      
      // Add investment potential filter if not default values
      if (appliedFilters.investmentPotential[0] !== 1 || appliedFilters.investmentPotential[1] !== 10) {
        params.set('investmentPotential', `${appliedFilters.investmentPotential[0]}-${appliedFilters.investmentPotential[1]}`);
      }
      
      console.log('New URL params string:', params.toString());
      console.log('Current URL:', window.location.href);
      
      // Update URL without causing navigation
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.pushState({}, '', newUrl);
      
      console.log('URL after update:', window.location.href);
    }
  }, [appliedFilters, appliedSearchQuery]);

  const showHotInvestments = () => {
    // Check if we have wines with investment data
    const winesWithInvestmentData = systembolagetWines.filter(wine => 
      wine.investment_score && wine.investment_score > 0
    );
    
    if (winesWithInvestmentData.length === 0) {
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
              <div>
                <h1 className="text-3xl font-bold text-foreground">The Story – Vinguide</h1>
                <button 
                  onClick={() => document.getElementById('about-service')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline flex items-center gap-1 mt-1"
                >
                  <Info className="h-3 w-3" />
                  Om tjänsten
                </button>
              </div>
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
                onClick={storeApplyFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Applicera filter
              </Button>
              
              <Button 
                variant="outline" 
                onClick={storeClearFilters}
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
                  storeClearFilters();
                  // Clear URL parameters
                  setSearchParams(new URLSearchParams());
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
              
              <Button 
                variant="outline" 
                onClick={() => exportToCSV(sortedWines, `vinlista_${new Date().toISOString().split('T')[0]}`)}
                className="flex items-center gap-2"
                disabled={sortedWines.length === 0}
              >
                <Download className="h-4 w-4" />
                Exportera CSV
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
                   <>Visar {sortedWines.length} av {systembolagetWines.length} viner</>
                 )}
              </h2>
              {!loading && !showSuggestions && (
                <div className="text-sm text-muted-foreground">
                  {filteredWines.length < systembolagetWines.length && (
                    <p>{systembolagetWines.length - sortedWines.length} viner filtrerade bort</p>
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
            <VirtualizedWineTable 
              wines={sortedWines} 
              onSort={handleSort}
              sortField={sortField as SortField}
              sortDirection={sortDirection}
            />
          )}
        </div>

        {/* Wine Lists Manager */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <WineListManager wines={systembolagetWines} />
          </CardContent>
        </Card>

        {/* About Service */}
        <div id="about-service" className="mt-8">
            <AboutService />
        </div>
      </div>
    </div>
  );
};

export default Index;