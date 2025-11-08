import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/wishlist/[id] - Get specific wishlist item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
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
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(wishlistItem);
  } catch (error) {
    console.log('Error fetching wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist item' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/[id] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if wishlist item exists
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existingWishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item removed from wishlist successfully' });
  } catch (error) {
    console.log('Error removing wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}