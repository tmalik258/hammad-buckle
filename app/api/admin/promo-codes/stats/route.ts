import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/promo-codes/stats - Get promo codes analytics and statistics
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [totalCodes, activeCodes, expiredCodes, inactiveCodes] = await Promise.all([
      // Total promo codes
      prisma.promoCode.count(),
      
      // Active promo codes (active and not expired)
      prisma.promoCode.count({
        where: {
          isActive: true,
          OR: [
            { expirationDate: null },
            { expirationDate: { gt: now } },
          ],
        },
      }),
      
      // Expired promo codes
      prisma.promoCode.count({
        where: {
          expirationDate: { lte: now },
        },
      }),
      
      // Inactive promo codes
      prisma.promoCode.count({
        where: {
          isActive: false,
        },
      }),
    ]);

    // Get most used promo codes
    const mostUsedCodes = await prisma.promoCode.findMany({
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        _count: {
          select: {
            promoCodeUsages: true,
          },
        },
      },
      orderBy: {
        promoCodeUsages: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Transform most used codes
    const transformedMostUsedCodes = mostUsedCodes.map((code) => ({
      id: code.id,
      code: code.code,
      discountType: code.discountType,
      discountValue: code.discountValue,
      usageCount: code._count.promoCodeUsages,
    }));

    // Calculate total revenue generated from promo codes
    const revenueData = await prisma.promoCodeUsage.aggregate({
      _sum: {
        discountAmount: true,
      },
    });

    const totalRevenue = revenueData._sum.discountAmount || 0;

    // Get usage statistics for the last 30 days
    const recentUsage = await prisma.promoCodeUsage.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get orders with promo codes in the last 30 days
    const ordersWithPromoCodes = await prisma.order.count({
      where: {
        promoCodeId: { not: null },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get average discount amount
    const avgDiscountData = await prisma.promoCodeUsage.aggregate({
      _avg: {
        discountAmount: true,
      },
    });

    const averageDiscount = avgDiscountData._avg.discountAmount || 0;

    // Get promo code usage trend (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const usageTrendData = await prisma.promoCodeUsage.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transform usage trend data
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const usage = usageTrendData.filter(
        (item) => item.createdAt.toISOString().split('T')[0] === dateStr
      );
      const count = usage.length;
      
      trendData.push({
        date: dateStr,
        usage: count,
      });
    }

    // Get discount type distribution
    const discountTypeStats = await prisma.promoCode.groupBy({
      by: ['discountType'],
      _count: {
        id: true,
      },
    }) as Array<{
      discountType: string;
      _count: {
        id: number;
      };
    }>;

    const stats = {
      totalCodes,
      activeCodes,
      expiredCodes,
      inactiveCodes,
      mostUsedCodes: transformedMostUsedCodes,
      totalRevenue,
      recentUsage,
      ordersWithPromoCodes,
      averageDiscount,
      usageTrend: trendData,
      discountTypeDistribution: discountTypeStats.map((item) => ({
        type: item.discountType,
        count: item._count.id,
      })),
      metrics: {
        conversionRate: totalCodes > 0 ? (recentUsage / totalCodes) * 100 : 0,
        activeRate: totalCodes > 0 ? (activeCodes / totalCodes) * 100 : 0,
        expirationRate: totalCodes > 0 ? (expiredCodes / totalCodes) * 100 : 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching promo codes stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes statistics' },
      { status: 500 }
    );
  }
}