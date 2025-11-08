import { z } from 'zod';

// Category creation form validation schema
export const categoryFormSchema = z.object({
  // Basic category information
  name: z
    .string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    }),
  
  // Image (optional - will be handled during form submission)
  image: z
    .string()
    .optional(),
  
  // Status flags
  featured: z
    .boolean(),

  isActive: z
    .boolean()
});

// Category update validation schema (all fields optional except id)
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters')
    .optional(),
  
  description: z
    .string()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    })
    .optional(),
  
  image: z
    .string()
    .optional(),
  
  featured: z
    .boolean()
    .optional(),
  
  isActive: z
    .boolean()
    .optional(),
});

// Category query parameters validation schema
export const getCategoriesQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be greater than 0')
    .default(1),
  
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default(20),
  
  search: z
    .string()
    .optional(),
  
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  isActive: z
    .string()
    .transform((val) => {
      if (val === 'active') return true;
      if (val === 'inactive') return false;
      if (val === 'all') return undefined;
      return val === 'true';
    })
    .optional(),
  
  includeProducts: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  sortBy: z
    .enum(['name', 'createdAt', 'productsCount'])
    .default('name'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
});

// Type definitions for TypeScript
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;