import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateOccasionSchema } from '@/lib/validations/occasion-schema';
import { apiCache } from '@/lib/cache';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/occasions/[id] - Get a specific occasion by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'Occasion ID is required' },
        { status: 400 }
      );
    }

    const include: Prisma.OccasionInclude = {
      _count: {
        select: {
          products: true,
        },
      },
    };

    if (includeProducts) {
      include.products = {
        take: 12,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          price: true,
          originalPrice: true,
          images: true,
          featured: true,
          createdAt: true,
        },
      };
    }

    const occasion = await prisma.occasion.findUnique({
      where: { id },
      include,
    });

    if (!occasion) {
      return NextResponse.json(
        { error: 'Occasion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(occasion);
  } catch (error) {
    console.error('Error fetching occasion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occasion' },
      { status: 500 }
    );
  }
}

// PUT /api/occasions/[id] - Update a specific occasion
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Occasion ID is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validationResult = updateOccasionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid occasion data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isActive } = validationResult.data;

    // Check if occasion exists
    const existingOccasion = await prisma.occasion.findUnique({
      where: { id },
    });

    if (!existingOccasion) {
      return NextResponse.json(
        { error: 'Occasion not found' },
        { status: 404 }
      );
    }

    // Check if another occasion with the same name exists (excluding current occasion)
    if (name && name !== existingOccasion.name) {
      const duplicateOccasion = await prisma.occasion.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateOccasion) {
        return NextResponse.json(
          { error: 'Occasion with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the occasion
    const updatedOccasion = await prisma.occasion.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Clear cache
    apiCache.clear();

    return NextResponse.json(updatedOccasion);
  } catch (error) {
    console.error('Error updating occasion:', error);
    return NextResponse.json(
      { error: 'Failed to update occasion' },
      { status: 500 }
    );
  }
}

// DELETE /api/occasions/[id] - Delete a specific occasion
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Occasion ID is required' },
        { status: 400 }
      );
    }

    // Check if occasion exists
    const existingOccasion = await prisma.occasion.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingOccasion) {
      return NextResponse.json(
        { error: 'Occasion not found' },
        { status: 404 }
      );
    }

    // Check if occasion has associated products
    if (existingOccasion._count.products > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete occasion with associated products',
          details: `This occasion has ${existingOccasion._count.products} associated products. Please reassign or delete these products first.`
        },
        { status: 409 }
      );
    }

    // Delete the occasion
    await prisma.occasion.delete({
      where: { id },
    });

    // Clear cache
    apiCache.clear();

    return NextResponse.json(
      { message: 'Occasion deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting occasion:', error);
    return NextResponse.json(
      { error: 'Failed to delete occasion' },
      { status: 500 }
    );
  }
}