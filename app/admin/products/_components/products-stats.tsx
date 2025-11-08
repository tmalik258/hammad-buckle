'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductStats } from '@/lib/hooks/useProductStats';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Star
} from 'lucide-react';

export default function ProductsStats() {
  const { data: stats, isLoading, error } = useProductStats();

  if (isLoading) {
    return <ProductsStatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Failed to load statistics
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    totalProducts = 0,
    activeProducts = 0,
    outOfStockProducts = 0,
    featuredProducts = 0,
    lowStockProducts = 0,
    averagePrice = 0,
    totalValue = 0,
    recentProducts = 0
  } = stats;

  // Calculate additional metrics
  const inactiveProducts = outOfStockProducts;
  const lowStockPercentage = activeProducts > 0 ? (lowStockProducts / activeProducts) * 100 : 0;

  const statsData = [
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      description: `${activeProducts} active, ${inactiveProducts} out of stock`,
      icon: Package,
      trend: activeProducts > inactiveProducts ? 'up' : 'down',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Featured Products',
      value: featuredProducts.toLocaleString(),
      description: 'Featured products',
      icon: Star,
      trend: 'neutral',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockProducts.toLocaleString(),
      description: `${lowStockPercentage.toFixed(1)}% of active products`,
      icon: AlertTriangle,
      trend: lowStockProducts > 0 ? 'down' : 'up',
      color: lowStockProducts > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: lowStockProducts > 0 ? 'bg-red-100' : 'bg-green-100',
    },
    {
      title: 'Recent Products',
      value: recentProducts.toLocaleString(),
      description: 'Added in last 30 days',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                {stat.trend !== 'neutral' && (
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    <TrendingUp className={`h-3 w-3 mr-1 ${
                      stat.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    {stat.trend === 'up' ? 'Good' : 'Alert'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProductsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}