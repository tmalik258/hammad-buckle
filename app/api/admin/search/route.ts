import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product, Order, User, Category, PromoCode, Review } from '@prisma/client';
import { assertAdminApi } from '@/lib/utils/auth';

// GET /api/admin/search - Global search across all entities
export async function GET(request: NextRequest) {
  const adminCheck = await assertAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type'); // Optional: filter by entity type
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10); // Cap at 10

    if (!query || query.length < 2) {
      return NextResponse.json({
        products: [],
        orders: [],
        customers: [],
        categories: [],
        promoCodes: [],
        reviews: [],
        totalResults: 0
      });
    }

    const searchTerm = query;

    type ProductSearchRow = Pick<Product, 'id' | 'name' | 'price' | 'sku'>;
    type OrderSearchRow = Pick<Order, 'id' | 'orderNumber' | 'totalAmount' | 'status' | 'createdAt' | 'userId'>;
    type CustomerSearchRow = Pick<User, 'id' | 'name' | 'email' | 'role' | 'isActive'>;
    type CategorySearchRow = Pick<Category, 'id' | 'name' | 'description' | 'productsCount'>;
    type PromoCodeSearchRow = Pick<PromoCode, 'id' | 'code' | 'discountType' | 'discountValue' | 'isActive'>;
    type ReviewSearchRow = Pick<Review, 'id' | 'rating' | 'title' | 'comment'>;

    interface GlobalSearchResults {
      products: ProductSearchRow[];
      orders: OrderSearchRow[];
      customers: CustomerSearchRow[];
      categories: CategorySearchRow[];
      promoCodes: PromoCodeSearchRow[];
      reviews: ReviewSearchRow[];
      totalResults: number;
    }

    const results: GlobalSearchResults = {
      products: [],
      orders: [],
      customers: [],
      categories: [],
      promoCodes: [],
      reviews: [],
      totalResults: 0,
    };

    // Search Products
    if (!type || type === 'products') {
      try {
        const products: ProductSearchRow[] = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { sku: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          take: limit,
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
          }
        });
        results.products = products;
      } catch (error) {
        console.error('Error searching products:', error);
        results.products = [];
      }
    }

    // Search Orders
    if (!type || type === 'orders') {
      try {
        const orders: OrderSearchRow[] = await prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
              // Remove relational filters to keep scalar-only typing
            ]
          },
          take: limit,
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            userId: true,
          }
        });
        results.orders = orders;
      } catch (error) {
        console.error('Error searching orders:', error);
        results.orders = [];
      }
    }

    // Search Customers
    if (!type || type === 'customers') {
      try {
        const customers: CustomerSearchRow[] = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        });
        results.customers = customers;
      } catch (error) {
        console.error('Error searching customers:', error);
        results.customers = [];
      }
    }

    // Search Categories
    if (!type || type === 'categories') {
      try {
        const categories: CategorySearchRow[] = await prisma.category.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          take: limit,
          select: {
            id: true,
            name: true,
            description: true,
            productsCount: true,
          }
        });
        results.categories = categories;
      } catch (error) {
        console.error('Error searching categories:', error);
        results.categories = [];
      }
    }

    // Search Promo Codes
    if (!type || type === 'promoCodes') {
      try {
        const promoCodes: PromoCodeSearchRow[] = await prisma.promoCode.findMany({
          where: {
            OR: [
              { code: { contains: searchTerm, mode: 'insensitive' } },
            ]
          },
          take: limit,
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            isActive: true
          }
        });
        results.promoCodes = promoCodes;
      } catch (error) {
        console.error('Error searching promo codes:', error);
        results.promoCodes = [];
      }
    }

    // Search Reviews
    if (!type || type === 'reviews') {
      try {
        const reviews: ReviewSearchRow[] = await prisma.review.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { comment: { contains: searchTerm, mode: 'insensitive' } },
              // Keep scalar-only filters for consistent typing
            ]
          },
          take: limit,
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
          }
        });
        results.reviews = reviews;
      } catch (error) {
        console.error('Error searching reviews:', error);
        results.reviews = [];
      }
    }

    // Calculate total results (sum lengths of arrays)
    results.totalResults = (
      results.products.length +
      results.orders.length +
      results.customers.length +
      results.categories.length +
      results.promoCodes.length +
      results.reviews.length
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        products: [],
        orders: [],
        customers: [],
        categories: [],
        promoCodes: [],
        reviews: [],
        totalResults: 0
      },
      { status: 500 }
    );
  }
}
