import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating address
const updateAddressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING'], {
    message: 'Type must be either SHIPPING or BILLING',
  }).optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  address1: z.string().min(1, 'Address line 1 is required').max(200, 'Address line 1 too long').optional(),
  address2: z.string().max(200, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(100, 'City name too long').optional(),
  state: z.string().min(1, 'State is required').max(100, 'State name too long').optional(),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long').optional(),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  isDefault: z.boolean().optional(),
});

// GET /api/addresses/[id] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const address = await prisma.address.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error) {
    console.log('Error fetching address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAddressSchema.parse(body);

    // Check if address exists
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other default addresses of the same type
    if (validatedData.isDefault === true) {
      const addressType = validatedData.type || existingAddress.type;
      
      await prisma.address.updateMany({
        where: {
          userId: existingAddress.userId,
          type: addressType,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // If unsetting default, ensure at least one address remains default
    if (validatedData.isDefault === false && existingAddress.isDefault) {
      const addressType = validatedData.type || existingAddress.type;
      
      const otherAddresses = await prisma.address.findMany({
        where: {
          userId: existingAddress.userId,
          type: addressType,
          id: { not: id },
        },
        orderBy: { createdAt: 'asc' },
        take: 1,
      });

      if (otherAddresses.length > 0) {
        await prisma.address.update({
          where: { id: otherAddresses[0].id },
          data: { isDefault: true },
        });
      } else {
        // If this is the only address of this type, keep it as default
        validatedData.isDefault = true;
      }
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    console.log('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if address exists
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Check if address is being used in any orders
    const ordersUsingAddress = await prisma.order.findFirst({
      where: {
        OR: [
          { shippingAddressId: id },
          { billingAddressId: id },
        ],
      },
    });

    if (ordersUsingAddress) {
      return NextResponse.json(
        { error: 'Cannot delete address that is being used in orders' },
        { status: 400 }
      );
    }

    // If deleting default address, make another address default
    if (existingAddress.isDefault) {
      const otherAddresses = await prisma.address.findMany({
        where: {
          userId: existingAddress.userId,
          type: existingAddress.type,
          id: { not: id },
        },
        orderBy: { createdAt: 'asc' },
        take: 1,
      });

      if (otherAddresses.length > 0) {
        await prisma.address.update({
          where: { id: otherAddresses[0].id },
          data: { isDefault: true },
        });
      }
    }

    // Delete address
    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.log('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}