import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, requireAuth } from "@/lib/utils/auth";

const processSuccessSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  amount: z.number().positive('Amount must be positive'),
  status: z.literal('PAID'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Payment success request body:', body);
    
    const validationResult = processSuccessSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('Payment success validation failed:', validationResult.error);
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error,
        },
        { status: 400 }
      );
    }

    const { orderId, paymentIntentId, customerId, paymentMethodId, amount, status } = validationResult.data;

    // Verify the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: {
        orderId: orderId,
      },
      data: {
        status: 'PAID',
        paymentMethod: 'card',
        stripePaymentMethodId: paymentMethodId,
        stripePaymentIntentId: paymentIntentId,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    // Add order timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'CONFIRMED',
        description: 'Payment confirmed and order confirmed',
      },
    });

    // Update user's Stripe customer ID if not already set
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!dbUser?.stripeCustomerId) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    console.log(`Payment processed successfully for order ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
    });

  } catch (error: unknown) {
    console.log('Error processing payment success:', error);
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
}