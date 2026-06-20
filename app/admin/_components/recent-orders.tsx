import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-slate-100 text-slate-800 border-slate-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

export default async function RecentOrders() {
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        take: 1,
        include: {
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (recentOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentOrders.map((order) => {
        const firstItem = order.items[0];
        const itemCount = order._count.items;
        const additionalItems = itemCount - 1;
        
        return (
          <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              {/* User Avatar */}
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarFallback>
                  {order.user.name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              {/* Order Details */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <p className="text-sm font-medium truncate">
                    Order #{order.orderNumber}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`${statusColors[order.status as keyof typeof statusColors]} text-xs`}
                  >
                    {order.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs text-muted-foreground">
                  <span className="truncate">{order.user.name}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                </div>
                {firstItem && (
                  <p className="text-xs text-muted-foreground truncate">
                    {firstItem.product.name}
                    {additionalItems > 0 && (
                      <span> +{additionalItems} more item{additionalItems > 1 ? 's' : ''}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            {/* Order Total and Actions */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right space-y-2">
              <p className="text-sm font-semibold">
                ${order.totalAmount.toFixed(2)}
              </p>
              <Button asChild variant="ghost" size="sm" className="h-8 px-3">
                <Link href={`/admin/orders/${order.id}`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
      
      {/* View All Orders Link */}
      <div className="pt-4 border-t">
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/orders">
            View All Orders
          </Link>
        </Button>
      </div>
    </div>
  );
}