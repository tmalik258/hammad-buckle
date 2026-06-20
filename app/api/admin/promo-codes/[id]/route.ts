import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertAdminApi } from '@/lib/utils/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/promo-codes/[id] - Get a specific promo code
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            promoCodeUsages: true,
          },
        },
        promoCodeUsages: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Transform data to include usage count
    const transformedPromoCode = {
      ...promoCode,
      usageCount: promoCode._count.promoCodeUsages,
      _count: undefined,
    };

    return NextResponse.json(transformedPromoCode);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promo-codes/[id] - Update a specific promo code
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      usageLimit,
      expirationDate,
      isActive,
    } = body;

    // Check if promo code exists
    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingPromoCode.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 409 }
        );
      }
    }

    // Update promo code
    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(minimumOrderAmount !== undefined && { minimumOrderAmount }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ?? null }),
        ...(expirationDate !== undefined && {
          expirationDate: expirationDate ? new Date(expirationDate) : null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedPromoCode);
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promo-codes/[id] - Delete a specific promo code
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;

    // Check if promo code exists
    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Check if promo code has been used
    const usageCount = await prisma.promoCodeUsage.count({
      where: { promoCodeId: id },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete promo code "${existingPromoCode.code}" because it has been used ${usageCount} time(s)`,
        },
        { status: 400 }
      );
    }

    // Delete promo code
    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}