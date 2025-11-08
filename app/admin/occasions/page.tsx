import { Suspense } from 'react';
import { Metadata } from 'next';
import OccasionsClient from './_components/occasions-client';
import OccasionsStats from './_components/occasions-stats';
import OccasionsTable from './_components/occasions-table';

export const metadata: Metadata = {
  title: 'Occasions | Admin Dashboard',
  description: 'Manage special occasions and events for your products',
};

interface OccasionsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default function OccasionsPage({ searchParams }: OccasionsPageProps) {
  return (
    <OccasionsClient>
      {/* Stats */}
      <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
        <OccasionsStats />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
        <OccasionsTable searchParams={searchParams} />
      </Suspense>
    </OccasionsClient>
  );
}