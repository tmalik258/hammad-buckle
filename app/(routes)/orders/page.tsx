'use client';

import React from 'react';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrdersList } from './_components/orders-list';
import { OrdersFilter } from './_components/orders-filter';
import BreadcrumbNavigation from '@/components/breadcrumb-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderFilters } from '@/lib/types/order';
import { 
  PackageIcon, 
  RefreshCwIcon,
  FilterIcon,
  ListOrderedIcon
} from 'lucide-react';

export default function OrdersPage() {
  const [filters, setFilters] = React.useState<OrderFilters>({});
  const [showFilters, setShowFilters] = React.useState(false);

  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders({
    filters,
    enabled: true,
  });

  const orders = React.useMemo(() => {
    return ordersData?.pages.flatMap(page => page.orders) || [];
  }, [ordersData]);

  const totalCount = ordersData?.pages.reduce((acc, page) => acc + page.orders.length, 0) || 0;

  const handleFiltersChange = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.status || 
    filters.dateFrom || 
    filters.dateTo
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/my-account' },
    { label: 'Orders', href: '/orders' },
  ];

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNavigation items={breadcrumbItems} />
        
        <div className="mt-8">
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <PackageIcon className="w-8 h-8 text-destructive" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Failed to Load Orders</h3>
              
              <p className="text-muted-foreground mb-6 max-w-md">
                {error?.message || 'Something went wrong while loading your orders. Please try again.'}
              </p>

              <Button onClick={handleRefresh}>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:pt-20">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mt-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your order history
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Count Badge */}
            {!isLoading && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ListOrderedIcon className="w-3 h-3" />
                {totalCount} order{totalCount !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className={cn(
                'flex items-center gap-2',
                hasActiveFilters && 'border-primary text-primary'
              )}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {Object.values(filters).filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCwIcon className={cn(
                'w-4 h-4',
                isLoading && 'animate-spin'
              )} />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {/* Results Summary */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {orders.length} of {totalCount} orders
              {hasActiveFilters && ' (filtered)'}
            </p>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Orders List Component */}
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          isLoadingMore={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}