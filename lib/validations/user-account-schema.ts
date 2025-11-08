import { z } from 'zod';
import { AddressType } from '@prisma/client';

// Profile update validation schema - matches Prisma User model
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
});

// Address validation schema - matches Prisma Address model
export const addressSchema = z.object({
  type: z.nativeEnum(AddressType, {
    message: 'Type must be SHIPPING, BILLING, or BOTH',
  }).default(AddressType.SHIPPING),
  
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable(),
  
  street: z
    .string()
    .max(200, 'Street address must be less than 200 characters')
    .optional()
    .nullable(),
  
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  
  area: z
    .string()
    .min(1, 'Area is required')
    .max(100, 'Area must be less than 100 characters'),
  
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code must be less than 20 characters'),
  
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .nullable(),
  
  isDefault: z
    .boolean()
    .default(false),
});

// Create address schema (without ID for new addresses)
export const createAddressSchema = addressSchema;

// Update address schema (for existing addresses)
export const updateAddressSchema = addressSchema.partial();

// User account form schema for frontend forms
export const userAccountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  email: z
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  avatar: z
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
});

// Address form schema for frontend forms (combines name fields)
export const addressFormSchema = z.object({
  type: z.nativeEnum(AddressType, {
    message: 'Type must be SHIPPING, BILLING, or BOTH',
  }).default(AddressType.SHIPPING),
  
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  
  street: z
    .string()
    .max(200, 'Street address must be less than 200 characters')
    .optional(),
  
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  
  area: z
    .string()
    .min(1, 'Area is required')
    .max(100, 'Area must be less than 100 characters'),
  
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code must be less than 20 characters'),
  
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  
  isDefault: z
    .boolean()
    .default(false),
});

// Type inference for validation schemas
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type CreateAddressData = z.infer<typeof createAddressSchema>;
export type UpdateAddressData = z.infer<typeof updateAddressSchema>;
export type UserAccountFormData = z.infer<typeof userAccountFormSchema>;
export type AddressFormData = z.infer<typeof addressFormSchema>;

// Default values for forms
export const defaultUserAccountFormValues: UserAccountFormData = {
  name: '',
  email: '',
  avatar: null,
};

export const defaultAddressFormValues: AddressFormData = {
  type: AddressType.SHIPPING,
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  area: '',
  postalCode: '',
  phone: '',
  isDefault: false,
};