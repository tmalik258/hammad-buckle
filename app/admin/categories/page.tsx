import { Suspense } from 'react';
import CategoriesStats from './_components/categories-stats';
import CategoriesTable from './_components/categories-table';
import CategoriesTableSkeleton, { CategoriesStatsSkeleton } from './_components/categories-table-skeleton';
import CategoriesClient from './_components/categories-client';

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Parse search params on server side
  const params = {
    page: parseInt(resolvedSearchParams.page || '1'),
    search: resolvedSearchParams.search || '',
    status: resolvedSearchParams.status || '',
    sort: resolvedSearchParams.sort || 'createdAt_desc',
  };

  return (
    <CategoriesClient>
      {/* Stats */}
      <Suspense fallback={<CategoriesStatsSkeleton />}>
        <CategoriesStats />
      </Suspense>

      {/* Categories Table */}
      <Suspense fallback={<CategoriesTableSkeleton />}>
        <CategoriesTable
          page={params.page}
          search={params.search}
          status={params.status}
          sort={params.sort}
        />
      </Suspense>
    </CategoriesClient>
  );
}