import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for wishlist item
const wishlistItemSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  productId: z.string().uuid('Invalid product ID'),
});

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get wishlist items with pagination
    const [wishlistItems, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true,
              stockQuantity: true,
              rating: true,
              reviewCount: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.wishlistItem.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items: wishlistItems,
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
    console.log('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = wishlistItemSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: validatedData.userId,
        productId: validatedData.productId,
      },
    });

    if (existingWishlistItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    // Create wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: validatedData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            stockQuantity: true,
            rating: true,
            reviewCount: true,
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

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Clear user's wishlist
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

    const deletedCount = await prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      message: 'Wishlist cleared successfully',
      deletedCount: deletedCount.count,
    });
  } catch (error) {
    console.log('Error clearing wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to clear wishlist' },
      { status: 500 }
    );
  }
}