import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/admin/promo-codes/orders - Get orders that used promo codes
export async function GET(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const promoCode = searchParams.get('promoCode') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      AND: [
        // Only orders with promo codes
        { promoCodeId: { not: null } },
        
        // Search filter (order number, customer email, promo code)
        search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: 'insensitive' as const } },
                  { user: { email: { contains: search, mode: 'insensitive' as const } } },
                  { promoCode: { code: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {},
          
        // Status filter
        status ? { status: status as Prisma.EnumOrderStatusFilter } : {},
        
        // Promo code filter
        promoCode
          ? { promoCode: { code: { contains: promoCode, mode: 'insensitive' as const } } }
          : {},
          
        // Date range filter
        startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {},
      ],
    };

    // Build orderBy clause
    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // Get orders with promo code details
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          promoCode: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
          promoCodeUsage: {
            select: {
              discountAmount: true,
              createdAt: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders with promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders with promo codes' },
      { status: 500 }
    );
  }
}

// GET /api/admin/promo-codes/orders/export - Export orders with promo codes
export async function POST(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { format = 'csv', filters = {} } = body;

    // Build where clause from filters
    const where: Prisma.OrderWhereInput = {
      AND: [
        // Only orders with promo codes
        { promoCodeId: { not: null } },
        
        // Apply filters
        ...(filters.search
          ? [
              {
                OR: [
                  { orderNumber: { contains: filters.search, mode: 'insensitive' as const } },
                  { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
                  { promoCode: { code: { contains: filters.search, mode: 'insensitive' as const } } },
                ],
              },
            ]
          : []),
          
        ...(filters.status ? [{ status: filters.status }] : []),
        
        ...(filters.promoCode
          ? [{ promoCode: { code: { contains: filters.promoCode, mode: 'insensitive' as const } } }]
          : []),
          
        ...(filters.startDate || filters.endDate
          ? [
              {
                createdAt: {
                  ...(filters.startDate && { gte: new Date(filters.startDate) }),
                  ...(filters.endDate && { lte: new Date(filters.endDate) }),
                },
              },
            ]
          : []),
      ],
    };

    // Get all matching orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        promoCode: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
        promoCodeUsage: {
          select: {
            discountAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for export
    const exportData = orders.map((order) => ({
      'Order Number': order.orderNumber,
      'Customer Email': order.user?.email || 'N/A',
      'Customer Name': order.user
        ? (order.user.name || '').trim()
        : 'N/A',
      'Promo Code': order.promoCode?.code || 'N/A',
      'Discount Type': order.promoCode?.discountType || 'N/A',
      'Discount Value': order.promoCode?.discountValue || 0,
      'Discount Amount': order.promoCodeUsage?.discountAmount || 0,
      'Order Total': order.totalAmount,
      'Order Status': order.status,
      'Order Date': order.createdAt.toISOString().split('T')[0],
      'Shipping Address': order.shippingAddressId || 'N/A',
    }));

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers.map((header) => `"${row[header as keyof typeof row] || ''}"`).join(',')
        ),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="promo-code-orders-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON for other formats
    return NextResponse.json({
      data: exportData,
      totalCount: exportData.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error exporting orders with promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to export orders with promo codes' },
      { status: 500 }
    );
  }
}