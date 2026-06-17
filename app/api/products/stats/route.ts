import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get basic product counts
    const [totalProducts, activeProducts, outOfStockProducts, featuredProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { inStock: true } }),
      prisma.product.count({ where: { inStock: false } }),
      prisma.product.count({ where: { featured: true } })
    ]);

    const draftProducts = 0; // No draft status in current schema

    // Get low stock products (assuming stockQuantity < 10 is low stock)
    const lowStockProducts = await prisma.product.count({
      where: {
        stockQuantity: {
          lt: 10
        }
      }
    });

    // Get products by featured status (since no type field exists)
    const productsByType: Record<string, number> = {
      'featured': featuredProducts,
      'regular': totalProducts - featuredProducts
    };

    // Calculate average price
    const priceAggregate = await prisma.product.aggregate({
      _avg: {
        price: true
      },
      _sum: {
        price: true
      },
      where: {
        inStock: true
      }
    });

    // Calculate total inventory value (price * stockQuantity)
    const inventoryValue = await prisma.product.aggregate({
      _sum: {
        price: true
      },
      where: {
        inStock: true,
        stockQuantity: {
          gt: 0
        }
      }
    });

    // Get recent products (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      totalProducts,
      activeProducts,
      draftProducts,
      outOfStockProducts,
      featuredProducts,
      lowStockProducts,
      averagePrice: priceAggregate._avg.price || 0,
      totalValue: inventoryValue._sum.price || 0,
      productsByType,
      recentProducts
    });
  } catch (error) {
    console.log('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}