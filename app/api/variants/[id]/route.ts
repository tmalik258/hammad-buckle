import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { assertAdminApi } from '@/lib/utils/auth';

// Validation schema for updating variant
const updateVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(100, 'Variant name too long').optional(),
  value: z.string().min(1, 'Variant value is required').max(100, 'Variant value too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  sku: z.string().max(100, 'SKU too long').optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: z.string().max(100, 'Dimensions too long').optional(),
});

// GET /api/variants/[id] - Get specific variant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            images: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.log('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

// PUT /api/variants/[id] - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateVariantSchema.parse(body);

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Check for duplicate variant (same name and value for the product)
    if (validatedData.name || validatedData.value) {
      const name = validatedData.name || existingVariant.name;
      const value = validatedData.value || existingVariant.value;
      
      const duplicateVariant = await prisma.productVariant.findFirst({
        where: {
          productId: existingVariant.productId,
          name,
          value,
          id: { not: id },
        },
      });

      if (duplicateVariant) {
        return NextResponse.json(
          { error: 'Variant with this name and value already exists for this product' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate SKU if provided
    if (validatedData.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: {
          sku: validatedData.sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: validatedData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

// DELETE /api/variants/[id] - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;
    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Check if variant is being used in cart items
    const cartItemsUsingVariant = await prisma.cartItem.findFirst({
      where: { variantId: id },
    });

    if (cartItemsUsingVariant) {
      return NextResponse.json(
        { error: 'Cannot delete variant that is in use by cart items' },
        { status: 400 }
      );
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.log('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}