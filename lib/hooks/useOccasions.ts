'use client';

import { Occasion } from '@prisma/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

interface OccasionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface OccasionsResponse {
  occasions: (Occasion & {
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

// Fetch occasions with pagination and filters
export function useOccasions(params: OccasionsParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    isActive,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  return useQuery({
    queryKey: ['occasions', { page, limit, search, isActive, sortBy, sortOrder }],
    queryFn: async (): Promise<OccasionsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(isActive !== undefined && { isActive: isActive.toString() }),
        sortBy,
        sortOrder,
      });

      const response = await axios.get(`/api/occasions?${searchParams}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single occasion
export function useOccasion(id: string, includeProducts: boolean = false) {
  return useQuery({
    queryKey: ['occasion', id, includeProducts],
    queryFn: async (): Promise<Occasion & {
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

      const response = await axios.get(`/api/occasions/${id}?${searchParams}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create occasion
export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Occasion, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await axios.post('/api/occasions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
      toast.success('Occasion created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create occasion');
    },
  });
};

// Update occasion
export function useUpdateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Occasion> }) => {
      const response = await axios.put(`/api/occasions/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedOccasion) => {
      queryClient.setQueryData(['occasion', updatedOccasion.id], updatedOccasion);
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
      toast.success('Occasion updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update occasion');
    },
  });
};

// Delete occasion
export function useDeleteOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/occasions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all occasions queries to ensure list updates
      queryClient.invalidateQueries({ 
        queryKey: ['occasions'],
        exact: false 
      });
      // Also refetch to ensure immediate update
      queryClient.refetchQueries({ 
        queryKey: ['occasions'],
        exact: false 
      });
      toast.success('Occasion deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete occasion');
    },
  });
};

// Fetch all active occasions (for dropdowns/selects)
export function useActiveOccasions() {
  return useQuery({
    queryKey: ['occasions', 'active'],
    queryFn: async (): Promise<Occasion[]> => {
      const response = await axios.get('/api/occasions?isActive=true&limit=1000');
      return response.data.occasions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};