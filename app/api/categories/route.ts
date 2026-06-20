import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { categoryFormSchema, getCategoriesQuerySchema } from '@/lib/validations/category-schema';
import { apiCache, generateCacheKey } from '@/lib/cache';
import { clearProductsCache } from '@/lib/utils/cache';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/categories - Get paginated categories with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryResult = getCategoriesQuerySchema.safeParse(
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
      featured,
      isActive,
      includeProducts,
      sortBy,
      sortOrder,
    } = queryResult.data;

    // Generate cache key based on query parameters
    const cacheKey = generateCacheKey('categories', queryResult.data);
    
    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    const skip = (page - 1) * limit;

    // Build where clause using Prisma-generated types
    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured !== undefined) where.featured = featured;
    if (isActive !== undefined) where.isActive = isActive;

    const include: Prisma.CategoryInclude = {
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

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.category.count({ where }),
    ]);

    const result = {
      categories,
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
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = categoryFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid category data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, image, featured, isActive } = validationResult.data;

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        featured: featured ?? false,
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

    // Clear cache after successful creation
    apiCache.clear();
    // Also clear products cache since category changes affect product listings
    clearProductsCache();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}