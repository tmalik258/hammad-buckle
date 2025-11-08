import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, AddressType } from '@prisma/client';
import { z } from 'zod';

// Validation schema for address - matches Prisma Address model
const addressSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['SHIPPING', 'BILLING'], {
    message: 'Type must be either SHIPPING or BILLING',
  }),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').optional().nullable(),
  street: z.string().max(200, 'Street address too long').optional().nullable(),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  area: z.string().min(1, 'Area is required').max(100, 'Area name too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
  phone: z.string().max(20, 'Phone number too long').optional().nullable(),
  isDefault: z.boolean().default(false),
});

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as AddressType | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Prisma.AddressWhereInput = { userId };
    if (type) {
      where.type = type;
    }

    // Get addresses with pagination
    const [addresses, total] = await Promise.all([
      prisma.address.findMany({
        where,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.address.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      addresses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset other default addresses of the same type
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: validatedData.userId,
          type: validatedData.type,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // If this is the first address of this type, make it default
    const existingAddressCount = await prisma.address.count({
      where: {
        userId: validatedData.userId,
        type: validatedData.type,
      },
    });

    if (existingAddressCount === 0) {
      validatedData.isDefault = true;
    }

    const address = await prisma.address.create({
      data: validatedData,
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error?.message },
        { status: 400 }
      );
    }

    console.log('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}