import { z } from 'zod';
import { DiscountType } from '@prisma/client';

// Schema for validating promo code validation requests
export const promoCodeValidationSchema = z.object({
  code: z.string().min(1, 'Promo code is required').max(50, 'Promo code is too long'),
  orderTotal: z.number().min(0, 'Order total must be positive'),
});

// Schema for validating promo code application requests
export const promoCodeApplicationSchema = z.object({
  code: z.string().min(1, 'Promo code is required').max(50, 'Promo code is too long'),
  orderTotal: z.number().min(0, 'Order total must be positive'),
});

// Schema for promo code creation/update (admin)
export const promoCodeCreateSchema = z.object({
  code: z.string()
    .min(3, 'Promo code must be at least 3 characters')
    .max(50, 'Promo code must be less than 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Promo code must contain only uppercase letters and numbers'),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().min(0.01, 'Discount value must be greater than 0'),
  minimumOrderAmount: z.number().min(0).optional(),
  // Optional cap for percentage discounts
  maxDiscountAmount: z.number().min(0).optional(),
  // Optional total usage limit
  usageLimit: z.number().int().min(1).optional(),
  expirationDate: z.date().optional(),
  isActive: z.boolean(),
});

// Schema for promo code update (admin)
export const promoCodeUpdateSchema = promoCodeCreateSchema.partial();

// Schema for checkout promo code state
export const checkoutPromoCodeSchema = z.object({
  code: z.string(),
  isValid: z.boolean(),
  isApplied: z.boolean(),
  discountAmount: z.number().min(0),
  error: z.string().optional(),
});

// Type exports for use in components
export type PromoCodeValidationInput = z.infer<typeof promoCodeValidationSchema>;
export type PromoCodeApplicationInput = z.infer<typeof promoCodeApplicationSchema>;
export type PromoCodeCreateInput = z.infer<typeof promoCodeCreateSchema>;
export type PromoCodeUpdateInput = z.infer<typeof promoCodeUpdateSchema>;
export type CheckoutPromoCodeInput = z.infer<typeof checkoutPromoCodeSchema>;