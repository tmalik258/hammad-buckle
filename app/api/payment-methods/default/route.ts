import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import type { 
  SetDefaultPaymentMethodRequest, 
  PaymentMethodResponse 
} from '@/lib/types/stripe-payment-method';
import Stripe from 'stripe';

// Schema for setting default payment method
const setDefaultPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
});

// POST - Set default payment method
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const body = await request.json();
    const { paymentMethodId } = setDefaultPaymentMethodSchema.parse(body);

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json(
        { error: 'User or Stripe customer not found' },
        { status: 404 }
      );
    }

    // Verify the payment method belongs to the user
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    if (paymentMethod.customer !== dbUser.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Payment method does not belong to user' },
        { status: 403 }
      );
    }

    // Set as default payment method
    await stripe.customers.update(dbUser.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ 
      message: 'Default payment method updated successfully'
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}