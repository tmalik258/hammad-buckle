'use client';

import { useQuery } from '@tanstack/react-query';

interface BadgeCounts {
  pendingOrders: number;
  pendingReviews: number;
  lowStockProducts: number;
  inactiveCategories: number;
  inactiveOccasions: number;
  inactiveTypes: number;
}

// Hook to fetch badge counts for admin sidebar
export function useBadgeCounts() {
  return useQuery({
    queryKey: ['badge-counts'],
    queryFn: async (): Promise<BadgeCounts> => {
      const response = await fetch('/api/admin/badge-counts');
      if (!response.ok) {
        throw new Error('Failed to fetch badge counts');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - frequent updates for real-time feel
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    refetchOnWindowFocus: true,
  });
}