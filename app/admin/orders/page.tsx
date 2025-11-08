import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrdersTable from './_components/orders-table';
import OrdersTableSkeleton from './_components/orders-table-skeleton';
import OrdersStats from './_components/orders-stats';
import OrdersClient from './_components/orders-client';

export const metadata = {
  title: 'Orders Management | Admin Dashboard',
  description: 'Manage customer orders, track shipments, and handle returns.',
};

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const status = params.status || '';
  const sort = params.sort || 'createdAt_desc';

  return (
    <OrdersClient>
      {/* Stats */}
      <Suspense fallback={<OrdersStatsSkeleton />}>
        <OrdersStats />
      </Suspense>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and track all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrdersTableSkeleton />}>
            <OrdersTable
              page={page}
              search={search}
              status={status}
              sort={sort}
            />
          </Suspense>
        </CardContent>
      </Card>
    </OrdersClient>
  );
}

// Skeleton for orders stats
function OrdersStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-20 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}