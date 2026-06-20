import { NextRequest, NextResponse } from 'next/server';
import { GenderTarget } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { clearProductsCache } from '@/lib/utils/cache';
import { assertAdminApi } from '@/lib/utils/auth';

// Validation schema for product update
const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  originalPrice: z.number().positive('Original price must be positive').optional().nullable(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional(),
  inStock: z.boolean().optional(),
  sku: z.string().optional().nullable(),
  weight: z.number().positive('Weight must be positive').optional().nullable(),
  dimensions: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  isActive: z.boolean().optional(),
  genderTarget: z.nativeEnum(GenderTarget).optional(),
})
.refine((data) => {
  // If originalPrice is provided, it should be greater than or equal to price
  if (data.originalPrice && data.price && data.originalPrice < data.price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be greater than or equal to current price',
  path: ['originalPrice'],
})
.refine((data) => {
  // If onSale is true, originalPrice should be provided and greater than price
  if (data.onSale && data.price && (!data.originalPrice || data.originalPrice <= data.price)) {
    return false;
  }
  return true;
}, {
  message: 'When product is on sale, original price must be provided and greater than current price',
  path: ['onSale'],
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            stock: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      // Clear entire products cache when product is not found
      // This ensures data consistency by removing potentially stale cached data
      clearProductsCache();
      
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Add detailed error logging for validation failures
    const validationResult = updateProductSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Product update validation failed:', {
        errors: validationResult.error.issues,
        body: body
      });
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }
    const validatedData = validationResult.data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!existingProduct) {
      // Clear entire products cache when product is not found
      // This ensures data consistency by removing potentially stale cached data
      clearProductsCache();
      
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<{
      name: string;
      description: string;
      price: number;
      originalPrice: number | null;
      image: string;
      images: string[];
      categoryId: string;
      inStock: boolean;
      stockQuantity: number;
      isNew: boolean;
      isActive: boolean;
      onSale: boolean;
      featured: boolean;
      sku: string | null;
      genderTarget: GenderTarget;
    }> = { ...validatedData };
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
    });

    // Update category product counts if category changed
    if (validatedData.categoryId && validatedData.categoryId !== existingProduct.categoryId) {
      const categoryCountUpdates: Promise<unknown>[] = [];
      // Decrement old category only if it exists
      if (existingProduct.categoryId) {
        categoryCountUpdates.push(
          prisma.category.update({
            where: { id: existingProduct.categoryId },
            data: { productsCount: { decrement: 1 } },
          })
        );
      }
      // Increment new category (validatedData.categoryId is a non-empty string)
      categoryCountUpdates.push(
        prisma.category.update({
          where: { id: validatedData.categoryId },
          data: { productsCount: { increment: 1 } },
        })
      );
      await Promise.all(categoryCountUpdates);
    }

    // Clear cache after successful update
    clearProductsCache();

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and get category info
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!existingProduct) {
      // Clear entire products cache when product is not found
      // This ensures data consistency by removing potentially stale cached data
      clearProductsCache();
      
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product and conditionally update category count (only if product had a category)
    const deletionTasks: Promise<unknown>[] = [
      prisma.product.delete({ where: { id } }),
    ];
    if (existingProduct.categoryId) {
      deletionTasks.push(
        prisma.category.update({
          where: { id: existingProduct.categoryId },
          data: { productsCount: { decrement: 1 } },
        })
      );
    }
    await Promise.all(deletionTasks);

    // Clear cache after successful deletion
    clearProductsCache();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}