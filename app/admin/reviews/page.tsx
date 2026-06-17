export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Metadata } from 'next';
import ReviewsStats from './_components/reviews-stats';
import ReviewsTable from './_components/reviews-table';
import ReviewsTableSkeleton, { ReviewsStatsSkeleton } from './_components/reviews-table-skeleton';

export const metadata: Metadata = {
  title: 'Reviews Management | Admin Dashboard',
  description: 'Manage customer reviews, ratings, and feedback moderation.',
};

interface ReviewsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    rating?: string;
    status?: string;
    sort?: string;
  };
}

export default function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const rating = searchParams.rating || '';
  const status = searchParams.status || '';
  const sort = searchParams.sort || 'createdAt_desc';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            Manage customer reviews and moderate feedback
          </p>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<ReviewsStatsSkeleton />}>
        <ReviewsStats />
      </Suspense>

      {/* Reviews Table */}
      <Suspense fallback={<ReviewsTableSkeleton />}>
        <ReviewsTable
          page={page}
          search={search}
          rating={rating}
          status={status}
          sort={sort}
        />
      </Suspense>
    </div>
  );
}