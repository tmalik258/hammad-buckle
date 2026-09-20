"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGsapToolbarReveal } from "@/lib/hooks/useGsapProductsReveal";
import {
  SORT_OPTIONS,
  parseSortValue,
  sortValueFromFilters,
  type ProductsFilterChange,
  type ProductsFiltersState,
} from "./products-filter-types";

type Props = {
  title: string;
  productsCount: number;
  filters: ProductsFiltersState;
  onFilterChange: ProductsFilterChange;
  onOpenFilters: () => void;
  activeFilterCount: number;
};

export function ProductsToolbar({
  title,
  productsCount,
  filters,
  onFilterChange,
  onOpenFilters,
  activeFilterCount,
}: Props) {
  const toolbarRef = useGsapToolbarReveal();
  const sortValue = sortValueFromFilters(filters.sortBy, filters.sortOrder);

  return (
    <div
      ref={toolbarRef}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {productsCount} {productsCount === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const parsed = parseSortValue(value);
            onFilterChange(parsed);
          }}
        >
          <SelectTrigger className="h-10 w-[180px] cursor-pointer border-zinc-200 bg-white text-sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenFilters}
          className="h-10 cursor-pointer border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-medium text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );
}
