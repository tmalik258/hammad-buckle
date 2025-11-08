'use client';

import { useQuery } from '@tanstack/react-query';

// Product stats interface
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  averagePrice: number;
  totalValue: number;
  productsByType: Record<string, number>;
  recentProducts: number;
}

// Get product statistics
export function useProductStats() {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: async (): Promise<ProductStats> => {
      const response = await fetch('/api/products/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch product statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}