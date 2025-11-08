import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { occasionFormSchema, getOccasionsQuerySchema } from '@/lib/validations/occasion-schema';
import { apiCache, generateCacheKey } from '@/lib/cache';
import { Prisma } from '@prisma/client';

// GET /api/occasions - Get all occasions with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = getOccasionsQuerySchema.safeParse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, search, isActive, sortBy, sortOrder } = queryValidation.data;

    // Generate cache key
    const cacheKey = generateCacheKey('occasions', {
      page,
      limit,
      search,
      isActive,
      sortBy,
      sortOrder,
    });

    // Check cache
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build where clause
    const where: Prisma.OccasionWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build include object
    const include = {
      _count: {
        select: {
          products: true,
        },
      },
    };

    // Build orderBy clause
    const orderBy: { name?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' } = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [occasions, total] = await Promise.all([
      prisma.occasion.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.occasion.count({ where }),
    ]);

    const result = {
      occasions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    apiCache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching occasions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occasions' },
      { status: 500 }
    );
  }
}

// POST /api/occasions - Create a new occasion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = occasionFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid occasion data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isActive } = validationResult.data;

    // Check if occasion with same name already exists
    const existingOccasion = await prisma.occasion.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingOccasion) {
      return NextResponse.json(
        { error: 'Occasion with this name already exists' },
        { status: 409 }
      );
    }

    // Create the occasion
    const occasion = await prisma.occasion.create({
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

    return NextResponse.json(occasion, { status: 201 });
  } catch (error) {
    console.error('Error creating occasion:', error);
    return NextResponse.json(
      { error: 'Failed to create occasion' },
      { status: 500 }
    );
  }
}