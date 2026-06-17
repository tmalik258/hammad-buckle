export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { PromoCodesClient } from './_components/promo-codes-client';
import { PromoCodesStats } from './_components/promo-codes-stats';
import { PromoCodesTable } from './_components/promo-codes-table';
import { PromoCodesTableSkeleton } from './_components/promo-codes-table-skeleton';

interface PromoCodesPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    discountType?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default function PromoCodesPage({ searchParams }: PromoCodesPageProps) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || '';
  const status = searchParams?.status || '';
  const discountType = searchParams?.discountType || '';
  const sortBy = searchParams?.sortBy || 'createdAt';
  const sortOrder = searchParams?.sortOrder || 'desc';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PromoCodesClient>
        <div className="space-y-4">
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
            <PromoCodesStats />
          </Suspense>
          
          <Suspense fallback={<PromoCodesTableSkeleton />}>
            <PromoCodesTable
              page={page}
              search={search}
              status={status}
              discountType={discountType}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </Suspense>
        </div>
      </PromoCodesClient>
    </div>
  );
}