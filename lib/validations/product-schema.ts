import { z } from 'zod';
import { GenderTarget } from '@prisma/client';

// Product creation form validation schema
export const productFormSchema = z.object({
  // Basic product information
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters'),
  
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 1000, {
      message: 'Description must be less than 1000 characters',
    }),
  
  // Pricing
  price: z
    .number({
      message: 'Price must be a valid number',
    })
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price must be less than 1,000,000'),
  
  originalPrice: z
    .number()
    .min(0, 'Original price must be greater than or equal to 0')
    .max(999999.99, 'Original price must be less than 1,000,000')
    .optional()
    .nullable(),
  
  // Category
  categoryId: z
    .string()
    .min(1, 'Category is required'),
  
  // Images
  image: z
    .url('Main image must be a valid URL')
    .min(1, 'Main image is required'),
  
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .default([]),
  
  // Inventory
  stockQuantity: z
    .number({
      message: 'Stock quantity must be a valid number',
    })
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  
  inStock: z
    .boolean()
    .default(true),
  
  // Product attributes
  sku: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9-_]+$/.test(val), {
      message: 'SKU can only contain letters, numbers, hyphens, and underscores',
    }),
  
  weight: z
    .number()
    .min(0, 'Weight cannot be negative')
    .max(10000, 'Weight must be less than 10,000 kg')
    .optional()
    .nullable(),
  
  dimensions: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: 'Dimensions must be less than 100 characters',
    }),
  
  // Product flags
  featured: z
    .boolean()
    .default(false),
  
  isNew: z
    .boolean()
    .default(false),
  
  onSale: z
    .boolean()
    .default(false),

  genderTarget: z.nativeEnum(GenderTarget).default(GenderTarget.UNISEX),
})
.refine((data) => {
  // If originalPrice is provided, it should be greater than or equal to price
  if (data.originalPrice && data.originalPrice < data.price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be greater than or equal to current price',
  path: ['originalPrice'],
})
.refine((data) => {
  // If onSale is true, originalPrice should be provided and greater than price
  if (data.onSale && (!data.originalPrice || data.originalPrice <= data.price)) {
    return false;
  }
  return true;
}, {
  message: 'When product is on sale, original price must be provided and greater than current price',
  path: ['onSale'],
});

// Type inference for the form data
export type ProductFormData = z.infer<typeof productFormSchema>;

// Default values for the product form
export const defaultProductFormValues: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  categoryId: '',
  image: '',
  images: [],
  stockQuantity: 0,
  inStock: true,
  sku: '',
  weight: null,
  dimensions: '',
  featured: false,
  isNew: false,
  onSale: false,
  genderTarget: GenderTarget.UNISEX,
};

// Validation schema for product variants (if needed)
export const productVariantSchema = z.object({
  name: z
    .string()
    .min(1, 'Variant name is required')
    .max(50, 'Variant name must be less than 50 characters'),
  
  value: z
    .string()
    .min(1, 'Variant value is required')
    .max(50, 'Variant value must be less than 50 characters'),
  
  price: z
    .number()
    .min(0, 'Additional price cannot be negative')
    .optional()
    .nullable(),
  
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  
  sku: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9-_]+$/.test(val), {
      message: 'SKU can only contain letters, numbers, hyphens, and underscores',
    }),
});

export type ProductVariantData = z.infer<typeof productVariantSchema>;