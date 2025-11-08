'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductWithRelations } from './useProductQueries';

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  categories?: string[];
  rating?: number;
  type?: string;
  occasion?: string;
}

interface ProductsResponse {
  products: ProductWithRelations[];
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Fetch products with pagination and filters
export function useProducts(params: ProductsParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    category = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minPrice,
    maxPrice,
    inStock,
    featured,
    categories = [],
    rating,
    type = '',
    occasion = '',
  } = params;

  // Normalize empty strings to undefined for consistent cache keys
  const normalizedCategory = category || undefined;
  const normalizedStatus = status || undefined;
  const normalizedSearch = search || undefined;
  const normalizedType = type || undefined;
  const normalizedOccasion = occasion || undefined;

  return useQuery({
    queryKey: ['products', { 
      page, 
      limit, 
      search: normalizedSearch, 
      category: normalizedCategory, 
      status: normalizedStatus, 
      sortBy, 
      sortOrder, 
      minPrice, 
      maxPrice, 
      inStock, 
      featured, 
      categories, 
      rating,
      type: normalizedType,
      occasion: normalizedOccasion
    }],
    queryFn: async (): Promise<ProductsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(normalizedSearch && { search: normalizedSearch }),
        ...(normalizedCategory && { categoryId: normalizedCategory }),
        ...(normalizedStatus && { status: normalizedStatus }),
        sortBy,
        sortOrder,
        ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
        ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
        ...(inStock !== undefined && { inStock: inStock.toString() }),
        ...(featured !== undefined && { featured: featured.toString() }),
        ...(categories.length > 0 && { categories: categories.join(',') }),
        ...(rating !== undefined && { rating: rating.toString() }),
        ...(normalizedType && { typeId: normalizedType }),
        ...(normalizedOccasion && { occasionId: normalizedOccasion }),
      });

      const response = await fetch(`/api/products?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for admin operations
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Fetch featured products
export function useFeaturedProducts(limit: number = 8) {
  return useProducts({
    featured: true,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

// Fetch products by category
export function useProductsByCategory(categoryId: string, limit: number = 12) {
  return useProducts({
    category: categoryId,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}
