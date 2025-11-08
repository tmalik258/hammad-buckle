'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Customer } from '@/lib/types';
import { Prisma } from '@prisma/client';

type UsersListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    avatar: true;
    role: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        orders: true;
        reviews: true;
        addresses: true;
      };
    };
  };
}>;

interface CustomersResponse {
  users: UsersListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fetch customers with pagination and filters
export function useCustomers(params: CustomersParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  return useQuery({
    queryKey: ['customers', { page, limit, search, status, dateFrom, dateTo, sortBy, sortOrder }],
    queryFn: async (): Promise<CustomersResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/users?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async (): Promise<Customer> => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch customer orders
export function useCustomerOrders(customerId: string, params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['customer-orders', customerId, { page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/users/${customerId}/orders?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer orders');
      }
      return response.json();
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch customer analytics
export function useCustomerAnalytics(customerId: string) {
  return useQuery({
    queryKey: ['customer-analytics', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${customerId}/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer analytics');
      }
      return response.json();
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerRequest): Promise<Customer> => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
      }

      return response.json();
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.setQueryData(['customer', newCustomer.id], newCustomer);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRequest }): Promise<Customer> => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update customer');
      }

      return response.json();
    },
    onSuccess: (updatedCustomer: Customer) => {
      queryClient.setQueryData(['customer', updatedCustomer.id], updatedCustomer);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete customer');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the customer from cache
      queryClient.removeQueries({ queryKey: ['customer', deletedId] });
      queryClient.removeQueries({ queryKey: ['customer-orders', deletedId] });
      queryClient.removeQueries({ queryKey: ['customer-analytics', deletedId] });
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
}

// Block/Unblock customer mutation
export function useToggleCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }): Promise<Customer> => {
      const response = await fetch(`/api/users/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update customer status');
      }

      return response.json();
    },
    onSuccess: (updatedCustomer) => {
      // Update the customer in cache
      queryClient.setQueryData(['customer', updatedCustomer.id], updatedCustomer);
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      toast.success(`Customer status updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer status');
    },
  });
}

// Send email to customer mutation
export function useSendCustomerEmail() {
  return useMutation({
    mutationFn: async ({ id, subject, message }: { id: string; subject: string; message: string }): Promise<void> => {
      const response = await fetch(`/api/users/${id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }
    },
    onSuccess: () => {
      toast.success('Email sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send email');
    },
  });
}

// Export customer data mutation
export function useExportCustomers() {
  return useMutation({
    mutationFn: async (params: CustomersParams & { format: 'csv' | 'xlsx' }): Promise<Blob> => {
      const searchParams = new URLSearchParams({
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        format: params.format,
      });

      const response = await fetch(`/api/users/export?${searchParams}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export customers');
      }

      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Customers exported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export customers');
    },
  });
}

// Bulk operations
export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      const response = await fetch('/api/users/bulk/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete customers');
      }
    },
    onSuccess: (_, deletedIds) => {
      // Remove deleted customers from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['customer', id] });
        queryClient.removeQueries({ queryKey: ['customer-orders', id] });
        queryClient.removeQueries({ queryKey: ['customer-analytics', id] });
      });
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast.success(`${deletedIds.length} customers deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customers');
    },
  });
}

export function useBulkUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, isBlocked }: { ids: string[]; isBlocked: boolean }): Promise<void> => {
      const response = await fetch('/api/users/bulk/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, isBlocked }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update customer status');
      }
    },
    onSuccess: (_, { ids, isBlocked }) => {
      // Invalidate all customer-related queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Remove individual customer queries from cache to force refetch
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: ['customer', id] });
      });
      
      toast.success(`${ids.length} customers ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer status');
    },
  });
}

// Send bulk email mutation
export function useBulkSendCustomerEmail() {
  return useMutation({
    mutationFn: async ({ ids, subject, message }: { ids: string[]; subject: string; message: string }): Promise<void> => {
      const response = await fetch('/api/users/bulk/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, subject, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send emails');
      }
    },
    onSuccess: (_, { ids }) => {
      toast.success(`Email sent to ${ids.length} customers successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send emails');
    },
  });
}

// Get customer statistics
export function useCustomerStats() {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch customer statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Request payload for creating a customer (user).
 * Mirrors the POST /api/users schema.
 */
interface CreateCustomerRequest {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'ADMIN' | 'CUSTOMER';
  password?: string;
}

/**
 * Request payload for updating a customer (user).
 * Mirrors the PUT/PATCH /api/users/[id] schema.
 */
interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'ADMIN' | 'CUSTOMER';
  isActive?: boolean;
  password?: string;
}