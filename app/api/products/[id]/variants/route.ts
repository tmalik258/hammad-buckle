import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for product variant
const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(100, 'Variant name too long'),
  value: z.string().min(1, 'Variant value is required').max(100, 'Variant value too long'),
  price: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().max(100, 'SKU too long').optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id]/variants - Get all variants for a product
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where: { productId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productVariant.count({
        where: { productId },
      }),
    ]);

    return NextResponse.json({
      variants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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

// POST /api/products/[id]/variants - Create a new variant for a product
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const validatedData = variantSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for duplicate variant (same name and value for the product)
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId,
        name: validatedData.name,
        value: validatedData.value,
      },
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: 'A variant with this name and value already exists for this product' },
        { status: 409 }
      );
    }

    // Check for duplicate SKU if provided
    if (validatedData.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: { sku: validatedData.sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'A variant with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Create the variant
    const variant = await prisma.productVariant.create({
      data: {
        ...validatedData,
        productId,
      },
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
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
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