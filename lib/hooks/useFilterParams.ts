'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { isValidCategoryId } from '@/lib/utils/category-mapper';
import { CategoryType } from '@/lib/types/category';
import { ProductFilters } from '@/lib/types/filters';

export const useFilterParams = (categories?: CategoryType[]) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getFiltersFromUrl = useCallback((): Partial<ProductFilters> => {
    const filters: Partial<ProductFilters> = {};

    console.log('🔍 getFiltersFromUrl - categories data:', categories);
    console.log('🔍 getFiltersFromUrl - searchParams:', searchParams.toString());
    console.log('🔍 getFiltersFromUrl - categories length:', categories?.length);
    console.log('🔍 getFiltersFromUrl - categories type:', typeof categories);

    // Parse categories from URL (expecting category IDs)
    const categoriesParam = searchParams.get('categories');
    console.log('🔍 categoriesParam:', categoriesParam);
    console.log('🔍 Condition check - categoriesParam exists:', !!categoriesParam);
    console.log('🔍 Condition check - categories length:', categories?.length);
    console.log('🔍 Condition check - both conditions:', !!(categoriesParam && categories?.length));
    
    if (categoriesParam && categories?.length) {
      const categoryIds = categoriesParam.split(',').filter(Boolean);
      console.log('🔍 categoryIds:', categoryIds);
      
      // Convert category IDs to category names for filtering
      const categoryNames = categoryIds
        .filter(id => {
          console.log(`🔍 Validating category ID: ${id}`);
          console.log(`🔍 Categories array:`, categories);
          console.log(`🔍 Categories length:`, categories?.length);
          console.log(`🔍 First category:`, categories?.[0]);
          const isValid = isValidCategoryId(id, categories);
          console.log(`🔍 isValidCategoryId(${id}):`, isValid);
          return isValid;
        })
        .map(id => {
          const category = categories.find(cat => cat.id === id);
          console.log(`🔍 Found category for ${id}:`, category);
          return category?.name || '';
        })
        .filter(Boolean);
      
      console.log('🔍 categoryNames:', categoryNames);
      
      if (categoryNames.length > 0) {
        filters.categories = categoryNames;
      }
    }
    
    // Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : 2000,
      };
    }
    
    // Rating
    const rating = searchParams.get('rating');
    if (rating) {
      filters.rating = parseFloat(rating);
    }
    
    // In stock
    const inStock = searchParams.get('inStock');
    if (inStock) {
      filters.inStock = inStock === 'true';
    }
    
    // Sort by
    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      filters.sortBy = sortBy as ProductFilters['sortBy'];
    }
    
    return filters;
  }, [searchParams, categories]);

  const updateUrlParams = useCallback((filters: ProductFilters, searchQuery?: string) => {
    const params = new URLSearchParams();

    // Convert category names back to IDs for URL
    if (filters.categories.length > 0 && categories) {
      const categoryIds = filters.categories
        .map((name: string) => {
          const category = categories.find(cat => cat.name === name);
          return category?.id || '';
        })
        .filter(Boolean);
      
      if (categoryIds.length > 0) {
        params.set('categories', categoryIds.join(','));
      }
    }
    
    // Price range (only if different from default)
    if (filters.priceRange.min > 0) {
      params.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max < 1000) {
      params.set('maxPrice', filters.priceRange.max.toString());
    }
    
    // Rating
    if (filters.rating > 0) {
      params.set('rating', filters.rating.toString());
    }
    
    // In stock
    if (filters.inStock) {
      params.set('inStock', 'true');
    }
    
    // Sort by
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sortBy', filters.sortBy);
    }
    
    // Search query
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    
    router.push(newUrl, { scroll: false });
  }, [router, categories]);

  const getSearchQueryFromUrl = useCallback((): string => {
    return searchParams.get('q') || '';
  }, [searchParams]);

  return {
    getFiltersFromUrl,
    updateUrlParams,
    getSearchQueryFromUrl,
  };
};