"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const sk = "bg-zinc-200/80";

// Product Card Skeleton for grid view
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
      <CardContent className="p-0">
        <Skeleton className={`aspect-[4/5] w-full rounded-none ${sk}`} />
        <div className="space-y-2 p-3 lg:space-y-3 lg:p-4">
          <Skeleton className={`h-4 w-3/4 sm:h-5 ${sk}`} />
          <Skeleton className={`h-3 w-full sm:h-4 ${sk}`} />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className={`h-3 w-3 lg:h-4 lg:w-4 ${sk}`} />
              ))}
            </div>
            <Skeleton className={`h-4 w-16 sm:h-5 ${sk}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Products Grid Skeleton
export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product Detail Image Skeleton
export function ProductImageSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className={`aspect-square w-full rounded-2xl ${sk}`} />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className={`aspect-square w-16 shrink-0 rounded-lg ${sk}`} />
        ))}
      </div>
    </div>
  );
}

// Product Info Skeleton
export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className={`h-8 w-3/4 sm:h-10 ${sk}`} />
        <Skeleton className={`h-4 w-full ${sk}`} />
        <Skeleton className={`h-4 w-2/3 ${sk}`} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className={`h-7 w-24 ${sk}`} />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className={`h-4 w-4 ${sk}`} />
          ))}
          <Skeleton className={`ml-2 h-4 w-12 ${sk}`} />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className={`h-5 w-20 ${sk}`} />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className={`h-10 w-full rounded-md ${sk}`} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className={`h-5 w-20 ${sk}`} />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className={`h-10 w-10 rounded-full ${sk}`} />
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <Skeleton className={`h-12 flex-1 rounded-md ${sk}`} />
          <Skeleton className={`h-12 w-12 shrink-0 rounded-md ${sk}`} />
        </div>
        <Skeleton className={`h-12 w-full rounded-md ${sk}`} />
        <Skeleton className={`mx-auto h-4 w-40 ${sk}`} />
      </div>
    </div>
  );
}

// Product Tabs Skeleton
export function ProductTabsSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex gap-6 border-b border-zinc-200 pb-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className={`h-5 w-20 ${sk}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className={`h-5 w-32 ${sk}`} />
          <Skeleton className={`h-4 w-full ${sk}`} />
          <Skeleton className={`h-4 w-full ${sk}`} />
          <Skeleton className={`h-4 w-3/4 ${sk}`} />
        </div>
        <div className="space-y-3">
          <Skeleton className={`h-5 w-32 ${sk}`} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sk}`} />
              <Skeleton className={`h-4 flex-1 ${sk}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Related Products Skeleton
export function RelatedProductsSkeleton() {
  return (
    <div className="mt-2 space-y-6">
      <Skeleton className={`h-7 w-48 ${sk}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Main Product Detail Skeleton — matches loaded page (zinc-50 storefront)
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)] pb-8">
      <div className="container mx-auto space-y-8 px-4 pt-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-5">
          <ProductImageSkeleton />
          <ProductInfoSkeleton />
        </div>
        <ProductTabsSkeleton />
        <RelatedProductsSkeleton />
      </div>
    </div>
  );
}

// Error State Component
export function ProductError({
  message = "Failed to load products",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-red-500">
        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">Oops! Something went wrong</h3>
      <p className="mb-4 text-zinc-600">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}
