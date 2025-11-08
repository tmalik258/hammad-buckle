import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, DiscountType } from '@prisma/client';

// GET /api/admin/promo-codes/export - Export promo codes as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const idsParam = searchParams.get('ids');
    const status = searchParams.get('status'); // 'active' | 'inactive' | 'expired'
    const discountType = searchParams.get('discountType'); // 'PERCENTAGE' | 'FIXED'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const now = new Date();
    const discountTypeParam = searchParams.get('discountType');
    const discountTypeEnum = discountTypeParam ? (discountTypeParam.toUpperCase() as DiscountType) : undefined;

    const where: Prisma.PromoCodeWhereInput = {
      AND: [
        idsParam
          ? { id: { in: idsParam.split(',').filter(Boolean) } }
          : {},
        search
          ? {
              code: { contains: search, mode: 'insensitive' },
            }
          : {},
        status === 'active'
          ? { isActive: true, OR: [{ expirationDate: null }, { expirationDate: { gt: now } }] }
          : status === 'inactive'
          ? { isActive: false }
          : status === 'expired'
          ? { expirationDate: { lte: now }, NOT: { expirationDate: null } }
          : {},
        discountTypeEnum ? { discountType: discountTypeEnum } : {},
      ],
    };

    const orderBy: Prisma.PromoCodeOrderByWithRelationInput = { [sortBy]: sortOrder } as Prisma.PromoCodeOrderByWithRelationInput;

    const promoCodes = await prisma.promoCode.findMany({
      where,
      orderBy,
    });

    type PromoCodeCsvHeaders =
      | 'Code'
      | 'Discount Type'
      | 'Discount Value'
      | 'Minimum Order Amount'
      | 'Max Discount Amount'
      | 'Usage Count'
      | 'Active'
      | 'Expires'
      | 'Created'
      | 'Updated';

    interface PromoCodeCsvRow {
      Code: string;
      'Discount Type': DiscountType;
      'Discount Value': number;
      'Minimum Order Amount': number | '';
      'Max Discount Amount': number | '';
      'Usage Count': number;
      Active: string;
      Expires: string;
      Created: string;
      Updated: string;
    }

    const data: PromoCodeCsvRow[] = promoCodes.map((p) => ({
      Code: p.code,
      'Discount Type': p.discountType,
      'Discount Value': p.discountValue,
      'Minimum Order Amount': p.minimumOrderAmount ?? '',
      'Max Discount Amount': p.maxDiscountAmount ?? '',
      'Usage Count': p.usageCount,
      Active: p.isActive ? 'Yes' : 'No',
      Expires: p.expirationDate ? p.expirationDate.toISOString().split('T')[0] : '',
      Created: p.createdAt.toISOString().split('T')[0],
      Updated: p.updatedAt.toISOString().split('T')[0],
    }));

    const headers: PromoCodeCsvHeaders[] = [
      'Code',
      'Discount Type',
      'Discount Value',
      'Minimum Order Amount',
      'Max Discount Amount',
      'Usage Count',
      'Active',
      'Expires',
      'Created',
      'Updated',
    ];
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => {
        const value = row[h] ?? '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="promo-codes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to export promo codes' },
      { status: 500 }
    );
  }
}


