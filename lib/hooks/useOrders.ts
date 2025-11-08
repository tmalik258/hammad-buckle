'use client';

import React from 'react';
import { useQuery, useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import type {
  OrderWithRelations,
  OrderFilters,
  OrdersResponse,
  OrderUpdateData,
  OrderFormData
} from '../types/order';

// Error interface for axios errors
interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// API functions
async function fetchUserOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  try {
    const response = await axios.get(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data?.message || `Failed to fetch orders: ${axiosError.response?.status || 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}

async function fetchOrderById(orderId: string): Promise<OrderWithRelations> {
  try {
    const response = await axios.get(`/api/orders/${orderId}`, {
      withCredentials: true,
    });
    return response.data.order;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data?.message || `Failed to fetch order: ${axiosError.response?.status || 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}

// Hook options interfaces
interface UseOrdersOptions {
  filters?: OrderFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseOrderOptions {
  enabled?: boolean;
}

// Main hooks
export const useOrders = (options: UseOrdersOptions = {}) => {
  const { filters = {}, enabled = true, refetchInterval } = options;

  return useInfiniteQuery({
    queryKey: ['orders', filters],
    queryFn: ({ pageParam = 1 }) => fetchUserOrders({ ...filters, page: pageParam }),
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.orders.length === 0) return undefined;
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
  });
};

export const useOrder = (orderId: string, options: UseOrderOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

// Regular query hook for admin tables (non-infinite)
export const useOrdersAdmin = (options: UseOrdersOptions = {}) => {
  const { filters = {}, enabled = true, refetchInterval } = options;

  return useQuery({
    queryKey: ['orders-admin', filters],
    queryFn: () => fetchUserOrders(filters),
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Update order function
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updateData }: { orderId: string; updateData: OrderUpdateData }): Promise<OrderWithRelations> => {
      const response = await axios.patch(`/api/orders/${orderId}`, updateData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.order;
    },
    onSuccess: (updatedOrder) => {
      // Update the specific order in cache
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast.success('Order updated successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.message || `Failed to update order: ${axiosError.response?.status || 'Unknown error'}`;
      toast.error(errorMessage);
    },
  });
}

// Create order function
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: OrderFormData): Promise<OrderWithRelations> => {
      const response = await axios.post('/api/orders', orderData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.order;
    },
    onSuccess: (newOrder) => {
      // Add the new order to cache
      queryClient.setQueryData(['order', newOrder.id], newOrder);
      
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast.success('Order created successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.message || `Failed to create order: ${axiosError.response?.status || 'Unknown error'}`;
      toast.error(errorMessage);
    },
  });
}

// Delete order function
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string): Promise<void> => {
      await axios.delete(`/api/orders/${orderId}`, {
        withCredentials: true,
      });
    },
    onSuccess: (_, orderId) => {
      // Remove the order from cache
      queryClient.removeQueries({ queryKey: ['order', orderId] });
      
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast.success('Order deleted successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.message || `Failed to delete order: ${axiosError.response?.status || 'Unknown error'}`;
      toast.error(errorMessage);
    },
  });
}

// Utility hooks for common operations
export const useOrdersWithPagination = (initialFilters: OrderFilters = {}) => {
  const [filters, setFilters] = React.useState<OrderFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const query = useOrders({ filters });

  const nextPage = React.useCallback(() => {
    if (query.data && filters.page! < query.data.pages.length) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [query.data, filters.page]);

  const prevPage = React.useCallback(() => {
    if (filters.page! > 1) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }));
    }
  }, [filters.page]);

  const setPage = React.useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const updateFilters = React.useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to first page
  }, []);

  return {
    ...query,
    filters,
    setFilters: updateFilters,
    nextPage,
    prevPage,
    setPage,
    hasNextPage: query.data ? filters.page! < query.data.pages.length : false,
    hasPrevPage: (filters.page || 1) > 1,
  };
};