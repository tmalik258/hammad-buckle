"use client";

import { ProductCard, CardProductType } from "@/components/product-card";
import { ProductsGridSkeleton, ProductError } from "./product-skeleton";
import { ProductWithRelations } from "@/lib/hooks/useProductQueries";

interface ProductGridProps {
  products: (ProductWithRelations | CardProductType)[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  productsCount?: number;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

export function ProductGrid({
  products,
  loading = false,
  error = null,
  onRetry,
  className = "",
  productsCount = 0,
  sortBy = "alphabetical",
  onSortChange,
}: ProductGridProps) {
  if (loading) {
    return <ProductsGridSkeleton count={8} />;
  }

  if (error && error !== 'No products found' && !(products.length === 0)) {
    return <ProductError message={error} onRetry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-black mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-black mb-2">
          No products found
        </h3>
        <p className="text-black">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Sort and Product Count */}
      {/* <div className="content-p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Sort by: Alphabetically A- Z" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Sort by: Alphabetically A- Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-white hidden sm:inline">{productsCount} products</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-white sm:hidden">{productsCount} products</span>
            <Button variant="outline" size="sm" className="ml-auto border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white sm:ml-0 cursor-pointer">
              + Sort by: Feature
            </Button>
          </div>
        </div>
      </div> */}

      {/* Products Grid Container */}
      <div className="content-p-4 md:p-7 rounded-2xl space-y-4">
        {/* Section Title */}
        <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">
          Shoes, Best Sellers & New Arrivals
        </h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6 ${className}`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductGrid;
