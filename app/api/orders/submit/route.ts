import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderStatus, PaymentStatus, AddressType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Updated schema to match Prisma Order model exactly
const orderSubmissionSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    area: z.string(),
    postalCode: z.string(),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    area: z.string(),
    postalCode: z.string(),
    phone: z.string().optional(),
  }).optional(),
  paymentMethod: z.string(),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  promoCode: z.string().nullish(),
});

// Real database function to create order with all related data
async function createOrder(orderData: z.infer<typeof orderSubmissionSchema>) {
  try {
    // Validate that user exists before creating addresses
    const userExists = await prisma.user.findUnique({
      where: { id: orderData.userId }
    });

    if (!userExists) {
      throw new Error(`User with ID ${orderData.userId} does not exist`);
    }

    // Validate and process promo code if provided
    let promoCodeId: string | null = null;
    if (orderData.promoCode) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { code: orderData.promoCode },
        include: {
          promoCodeUsages: {
            where: { userId: orderData.userId }
          }
        }
      });

      if (!promoCode) {
        throw new Error('Invalid promo code');
      }

      if (!promoCode.isActive) {
        throw new Error('Promo code is not active');
      }

      if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
        throw new Error('Promo code has expired');
      }

      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        throw new Error('Promo code usage limit exceeded');
      }

      if (promoCode.promoCodeUsages.length > 0) {
        throw new Error('You have already used this promo code');
      }

      if (promoCode.minimumOrderAmount && orderData.subtotal < promoCode.minimumOrderAmount) {
        throw new Error(`Minimum order amount of $${promoCode.minimumOrderAmount} required for this promo code`);
      }

      promoCodeId = promoCode.id;
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create addresses first
    const shippingAddress = await prisma.address.create({
      data: {
        userId: orderData.userId,
        type: AddressType.SHIPPING,
        ...orderData.shippingAddress,
      },
    });

    let billingAddress = shippingAddress;
    if (orderData.billingAddress) {
      billingAddress = await prisma.address.create({
        data: {
          userId: orderData.userId,
          type: AddressType.BILLING,
          ...orderData.billingAddress,
        },
      });
    }

    // Create the order with all related data in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: orderData.userId,
          orderNumber,
          status: OrderStatus.PENDING,
          totalAmount: orderData.totalAmount,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          discount: orderData.discount,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          promoCodeId: promoCodeId,
        },
        include: {
          user: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });

      // Debug: Log the productIds being submitted
      console.log('🔍 DEBUG: Order items being created:', orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })));

      // Verify all productIds exist in the products table
      const productIds = orderData.items.map(item => item.productId);
      const existingProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
      });
      
      console.log('🔍 DEBUG: Existing products found:', existingProducts);
      console.log('🔍 DEBUG: Submitted productIds:', productIds);
      
      const missingProductIds = productIds.filter(id => 
        !existingProducts.find(p => p.id === id)
      );
      
      if (missingProductIds.length > 0) {
        console.error('❌ Missing product IDs:', missingProductIds);
        throw new Error(`Products not found: ${missingProductIds.join(', ')}`);
      }

      // Create order items in batch using createMany for better performance
      await tx.orderItem.createMany({
        data: orderData.items.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      });

      // Get the created order items with product details
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: newOrder.id },
        include: {
          product: true,
        },
      });

      // Create initial order timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PENDING,
          description: 'Order created and pending payment',
        },
      });

      // Create promo code usage record and update usage count if promo code was used
      if (promoCodeId) {
        await tx.promoCodeUsage.create({
          data: {
            promoCodeId: promoCodeId,
            userId: orderData.userId,
            orderId: newOrder.id,
            discountAmount: orderData.discount,
          },
        });

        // Update promo code usage count
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      return { ...newOrder, items: orderItems };
    }, {
      timeout: 15000 // 15 seconds timeout
    });

    return order;
  } catch (error) {
    console.log('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

// Payment processing function - COD only
async function processPayment(orderId: string, paymentMethod: string, amount: number) {
  console.log('🔄 processPayment called with:', { orderId, paymentMethod, amount });
  
  try {
    if (paymentMethod !== 'cod') {
      throw new Error('Only Cash on Delivery (COD) is supported');
    }

    console.log('💰 Processing COD payment for order:', orderId);
    
    // For COD, mark as pending payment
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PENDING },
    });
    
    console.log('✅ COD payment processed successfully for order:', orderId);
    
    return {
      success: true,
      paymentIntentId: `cod_${orderId}`,
      status: 'pending',
    };
  } catch (error) {
    console.log('❌ Error processing payment:', error);
    throw new Error('Payment processing failed');
  }
}

// Real function to update order status
async function updateOrderStatus(orderId: string, status: OrderStatus, description?: string) {
  try {
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: status.toString(),
        description: description || `Order status updated to ${status}`,
      },
    });

    return updatedOrder;
  } catch (error) {
    console.log('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
}

// Real function to send order confirmation email
async function sendOrderConfirmationEmail(order: {
  user: { email: string };
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}) {
  try {
    console.log('📧 Preparing to send order confirmation email:', {
      to: order.user.email,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    });

    // Import email service dynamically to avoid initialization issues
    const { emailService } = await import('@/lib/services/email-service');
    
    // Send order confirmation email using the email service
    const result = await emailService.sendOrderConfirmationEmail(order);
    
    if (result.success) {
      console.log('✅ Order confirmation email sent successfully:', {
        messageId: result.messageId,
        to: order.user.email,
        orderNumber: order.orderNumber,
      });
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send order confirmation email:', {
        error: result.error,
        to: order.user.email,
        orderNumber: order.orderNumber,
      });
      // Don't throw error to prevent order submission failure
      // Email failure shouldn't block order completion
      return { success: false, error: result.error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error in sendOrderConfirmationEmail function:', {
      error: errorMessage,
      to: order.user.email,
      orderNumber: order.orderNumber,
    });
    
    // Don't throw error to prevent order submission failure
    // Email failure shouldn't block order completion
    return { success: false, error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Order submission API called');
  
  try {
    const body = await request.json();
    console.log('📦 Order data received:', JSON.stringify(body, null, 2));
    
    // Validate request data
    const validatedData = orderSubmissionSchema.parse(body);
    console.log('✅ Order data validated successfully');
    
    // Create order with real database operations
    const order = await createOrder(validatedData);
    console.log('📝 Order created with ID:', order.id);
    
    // Process payment
    console.log('💳 About to process payment...');
    const paymentResult = await processPayment(
      order.id,
      validatedData.paymentMethod,
      validatedData.totalAmount
    );
    console.log('💳 Payment result:', paymentResult);
    
    if (!paymentResult.success) {
      console.log('❌ Payment failed, cancelling order');
      // Update order status to cancelled if payment fails
      await updateOrderStatus(order.id, OrderStatus.CANCELLED, 'Payment failed');
      
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 400 }
      );
    }
    
    // Update order status based on payment method
    const newStatus = validatedData.paymentMethod === 'cod' 
      ? OrderStatus.CONFIRMED 
      : OrderStatus.PROCESSING;
      
    console.log('📊 Updating order status to:', newStatus);
    await updateOrderStatus(
      order.id, 
      newStatus,
      validatedData.paymentMethod === 'cod' 
        ? 'Order confirmed - Cash on Delivery' 
        : 'Payment successful - Processing order'
    );
    
    // Send confirmation email in background
    sendOrderConfirmationEmail(order).catch(error => {
      console.log('Background email sending failed:', error);
    });
    
    const response = {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntentId: paymentResult.paymentIntentId,
      status: newStatus,
      message: 'Order placed successfully! You will pay upon delivery.',
    };
    
    console.log('🎉 Order submission completed successfully:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.log('❌ Order submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}