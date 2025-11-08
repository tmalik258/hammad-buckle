'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Review, ReviewFormData } from '@/lib/types';

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  customerId?: string;
  rating?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fetch reviews with pagination and filters
export function useReviews(params: ReviewsParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    productId,
    customerId,
    rating,
    status = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  return useQuery({
    queryKey: ['reviews', { page, limit, search, productId, customerId, rating, status, dateFrom, dateTo, sortBy, sortOrder }],
    queryFn: async (): Promise<ReviewsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(productId && { productId }),
        ...(customerId && { customerId }),
        ...(rating && { rating: rating.toString() }),
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reviews change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch product reviews
export function useProductReviews(productId: string, params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['product-reviews', productId, { page, limit }],
    queryFn: async (): Promise<ReviewsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/products/${productId}/reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product reviews');
      }
      return response.json();
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Fetch customer reviews
export function useCustomerReviews(customerId: string, params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['customer-reviews', customerId, { page, limit }],
    queryFn: async (): Promise<ReviewsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/users/${customerId}/reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer reviews');
      }
      return response.json();
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Fetch single review
export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: async (): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Create review mutation
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReviewFormData): Promise<Review> => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create review');
      }

      return response.json();
    },
    onSuccess: (newReview) => {
      // Invalidate and refetch reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      // Invalidate product reviews
      if (newReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', newReview.productId] });
      }
      
      // Invalidate customer reviews
      if (newReview.customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer-reviews', newReview.customerId] });
      }
      
      // Add the new review to the cache
      queryClient.setQueryData(['review', newReview.id], newReview);
      
      // Invalidate product data to update average rating
      if (newReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product', newReview.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      
      toast.success('Review created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create review');
    },
  });
}

// Update review mutation
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReviewFormData> }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }

      return response.json();
    },
    onSuccess: (updatedReview) => {
      // Update the review in cache
      queryClient.setQueryData(['review', updatedReview.id], updatedReview);
      
      // Invalidate reviews list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      // Invalidate product and customer reviews
      if (updatedReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', updatedReview.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', updatedReview.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      
      if (updatedReview.customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer-reviews', updatedReview.customerId] });
      }
      
      toast.success('Review updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
}

// Delete review mutation
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ productId?: string; customerId?: string }> => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }

      return response.json();
    },
    onSuccess: (data, deletedId) => {
      // Remove the review from cache
      queryClient.removeQueries({ queryKey: ['review', deletedId] });
      
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      // Invalidate product and customer reviews
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', data.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      
      if (data.customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer-reviews', data.customerId] });
      }
      
      toast.success('Review deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
}

// Approve/Reject review mutation
export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review status');
      }

      return response.json();
    },
    onSuccess: (updatedReview) => {
      // Update the review in cache
      queryClient.setQueryData(['review', updatedReview.id], updatedReview);
      
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      // Invalidate product reviews and data
      if (updatedReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', updatedReview.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', updatedReview.productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      
      toast.success(`Review ${updatedReview.status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review status');
    },
  });
}

// Reply to review mutation
export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reply to review');
      }

      return response.json();
    },
    onSuccess: (updatedReview) => {
      // Update the review in cache
      queryClient.setQueryData(['review', updatedReview.id], updatedReview);
      
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      // Invalidate product reviews
      if (updatedReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', updatedReview.productId] });
      }
      
      toast.success('Reply added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reply to review');
    },
  });
}

// Flag review as inappropriate mutation
export function useFlagReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to flag review');
      }

      return response.json();
    },
    onSuccess: (flaggedReview) => {
      // Update the review in cache
      queryClient.setQueryData(['review', flaggedReview.id], flaggedReview);
      
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      toast.success('Review flagged successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to flag review');
    },
  });
}

// Bulk operations
export function useBulkDeleteReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      const response = await fetch('/api/reviews/bulk/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete reviews');
      }
    },
    onSuccess: (_, deletedIds) => {
      // Remove deleted reviews from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['review', id] });
      });
      
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast.success(`${deletedIds.length} reviews deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete reviews');
    },
  });
}

export function useBulkUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: 'approved' | 'rejected' | 'pending' }): Promise<void> => {
      const response = await fetch('/api/reviews/bulk/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review status');
      }
    },
    onSuccess: (_, { ids, status }) => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Remove individual review queries from cache to force refetch
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: ['review', id] });
      });
      
      toast.success(`${ids.length} reviews ${status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review status');
    },
  });
}

// Get review statistics
export function useReviewStats() {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const response = await fetch('/api/reviews/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch review statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get product review summary
export function useProductReviewSummary(productId: string) {
  return useQuery({
    queryKey: ['product-review-summary', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch product review summary');
      }
      return response.json();
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}