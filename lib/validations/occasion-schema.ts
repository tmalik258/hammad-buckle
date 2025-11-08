import { z } from 'zod';

// Occasion creation form validation schema
export const occasionFormSchema = z.object({
  // Basic occasion information
  name: z
    .string()
    .min(1, 'Occasion name is required')
    .min(2, 'Occasion name must be at least 2 characters')
    .max(50, 'Occasion name must be less than 50 characters'),
  
  description: z
    .string()
    .nullable()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    }),
  
  // Status flag
  isActive: z
    .boolean()
});

// Occasion update validation schema (all fields optional except id)
export const updateOccasionSchema = z.object({
  name: z
    .string()
    .min(2, 'Occasion name must be at least 2 characters')
    .max(50, 'Occasion name must be less than 50 characters')
    .optional(),
  
  description: z
    .string()
    .nullable()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    }),
  
  isActive: z
    .boolean()
    .optional(),
});

// Occasion query parameters validation schema
export const getOccasionsQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be greater than 0')
    .default(1),
  
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 1000, 'Limit must be between 1 and 1000')
    .default(20),
  
  search: z
    .string()
    .nullable()
    .optional(),
  
  isActive: z
    .string()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      return val === 'true';
    })
    .optional(),
  
  includeProducts: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  sortBy: z
    .enum(['name', 'createdAt'])
    .default('name'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
});

// Type definitions for TypeScript
export type OccasionFormData = z.infer<typeof occasionFormSchema>;
export type UpdateOccasionData = z.infer<typeof updateOccasionSchema>;
export type GetOccasionsQuery = z.infer<typeof getOccasionsQuerySchema>;