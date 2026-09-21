import { cn } from "@/lib/utils";
import { SITE_CURRENCY } from "@/lib/site-metadata";

export type PriceRange = {
  label: string;
  value: string;
  min: number;
  max: number | "max";
};

const chipShape =
  "rounded-none rounded-tr-2xl rounded-bl-2xl border transition cursor-pointer";

export function filterChipClass(active: boolean, size: "sm" | "md" = "md") {
  return cn(
    chipShape,
    size === "sm" ? "px-3 py-1.5 text-xs font-medium" : "px-3.5 py-2 text-sm font-medium",
    active
      ? "border-zinc-900 bg-zinc-900 text-white"
      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
  );
}

export function filterRowClass(active: boolean) {
  return cn(
    chipShape,
    "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm font-medium",
    active
      ? "border-zinc-900 bg-zinc-900 text-white"
      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
  );
}

function priceLabel(min: number, max: number | "max", catalogMax: number): string {
  if (min <= 0) {
    return `Under ${Math.round(max === "max" ? catalogMax : max)} ${SITE_CURRENCY}`;
  }
  if (max === "max") {
    return `${Math.round(min)}+ ${SITE_CURRENCY}`;
  }
  return `${Math.round(min)} - ${Math.round(max)} ${SITE_CURRENCY}`;
}

export function buildPriceRanges(
  min: number,
  max: number,
  apiRanges?: { label: string; min: number; max: number }[]
): PriceRange[] {
  if (apiRanges?.length) {
    return apiRanges.map((range, index) => {
      const isLast = index === apiRanges.length - 1;
      const rangeMax: number | "max" = isLast || range.max >= max ? "max" : range.max;
      return {
        label: priceLabel(range.min, rangeMax, max),
        value: `${range.min}-${rangeMax === "max" ? "max" : range.max}`,
        min: range.min,
        max: rangeMax,
      };
    });
  }

  const step = Math.max(1, Math.ceil((max - min) / 5));
  return [
    {
      label: priceLabel(min, min + step, max),
      value: `${min}-${min + step}`,
      min,
      max: min + step,
    },
    {
      label: priceLabel(min + step, min + step * 2, max),
      value: `${min + step}-${min + step * 2}`,
      min: min + step,
      max: min + step * 2,
    },
    {
      label: priceLabel(min + step * 2, min + step * 3, max),
      value: `${min + step * 2}-${min + step * 3}`,
      min: min + step * 2,
      max: min + step * 3,
    },
    {
      label: priceLabel(min + step * 3, "max", max),
      value: `${min + step * 3}-max`,
      min: min + step * 3,
      max: "max",
    },
  ];
}

export const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Women's", value: "WOMENS" },
  { label: "Men's", value: "MENS" },
  { label: "Unisex", value: "UNISEX" },
] as const;
