'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProductVariantData } from '@/lib/validations/product-schema';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number | null;
  stock: number;
  sku?: string | null;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create variant
export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductVariantData & { productId: string }): Promise<ProductVariant> => {
      const { productId, ...variantData } = data;
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variantData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create variant');
      }

      return response.json();
    },
    onSuccess: (newVariant) => {
      // Invalidate product variants query
      queryClient.invalidateQueries({ queryKey: ['product-variants', newVariant.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', newVariant.productId] });
      
      toast.success('Variant created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create variant');
    },
  });
}

// Update variant
export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ProductVariantData>): Promise<ProductVariant> => {
      const response = await fetch(`/api/variants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update variant');
      }

      return response.json();
    },
    onSuccess: (updatedVariant) => {
      // Update variant in cache
      queryClient.setQueryData(['variant', updatedVariant.id], updatedVariant);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['product-variants', updatedVariant.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedVariant.productId] });
      
      toast.success('Variant updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update variant');
    },
  });
}

// Delete variant
export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ productId: string }> => {
      const response = await fetch(`/api/variants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete variant');
      }

      return response.json();
    },
    onSuccess: (data, deletedId) => {
      // Remove variant from cache
      queryClient.removeQueries({ queryKey: ['variant', deletedId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      
      toast.success('Variant deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete variant');
    },
  });
}