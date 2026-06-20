import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/admin/promo-codes/users - Get users who have used promo codes
export async function GET(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const usageStatus = searchParams.get('usageStatus'); // 'active' | 'inactive'
    const accountType = searchParams.get('accountType'); // 'ADMIN' | 'USER'
    const userId = searchParams.get('userId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause for users who have used promo codes
    const where: Prisma.UserWhereInput = {
      AND: [
        // Only users who have used promo codes
        {
          promoCodeUsages: {
            some: {},
          },
        },
        
        // Search filter (email, name, user ID)
        search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } },
                { id: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
          
        // User ID filter
        userId ? { id: { contains: userId, mode: 'insensitive' as const } } : {},
        
        // Account type filter
        accountType ? { role: accountType as Prisma.EnumUserRoleFilter } : {},
        
        // Usage status filter (users with recent usage vs inactive)
        usageStatus === 'active'
          ? {
              promoCodeUsages: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  },
                },
              },
            }
          : usageStatus === 'inactive'
          ? {
              promoCodeUsages: {
                none: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // No usage in last 30 days
                  },
                },
              },
            }
          : {},
      ],
    };

    // Build orderBy clause
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // Get users with promo code usage details
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              promoCodeUsages: true,
              orders: true,
            },
          },
          promoCodeUsages: {
            select: {
              id: true,
              discountAmount: true,
              createdAt: true,
              promoCode: {
                select: {
                  code: true,
                  discountType: true,
                  discountValue: true,
                },
              },
              order: {
                select: {
                  orderNumber: true,
                  totalAmount: true,
                  status: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5, // Latest 5 usages
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform data to include usage statistics
    const transformedUsers = users.map((user) => {
      const totalDiscountReceived = user.promoCodeUsages.reduce(
        (sum, usage) => sum + (usage.discountAmount || 0),
        0
      );
      
      const lastUsage = user.promoCodeUsages[0]?.createdAt || null;
      const isActiveUser = lastUsage
        ? new Date(lastUsage) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false;

      return {
        ...user,
        usageCount: user._count.promoCodeUsages,
        orderCount: user._count.orders,
        totalDiscountReceived,
        lastUsage,
        isActiveUser,
        recentUsages: user.promoCodeUsages,
        _count: undefined,
      };
    });

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users with promo code usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users with promo code usage' },
      { status: 500 }
    );
  }
}

// GET /api/admin/promo-codes/users/export - Export users with promo code usage
export async function POST(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { format = 'csv', filters = {} } = body;

    // Build where clause from filters
    const where: Prisma.UserWhereInput = {
      AND: [
        // Only users who have used promo codes
        {
          promoCodeUsages: {
            some: {},
          },
        },
        
        // Apply filters
        ...(filters.search
          ? [
              {
                OR: [
                  { email: { contains: filters.search, mode: 'insensitive' as const } },
                { name: { contains: filters.search, mode: 'insensitive' as const } },
                { id: { contains: filters.search, mode: 'insensitive' as const } },
                ],
              },
            ]
          : []),
          
        ...(filters.userId ? [{ id: { contains: filters.userId, mode: 'insensitive' as const } }] : []),
        
        ...(filters.accountType ? [{ role: filters.accountType }] : []),
        
        ...(filters.usageStatus === 'active'
          ? [
              {
                promoCodeUsages: {
                  some: {
                    createdAt: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
            ]
          : filters.usageStatus === 'inactive'
          ? [
              {
                promoCodeUsages: {
                  none: {
                    createdAt: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
            ]
          : []),
      ],
    };

    // Get all matching users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            promoCodeUsages: true,
            orders: true,
          },
        },
        promoCodeUsages: {
          select: {
            discountAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for export
    const exportData = users.map((user) => {
      const totalDiscountReceived = user.promoCodeUsages.reduce(
        (sum, usage) => sum + (usage.discountAmount || 0),
        0
      );
      
      const lastUsage = user.promoCodeUsages[0]?.createdAt || null;
      const isActiveUser = lastUsage
        ? new Date(lastUsage) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false;

      return {
        'User ID': user.id,
        'Email': user.email,
        'Name': user.name || 'N/A',
        'Account Type': user.role,
        'Total Promo Code Usage': user._count.promoCodeUsages,
        'Total Orders': user._count.orders,
        'Total Discount Received': totalDiscountReceived,
        'Last Promo Code Usage': lastUsage ? lastUsage.toISOString().split('T')[0] : 'Never',
        'Active User (Last 30 Days)': isActiveUser ? 'Yes' : 'No',
        'Account Created': user.createdAt.toISOString().split('T')[0],
      };
    });

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
          'Content-Disposition': `attachment; filename="promo-code-users-${new Date().toISOString().split('T')[0]}.csv"`,
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
    console.error('Error exporting users with promo code usage:', error);
    return NextResponse.json(
      { error: 'Failed to export users with promo code usage' },
      { status: 500 }
    );
  }
}