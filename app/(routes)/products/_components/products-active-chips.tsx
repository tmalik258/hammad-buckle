"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductsFilterChange, ProductsFiltersState } from "./products-filter-types";

type Chip = {
  key: string;
  label: string;
  clear: Partial<ProductsFiltersState>;
};

type Props = {
  filters: ProductsFiltersState;
  categoryName?: string;
  priceLabel?: string;
  onFilterChange: ProductsFilterChange;
  onClearAll: () => void;
};

export function ProductsActiveChips({
  filters,
  categoryName,
  priceLabel,
  onFilterChange,
  onClearAll,
}: Props) {
  const chips: Chip[] = [];

  if (filters.genderTarget) {
    const genderLabel =
      filters.genderTarget === "WOMENS"
        ? "Women's"
        : filters.genderTarget === "MENS"
          ? "Men's"
          : "Unisex";
    chips.push({
      key: "gender",
      label: genderLabel,
      clear: { genderTarget: "" },
    });
  }

  if (filters.category) {
    chips.push({
      key: "category",
      label: categoryName || "Category",
      clear: { category: "" },
    });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    chips.push({
      key: "price",
      label: priceLabel || "Price",
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (filters.isNew) {
    chips.push({ key: "isNew", label: "New", clear: { isNew: undefined } });
  }
  if (filters.onSale) {
    chips.push({ key: "onSale", label: "Sale", clear: { onSale: undefined } });
  }
  if (filters.featured) {
    chips.push({ key: "featured", label: "Featured", clear: { featured: undefined } });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onFilterChange(chip.clear)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-zinc-400"
          )}
        >
          {chip.label}
          <X className="h-3 w-3 opacity-60" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="cursor-pointer text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
