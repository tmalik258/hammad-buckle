import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform the order data to match the expected format
    const transformedOrder = {
      id: order.id,
      number: order.orderNumber,
      orderKey: order.id,
      status: order.status,
      currency: 'USD', // Default currency
      version: '1.0',
      pricesIncludeTax: false,
      customerId: order.userId,
      customerNote: '', // Notes field not available in current schema
      billing: {
        name: order.billingAddress?.name || '',
        street: order.billingAddress?.street || '',
        city: order.billingAddress?.city || '',
        area: order.billingAddress?.area || '',
        postcode: order.billingAddress?.postalCode || '',
        email: order.user?.email || '',
        phone: order.billingAddress?.phone || ''
      },
      shipping: {
        name: order.shippingAddress?.name || '',
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        area: order.shippingAddress?.area || '',
        postcode: order.shippingAddress?.postalCode || '',
        phone: order.shippingAddress?.phone || ''
      },
      paymentMethod: order.paymentMethod || '',
      paymentMethodTitle: order.paymentMethod || '',
      transactionId: '', // Transaction ID not available in current schema
      lineItems: order.items.map((item: {
        id: string;
        productId: string;
        price: number;
        quantity: number;
        product?: { name: string; images?: string [] } | null;
        total?: number;
      }) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || 'Unknown Product',
        sku: item.productId,
        price: item.price,
        quantity: item.quantity,
        total: item.total || item.price * item.quantity,
        image: item.product?.images?.[0] || '',
      })),
      shippingLines: [],
      taxLines: [],
      feeLines: [],
      couponLines: [],
      refunds: [],
      discountTotal: 0,
      discountTax: 0,
      shippingTotal: order.shipping || 0,
      shippingTax: 0,
      cartTax: 0,
      total: order.totalAmount,
      totalTax: 0,
      meta: [],
      notes: [],
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.deliveredAt?.toISOString(),
      paidAt: order.createdAt.toISOString(), // Use createdAt as fallback for paidAt
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.log('Error fetching order by number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}