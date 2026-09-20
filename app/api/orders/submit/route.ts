import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderStatus, PaymentStatus, AddressType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth';

const orderSubmissionSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email(),
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

type OrderSubmissionInput = z.infer<typeof orderSubmissionSchema>;

type ResolvedOrderIdentity = {
  userId: string | null;
  guestEmail: string | null;
  confirmationEmail: string;
};

async function resolveOrderIdentity(
  email: string,
  clientUserId: string | undefined,
): Promise<ResolvedOrderIdentity> {
  const normalizedEmail = email.toLowerCase().trim();
  const authUser = await getAuthenticatedUser();

  if (authUser) {
    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!dbUser) {
      throw new Error('Authenticated user profile not found');
    }

    return {
      userId: dbUser.id,
      guestEmail: null,
      confirmationEmail: dbUser.email || normalizedEmail,
    };
  }

  // Ignore forged client userId for guests
  void clientUserId;

  return {
    userId: null,
    guestEmail: normalizedEmail,
    confirmationEmail: normalizedEmail,
  };
}

async function createOrder(
  orderData: OrderSubmissionInput,
  identity: ResolvedOrderIdentity,
) {
  try {
    if (orderData.promoCode && !identity.userId) {
      throw new Error('Sign in to use promo codes');
    }

    if (identity.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: identity.userId },
      });
      if (!userExists) {
        throw new Error(`User with ID ${identity.userId} does not exist`);
      }
    }

    let promoCodeId: string | null = null;
    if (orderData.promoCode && identity.userId) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { code: orderData.promoCode },
        include: {
          promoCodeUsages: {
            where: { userId: identity.userId },
          },
        },
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
        throw new Error(
          `Minimum order amount of $${promoCode.minimumOrderAmount} required for this promo code`,
        );
      }

      promoCodeId = promoCode.id;
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const shippingAddress = await prisma.address.create({
      data: {
        userId: identity.userId,
        type: AddressType.SHIPPING,
        email: identity.confirmationEmail,
        ...orderData.shippingAddress,
      },
    });

    let billingAddress = shippingAddress;
    if (orderData.billingAddress) {
      billingAddress = await prisma.address.create({
        data: {
          userId: identity.userId,
          type: AddressType.BILLING,
          email: identity.confirmationEmail,
          ...orderData.billingAddress,
        },
      });
    }

    const order = await prisma.$transaction(
      async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: identity.userId,
            guestEmail: identity.guestEmail,
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

        const productIds = orderData.items.map((item) => item.productId);
        const existingProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        });

        const missingProductIds = productIds.filter(
          (id) => !existingProducts.find((p) => p.id === id),
        );

        if (missingProductIds.length > 0) {
          throw new Error(`Products not found: ${missingProductIds.join(', ')}`);
        }

        await tx.orderItem.createMany({
          data: orderData.items.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        });

        const orderItems = await tx.orderItem.findMany({
          where: { orderId: newOrder.id },
          include: {
            product: true,
          },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: newOrder.id,
            status: OrderStatus.PENDING,
            description: 'Order created and pending payment',
          },
        });

        if (promoCodeId && identity.userId) {
          await tx.promoCodeUsage.create({
            data: {
              promoCodeId: promoCodeId,
              userId: identity.userId,
              orderId: newOrder.id,
              discountAmount: orderData.discount,
            },
          });

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
      },
      {
        timeout: 15000,
      },
    );

    return order;
  } catch (error) {
    console.log('Error creating order:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create order');
  }
}

async function processPayment(orderId: string, paymentMethod: string, amount: number) {
  console.log('🔄 processPayment called with:', { orderId, paymentMethod, amount });

  try {
    if (paymentMethod !== 'cod') {
      throw new Error('Only Cash on Delivery (COD) is supported');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PENDING },
    });

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

async function updateOrderStatus(orderId: string, status: OrderStatus, description?: string) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
      },
    });

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

async function sendOrderConfirmationEmail(order: {
  confirmationEmail: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}) {
  try {
    const emailPayload = {
      user: { email: order.confirmationEmail },
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      items: order.items,
    };

    console.log('📧 Preparing to send order confirmation email:', {
      to: order.confirmationEmail,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    });

    const { emailService } = await import('@/lib/services/email-service');
    const result = await emailService.sendOrderConfirmationEmail(emailPayload);

    if (result.success) {
      console.log('✅ Order confirmation email sent successfully:', {
        messageId: result.messageId,
        to: order.confirmationEmail,
        orderNumber: order.orderNumber,
      });
      return { success: true, messageId: result.messageId };
    }

    console.error('❌ Failed to send order confirmation email:', {
      error: result.error,
      to: order.confirmationEmail,
      orderNumber: order.orderNumber,
    });
    return { success: false, error: result.error };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error in sendOrderConfirmationEmail function:', {
      error: errorMessage,
      to: order.confirmationEmail,
      orderNumber: order.orderNumber,
    });
    return { success: false, error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Order submission API called');

  try {
    const body = await request.json();
    const validatedData = orderSubmissionSchema.parse(body);
    const identity = await resolveOrderIdentity(validatedData.email, validatedData.userId);

    const order = await createOrder(validatedData, identity);
    console.log('📝 Order created with ID:', order.id);

    const paymentResult = await processPayment(
      order.id,
      validatedData.paymentMethod,
      validatedData.totalAmount,
    );

    if (!paymentResult.success) {
      await updateOrderStatus(order.id, OrderStatus.CANCELLED, 'Payment failed');
      return NextResponse.json({ error: 'Payment processing failed' }, { status: 400 });
    }

    const newStatus =
      validatedData.paymentMethod === 'cod' ? OrderStatus.CONFIRMED : OrderStatus.PROCESSING;

    await updateOrderStatus(
      order.id,
      newStatus,
      validatedData.paymentMethod === 'cod'
        ? 'Order confirmed - Cash on Delivery'
        : 'Payment successful - Processing order',
    );

    sendOrderConfirmationEmail({
      confirmationEmail: identity.confirmationEmail,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      items: order.items,
    }).catch((error) => {
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
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      const clientErrors = [
        'Sign in to use promo codes',
        'Invalid promo code',
        'Promo code is not active',
        'Promo code has expired',
        'Promo code usage limit exceeded',
        'You have already used this promo code',
        'Authenticated user profile not found',
      ];
      if (
        clientErrors.includes(error.message) ||
        error.message.startsWith('Minimum order amount') ||
        error.message.startsWith('Products not found')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 },
    );
  }
}
