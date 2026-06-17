// Filter-related TypeScript types for dynamic data fetching

export interface PriceStatistics {
  min: number;
  max: number;
  average: number;
  median: number;
  totalProducts: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  priceRanges: PriceRangeOption[];
}

export interface PriceRangeOption {
  min: number;
  max: number;
  label: string;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  description?: string;
  productsCount: number;
  featured?: boolean;
}

export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export interface FilterSection {
  id: string;
  name: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range';
}

export interface DynamicFiltersData {
  categories: CategoryWithCount[];
  priceStats: PriceStatistics;
  filterSections: FilterSection[];
}

export interface FilterState {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  [key: string]: unknown;
}

export interface ProductFilters {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  inStock: boolean;
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'rating';
}

export interface FilterHookOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export interface FilterQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export interface UseFiltersResult {
  categories: FilterQueryResult<CategoryWithCount[]>;
  priceStats: FilterQueryResult<PriceStatistics>;
  filterSections: FilterSection[];
  isLoading: boolean;
  hasError: boolean;
  refetchAll: () => void;
}