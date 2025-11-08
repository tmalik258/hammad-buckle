import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/price-stats - Get price statistics for all active products
export async function GET(request: NextRequest) {
  try {
    // Get price statistics from active products
    const priceStats = await prisma.product.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _avg: {
        price: true,
      },
      _count: {
        price: true,
      },
      where: {
        price: {
          gt: 0, // Only include products with valid prices
        },
      },
    });

    // Also get variant price statistics for more accurate ranges
    const variantPriceStats = await prisma.productVariant.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _avg: {
        price: true,
      },
      where: {
        price: {
          gt: 0,
        },
      },
    });

    // Combine product and variant price statistics
    const minPrice = Math.min(
      priceStats._min.price || 0,
      variantPriceStats._min.price || 0
    );
    
    const maxPrice = Math.max(
      priceStats._max.price || 1000,
      variantPriceStats._max.price || 1000
    );
    
    const avgPrice = (
      (priceStats._avg.price || 0) + (variantPriceStats._avg.price || 0)
    ) / 2;

    // Get price distribution for better range calculation
    const priceDistribution = await prisma.product.findMany({
      select: {
        price: true,
        variants: {
          select: {
            price: true,
          },
          where: {
            price: {
              gt: 0,
            },
          },
        },
      },
      where: {
        price: {
          gt: 0,
        },
      },
    });

    // Collect all prices for percentile calculation
    const allPrices: number[] = [];
    
    priceDistribution.forEach(product => {
      allPrices.push(product.price);
      product.variants?.forEach(variant => {
        if (variant.price && variant.price > 0) {
          allPrices.push(variant.price);
        }
      });
    });

    // Sort prices for percentile calculation
    allPrices.sort((a, b) => a - b);

    // Calculate percentiles for better price range distribution
    const getPercentile = (arr: number[], percentile: number): number => {
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      return arr[Math.max(0, Math.min(index, arr.length - 1))] || 0;
    };

    const percentiles = {
      p25: getPercentile(allPrices, 25),
      p50: getPercentile(allPrices, 50), // median
      p75: getPercentile(allPrices, 75),
      p90: getPercentile(allPrices, 90),
    };

    const response = {
      min: Math.floor(minPrice),
      max: Math.ceil(maxPrice),
      average: Math.round(avgPrice * 100) / 100,
      median: Math.round(percentiles.p50 * 100) / 100,
      totalProducts: priceStats._count.price || 0,
      percentiles: {
        p25: Math.round(percentiles.p25 * 100) / 100,
        p50: Math.round(percentiles.p50 * 100) / 100,
        p75: Math.round(percentiles.p75 * 100) / 100,
        p90: Math.round(percentiles.p90 * 100) / 100,
      },
      priceRanges: [
        { min: 0, max: percentiles.p25, label: `Under ${Math.round(percentiles.p25)} KWD` },
        { min: percentiles.p25, max: percentiles.p50, label: `${Math.round(percentiles.p25)} - ${Math.round(percentiles.p50)} KWD` },
        { min: percentiles.p50, max: percentiles.p75, label: `${Math.round(percentiles.p50)} - ${Math.round(percentiles.p75)} KWD` },
        { min: percentiles.p75, max: percentiles.p90, label: `${Math.round(percentiles.p75)} - ${Math.round(percentiles.p90)} KWD` },
        { min: percentiles.p90, max: maxPrice, label: `${Math.round(percentiles.p90)}+ KWD` },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.log('Error fetching price statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price statistics' },
      { status: 500 }
    );
  }
}