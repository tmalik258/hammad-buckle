import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating cart item
const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

// GET /api/cart/[id] - Get specific cart item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
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

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.log('Error fetching cart item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart item' },
      { status: 500 }
    );
  }
}

// PUT /api/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCartItemSchema.parse(body);

    // Get current cart item with product/variant info
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stockQuantity: true,
          },
        },
        variant: {
          select: {
            id: true,
            stock: true,
          },
        },
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    const availableStock = existingCartItem.variant
      ? existingCartItem.variant.stock
      : existingCartItem.product.stockQuantity;

    if (validatedData.quantity > availableStock) {
      return NextResponse.json(
        { error: 'Requested quantity exceeds available stock' },
        { status: 400 }
      );
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: validatedData.quantity },
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

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if cart item exists
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.log('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}