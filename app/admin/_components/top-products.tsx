import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { ExternalLink, Star } from 'lucide-react';

export default async function TopProducts() {
  // Get top products based on order items count in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const topProducts = await prisma.product.findMany({
    take: 5,
    where: {
      inStock: true,
      orderItems: {
        some: {
          order: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
            status: {
              not: 'CANCELLED',
            },
          },
        },
      },
    },
    include: {
      category: true,
      _count: {
        select: {
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      orderItems: {
        _count: 'desc',
      },
    },
  });

  if (topProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sales data available for the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => {
        const salesCount = product._count.orderItems;
        const primaryImage = product.images?.[0] || '/placeholder-product.jpg';
        
        return (
          <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {/* Rank */}
            <div className="flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
            </div>
            
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-muted">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </div>
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {product.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {product?.category?.name}
                    </Badge>
                    {product.averageRating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {product.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sales Count and Price */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right space-y-1">
                  <p className="text-sm font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {salesCount} sold
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* View All Products Link */}
      <div className="pt-4 border-t">
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/products">
            <ExternalLink className="h-3 w-3 mr-2" />
            View All Products
          </Link>
        </Button>
      </div>
    </div>
  );
}