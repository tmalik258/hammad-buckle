import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for product variant
const variantSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Variant name is required').max(100, 'Variant name too long'),
  value: z.string().min(1, 'Variant value is required').max(100, 'Variant value too long'),
  price: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().max(100, 'SKU too long').optional(),
});

// GET /api/variants - Get product variants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: { productId?: string } = {};
    if (productId) {
      where.productId = productId;
    }

    // Get variants with pagination
    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.productVariant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      variants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

// POST /api/variants - Create new variant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = variantSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      console.log('Product not found:', validatedData.productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for duplicate variant (same name and value for the product)
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: validatedData.productId,
        name: validatedData.name,
        value: validatedData.value,
      },
    });

    if (existingVariant) {
      console.log('Duplicate variant found:', existingVariant);
      return NextResponse.json(
        { error: 'Variant with this name and value already exists for this product' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU if provided
    if (validatedData.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: { sku: validatedData.sku },
      });

      if (existingSku) {
        console.log('Duplicate SKU found:', existingSku);
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    const variant = await prisma.productVariant.create({
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

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error);
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error creating variant:', error);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}