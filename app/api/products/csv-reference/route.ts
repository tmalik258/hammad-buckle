import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [categories, types, occasions] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.type.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.occasion.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
    ]);

    return NextResponse.json({
      categories,
      types,
      occasions,
    });
  } catch (error) {
    console.error('Error fetching CSV reference data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
