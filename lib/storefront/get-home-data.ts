import { unstable_cache } from "next/cache";
import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductWithRelations } from "@/lib/hooks/useProductQueries";
import {
  DEFAULT_HOME_SECTION_ORDER,
  HOME_PAGE_REVALIDATE_SECONDS,
  HOME_PRODUCTS_CACHE_TAG,
  STOREFRONT_CACHE_TAG,
  type HomeSectionKey,
} from "./constants";
import { homeProductInclude } from "./product-include";
import {
  normalizeSectionOrder,
  parseSectionHeadings,
  type HomeSectionHeadings,
} from "./section-headings";

export type TrustBadge = { icon: string; label: string; sub: string };
export type { HomeSectionHeadings };

function parseTrustBadges(json: unknown): TrustBadge[] | null {
  if (!Array.isArray(json)) return null;
  const rows = json.filter(
    (x): x is TrustBadge =>
      typeof x === "object" &&
      x !== null &&
      "label" in x &&
      typeof (x as TrustBadge).label === "string"
  );
  return rows.length ? rows : null;
}

const getCachedCms = unstable_cache(
  async () => {
    const [settings, heroSlides, categorySpotlights, promoBanners, productPicks] = await Promise.all([
      prisma.storefrontSettings.findUnique({ where: { id: "default" } }),
      prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.homeCategorySpotlight.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          category: true,
        },
      }),
      prisma.homePromoBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.homeProductPick.findMany({
        where: { isActive: true },
        orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
        include: {
          product: { include: homeProductInclude },
        },
      }),
    ]);

    const picksHeroSecondary = productPicks
      .filter((p) => p.section === "HERO_SECONDARY")
      .map((p) => p.product as ProductWithRelations);
    const picksEditorial = productPicks
      .filter((p) => p.section === "EDITORIAL_GRID")
      .map((p) => p.product as ProductWithRelations);
    const picksTrending = productPicks
      .filter((p) => p.section === "TRENDING")
      .map((p) => p.product as ProductWithRelations);

    const sectionOrder = normalizeSectionOrder(
      settings?.homeSectionOrderJson ?? null,
      DEFAULT_HOME_SECTION_ORDER
    );
    const trustBadges = parseTrustBadges(settings?.trustBadgesJson ?? null);
    const sectionHeadings = parseSectionHeadings(settings?.homeSectionHeadingsJson ?? null);

    return {
      settings,
      heroSlides,
      categorySpotlights,
      promoBanners,
      picksHeroSecondary,
      picksEditorial,
      picksTrending,
      sectionOrder,
      trustBadges,
      sectionHeadings,
    };
  },
  ["home-storefront-cms"],
  { tags: [STOREFRONT_CACHE_TAG], revalidate: HOME_PAGE_REVALIDATE_SECONDS }
);

const getCachedProductStrips = unstable_cache(
  async () => {
    const [newArrivals, onSale, featured, trendingFallback] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isNew: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: homeProductInclude,
      }),
      prisma.product.findMany({
        where: { isActive: true, onSale: true },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: homeProductInclude,
      }),
      prisma.product.findMany({
        where: { isActive: true, featured: true },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: homeProductInclude,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
        include: homeProductInclude,
      }),
    ]);

    return {
      newArrivals: newArrivals as ProductWithRelations[],
      onSale: onSale as ProductWithRelations[],
      featured: featured as ProductWithRelations[],
      trendingFallback: trendingFallback as ProductWithRelations[],
    };
  },
  ["home-product-strips"],
  { tags: [STOREFRONT_CACHE_TAG, HOME_PRODUCTS_CACHE_TAG], revalidate: HOME_PAGE_REVALIDATE_SECONDS }
);

const getCachedTestimonials = unstable_cache(
  async () => {
    const reviews = await prisma.review.findMany({
      where: { verified: true, status: ReviewStatus.APPROVED },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
    return reviews;
  },
  ["home-testimonials"],
  { tags: [STOREFRONT_CACHE_TAG], revalidate: HOME_PAGE_REVALIDATE_SECONDS }
);

export async function getHomePageData() {
  const [cms, strips, testimonials] = await Promise.all([
    getCachedCms(),
    getCachedProductStrips(),
    getCachedTestimonials(),
  ]);

  const trendingProducts =
    cms.picksTrending.length > 0 ? cms.picksTrending : strips.trendingFallback;

  return {
    ...cms,
    newArrivals: strips.newArrivals,
    onSale: strips.onSale,
    featured: strips.featured,
    trendingProducts,
    testimonials,
  };
}

export async function getHomeMetadata() {
  const { settings } = await getCachedCms();
  return {
    title: settings?.homeTitle ?? "Hammad Buckle — Apparel & footwear",
    description:
      settings?.homeDescription ??
      "Shop curated clothing and shoes for women and men — new drops and timeless staples.",
  };
}
