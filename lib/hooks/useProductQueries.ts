'use client';

import { useQuery } from '@tanstack/react-query';
import { Prisma } from '@prisma/client';

// Types based on Prisma schema
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
      };
    };
    variants: {
      select: {
        id: true;
        name: true;
        value: true;
        stock: true;
      };
    };
    _count: {
      select: {
        reviews: true;
      };
    };
  };
}>;

// Fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<ProductWithRelations> => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch related products
export function useRelatedProducts(productId: string, limit: number = 10) {
  return useQuery({
    queryKey: ['related-products', productId, limit],
    queryFn: async (): Promise<ProductWithRelations[]> => {
      const response = await fetch(`/api/products/${productId}/related?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }
      return response.json();
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}