import { Fragment, Suspense, type ReactNode } from "react";
import { getHomePageData } from "@/lib/storefront/get-home-data";
import type { HomeSectionKey } from "@/lib/storefront/constants";
import { resolveHeading } from "@/lib/storefront/section-headings";
import { StorefrontHeroCarousel } from "./storefront-hero-carousel";
import { StorefrontHeroSecondaryStrip } from "./storefront-hero-secondary-strip";
import { StorefrontCategorySpotlight } from "./storefront-category-spotlight";
import { StorefrontEditorialGrid } from "./storefront-editorial-grid";
import { StorefrontPromoBanners } from "./storefront-promo-banners";
import { StorefrontProductRail } from "./storefront-product-rail";
import { StorefrontTrustRow } from "./storefront-trust-row";
import { StorefrontHomeTestimonials } from "./storefront-home-testimonials";
import { StorefrontReveal } from "./storefront-reveal";
import NewsletterSection from "../newsletter-section";

export async function StorefrontHome() {
  const data = await getHomePageData();
  const headings = data.sectionHeadings;

  const newsletterTitle = data.settings?.newsletterTitle ?? undefined;
  const newsletterSubtitle = data.settings?.newsletterSubtitle ?? undefined;

  const categoriesHeading = resolveHeading(headings, "categories");
  const editorialHeading = resolveHeading(headings, "editorial");
  const heroSecondaryHeading = resolveHeading(headings, "heroSecondary");
  const newArrivalsHeading = resolveHeading(headings, "newArrivals");
  const saleHeading = resolveHeading(headings, "sale");
  const featuredHeading = resolveHeading(headings, "featured");
  const trendingHeading = resolveHeading(headings, "trending");
  const testimonialsHeading = resolveHeading(headings, "testimonials");

  const sectionBlocks: Record<HomeSectionKey, ReactNode | null> = {
    announcement: null,
    hero: (
      <div className="-mt-[var(--site-chrome-height,4rem)]">
        <Suspense fallback={<div className="h-[100svh] animate-pulse bg-zinc-100" aria-hidden />}>
          <StorefrontHeroCarousel slides={data.heroSlides} />
        </Suspense>
        {data.picksHeroSecondary.length ? (
          <StorefrontReveal>
            <StorefrontHeroSecondaryStrip
              title={heroSecondaryHeading.title}
              subtitle={heroSecondaryHeading.subtitle}
              products={data.picksHeroSecondary}
            />
          </StorefrontReveal>
        ) : null}
      </div>
    ),
    categories: data.categorySpotlights.length ? (
      <StorefrontReveal>
        <StorefrontCategorySpotlight
          title={categoriesHeading.title}
          subtitle={categoriesHeading.subtitle}
          rows={data.categorySpotlights}
        />
      </StorefrontReveal>
    ) : null,
    editorial: data.picksEditorial.length ? (
      <StorefrontReveal>
        <StorefrontEditorialGrid
          title={editorialHeading.title}
          subtitle={editorialHeading.subtitle}
          products={data.picksEditorial}
        />
      </StorefrontReveal>
    ) : null,
    promos: data.promoBanners.length ? (
      <StorefrontReveal>
        <div className="bg-white">
          <StorefrontPromoBanners banners={data.promoBanners} />
        </div>
      </StorefrontReveal>
    ) : null,
    newArrivals: (
      <StorefrontReveal>
        <StorefrontProductRail
          title={newArrivalsHeading.title}
          subtitle={newArrivalsHeading.subtitle}
          products={data.newArrivals}
          viewAllHref="/products?isNew=true"
        />
      </StorefrontReveal>
    ),
    sale: (
      <StorefrontReveal>
        <div className="bg-zinc-50">
          <StorefrontProductRail
            title={saleHeading.title}
            subtitle={saleHeading.subtitle}
            products={data.onSale}
            viewAllHref="/products?onSale=true"
            viewAllLabel="Shop sale"
          />
        </div>
      </StorefrontReveal>
    ),
    featured: (
      <StorefrontReveal>
        <StorefrontProductRail
          title={featuredHeading.title}
          subtitle={featuredHeading.subtitle}
          products={data.featured}
          viewAllHref="/products?featured=true"
        />
      </StorefrontReveal>
    ),
    trending: (
      <StorefrontReveal>
        <div className="bg-zinc-50">
          <StorefrontProductRail
            title={trendingHeading.title}
            subtitle={trendingHeading.subtitle}
            products={data.trendingProducts}
            viewAllHref="/products?sortBy=reviewCount&sortOrder=desc"
            viewAllLabel="Explore trending"
          />
        </div>
      </StorefrontReveal>
    ),
    testimonials: (
      <StorefrontReveal>
        <StorefrontHomeTestimonials
          title={testimonialsHeading.title}
          subtitle={testimonialsHeading.subtitle}
          testimonials={data.testimonials}
        />
      </StorefrontReveal>
    ),
    newsletter: (
      <StorefrontReveal>
        <NewsletterSection title={newsletterTitle} subtitle={newsletterSubtitle} />
      </StorefrontReveal>
    ),
    trust: (
      <StorefrontReveal>
        <StorefrontTrustRow badges={data.trustBadges} />
      </StorefrontReveal>
    ),
  };

  return (
    <div className="min-h-screen bg-white">
      {data.sectionOrder.map((key) => {
        if (key === "announcement") return null;
        const block = sectionBlocks[key];
        if (block == null) return null;
        return <Fragment key={key}>{block}</Fragment>;
      })}
    </div>
  );
}
