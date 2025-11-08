import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, OrderStatus } from '@prisma/client';

// Validation schema for order creation
const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

const orderSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  shippingAddressId: z.string().uuid('Invalid shipping address ID').optional(),
  billingAddressId: z.string().uuid('Invalid billing address ID').optional(),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  shipping: z.number().min(0, 'Shipping cannot be negative'),
  total: z.number().positive('Total must be positive'),
  paymentMethod: z.enum(['CARD', 'PAYPAL', 'BANK_TRANSFER']),
  notes: z.string().optional(),
});

// GET /api/orders - Get orders with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    }

    // Filter by status (ensure Prisma enum typing)
    if (status && status !== 'all') {
      const normalized = status.toUpperCase();
      if (Object.values(OrderStatus).includes(normalized as OrderStatus)) {
        where.status = { equals: normalized as OrderStatus };
      }
    }

    // Search functionality - search in order number, user name, or user email
    if (search && search.trim()) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shippingAddress: {
            select: {
              id: true,
              street: true,
              city: true,
              area: true,
              postalCode: true,
            },
          },
          billingAddress: {
            select: {
              id: true,
              street: true,
              city: true,
              area: true,
              postalCode: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
          timeline: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          payment: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items and initial timeline entry
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: validatedData.userId,
        shippingAddressId: validatedData.shippingAddressId,
        billingAddressId: validatedData.billingAddressId,
        subtotal: validatedData.subtotal,
        tax: validatedData.tax,
        shipping: validatedData.shipping,
        totalAmount: validatedData.total,
        paymentMethod: validatedData.paymentMethod,
        status: OrderStatus.PENDING,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
        timeline: {
          create: {
            status: 'PENDING',
            description: 'Order placed successfully',
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddress: {
          select: {
            id: true,
            street: true,
            city: true,
            area: true,
            postalCode: true,
          },
        },
        billingAddress: {
          select: {
            id: true,
            street: true,
            city: true,
            area: true,
            postalCode: true,
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
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}