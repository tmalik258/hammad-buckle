import { z } from 'zod';

// Type creation form validation schema
export const typeFormSchema = z.object({
  // Basic type information
  name: z
    .string()
    .min(1, 'Type name is required')
    .min(2, 'Type name must be at least 2 characters')
    .max(50, 'Type name must be less than 50 characters'),
  
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    }),
  
  // Status flag
  isActive: z
    .boolean()
});

// Type update validation schema (all fields optional except id)
export const updateTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'Type name must be at least 2 characters')
    .max(50, 'Type name must be less than 50 characters')
    .optional(),
  
  description: z
    .string()
    .refine((val) => !val || val.length <= 500, {
      message: 'Description must be less than 500 characters',
    })
    .optional(),
  
  isActive: z
    .boolean()
});

// Type query parameters validation schema
export const getTypesQuerySchema = z.object({
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
    .optional(),
  
  isActive: z
    .string()
    .transform((val) => val === 'true')
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
export type TypeFormData = z.infer<typeof typeFormSchema>;
export type UpdateTypeData = z.infer<typeof updateTypeSchema>;
export type GetTypesQuery = z.infer<typeof getTypesQuerySchema>;