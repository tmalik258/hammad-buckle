import { z } from 'zod';

// Query parameters validation schema for product listing
export const getProductsQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be greater than 0'),
  
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 12)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  
  // Search
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  
  // Filters based on Prisma Product model
  categoryId: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  
  // Boolean filters
  featured: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  inStock: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  onSale: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  isNew: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

  genderTarget: z
    .enum(['WOMENS', 'MENS', 'UNISEX'])
    .optional(),
  
  // Price range filters
  minPrice: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || val >= 0, 'Minimum price must be non-negative'),
  
  maxPrice: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || val >= 0, 'Maximum price must be non-negative'),
  
  // Sorting
  sortBy: z
    .enum(['name', 'price', 'createdAt', 'averageRating', 'reviewCount'])
    .optional()
    .default('createdAt'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

export type ProductQueryParams = z.infer<typeof getProductsQuerySchema>;