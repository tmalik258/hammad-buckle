import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import {
  FolderTree,
  Package,
  TrendingUp,
  Eye,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';

export default async function CategoriesStats() {
  // Fetch category statistics
  const [totalCategories, activeCategories, categoriesWithProducts, topCategory] = await Promise.all([
    // Total categories
    prisma.category.count(),
    
    // Active categories
    prisma.category.count({
      where: { isActive: true }
    }),
    
    // Categories with products
    prisma.category.count({
      where: {
        products: {
          some: {
            inStock: true
          }
        }
      }
    }),
    
    // Top category by product count
    prisma.category.findFirst({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      }
    })
  ]);

  // Calculate growth rate (mock data for now)
  const lastMonthCategories = Math.floor(totalCategories * 0.9);
  const growthRate = totalCategories > 0 
    ? ((totalCategories - lastMonthCategories) / lastMonthCategories * 100)
    : 0;

  const stats = [
    {
      title: 'Total Categories',
      value: totalCategories.toString(),
      description: `${activeCategories} active`,
      icon: FolderTree,
      trend: {
        value: growthRate,
        isPositive: growthRate >= 0,
        label: 'from last month'
      }
    },
    {
      title: 'With Products',
      value: categoriesWithProducts.toString(),
      description: `${Math.round((categoriesWithProducts / totalCategories) * 100)}% of total`,
      icon: Package,
      trend: {
        value: Math.abs(growthRate * 0.8),
        isPositive: true,
        label: 'utilization rate'
      }
    },
    {
      title: 'Top Category',
      value: topCategory?.name || 'N/A',
      description: `${topCategory?._count.products || 0} products`,
      icon: TrendingUp,
      trend: {
        value: topCategory?._count.products || 0,
        isPositive: true,
        label: 'products'
      }
    },
    {
      title: 'Empty Categories',
      value: (totalCategories - categoriesWithProducts).toString(),
      description: 'Need attention',
      icon: Eye,
      trend: {
        value: Math.round(((totalCategories - categoriesWithProducts) / totalCategories) * 100),
        isPositive: false,
        label: 'of total'
      }
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend.isPositive ? ArrowUpIcon : ArrowDownIcon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendIcon 
                    className={`h-3 w-3 ${
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`} 
                  />
                  <span className={stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend.value}%
                  </span>
                </div>
                <span>{stat.trend.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}