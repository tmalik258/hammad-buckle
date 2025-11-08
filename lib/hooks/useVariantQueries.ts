'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductVariant } from './useVariantMutations';

// Fetch variants for a specific product
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async (): Promise<ProductVariant[]> => {
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) {
        throw new Error('Failed to fetch product variants');
      }
      const data = await response.json();
      // Handle the nested response structure
      return data.variants || [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single variant
export function useVariant(variantId: string) {
  return useQuery({
    queryKey: ['variant', variantId],
    queryFn: async (): Promise<ProductVariant> => {
      const response = await fetch(`/api/variants/${variantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch variant');
      }
      return response.json();
    },
    enabled: !!variantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}