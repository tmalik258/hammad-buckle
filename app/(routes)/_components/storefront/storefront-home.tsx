import { AnnouncementStyle } from "@prisma/client";
import { Fragment, Suspense, type ReactNode } from "react";
import { getHomePageData } from "@/lib/storefront/get-home-data";
import type { HomeSectionKey } from "@/lib/storefront/constants";
import { resolveHeading } from "@/lib/storefront/section-headings";
import { StorefrontAnnouncementBar } from "./storefront-announcement-bar";
import { StorefrontHeroCarousel } from "./storefront-hero-carousel";
import { StorefrontHeroSecondaryStrip } from "./storefront-hero-secondary-strip";
import { StorefrontCategorySpotlight } from "./storefront-category-spotlight";
import { StorefrontEditorialGrid } from "./storefront-editorial-grid";
import { StorefrontPromoBanners } from "./storefront-promo-banners";
import { StorefrontProductRail } from "./storefront-product-rail";
import { StorefrontTrustRow } from "./storefront-trust-row";
import { StorefrontHomeTestimonials } from "./storefront-home-testimonials";
import NewsletterSection from "../newsletter-section";

export async function StorefrontHome() {
  const data = await getHomePageData();
  const headings = data.sectionHeadings;

  const announcementEnabled = data.settings?.announcementEnabled ?? false;
  const announcementText = data.settings?.announcementText ?? null;
  const announcementHref = data.settings?.announcementHref ?? null;
  const announcementStyle = data.settings?.announcementStyle ?? AnnouncementStyle.NEUTRAL;

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
    announcement: (
      <StorefrontAnnouncementBar
        enabled={announcementEnabled}
        text={announcementText}
        href={announcementHref}
        style={announcementStyle}
      />
    ),
    hero: (
      <>
        <Suspense fallback={<div className="h-[60vh] animate-pulse bg-zinc-100" aria-hidden />}>
          <StorefrontHeroCarousel slides={data.heroSlides} />
        </Suspense>
        {data.picksHeroSecondary.length ? (
          <StorefrontHeroSecondaryStrip
            title={heroSecondaryHeading.title}
            subtitle={heroSecondaryHeading.subtitle}
            products={data.picksHeroSecondary}
          />
        ) : null}
      </>
    ),
    categories: data.categorySpotlights.length ? (
      <StorefrontCategorySpotlight
        title={categoriesHeading.title}
        subtitle={categoriesHeading.subtitle}
        rows={data.categorySpotlights}
      />
    ) : null,
    editorial: data.picksEditorial.length ? (
      <StorefrontEditorialGrid
        title={editorialHeading.title}
        subtitle={editorialHeading.subtitle}
        products={data.picksEditorial}
      />
    ) : null,
    promos: data.promoBanners.length ? (
      <div className="bg-white">
        <StorefrontPromoBanners banners={data.promoBanners} />
      </div>
    ) : null,
    newArrivals: (
      <StorefrontProductRail
        title={newArrivalsHeading.title}
        subtitle={newArrivalsHeading.subtitle}
        products={data.newArrivals}
        viewAllHref="/products?isNew=true"
      />
    ),
    sale: (
      <div className="bg-zinc-50">
        <StorefrontProductRail
          title={saleHeading.title}
          subtitle={saleHeading.subtitle}
          products={data.onSale}
          viewAllHref="/products?onSale=true"
          viewAllLabel="Shop sale"
        />
      </div>
    ),
    featured: (
      <StorefrontProductRail
        title={featuredHeading.title}
        subtitle={featuredHeading.subtitle}
        products={data.featured}
        viewAllHref="/products?featured=true"
      />
    ),
    trending: (
      <div className="bg-zinc-50">
        <StorefrontProductRail
          title={trendingHeading.title}
          subtitle={trendingHeading.subtitle}
          products={data.trendingProducts}
          viewAllHref="/products?sortBy=reviewCount&sortOrder=desc"
          viewAllLabel="Explore trending"
        />
      </div>
    ),
    testimonials: (
      <StorefrontHomeTestimonials
        title={testimonialsHeading.title}
        subtitle={testimonialsHeading.subtitle}
        testimonials={data.testimonials}
      />
    ),
    newsletter: (
      <NewsletterSection title={newsletterTitle} subtitle={newsletterSubtitle} />
    ),
    trust: <StorefrontTrustRow badges={data.trustBadges} />,
  };

  return (
    <div className="min-h-screen bg-white">
      {data.sectionOrder.map((key) => {
        const block = sectionBlocks[key];
        if (block == null) return null;
        return <Fragment key={key}>{block}</Fragment>;
      })}
    </div>
  );
}
