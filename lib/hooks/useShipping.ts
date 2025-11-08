'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CustomShippingMethod, ShippingZone, ShippingRate, ShippingFormData } from '@/lib/types';
interface ShippingMethodsResponse {
  methods: CustomShippingMethod[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ShippingZonesResponse {
  zones: ShippingZone[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ShippingRatesResponse {
  rates: ShippingRate[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ShippingParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  zoneId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ShippingCalculationParams {
  items: Array<{
    productId: string;
    quantity: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  destination: {
    country: string;
    state?: string;
    city?: string;
    postalCode: string;
  };
  origin?: {
    country: string;
    state?: string;
    city?: string;
    postalCode: string;
  };
}

// Fetch shipping methods
export function useShippingMethods(params: ShippingParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    type = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  return useQuery({
    queryKey: ['shipping-methods', { page, limit, search, status, type, sortBy, sortOrder }],
    queryFn: async (): Promise<ShippingMethodsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(type && { type }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/shipping/methods?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch all active shipping methods
export function useActiveShippingMethods() {
  return useQuery({
    queryKey: ['active-shipping-methods'],
    queryFn: async (): Promise<CustomShippingMethod[]> => {
      const response = await fetch('/api/shipping/methods/active');
      if (!response.ok) {
        throw new Error('Failed to fetch active shipping methods');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single shipping method
export function useShippingMethod(id: string) {
  return useQuery({
    queryKey: ['shipping-method', id],
    queryFn: async (): Promise<CustomShippingMethod> => {
      const response = await fetch(`/api/shipping/methods/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping method');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch shipping zones
export function useShippingZones(params: ShippingParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  return useQuery({
    queryKey: ['shipping-zones', { page, limit, search, status, sortBy, sortOrder }],
    queryFn: async (): Promise<ShippingZonesResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/shipping/zones?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping zones');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch all active shipping zones
export function useActiveShippingZones() {
  return useQuery({
    queryKey: ['active-shipping-zones'],
    queryFn: async (): Promise<ShippingZone[]> => {
      const response = await fetch('/api/shipping/zones/active');
      if (!response.ok) {
        throw new Error('Failed to fetch active shipping zones');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single shipping zone
export function useShippingZone(id: string) {
  return useQuery({
    queryKey: ['shipping-zone', id],
    queryFn: async (): Promise<ShippingZone> => {
      const response = await fetch(`/api/shipping/zones/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping zone');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch shipping rates
export function useShippingRates(params: ShippingParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    zoneId = '',
    sortBy = 'minWeight',
    sortOrder = 'asc',
  } = params;

  return useQuery({
    queryKey: ['shipping-rates', { page, limit, search, zoneId, sortBy, sortOrder }],
    queryFn: async (): Promise<ShippingRatesResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(zoneId && { zoneId }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/shipping/rates?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping rates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Calculate shipping rates
export function useCalculateShipping() {
  return useMutation({
    mutationFn: async (params: ShippingCalculationParams) => {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate shipping');
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to calculate shipping');
    },
  });
}

// Create shipping method mutation
export function useCreateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShippingFormData): Promise<CustomShippingMethod> => {
      const response = await fetch('/api/shipping/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shipping method');
      }

      return response.json();
    },
    onSuccess: (newMethod) => {
      // Invalidate and refetch shipping methods list
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-methods'] });
      
      // Add the new method to the cache
      queryClient.setQueryData(['shipping-method', newMethod.id], newMethod);
      
      toast.success('Shipping method created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create shipping method');
    },
  });
}

// Update shipping method mutation
export function useUpdateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShippingFormData> }): Promise<CustomShippingMethod> => {
      const response = await fetch(`/api/shipping/methods/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shipping method');
      }

      return response.json();
    },
    onSuccess: (updatedMethod) => {
      // Update the method in cache
      queryClient.setQueryData(['shipping-method', updatedMethod.id], updatedMethod);
      
      // Invalidate shipping methods list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-methods'] });
      
      toast.success('Shipping method updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shipping method');
    },
  });
}

// Delete shipping method mutation
export function useDeleteShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/shipping/methods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shipping method');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the method from cache
      queryClient.removeQueries({ queryKey: ['shipping-method', deletedId] });
      
      // Invalidate shipping methods list
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-methods'] });
      
      toast.success('Shipping method deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete shipping method');
    },
  });
}

// Toggle shipping method status
export function useToggleShippingMethodStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }): Promise<CustomShippingMethod> => {
      const response = await fetch(`/api/shipping/methods/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shipping method status');
      }

      return response.json();
    },
    onSuccess: (updatedMethod) => {
      // Update the method in cache
      queryClient.setQueryData(['shipping-method', updatedMethod.id], updatedMethod);
      
      // Invalidate shipping methods list
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-methods'] });
      
      toast.success(`Shipping method ${updatedMethod.status ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shipping method status');
    },
  });
}

// Create shipping zone mutation
export function useCreateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      countries: string[];
      states?: string[];
      cities?: string[];
      postalCodes?: string[];
    }): Promise<ShippingZone> => {
      const response = await fetch('/api/shipping/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shipping zone');
      }

      return response.json();
    },
    onSuccess: (newZone) => {
      // Invalidate and refetch shipping zones list
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-zones'] });
      
      // Add the new zone to the cache
      queryClient.setQueryData(['shipping-zone', newZone.id], newZone);
      
      toast.success('Shipping zone created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create shipping zone');
    },
  });
}

// Update shipping zone mutation
export function useUpdateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<{
        name: string;
        description?: string;
        countries: string[];
        states?: string[];
        cities?: string[];
        postalCodes?: string[];
      }>;
    }): Promise<ShippingZone> => {
      const response = await fetch(`/api/shipping/zones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shipping zone');
      }

      return response.json();
    },
    onSuccess: (updatedZone) => {
      // Update the zone in cache
      queryClient.setQueryData(['shipping-zone', updatedZone.id], updatedZone);
      
      // Invalidate shipping zones list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-zones'] });
      
      toast.success('Shipping zone updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shipping zone');
    },
  });
}

// Delete shipping zone mutation
export function useDeleteShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/shipping/zones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shipping zone');
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the zone from cache
      queryClient.removeQueries({ queryKey: ['shipping-zone', deletedId] });
      
      // Invalidate shipping zones list
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['active-shipping-zones'] });
      
      // Invalidate related shipping rates
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      
      toast.success('Shipping zone deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete shipping zone');
    },
  });
}

// Create shipping rate mutation
export function useCreateShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      zoneId: string;
      methodId: string;
      minWeight?: number;
      maxWeight?: number;
      rate: number;
      freeShippingThreshold?: number;
    }): Promise<ShippingRate> => {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shipping rate');
      }

      return response.json();
    },
    onSuccess: (newRate) => {
      console.log(newRate)
      // Invalidate and refetch shipping rates list
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      
      toast.success('Shipping rate created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create shipping rate');
    },
  });
}

// Update shipping rate mutation
export function useUpdateShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<{
        minWeight?: number;
        maxWeight?: number;
        rate: number;
        freeShippingThreshold?: number;
      }>;
    }): Promise<ShippingRate> => {
      const response = await fetch(`/api/shipping/rates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shipping rate');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate shipping rates list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      
      toast.success('Shipping rate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shipping rate');
    },
  });
}

// Delete shipping rate mutation
export function useDeleteShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/shipping/rates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shipping rate');
      }
    },
    onSuccess: () => {
      // Invalidate shipping rates list
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      
      toast.success('Shipping rate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete shipping rate');
    },
  });
}

// Get shipping statistics
export function useShippingStats() {
  return useQuery({
    queryKey: ['shipping-stats'],
    queryFn: async () => {
      const response = await fetch('/api/shipping/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Validate shipping address
export function useValidateShippingAddress() {
  return useMutation({
    mutationFn: async (address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    }) => {
      const response = await fetch('/api/shipping/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to validate address');
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to validate address');
    },
  });
}