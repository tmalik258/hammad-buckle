import { Category } from '@prisma/client';

// Base category type from Prisma
export type CategoryType = Category;

// Category with additional computed fields for UI
export interface CategoryWithStats extends Category {
  productsCount: number;
  _count?: {
      products: number;
    };
}

// Form data for creating/updating categories
export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  featured?: boolean;
  isActive?: boolean;
}

// API request/response types
export interface CategoriesResponse {
  categories: CategoryType[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  category: CategoryType;
}

// Filter and search params
export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}