"use client";

import { RelatedProductsSkeleton } from "../../_components/product-skeleton";
import { TransformedProductType } from "@/components/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/product-card";

interface RelatedProductsProps {
  products?: TransformedProductType[];
  loading?: boolean;
  title?: string;
  error?: Error | null;
}

export function RelatedProducts({ 
  products = [], 
  loading = false, 
  title = "Explore More" 
}: RelatedProductsProps) {
  if (loading) {
    return (
      <div>
        <h2 className="mb-8 text-2xl font-bold text-zinc-900">{title}</h2>
        <RelatedProductsSkeleton />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div>
        <h2 className="mb-8 text-2xl font-bold text-zinc-900">{title}</h2>
        <div className="text-center py-12">
          <div className="text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No related products available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl mt-5">
      <h2 className="mb-8 text-2xl font-bold text-zinc-900">{title}</h2>
      <div className="relative">
        <Carousel className="w-full" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2 md:-ml-4 py-3">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 xs:basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 md:-left-4" />
          <CarouselNext className="right-0 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 md:-right-4" />
        </Carousel>
      </div>
    </div>
  );
}

export default RelatedProducts;
