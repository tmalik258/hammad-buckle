'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CategoryType, CategoryFormData, CategoryWithStats } from '@/lib/types/category';

interface CategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  featured?: boolean;
  isActive?: string;
  showOnHomepage?: boolean;
  hideEmpty?: boolean;
  orderBy?: string;
  order?: 'asc' | 'desc';
  include?: string[];
}

// Fetch categories
export function useCategories(params: CategoriesParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    parent = '',
    featured,
    isActive,
    showOnHomepage,
    hideEmpty,
    orderBy = 'menuOrder',
    order = 'asc',
    include = [],
  } = params;

  return useQuery({
    queryKey: ['categories', { page, limit, search, parent, featured, isActive, showOnHomepage, hideEmpty, orderBy, order, include }],
    queryFn: async (): Promise<{
      categories: CategoryWithStats[];
      total: number;
      totalPages: number;
      currentPage: number;
    }> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(parent && { parent }),
        ...(featured !== undefined && { featured: featured.toString() }),
        ...(isActive && { isActive }),
        ...(showOnHomepage !== undefined && { showOnHomepage: showOnHomepage.toString() }),
        ...(hideEmpty !== undefined && { hideEmpty: hideEmpty.toString() }),
        orderBy,
        order,
        ...(include.length > 0 && { include: include.join(',') }),
      });

      const response = await fetch(`/api/categories?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      
      // Map API response to expected format
      return {
        categories: data.categories,
        total: data.pagination.total,
        totalPages: data.pagination.pages,
        currentPage: data.pagination.page,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData): Promise<CategoryType> => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      return response.json();
    },
    onSuccess: (newCategory) => {
      // Add the new category to cache
      queryClient.setQueryData(['category', newCategory.id], newCategory);
      
      // Invalidate categories list and related queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

// Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CategoryFormData>): Promise<CategoryType> => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }

      return response.json();
    },
    onSuccess: (updatedCategory) => {
      // Update the category in cache
      queryClient.setQueryData(['category', updatedCategory.id], updatedCategory);
      
      // Invalidate categories list and related queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

// Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      force?: boolean;
      reassignTo?: string;
    }): Promise<void> => {
      const searchParams = new URLSearchParams({
        ...(data.force && { force: 'true' }),
        ...(data.reassignTo && { reassignTo: data.reassignTo }),
      });

      const response = await fetch(`/api/categories/${data.id}?${searchParams}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }
    },
    onSuccess: (_, { id }) => {
      // Remove the category from cache
      queryClient.removeQueries({ queryKey: ['category', id] });
      
      // Invalidate categories list and related queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}
