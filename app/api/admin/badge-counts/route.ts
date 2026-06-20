import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertAdminApi } from '@/lib/utils/auth';

export async function GET() {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

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

    return NextResponse.json({
      pendingOrders,
      pendingReviews,
      lowStockProducts,
      inactiveCategories,
    });
  } catch (error) {
    console.log('Error fetching badge counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge counts' },
      { status: 500 }
    );
  }
}