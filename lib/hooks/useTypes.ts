'use client';

import { Type } from '@prisma/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TypesResponse {
  types: (Type & {
    _count: {
      products: number;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fetch types with pagination and filters
export function useTypes(params: TypesParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    isActive,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  return useQuery({
    queryKey: ['types', { page, limit, search, isActive, sortBy, sortOrder }],
    queryFn: async (): Promise<TypesResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(isActive !== undefined && { isActive: isActive.toString() }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/types?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch types');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single type
export function useType(id: string, includeProducts: boolean = false) {
  return useQuery({
    queryKey: ['type', id, includeProducts],
    queryFn: async (): Promise<Type & {
      _count: {
        products: number;
      };
      products?: Array<{
        id: string;
        name: string;
        price: number;
        originalPrice: number | null;
        images: string[];
        featured: boolean;
        createdAt: Date;
      }>;
    }> => {
      const searchParams = new URLSearchParams({
        ...(includeProducts && { includeProducts: 'true' }),
      });

      const response = await fetch(`/api/types/${id}?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch type');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create type
export function useCreateType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
    }): Promise<Type> => {
      const response = await fetch('/api/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create type');
      }

      return response.json();
    },
    onSuccess: (newType) => {
      // Add the new type to cache
      queryClient.setQueryData(['type', newType.id], newType);
      
      // Invalidate types list
      queryClient.invalidateQueries({ queryKey: ['types'] });
      
      toast.success('Type created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create type');
    },
  });
}

// Update type
export function useUpdateType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      description?: string;
      isActive?: boolean;
    }): Promise<Type> => {
      const response = await fetch(`/api/types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update type');
      }

      return response.json();
    },
    onSuccess: (updatedType) => {
      // Update the type in cache
      queryClient.setQueryData(['type', updatedType.id], updatedType);
      
      // Invalidate types list
      queryClient.invalidateQueries({ queryKey: ['types'] });
      
      toast.success('Type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update type');
    },
  });
}

// Delete type
export function useDeleteType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete type');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the type from cache
      queryClient.removeQueries({ queryKey: ['type', deletedId] });
      
      // Invalidate types list
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete type');
    },
  });
}

// Fetch all active types (for dropdowns/selects)
export function useActiveTypes() {
  return useTypes({
    isActive: true,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });
}