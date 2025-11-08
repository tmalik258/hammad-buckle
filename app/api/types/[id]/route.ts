import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateTypeSchema } from '@/lib/validations/type-schema';
import { apiCache } from '@/lib/cache';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/types/[id] - Get a specific type by ID
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
        { error: 'Type ID is required' },
        { status: 400 }
      );
    }

    const include: Prisma.TypeInclude = {
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

    const type = await prisma.type.findUnique({
      where: { id },
      include,
    });

    if (!type) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(type);
  } catch (error) {
    console.error('Error fetching type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch type' },
      { status: 500 }
    );
  }
}

// PUT /api/types/[id] - Update a specific type
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Type ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = updateTypeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid type data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isActive } = validationResult.data;

    // Check if type exists
    const existingType = await prisma.type.findUnique({
      where: { id },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    // Check if another type with the same name exists (excluding current type)
    if (name && name !== existingType.name) {
      const duplicateType = await prisma.type.findFirst({
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

      if (duplicateType) {
        return NextResponse.json(
          { error: 'Type with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the type
    const updatedType = await prisma.type.update({
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

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error('Error updating type:', error);
    return NextResponse.json(
      { error: 'Failed to update type' },
      { status: 500 }
    );
  }
}

// DELETE /api/types/[id] - Delete a specific type
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Type ID is required' },
        { status: 400 }
      );
    }

    // Check if type exists
    const existingType = await prisma.type.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    // Check if type has associated products
    if (existingType._count.products > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete type with associated products',
          details: `This type has ${existingType._count.products} associated products. Please reassign or delete these products first.`
        },
        { status: 409 }
      );
    }

    // Delete the type
    await prisma.type.delete({
      where: { id },
    });

    // Clear cache
    apiCache.clear();

    return NextResponse.json(
      { message: 'Type deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting type:', error);
    return NextResponse.json(
      { error: 'Failed to delete type' },
      { status: 500 }
    );
  }
}