import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // First, get the product to find its category
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Then, find related products from the same category, excluding the current product
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId }, // Exclude the current product
      },
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
          select: {
            id: true,
            rating: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating for each product
    const productsWithRating = relatedProducts.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        averageRating,
      };
    });

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.log('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}