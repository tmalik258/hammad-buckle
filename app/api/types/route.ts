import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { typeFormSchema, getTypesQuerySchema } from '@/lib/validations/type-schema';
import { apiCache, generateCacheKey } from '@/lib/cache';

// GET /api/types - Get paginated types with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryResult = getTypesQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      search,
      isActive,
      includeProducts,
      sortBy,
      sortOrder,
    } = queryResult.data;

    // Generate cache key based on query parameters
    const cacheKey = generateCacheKey('types', queryResult.data);
    
    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    const skip = (page - 1) * limit;

    // Build where clause using Prisma-generated types
    const where: Prisma.TypeWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) where.isActive = isActive;

    const include: Prisma.TypeInclude = {
      _count: {
        select: {
          products: true,
        },
      },
    };

    if (includeProducts) {
      include.products = {
        take: 8,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          featured: true,
        },
      };
    }

    const [types, total] = await Promise.all([
      prisma.type.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.type.count({ where }),
    ]);

    const result = {
      types,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 5 minutes
    apiCache.set(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    );
  }
}

// POST /api/types - Create a new type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = typeFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid type data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isActive } = validationResult.data;

    // Check if type with same name already exists
    const existingType = await prisma.type.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Type with this name already exists' },
        { status: 409 }
      );
    }

    // Create the type
    const type = await prisma.type.create({
      data: {
        name,
        description,
        isActive: isActive ?? true,
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

    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error('Error creating type:', error);
    return NextResponse.json(
      { error: 'Failed to create type' },
      { status: 500 }
    );
  }
}