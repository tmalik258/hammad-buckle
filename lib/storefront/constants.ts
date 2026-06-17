export const STOREFRONT_CACHE_TAG = "storefront";
export const HOME_PRODUCTS_CACHE_TAG = "home-products";
/** Matches route `export const revalidate` and unstable_cache revalidate option */
export const HOME_PAGE_REVALIDATE_SECONDS = 300;

export const DEFAULT_HOME_SECTION_ORDER = [
  "announcement",
  "hero",
  "categories",
  "editorial",
  "promos",
  "newArrivals",
  "sale",
  "featured",
  "trending",
  "testimonials",
  "newsletter",
  "trust",
] as const;

export type HomeSectionKey = (typeof DEFAULT_HOME_SECTION_ORDER)[number];
