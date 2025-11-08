import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Payment processing validation schema
const paymentProcessSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal']),
  cardDetails: z.object({
    cardNumber: z.string().regex(/^[0-9]{16}$/, 'Card number must be 16 digits'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Expiry date must be in MM/YY format'),
    cvv: z.string().regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
    cardholderName: z.string().min(3, 'Cardholder name is required')
  }).optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  orderId: z.string().uuid('Order ID must be a valid UUID'),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    street: z.string().min(1, 'Street is required'),
    apartment: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
    country: z.string().min(1, 'Country is required').default('United States')
  })
});

// Mock payment gateway integration
const processPaymentWithGateway = async (paymentData: z.infer<typeof paymentProcessSchema>) => {
  // In a real implementation, this would integrate with a payment processor like Stripe, PayPal, etc.
  // For now, we'll simulate a payment processing delay and return a success response
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a transaction ID
  const transactionId = crypto.randomUUID();
  
  // Mock success response
  return {
    success: true,
    transactionId,
    status: 'completed',
    processorResponse: {
      code: 'approved',
      message: 'Payment approved'
    },
    timestamp: new Date().toISOString()
  };
};

// Handle payment processing errors
const handlePaymentError = (error: unknown) => {
  console.log('Payment processing error:', error);
  
  const errorObj = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  
  return {
    success: false,
    status: 'failed',
    error: {
      code: (errorObj.code as string) || 'payment_failed',
      message: (errorObj.message as string) || 'Payment processing failed. Please try again.'
    },
    timestamp: new Date().toISOString()
  };
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = paymentProcessSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'validation_error',
            message: 'Invalid payment data',
            details: validationResult.error
          }
        }, 
        { status: 400 }
      );
    }
    
    const paymentData = validationResult.data;
    
    // Additional validation for payment method
    if (paymentData.paymentMethod === 'card' && !paymentData.cardDetails) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'validation_error',
            message: 'Card details are required for card payments'
          }
        }, 
        { status: 400 }
      );
    }
    
    // Process the payment with the payment gateway
    const paymentResult = await processPaymentWithGateway(paymentData);
    
    // Return the payment result
    return NextResponse.json(paymentResult, { status: 200 });
  } catch (error: unknown) {
    // Handle any unexpected errors
    const errorResponse = handlePaymentError(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}