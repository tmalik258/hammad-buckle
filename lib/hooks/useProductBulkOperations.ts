'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProductsParams } from './useProducts';

// Bulk update products
export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      productIds: string[];
      updates: {
        status?: string;
        visibility?: string;
        featured?: boolean;
        categories?: string[];
        tags?: string[];
        stockStatus?: string;
        price?: number;
        salePrice?: number;
      };
    }): Promise<{ updated: number; failed: number }> => {
      const response = await fetch('/api/products/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk update products');
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate products list and stats
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      toast.success(`Successfully updated ${result.updated} products`);
      if (result.failed > 0) {
        toast.warning(`Failed to update ${result.failed} products`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk update products');
    },
  });
}

// Bulk delete products
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: string[]): Promise<{ deleted: number; failed: number }> => {
      const response = await fetch('/api/products/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk delete products');
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate products list and stats
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      toast.success(`Successfully deleted ${result.deleted} products`);
      if (result.failed > 0) {
        toast.warning(`Failed to delete ${result.failed} products`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk delete products');
    },
  });
}

// Export products
export function useExportProducts() {
  return useMutation({
    mutationFn: async (data: {
      format: 'csv' | 'excel' | 'json';
      filters?: ProductsParams;
      fields?: string[];
    }): Promise<{ downloadUrl: string; filename: string }> => {
      const response = await fetch('/api/products/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export products');
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Products exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export products');
    },
  });
}

// Import products
export function useImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file: File;
      format: 'csv' | 'excel' | 'json';
      options?: {
        skipDuplicates?: boolean;
        updateExisting?: boolean;
        createCategories?: boolean;
        createTags?: boolean;
      };
    }): Promise<{ imported: number; skipped: number; failed: number; errors?: string[] }> => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('format', data.format);
      if (data.options) {
        formData.append('options', JSON.stringify(data.options));
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import products');
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate products list and stats
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      toast.success(`Successfully imported ${result.imported} products`);
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} products`);
      }
      if (result.failed > 0) {
        toast.warning(`Failed to import ${result.failed} products`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import products');
    },
  });
}