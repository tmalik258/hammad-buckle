import React, { Suspense } from 'react';
import { Metadata } from 'next';
import TypesClient from './_components/types-client';
import TypesStats from './_components/types-stats';
import TypesTable from './_components/types-table';
import TypesStatsSkeleton from './_components/types-stats-skeleton';
import TypesTableSkeleton from './_components/types-table-skeleton';

export const metadata: Metadata = {
  title: 'Types | Admin Dashboard',
  description: 'Manage product types and classifications',
};

interface TypesPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  };
}

export default function TypesPage({ searchParams }: TypesPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const status = searchParams.status || 'all';
  const sort = searchParams.sort || 'name_asc';

  return (
    <TypesClient>
      {/* Stats */}
      <Suspense fallback={<TypesStatsSkeleton />}>
        <TypesStats />
      </Suspense>

      {/* Types Table */}
      <Suspense fallback={<TypesTableSkeleton />}>
        <TypesTable
          page={page}
          search={search}
          status={status}
          sort={sort}
        />
      </Suspense>
    </TypesClient>
  );
}