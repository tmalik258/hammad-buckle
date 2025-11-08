import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get pending orders count (orders that need attention)
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING']
        }
      }
    });

    // Get pending reviews count (reviews awaiting moderation)
    const pendingReviews = await prisma.review.count({
      where: {
        status: 'PENDING'
      }
    });

    // Get low stock products count (products with stock below threshold)
    const lowStockProducts = await prisma.product.count({
      where: {
        stockQuantity: {
          lt: 10 // Less than 10 items in stock
        }
      }
    });

    // Get inactive categories count (categories with no products)
    const inactiveCategories = await prisma.category.count({
      where: {
        products: {
          none: {} // Categories with no products
        }
      }
    });

    // Get inactive occasions count (occasions with no products)
    const inactiveOccasions = await prisma.occasion.count({
      where: {
        products: {
          none: {} // Occasions with no products
        }
      }
    });

    // Get inactive types count (types with no products)
    const inactiveTypes = await prisma.type.count({
      where: {
        products: {
          none: {} // Types with no products
        }
      }
    });

    return NextResponse.json({
      pendingOrders,
      pendingReviews,
      lowStockProducts,
      inactiveCategories,
      inactiveOccasions,
      inactiveTypes
    });
  } catch (error) {
    console.log('Error fetching badge counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge counts' },
      { status: 500 }
    );
  }
}