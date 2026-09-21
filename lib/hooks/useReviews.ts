'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Review, ReviewFormData, ReviewStatus } from '@/lib/types';

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ReviewsParams {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  rating?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type ApiListPayload = {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

function mapListResponse(payload: ApiListPayload): ReviewsResponse {
  return {
    reviews: payload.reviews,
    total: payload.pagination.total,
    totalPages: payload.pagination.pages,
    currentPage: payload.pagination.page,
  };
}

export function useReviews(params: ReviewsParams = {}) {
  const {
    page = 1,
    limit = 10,
    productId,
    userId,
    rating,
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  return useQuery({
    queryKey: ['reviews', { page, limit, productId, userId, rating, status, sortBy, sortOrder }],
    queryFn: async (): Promise<ReviewsResponse> => {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (productId) searchParams.set('productId', productId);
      if (userId) searchParams.set('userId', userId);
      if (rating) searchParams.set('rating', String(rating));
      if (status) searchParams.set('status', status);

      const response = await fetch(`/api/reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return mapListResponse(await response.json());
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReviewFormData): Promise<Review> => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }
      return response.json();
    },
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', review.productId] });
      toast.success('Review created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create review');
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ReviewFormData> & { status?: ReviewStatus };
    }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }
      return response.json();
    },
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      if (updatedReview.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', updatedReview.productId] });
      }
      toast.success('Review updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ReviewStatus;
    }): Promise<Review> => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review status');
      }
      return response.json();
    },
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(`Review ${updatedReview.status.toLowerCase()} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review status');
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
}
