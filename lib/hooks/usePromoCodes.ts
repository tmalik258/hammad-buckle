'use client';

import { useQuery } from '@tanstack/react-query';

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expirationDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  discountType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PromoCodesResponse {
  promoCodes: PromoCode[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Fetch promo codes with pagination and filters
export function usePromoCodes(params: PromoCodesParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    discountType = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Normalize empty strings to undefined for consistent cache keys
  const normalizedSearch = search || undefined;
  const normalizedStatus = status || undefined;
  const normalizedDiscountType = discountType || undefined;

  return useQuery({
    queryKey: ['promo-codes', { 
      page, 
      limit, 
      search: normalizedSearch, 
      status: normalizedStatus, 
      discountType: normalizedDiscountType, 
      sortBy, 
      sortOrder 
    }],
    queryFn: async (): Promise<PromoCodesResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(normalizedSearch && { search: normalizedSearch }),
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedDiscountType && { discountType: normalizedDiscountType }),
      });

      const response = await fetch(`/api/admin/promo-codes?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch promo codes');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for admin operations
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

