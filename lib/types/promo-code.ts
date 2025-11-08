import { DiscountType } from '@prisma/client';

// Promo code validation request/response types
export interface PromoCodeValidationRequest {
  code: string;
  orderTotal: number;
}

export interface PromoCodeValidationResponse {
  valid: boolean;
  promoCode?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    expirationDate?: Date;
  };
  discountAmount?: number;
  newTotal?: number;
  error?: string;
}

// Promo code application request/response types
export interface PromoCodeApplicationRequest {
  code: string;
  orderTotal: number;
}

export interface PromoCodeApplicationResponse {
  success: boolean;
  discountAmount?: number;
  newTotal?: number;
  promoCode?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
  error?: string;
}

// Checkout promo code state
export interface CheckoutPromoCode {
  code: string;
  isValid: boolean;
  isApplied: boolean;
  discountAmount: number;
  error?: string;
}

// Promo code display information
export interface PromoCodeDisplay {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  formattedDiscount: string;
}