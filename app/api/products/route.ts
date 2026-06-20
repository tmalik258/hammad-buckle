import { NextRequest, NextResponse } from 'next/server';
import type { GenderTarget } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { productFormSchema } from '@/lib/validations/product-schema';
import { getProductsQuerySchema } from '@/lib/validations/product-query-schema';
import { apiCache, generateCacheKey } from '@/lib/cache';
import { clearProductsCache } from '@/lib/utils/cache';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/products - Get paginated products with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryResult = getProductsQuerySchema.safeParse(
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
      categoryId,
      featured,
      inStock,
      onSale,
      isNew,
      isActive,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      genderTarget,
    } = queryResult.data;

    // Generate cache key based on query parameters
    const cacheKey = generateCacheKey('products', queryResult.data);
    
    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Build where clause - only include non-null parameters
    const where: {
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>;
      categoryId?: string;
      featured?: boolean;
      inStock?: boolean;
      onSale?: boolean;
      isNew?: boolean;
      isActive?: boolean;
      genderTarget?: GenderTarget;
      price?: { gte?: number; lte?: number };
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (featured !== undefined) where.featured = featured;
    if (inStock !== undefined) where.inStock = inStock;
    if (onSale !== undefined) where.onSale = onSale;
    if (isNew !== undefined) where.isNew = isNew;
    if (isActive !== undefined) where.isActive = isActive;
    if (genderTarget) where.genderTarget = genderTarget;

    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build orderBy clause
    const orderBy: {
      averageRating?: 'asc' | 'desc';
      reviewCount?: 'asc' | 'desc';
      name?: 'asc' | 'desc';
      price?: 'asc' | 'desc';
      createdAt?: 'asc' | 'desc';
      updatedAt?: 'asc' | 'desc';
    } = {};
    if (sortBy === 'averageRating') {
      orderBy.averageRating = sortOrder;
    } else if (sortBy === 'reviewCount') {
      orderBy.reviewCount = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const result = {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    };

    // Cache the result for 5 minutes (300 seconds)
    apiCache.set(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = productFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const productData = validationResult.data;

    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        stockQuantity: productData.stockQuantity || 0,
        inStock: productData.inStock ?? true,
        featured: productData.featured ?? false,
        isNew: productData.isNew ?? false,
        onSale: productData.onSale ?? false,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    // Update category product count
    await prisma.category.update({
      where: { id: productData.categoryId },
      data: {
        productsCount: {
          increment: 1,
        },
      },
    });

    // Clear cache after successful creation
    clearProductsCache();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}