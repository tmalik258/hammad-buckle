import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default async function OrdersStats() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // Get order statistics
  const [totalOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
    // Total orders
    prisma.order.count(),
    
    // Pending orders (PENDING, CONFIRMED, PROCESSING, SHIPPED)
    prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']
        }
      }
    }),
    
    // Completed orders
    prisma.order.count({
      where: { status: 'DELIVERED' }
    }),
    
    // Cancelled orders
    prisma.order.count({
      where: { status: 'CANCELLED' }
    })
  ]);

  // Get revenue statistics
  const [totalRevenue, todayRevenue, monthlyRevenue] = await Promise.all([
    // Total revenue from completed orders
    prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true }
    }).then(result => result._sum.totalAmount || 0),
    
    // Today's revenue
    prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      },
      _sum: { totalAmount: true }
    }).then(result => result._sum.totalAmount || 0),
    
    // This month's revenue
    prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: { totalAmount: true }
    }).then(result => result._sum.totalAmount || 0)
  ]);

  // Calculate completion rate
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // Get average order value
  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      description: `${completedOrders} completed, ${pendingOrders} pending`,
      icon: ShoppingBag,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toLocaleString(),
      description: 'Awaiting fulfillment',
      icon: Clock,
      trend: pendingOrders > 10 ? 'down' : 'up',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      description: `Avg: $${avgOrderValue.toFixed(2)} per order`,
      icon: DollarSign,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      description: `${cancellationRate.toFixed(1)}% cancelled`,
      icon: CheckCircle,
      trend: completionRate > 80 ? 'up' : 'down',
      color: completionRate > 80 ? 'text-green-600' : 'text-red-600',
      bgColor: completionRate > 80 ? 'bg-green-100' : 'bg-red-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
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
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    stat.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {stat.trend === 'up' ? 'Good' : 'Alert'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}