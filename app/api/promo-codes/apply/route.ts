import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/utils/auth';

// Validation schema for applying promo code
const applyPromoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  orderTotal: z.number().min(0, 'Order total must be positive'),
});

// Response type for promo code application
interface PromoCodeApplicationResponse {
  success: boolean;
  promoCode?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
  };
  discountAmount?: number;
  newTotal?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserIdFromAuth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, orderTotal } = applyPromoCodeSchema.parse(body);

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    // Check if promo code exists
    if (!promoCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid promo code',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'This promo code is no longer active',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Check if promo code has expired
    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'This promo code has expired',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json(
        {
          success: false,
          error: 'This promo code has reached its usage limit',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (promoCode.minimumOrderAmount && orderTotal < promoCode.minimumOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of $${promoCode.minimumOrderAmount} required`,
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Check if user has already used this promo code
    const existingUsage = await prisma.promoCodeUsage.findFirst({
      where: {
        promoCodeId: promoCode.id,
        userId: userId,
      },
    });

    if (existingUsage) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already used this promo code',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (orderTotal * promoCode.discountValue) / 100;
      // Apply max discount cap if specified
      if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
        discountAmount = promoCode.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(promoCode.discountValue, orderTotal);
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const newTotal = Math.max(0, orderTotal - discountAmount);

    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
      discountAmount,
      newTotal,
    } as PromoCodeApplicationResponse);
  } catch (error) {
    console.error('Error applying promo code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || 'Invalid request data',
        } as PromoCodeApplicationResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as PromoCodeApplicationResponse,
      { status: 500 }
    );
  }
}