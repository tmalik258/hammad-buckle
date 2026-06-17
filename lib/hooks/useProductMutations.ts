'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProductWithRelations } from './useProductQueries';

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      price: number;
      originalPrice?: number | null;
      categoryId: string;
      image: string;
      images?: string[];
      stockQuantity: number;
      inStock: boolean;
      sku?: string | null;
      weight?: number | null;
      dimensions?: string;
      featured: boolean;
      isNew: boolean;
      onSale: boolean;
      genderTarget?: string;
      isActive?: boolean;
    }): Promise<ProductWithRelations> => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }

      return response.json();
    },
    onSuccess: (newProduct) => {
      // Add the new product to cache
      queryClient.setQueryData(['product', newProduct.id], newProduct);
      
      // Aggressively invalidate and refetch products list and stats
      queryClient.invalidateQueries({ 
        queryKey: ['products'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['product-stats'],
        refetchType: 'active'
      });
      
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      originalPrice?: number | null;
      categoryId?: string;
      image?: string;
      images?: string[];
      stockQuantity?: number;
      inStock?: boolean;
      sku?: string | null;
      weight?: number | null;
      dimensions?: string;
      featured?: boolean;
      isNew?: boolean;
      onSale?: boolean;
      genderTarget?: string;
      isActive?: boolean;
    }): Promise<ProductWithRelations> => {
      console.log('Updating product with data:', { id, ...data });
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Update product error:', error);
        throw new Error(error.message || 'Failed to update product');
      }

      return response.json();
    },
    onSuccess: (updatedProduct) => {
      // Update the product in cache
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
      
      // Aggressively invalidate and refetch products list and stats
      queryClient.invalidateQueries({ 
        queryKey: ['products'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['product-stats'],
        refetchType: 'active'
      });
      
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: ['product', deletedId] });
      
      // Aggressively invalidate and refetch products list and stats
      queryClient.invalidateQueries({ 
        queryKey: ['products'],
        refetchType: 'active' // Force refetch even if data is considered fresh
      });
      queryClient.invalidateQueries({ 
        queryKey: ['product-stats'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['product-variations'],
        refetchType: 'active'
      });
      
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}

// Duplicate product
export function useDuplicateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      sku?: string;
    }): Promise<ProductWithRelations> => {
      const response = await fetch(`/api/products/${data.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.name, sku: data.sku }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to duplicate product');
      }

      return response.json();
    },
    onSuccess: (duplicatedProduct) => {
      // Add the duplicated product to cache
      queryClient.setQueryData(['product', duplicatedProduct.id], duplicatedProduct);
      
      // Invalidate products list and stats
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      toast.success('Product duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate product');
    },
  });
}

// Update product stock
export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      stockQuantity: number;
      stockStatus?: string;
      note?: string;
    }): Promise<ProductWithRelations> => {
      const response = await fetch(`/api/products/${data.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product stock');
      }

      return response.json();
    },
    onSuccess: (updatedProduct) => {
      // Update the product in cache
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
      
      // Invalidate products list and stats
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      toast.success('Product stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product stock');
    },
  });
}