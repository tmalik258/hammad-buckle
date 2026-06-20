"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Product Card Skeleton for grid view
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <CardContent className="p-0">
        <div className="relative">
          <Skeleton className="w-full h-40 sm:h-44 lg:h-48" />
          <Skeleton className="absolute top-2 lg:top-3 left-2 lg:left-3 w-12 h-6" />
        </div>
        <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
          <Skeleton className="h-4 sm:h-5 lg:h-6 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-2/3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 lg:h-4 lg:w-4" />
              ))}
            </div>
            <Skeleton className="h-4 sm:h-5 lg:h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Products Grid Skeleton
export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product Detail Image Skeleton
export function ProductImageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main image container with brand badge and navigation */}
      <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        {/* Main image skeleton */}
        <Skeleton className="w-full h-full" />
        
        {/* Brand badge skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        
        {/* Navigation arrows skeleton */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      
      {/* Thumbnail images */}
      <div className="flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Product Info Skeleton
export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6 text-white">
      {/* Product name and description */}
      <div>
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Price and rating section */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5" />
          ))}
          <Skeleton className="h-4 w-12 ml-2" />
        </div>
      </div>

      {/* Size Selection Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Color Selection Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="flex space-x-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="flex space-x-4">
          <Skeleton className="flex-1 h-12 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-md" />
        </div>
        <Skeleton className="w-full h-12 rounded-md" />
        
        {/* Size guide note skeleton */}
        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Product Tabs Skeleton
export function ProductTabsSkeleton() {
  return (
    <div className="rounded-2xl p-8">
      {/* Tab navigation skeleton */}
      <div className="flex space-x-8 mb-8 border-b border-gray-600">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 mb-4" />
        ))}
      </div>
      
      {/* Tab content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        {/* Right column */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Related Products Skeleton
export function RelatedProductsSkeleton() {
  return (
    <div className="rounded-2xl p-4 mt-5">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-48 mb-8" />
      
      {/* Carousel container */}
      <div className="relative">
        <div className="w-full overflow-hidden">
          <div className="flex -ml-2 md:-ml-4 space-x-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="pl-2 md:pl-4 xs:basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 shrink-0"
              >
                <Card className="group overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <CardContent className="p-0">
                    {/* Product image skeleton */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-xl overflow-hidden">
                      <Skeleton className="w-full h-full" />
                    </div>
                    
                    {/* Product info skeleton */}
                    <div className="p-4 space-y-2">
                      {/* Product name */}
                      <Skeleton className="h-5 w-3/4" />
                      
                      {/* Product subtitle */}
                      <Skeleton className="h-4 w-full" />
                      
                      {/* Rating and price section */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, j) => (
                            <Skeleton key={j} className="h-3 w-3" />
                          ))}
                          <Skeleton className="h-3 w-8 ml-1" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation arrows skeleton */}
        <div className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Main Product Detail Skeleton - matches the complete page structure
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background eclipse skeleton */}
      <div className="absolute top-10">
        <Skeleton className="w-full h-[1080px] bg-gray-900/20" />
      </div>
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Main product grid - 2 columns */}
        <div className="grid grid-cols-2 gap-5">
          <ProductImageSkeleton />
          <ProductInfoSkeleton />
        </div>
        
        {/* Product tabs section */}
        <ProductTabsSkeleton />
        
        {/* Related products section */}
        <RelatedProductsSkeleton />
      </div>
    </div>
  );
}

// Error State Component
export function ProductError({ 
  message = "Failed to load products", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
        >
          Try Again
        </button>
      )}
    </div>
  );
}