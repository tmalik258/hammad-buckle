"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useFilters, usePriceStatistics } from "@/lib/hooks/useFilters";
import type { ProductsFilterChange, ProductsFiltersState } from "./products-filter-types";

type PriceRange = { label: string; value: string; min: number; max: number | "max" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductsFiltersState;
  onFilterChange: ProductsFilterChange;
  onClearAll: () => void;
};

function buildPriceRanges(
  min: number,
  max: number,
  apiRanges?: { label: string; min: number; max: number }[]
): PriceRange[] {
  if (apiRanges?.length) {
    return apiRanges.map((range) => ({
      label: range.label,
      value: `${range.min}-${range.max === max ? "max" : range.max}`,
      min: range.min,
      max: range.max === max ? "max" : range.max,
    }));
  }

  const step = Math.max(1, Math.ceil((max - min) / 5));
  return [
    { label: `Under ${min + step}`, value: `${min}-${min + step}`, min, max: min + step },
    {
      label: `${min + step} – ${min + step * 2}`,
      value: `${min + step}-${min + step * 2}`,
      min: min + step,
      max: min + step * 2,
    },
    {
      label: `${min + step * 2} – ${min + step * 3}`,
      value: `${min + step * 2}-${min + step * 3}`,
      min: min + step * 2,
      max: min + step * 3,
    },
    {
      label: `${min + step * 3}+`,
      value: `${min + step * 3}-max`,
      min: min + step * 3,
      max: "max",
    },
  ];
}

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Women's", value: "WOMENS" },
  { label: "Men's", value: "MENS" },
  { label: "Unisex", value: "UNISEX" },
] as const;

export function ProductFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onClearAll,
}: Props) {
  const { filterSections, isLoading } = useFilters();
  const { data: priceStats, isLoading: priceStatsLoading } = usePriceStatistics();

  const realMin = priceStats?.min ?? 15;
  const realMax = priceStats?.max ?? 300;
  const priceRanges = buildPriceRanges(realMin, realMax, priceStats?.priceRanges);

  const selectedPriceValue =
    filters.minPrice != null
      ? `${filters.minPrice}-${filters.maxPrice != null && filters.maxPrice >= realMax ? "max" : filters.maxPrice}`
      : "";

  const hasActive =
    Boolean(filters.category) ||
    Boolean(filters.genderTarget) ||
    filters.minPrice != null ||
    filters.maxPrice != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-zinc-200 bg-white sm:max-w-md z-[4001]"
      >
        <SheetHeader className="border-b border-zinc-100 pb-4 text-left">
          <div className="flex items-center justify-between gap-3 pr-8">
            <SheetTitle className="text-lg font-semibold text-zinc-900">Filters</SheetTitle>
            {hasActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="cursor-pointer text-zinc-600 hover:text-zinc-900"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto py-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Shop for</h3>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value || "all"}
                  type="button"
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    filters.genderTarget === opt.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                  )}
                  onClick={() => onFilterChange({ genderTarget: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Category</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-zinc-100" />
                ))}
              </div>
            ) : (
              <RadioGroup
                value={filters.category || "all"}
                onValueChange={(value) =>
                  onFilterChange({ category: value === "all" ? "" : value })
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="cat-all" className="cursor-pointer" />
                  <Label htmlFor="cat-all" className="cursor-pointer text-sm text-zinc-800">
                    All categories
                  </Label>
                </div>
                {filterSections[0]?.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={`cat-${option.id}`}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`cat-${option.id}`}
                      className="cursor-pointer text-sm text-zinc-800"
                    >
                      {option.name}
                      {option.count != null && option.count > 0 ? (
                        <span className="ml-1 text-zinc-400">({option.count})</span>
                      ) : null}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              Price
              {!priceStatsLoading && priceStats ? (
                <span className="ml-2 font-normal text-zinc-500">
                  {priceStats.min} – {priceStats.max}+
                </span>
              ) : null}
            </h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => {
                    const maxPrice =
                      range.max === "max" ? realMax : (range.max as number);
                    onFilterChange({ minPrice: range.min, maxPrice });
                  }}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    selectedPriceValue === range.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-100 pt-4">
          <Button
            type="button"
            className="h-11 w-full cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={() => onOpenChange(false)}
          >
            Show results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
