"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductsPageSkeleton } from "@/components/ui/route-skeletons";
import ProductFilters from "./_components/product-filters";
import ProductGrid from "./_components/product-grid";
import { useProducts } from "@/lib/hooks/useProducts";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    genderTarget: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });

  const scrollToProductsTop = useCallback(() => {
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Initialize filters from URL parameters on mount
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");
    const urlSearch = searchParams.get("search") || "";
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlSortOrder = searchParams.get("sortOrder") || "desc";
    const urlPage = searchParams.get("page");
    const urlGender = searchParams.get("genderTarget") || "";

    setFilters((prev) => ({
      ...prev,
      search: urlSearch,
      category: urlCategory,
      genderTarget: urlGender,
      minPrice: urlMinPrice ? Number(urlMinPrice) : undefined,
      maxPrice: urlMaxPrice ? Number(urlMaxPrice) : undefined,
      sortBy: urlSortBy,
      sortOrder:
        urlSortOrder === "asc" || urlSortOrder === "desc"
          ? urlSortOrder
          : "desc",
    }));

    if (urlPage) {
      const pageNum = Number(urlPage);
      if (pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useProducts({
    page: currentPage,
    limit: 12,
    ...filters,
  });

  const products = data?.products || [];
  const totalProducts = data?.pagination.totalCount || 0;
  const totalPages = data?.pagination.totalPages || 1;

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1); // Reset to first page when filters change

      // Update URL parameters
      const params = new URLSearchParams(searchParams);

      // Update each filter parameter
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      // Reset page to 1 when filters change
      params.set("page", "1");

      // Update URL without page reload
      window.history.pushState({}, "", `?${params.toString()}`);
    },
    [searchParams]
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      setFilters((prev) => ({ ...prev, sortBy }));

      // Update URL parameters
      const params = new URLSearchParams(searchParams);
      params.set("sortBy", sortBy);

      // Update URL without page reload
      window.history.pushState({}, "", `?${params.toString()}`);
    },
    [searchParams]
  );

  // Loading state
  if (isLoading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="min-h-screen pt-20 z-0">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        {/* Removed HeroSection */}

        {/* Main Content Layout */}
        <div
          id="products-section"
          className="flex max-md:flex-col space-x-5 space-y-4 md:space-y-6 lg:space-y-8 z-10"
        >
          {/* Reusable Filter Component - Full Width */}
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Main Content Area - Full Width */}
          <div className="flex-1">
            {/* Products Grid */}
            <ProductGrid
              products={products}
              loading={isLoading}
              error={error?.message || null}
              onRetry={refetch}
              productsCount={totalProducts}
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-12 z-10">
          <Button
            variant="outline"
            onClick={() => {
              const newPage = Math.max(1, currentPage - 1);
              setCurrentPage(newPage);

              // Update URL parameters
              const params = new URLSearchParams(searchParams);
              params.set("page", newPage.toString());
              window.history.pushState({}, "", `?${params.toString()}`);

              // Scroll to top of products section
              scrollToProductsTop();
            }}
            disabled={currentPage === 1 || isLoading}
            className="border-gray-700 text-black hover:bg-black/10 cursor-pointer disabled:cursor-none"
          >
            Previous
          </Button>

          <span className="text-black">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);

              // Update URL parameters
              const params = new URLSearchParams(searchParams);
              params.set("page", newPage.toString());
              window.history.pushState({}, "", `?${params.toString()}`);

              // Scroll to top of products section
              scrollToProductsTop();
            }}
            disabled={currentPage >= totalPages || isLoading}
            className="border-gray-700 text-black hover:bg-black/10 cursor-pointer disabled:cursor-none"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}> 
      <ProductsContent />
    </Suspense>
  );
}
