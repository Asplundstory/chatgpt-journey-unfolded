import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Filters {
  category: string[];
  priceRange: [number, number];
  country: string[];
  vintage: string[];
  drinkingWindowStart: string;
  drinkingWindowEnd: string;
  assortment: string[];
  storageTimeRange: [number, number];
  investmentPotential: [number, number];
}

interface FilterState {
  // Filter state
  searchQuery: string;
  filters: Filters;
  appliedFilters: Filters;
  appliedSearchQuery: string;
  showSuggestions: boolean;
  
  // Pagination & sorting
  currentPage: number;
  itemsPerPage: number;
  sortField: string | null;
  sortDirection: 'asc' | 'desc' | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Filters) => void;
  setAppliedFilters: (filters: Filters) => void;
  setAppliedSearchQuery: (query: string) => void;
  setShowSuggestions: (show: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSorting: (field: string | null, direction: 'asc' | 'desc' | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  resetPagination: () => void;
}

const defaultFilters: Filters = {
  category: [],
  priceRange: [0, 10000],
  country: [],
  vintage: [],
  drinkingWindowStart: "",
  drinkingWindowEnd: "",
  assortment: [],
  storageTimeRange: [0, 30],
  investmentPotential: [1, 10]
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      searchQuery: "",
      filters: defaultFilters,
      appliedFilters: defaultFilters,
      appliedSearchQuery: "",
      showSuggestions: false,
      currentPage: 1,
      itemsPerPage: 100,
      sortField: null,
      sortDirection: null,

      // Actions
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setFilters: (filters: Filters) => set({ filters }),
      
      setAppliedFilters: (appliedFilters: Filters) => set({ appliedFilters }),
      
      setAppliedSearchQuery: (appliedSearchQuery: string) => set({ appliedSearchQuery }),
      
      setShowSuggestions: (showSuggestions: boolean) => set({ showSuggestions }),
      
      setCurrentPage: (currentPage: number) => set({ currentPage }),
      
      setSorting: (sortField: string | null, sortDirection: 'asc' | 'desc' | null) => 
        set({ sortField, sortDirection, currentPage: 1 }),
      
      applyFilters: () => {
        const { filters, searchQuery } = get();
        set({ 
          appliedFilters: { ...filters }, 
          appliedSearchQuery: searchQuery,
          showSuggestions: false,
          currentPage: 1
        });
      },
      
      clearFilters: () => set({
        filters: defaultFilters,
        appliedFilters: defaultFilters,
        searchQuery: "",
        appliedSearchQuery: "",
        showSuggestions: false,
        currentPage: 1,
        sortField: null,
        sortDirection: null
      }),
      
      resetPagination: () => set({ currentPage: 1 })
    }),
    {
      name: 'wine-filter-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist applied filters and search, not temporary filter state
        appliedFilters: state.appliedFilters,
        appliedSearchQuery: state.appliedSearchQuery,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        itemsPerPage: state.itemsPerPage
      })
    }
  )
);