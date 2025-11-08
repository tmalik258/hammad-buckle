import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import Stripe from 'stripe';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE - Remove payment method
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const { id: paymentMethodId } = await params;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

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

    // Check if this is the default payment method
    const customer = await stripe.customers.retrieve(dbUser.stripeCustomerId) as Stripe.Customer;
    const isDefault = customer.invoice_settings?.default_payment_method === paymentMethodId;

    // If it's the default, we need to unset it first
    if (isDefault) {
      await stripe.customers.update(dbUser.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: undefined,
        },
      });
    }

    // Detach the payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ 
      message: 'Payment method removed successfully',
      wasDefault: isDefault
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}

// PATCH - Set payment method as default
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const { id: paymentMethodId } = await params;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

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
      message: 'Payment method set as default successfully'
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    
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