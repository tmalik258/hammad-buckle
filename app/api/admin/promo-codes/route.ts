import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/admin/promo-codes - Get all promo codes with filtering and pagination
export async function GET(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active' | 'inactive' | 'expired'
    const discountType = searchParams.get('discountType'); // 'PERCENTAGE' | 'FIXED'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const now = new Date();
    const where: Prisma.PromoCodeWhereInput = {
      AND: [
        // Search filter
        search
          ? {
              code: { contains: search, mode: 'insensitive' as const },
            }
          : {},
        // Status filter
        status === 'active'
          ? {
              isActive: true,
              OR: [
                { expirationDate: null },
                { expirationDate: { gt: now } },
              ],
            }
          : status === 'inactive'
          ? { isActive: false }
          : status === 'expired'
          ? {
              expirationDate: { lte: now },
              // Only consider rows that actually have an expiration date set
              NOT: { expirationDate: null },
            }
          : {},
        // Discount type filter
        discountType ? { discountType: discountType as Prisma.EnumDiscountTypeFilter } : {},
      ],
    };

    // Build orderBy clause
    const orderBy: Prisma.PromoCodeOrderByWithRelationInput = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // Get promo codes with usage count
    const [promoCodes, totalCount] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              promoCodeUsages: true,
            },
          },
        },
      }),
      prisma.promoCode.count({ where }),
    ]);

    // Transform data to include usage count
    const transformedPromoCodes = promoCodes.map((promoCode) => ({
      ...promoCode,
      usageCount: promoCode._count.promoCodeUsages,
      _count: undefined,
    }));

    return NextResponse.json({
      promoCodes: transformedPromoCodes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/promo-codes - Create a new promo code
export async function POST(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      usageLimit,
      expirationDate,
      isActive,
    } = body;

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existingPromoCode) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      );
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue,
        minimumOrderAmount: minimumOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount ?? null,
        usageLimit: usageLimit ?? null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promo-codes - Bulk delete promo codes
export async function DELETE(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No promo code IDs provided' },
        { status: 400 }
      );
    }

    // Check if any promo codes have been used
    const usedPromoCodes = await prisma.promoCodeUsage.findMany({
      where: {
        promoCodeId: { in: ids },
      },
      select: {
        promoCodeId: true,
        promoCode: {
          select: {
            code: true,
          },
        },
      },
    });

    if (usedPromoCodes.length > 0) {
      const usedCodes = usedPromoCodes.map((usage) => usage.promoCode.code);
      return NextResponse.json(
        {
          error: `Cannot delete promo codes that have been used: ${usedCodes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Delete promo codes
    const result = await prisma.promoCode.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} promo codes`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo codes' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/promo-codes - Bulk update promo codes (activate/deactivate)
export async function PATCH(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No promo code IDs provided' },
        { status: 400 }
      );
    }

    if (!['activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "activate" or "deactivate"' },
        { status: 400 }
      );
    }

    const isActive = action === 'activate';

    // Update promo codes
    const result = await prisma.promoCode.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isActive,
      },
    });

    return NextResponse.json({
      message: `Successfully ${action}d ${result.count} promo codes`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error updating promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to update promo codes' },
      { status: 500 }
    );
  }
}