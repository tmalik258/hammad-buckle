import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for cart item
const cartItemSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stockQuantity: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate cart totals
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + (price * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      summary: {
        subtotal,
        totalItems,
        itemCount: cartItems.length,
      },
    });
  } catch (error) {
    console.log('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = cartItemSchema.parse(body);

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        variants: validatedData.variantId ? {
          where: { id: validatedData.variantId },
        } : false,
      },
    });

    // Check variant if specified
    if (validatedData.variantId) {
      const variant = product?.variants?.[0];
      if (!variant) {
        return NextResponse.json(
          { error: 'Product variant not found' },
          { status: 404 }
        );
      }

      // Check variant stock
      if (variant.stock < validatedData.quantity) {
        return NextResponse.json(
          { error: 'Insufficient variant stock' },
          { status: 400 }
        );
      }
    } else {
      // Check product stock
      if (product?.stockQuantity && product.stockQuantity < validatedData.quantity) {
        return NextResponse.json(
          { error: 'Insufficient product stock' },
          { status: 400 }
        );
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: validatedData.userId,
        productId: validatedData.productId,
        variantId: validatedData.variantId || null,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item exists
      const newQuantity = existingCartItem.quantity + validatedData.quantity;
      
      // Check stock again for new quantity
      const availableStock = validatedData.variantId 
        ? product?.variants?.[0]?.stock || 0
        : product?.stockQuantity;
      
      if (availableStock !== undefined && newQuantity > availableStock) {
        return NextResponse.json(
          { error: 'Total quantity exceeds available stock' },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stockQuantity: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              stock: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: validatedData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stockQuantity: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              stock: true,
            },
          },
        },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear user's cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.log('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}