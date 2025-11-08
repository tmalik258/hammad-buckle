'use client';

import React from 'react';
import { OrderCard } from './order-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { OrderListItem } from '@/lib/types/order';
import { 
  PackageIcon, 
  RefreshCwIcon,
  ChevronDownIcon
} from 'lucide-react';
import Link from 'next/link';

interface OrdersListProps {
  orders: OrderListItem[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export const OrdersList = ({
  orders,
  isLoading = false,
  isLoadingMore = false,
  hasNextPage = false,
  onLoadMore,
  onRefresh,
  className
}: OrdersListProps) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className={cn('', className)}>
        <EmptyOrdersState onRefresh={onRefresh} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Orders Grid */}
      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-w-32"
          >
            {isLoadingMore ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-2" />
                Load More Orders
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <OrderCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// Order Card Skeleton Component
const OrderCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Empty Orders State Component
const EmptyOrdersState = ({ onRefresh }: { onRefresh?: () => void }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <PackageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven&apos;t placed any orders yet, or no orders match your current filters. 
          Start shopping to see your orders here!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/products" className="cursor-pointer">
              Start Shopping
            </Link>
          </Button>
          
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};