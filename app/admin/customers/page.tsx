export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsersTable from './_components/customers-table';
import UsersTableSkeleton from './_components/customers-table-skeleton';
import UsersStats from './_components/customers-stats';
import AddUserButton from './_components/add-user-button';

export const metadata = {
  title: 'Users Management | Admin Dashboard',
  description: 'Manage user accounts, roles, and permissions.',
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const role = params.role || '';
  const status = params.status || '';
  const sort = params.sort || 'createdAt_desc';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <AddUserButton />
      </div>

      {/* Stats */}
      <Suspense fallback={<UsersStatsSkeleton />}>
        <UsersStats />
      </Suspense>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTable
              page={page}
              search={search}
              role={role}
              status={status}
              sort={sort}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton for users stats
function UsersStatsSkeleton() {
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