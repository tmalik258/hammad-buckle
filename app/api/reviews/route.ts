import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema for review creation
const reviewSchema = z.object({
  userId: z.uuid('Invalid user ID'),
  productId: z.uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(200, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
  verified: z.boolean().optional().default(false),
});

// GET /api/reviews - Get reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    type SortableReviewField = 'createdAt' | 'rating' | 'helpful';
    const sortByRaw = searchParams.get('sortBy') || 'createdAt';
    const sortOrderRaw = searchParams.get('sortOrder') || 'desc';
    const sortBy: SortableReviewField = (['createdAt', 'rating', 'helpful'] as const).includes(sortByRaw as SortableReviewField)
      ? (sortByRaw as SortableReviewField)
      : 'createdAt';
    const sortOrder: 'asc' | 'desc' = sortOrderRaw === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    const where: {
      productId?: string;
      userId?: string;
      status?: ReviewStatus;
      verified?: boolean;
      rating?: number;
    } = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status as ReviewStatus;
    }
    
    if (rating) {
      where.rating = parseInt(rating);
    }
    
    if (verified !== null) {
      where.verified = verified === 'true';
    }

    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sortBy === 'rating'
        ? { rating: sortOrder }
        : sortBy === 'helpful'
        ? { helpful: sortOrder }
        : { createdAt: sortOrder };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate rating statistics if filtering by product
    let ratingStats = null;
    if (productId) {
      const [avgAgg, r1, r2, r3, r4, r5] = await Promise.all([
        prisma.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { rating: true },
        }),
        prisma.review.count({ where: { productId, rating: 1 } }),
        prisma.review.count({ where: { productId, rating: 2 } }),
        prisma.review.count({ where: { productId, rating: 3 } }),
        prisma.review.count({ where: { productId, rating: 4 } }),
        prisma.review.count({ where: { productId, rating: 5 } }),
      ]);

      const totalReviews = avgAgg._count.rating;
      const averageRating = avgAgg._avg.rating ?? 0;

      ratingStats = {
        average: Math.round(averageRating * 10) / 10,
        total: totalReviews,
        distribution: {
          5: r5,
          4: r4,
          3: r3,
          2: r2,
          1: r1,
        },
      };
    }

    return NextResponse.json({
      reviews,
      ratingStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: validatedData.userId,
        productId: validatedData.productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: validatedData.productId,
        order: {
          userId: validatedData.userId,
          status: 'DELIVERED',
        },
      },
    });

    const reviewData = {
      ...validatedData,
      verified: hasPurchased ? true : false,
    };

    // Create review and update product rating statistics
    const [review] = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: reviewData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      });

      // Update product rating statistics
      const reviewStats = await tx.review.aggregate({
        where: { productId: validatedData.productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: validatedData.productId },
        data: {
          rating: reviewStats._avg.rating || 0,
          reviewCount: reviewStats._count.rating,
        },
      });

      return [newReview];
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.log('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}