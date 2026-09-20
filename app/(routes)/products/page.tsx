"use client";

import React, { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductsPageSkeleton } from "@/components/ui/route-skeletons";
import ProductGrid from "./_components/product-grid";
import { ProductsToolbar } from "./_components/products-toolbar";
import { ProductsActiveChips } from "./_components/products-active-chips";
import { ProductFiltersSheet } from "./_components/product-filters-sheet";
import {
  productsPageHeading,
  type ProductsFiltersState,
} from "./_components/products-filter-types";
import { useProducts } from "@/lib/hooks/useProducts";
import { useFilters } from "@/lib/hooks/useFilters";

const DEFAULT_FILTERS: ProductsFiltersState = {
  search: "",
  category: "",
  genderTarget: "",
  status: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  minPrice: undefined,
  maxPrice: undefined,
  isNew: undefined,
  onSale: undefined,
  featured: undefined,
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductsFiltersState>(DEFAULT_FILTERS);
  const { categories } = useFilters();

  const scrollToProductsTop = useCallback(() => {
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const parseBool = (value: string | null) =>
      value === "true" ? true : value === "false" ? false : undefined;

    const urlSortOrder = searchParams.get("sortOrder") || "desc";

    setFilters({
      search: searchParams.get("search") || "",
      category:
        searchParams.get("category") || searchParams.get("categoryId") || "",
      genderTarget: searchParams.get("genderTarget") || "",
      status: "",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder:
        urlSortOrder === "asc" || urlSortOrder === "desc" ? urlSortOrder : "desc",
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      isNew: parseBool(searchParams.get("isNew")),
      onSale: parseBool(searchParams.get("onSale")),
      featured: parseBool(searchParams.get("featured")),
    });

    const urlPage = searchParams.get("page");
    if (urlPage) {
      const pageNum = Number(urlPage);
      if (pageNum > 0) setCurrentPage(pageNum);
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

  const categoryName = useMemo(() => {
    if (!filters.category || !categories.data) return undefined;
    return categories.data.find((c) => c.id === filters.category)?.name;
  }, [filters.category, categories.data]);

  const priceLabel = useMemo(() => {
    if (filters.minPrice == null && filters.maxPrice == null) return undefined;
    if (filters.minPrice != null && filters.maxPrice != null) {
      return `${filters.minPrice}–${filters.maxPrice}`;
    }
    if (filters.minPrice != null) return `From ${filters.minPrice}`;
    return `Up to ${filters.maxPrice}`;
  }, [filters.minPrice, filters.maxPrice]);

  const activeFilterCount = [
    filters.category,
    filters.genderTarget,
    filters.minPrice != null || filters.maxPrice != null,
    filters.isNew,
    filters.onSale,
    filters.featured,
  ].filter(Boolean).length;

  const syncUrl = useCallback(
    (next: ProductsFiltersState, page: number) => {
      const params = new URLSearchParams();
      if (next.search) params.set("search", next.search);
      if (next.category) params.set("category", next.category);
      if (next.genderTarget) params.set("genderTarget", next.genderTarget);
      if (next.sortBy) params.set("sortBy", next.sortBy);
      if (next.sortOrder) params.set("sortOrder", next.sortOrder);
      if (next.minPrice != null) params.set("minPrice", String(next.minPrice));
      if (next.maxPrice != null) params.set("maxPrice", String(next.maxPrice));
      if (next.isNew === true) params.set("isNew", "true");
      if (next.onSale === true) params.set("onSale", "true");
      if (next.featured === true) params.set("featured", "true");
      params.set("page", String(page));
      window.history.pushState({}, "", `?${params.toString()}`);
    },
    []
  );

  const handleFilterChange = useCallback(
    (partial: Partial<ProductsFiltersState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...partial };
        setCurrentPage(1);
        syncUrl(next, 1);
        return next;
      });
    },
    [syncUrl]
  );

  const handleClearAll = useCallback(() => {
    const next: ProductsFiltersState = {
      ...DEFAULT_FILTERS,
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    setFilters(next);
    setCurrentPage(1);
    syncUrl(next, 1);
  }, [filters.search, filters.sortBy, filters.sortOrder, syncUrl]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncUrl(filters, page);
      scrollToProductsTop();
    },
    [filters, syncUrl, scrollToProductsTop]
  );

  if (isLoading) {
    return <ProductsPageSkeleton />;
  }

  const title = productsPageHeading(filters, categoryName);

  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div id="products-section" className="space-y-6">
          <ProductsToolbar
            title={title}
            productsCount={totalProducts}
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          <ProductsActiveChips
            filters={filters}
            categoryName={categoryName}
            priceLabel={priceLabel}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />

          <ProductGrid
            products={products}
            loading={false}
            error={error?.message || null}
            onRetry={refetch}
          />

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-600">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="cursor-pointer border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <ProductFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />
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
