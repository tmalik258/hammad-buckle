import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, requireAuth } from "@/lib/utils/auth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  orderId: z.cuid('Invalid order ID'),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const userId = user?.id;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('Payment intent request body:', body);
    
    const validationResult = createPaymentIntentSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('Payment intent validation failed:', validationResult.error);
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error,
        },
        { status: 400 }
      );
    }

    const { amount, currency, orderId, metadata } = validationResult.data;

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

    // Get or create Stripe customer
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true }
    });

    let stripeCustomerId = dbUser?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser?.email || user.email!,
        name: dbUser?.name || user?.app_metadata?.name || undefined,
        metadata: {
          userId: userId!,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      metadata: {
        orderId,
        userId: userId!,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Check if payment record already exists for this order
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    // Only create payment record if it doesn't exist
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId,
          amount,
          currency,
          status: 'PENDING',
          paymentMethod: paymentIntent.payment_method_types[0],
          metadata: metadata || {},
        },
      });
    } else {
      // Update existing payment record with new Stripe payment intent
      await prisma.payment.update({
        where: { orderId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId,
          amount,
          currency,
          status: 'PENDING',
          paymentMethod: paymentIntent.payment_method_types[0],
          metadata: metadata || {},
        },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: stripeCustomerId,
    });
  } catch (error: unknown) {
    console.log('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}