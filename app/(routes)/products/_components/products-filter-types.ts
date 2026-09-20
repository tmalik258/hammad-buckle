export type ProductsFiltersState = {
  search: string;
  category: string;
  genderTarget: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  onSale?: boolean;
  featured?: boolean;
};

export type ProductsFilterChange = (filters: Partial<ProductsFiltersState>) => void;

export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "averageRating:desc", label: "Highest Rated" },
  { value: "name:asc", label: "Name: A–Z" },
] as const;

export function sortValueFromFilters(sortBy: string, sortOrder: "asc" | "desc"): string {
  return `${sortBy}:${sortOrder}`;
}

export function parseSortValue(value: string): { sortBy: string; sortOrder: "asc" | "desc" } {
  const [sortBy, sortOrder] = value.split(":");
  if (!sortBy) return { sortBy: "createdAt", sortOrder: "desc" };
  if (sortOrder === "asc" || sortOrder === "desc") {
    return { sortBy, sortOrder };
  }
  return { sortBy, sortOrder: "desc" };
}

export function productsPageHeading(filters: ProductsFiltersState, categoryName?: string): string {
  if (filters.isNew) return "New arrivals";
  if (filters.onSale) return "Sale";
  if (filters.featured) return "Featured";
  if (categoryName) return categoryName;
  if (filters.genderTarget === "WOMENS") return "Women's";
  if (filters.genderTarget === "MENS") return "Men's";
  if (filters.genderTarget === "UNISEX") return "Unisex";
  return "All products";
}
