'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  PriceStatistics,
  CategoryWithCount,
  FilterSection,
  UseFiltersResult,
  FilterHookOptions,
} from '@/lib/types/filters';

// Legacy interfaces for backward compatibility
export interface PriceRange {
  label: string;
  value: string;
  min: number;
  max: number;
}

export interface FilterData {
  categories: FilterSection;
  priceRanges: PriceRange[];
  priceStats: PriceStatistics;
}

// Query hooks with React Query caching
export function useFilterCategories(options: FilterHookOptions = {}) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    cacheTime = 10 * 60 * 1000,
    refetchOnWindowFocus = false,
  } = options;

  return useQuery({
    queryKey: ['filter-categories'],
    queryFn: async (): Promise<CategoryWithCount[]> => {
      const response = await axios.get('/api/categories?limit=50');
      return response.data.categories;
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePriceStatistics(options: FilterHookOptions = {}) {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000,
    cacheTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
  } = options;

  return useQuery({
    queryKey: ['price-stats'],
    queryFn: async (): Promise<PriceStatistics> => {
      const response = await axios.get('/api/products/price-stats');
      return response.data;
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Main hook for getting all filter data with caching
export function useFilters(options: FilterHookOptions = {}): UseFiltersResult {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
  } = options;

  const categoriesQuery = useFilterCategories({ enabled, staleTime, cacheTime, refetchOnWindowFocus });
  const priceStatsQuery = usePriceStatistics({ enabled, staleTime, cacheTime, refetchOnWindowFocus });

  // Transform data into filter sections
  const filterSections: FilterSection[] = [
    {
      id: 'categories',
      name: 'Categories',
      type: 'checkbox',
      options: categoriesQuery.data?.map(category => ({
        id: category.id,
        name: category.name,
        count: category.productsCount || 0,
      })) || [],
    },
  ];

  // Loading and error states
  const isLoading = categoriesQuery.isLoading || priceStatsQuery.isLoading;
  const hasError = categoriesQuery.isError || priceStatsQuery.isError;

  const refetchAll = () => {
    categoriesQuery.refetch();
    priceStatsQuery.refetch();
  };

  return {
    categories: {
      data: categoriesQuery.data,
      isLoading: categoriesQuery.isLoading,
      isError: categoriesQuery.isError,
      error: categoriesQuery.error,
      refetch: categoriesQuery.refetch,
      isRefetching: categoriesQuery.isRefetching,
    },
    priceStats: {
      data: priceStatsQuery.data,
      isLoading: priceStatsQuery.isLoading,
      isError: priceStatsQuery.isError,
      error: priceStatsQuery.error,
      refetch: priceStatsQuery.refetch,
      isRefetching: priceStatsQuery.isRefetching,
    },
    filterSections,
    isLoading,
    hasError,
    refetchAll,
  };
}



// Hook for invalidating filter cache when products change
export function useInvalidateFilters() {
  const queryClient = useQueryClient();
  
  return {
    invalidateCategories: () => {
      queryClient?.invalidateQueries({ queryKey: ['filter-categories'] });
    },
    invalidatePriceStats: () => {
      queryClient?.invalidateQueries({ queryKey: ['price-stats'] });
    },
    invalidateAll: () => {
      queryClient?.invalidateQueries({ queryKey: ['filter-categories'] });
      queryClient?.invalidateQueries({ queryKey: ['price-stats'] });
    },
  };
}