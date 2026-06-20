import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for review update
const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  title: z.string().min(1, 'Review title is required').max(200, 'Title too long').optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long').optional(),
  verified: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/reviews/[id] - Get a single review
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.log('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update a review
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateReviewSchema.parse(body);

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update review and recalculate product rating if rating changed
    const [review] = await prisma.$transaction(async (tx) => {
      // Update the review
      const updatedReview = await tx.review.update({
        where: { id },
        data: validatedData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
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

      // If rating was updated, recalculate product statistics
      if (validatedData.rating !== undefined) {
        const reviewStats = await tx.review.aggregate({
          where: { productId: existingReview.productId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.product.update({
          where: { id: existingReview.productId },
          data: {
            rating: reviewStats._avg.rating || 0,
            reviewCount: reviewStats._count.rating,
          },
        });
      }

      return [updatedReview];
    });

    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete review and update product rating statistics
    await prisma.$transaction(async (tx) => {
      // Delete the review
      await tx.review.delete({ where: { id } });

      // Recalculate product rating statistics
      const reviewStats = await tx.review.aggregate({
        where: { productId: existingReview.productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: existingReview.productId },
        data: {
            rating: reviewStats._avg.rating || 0,
            reviewCount: reviewStats._count.rating,
          },
      });
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.log('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}