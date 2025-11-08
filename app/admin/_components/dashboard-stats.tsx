import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default async function DashboardStats() {
  // Get current date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fetch current month stats
  const [currentMonthOrders, currentMonthRevenue, totalProducts, totalUsers] = await Promise.all([
    // Current month orders
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    }),
    
    // Current month revenue
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: {
          in: ['DELIVERED', 'SHIPPED', 'PROCESSING'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    
    // Total products
    prisma.product.count({
      where: {
        inStock: true,
      },
    }),
    
    // Total users
    prisma.user.count(),
  ]) as [number, { _sum: { totalAmount: number | null } }, number, number];

  // Fetch last month stats for comparison
  const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    }),
    
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: {
          in: ['DELIVERED', 'SHIPPED', 'PROCESSING'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]) as [number, { _sum: { totalAmount: number | null } }];

  // Calculate percentage changes
  const revenueChange = lastMonthRevenue?._sum?.totalAmount 
    ? ((currentMonthRevenue._sum?.totalAmount || 0) - lastMonthRevenue._sum?.totalAmount) / lastMonthRevenue._sum?.totalAmount * 100
    : 0;
    
  const ordersChange = lastMonthOrders 
    ? (currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100
    : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(currentMonthRevenue._sum?.totalAmount || 0).toLocaleString()}`,
      change: revenueChange,
      changeText: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% from last month`,
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: currentMonthOrders.toLocaleString(),
      change: ordersChange,
      changeText: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}% from last month`,
      icon: ShoppingBag,
    },
    {
      title: 'Products',
      value: totalProducts.toLocaleString(),
      change: 0, // You could calculate this if needed
      changeText: 'Active products',
      icon: Package,
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: 0, // You could calculate this if needed
      changeText: 'Registered users',
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.change !== 0 && (
                  <TrendIcon 
                    className={`mr-1 h-3 w-3 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`} 
                  />
                )}
                <span className={stat.change !== 0 ? (isPositive ? 'text-green-600' : 'text-red-600') : ''}>
                  {stat.changeText}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}