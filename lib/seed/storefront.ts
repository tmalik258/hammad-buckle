import {
  AnnouncementStyle,
  HomeProductPickSection,
  PromoBannerLayout,
} from "@prisma/client";
import { prisma } from "../prisma";

const heroSlides = [
  {
    sortOrder: 0,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=768&q=80",
    heading: "New season essentials",
    subheading: "Elevated fits for every day — tailored layers, premium fabrics.",
    badgeText: "Just dropped",
    primaryCtaLabel: "Shop women",
    primaryCtaHref: "/products?genderTarget=WOMENS",
    secondaryCtaLabel: "Shop men",
    secondaryCtaHref: "/products?genderTarget=MENS",
  },
  {
    sortOrder: 1,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=768&q=80",
    heading: "Footwear that moves with you",
    subheading: "Running, lifestyle, and street silhouettes with responsive comfort.",
    badgeText: "Shoes",
    primaryCtaLabel: "Shop shoes",
    primaryCtaHref: "/collections",
    secondaryCtaLabel: "View all",
    secondaryCtaHref: "/products",
  },
  {
    sortOrder: 2,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&q=80",
    heading: "Weekend polish",
    subheading: "Knits, denim, and outerwear styled for crisp transitions.",
    badgeText: "Looks",
    primaryCtaLabel: "Explore apparel",
    primaryCtaHref: "/products?categoryId=cat-fashion",
    secondaryCtaLabel: "Sale",
    secondaryCtaHref: "/products?onSale=true",
  },
];

export async function seedStorefront() {
  await prisma.storefrontSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      announcementEnabled: true,
      announcementText: "Free shipping on orders over $75 · New arrivals every week",
      announcementHref: "/products",
      announcementStyle: AnnouncementStyle.NEUTRAL,
      homeTitle: "Modern apparel & footwear",
      homeDescription:
        "Discover curated clothing and shoes for women and men — shop new drops and timeless staples.",
      newsletterTitle: "Stay in the loop",
      newsletterSubtitle: "Early access to releases and members-only offers.",
      trustBadgesJson: [
        { icon: "truck", label: "Free shipping", sub: "On qualifying orders" },
        { icon: "refresh", label: "Easy returns", sub: "30-day policy" },
        { icon: "shield", label: "Secure checkout", sub: "Encrypted payments" },
      ],
      homeSectionOrderJson: [
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
      ],
    },
    update: {},
  });

  await prisma.heroSlide.deleteMany();
  for (const slide of heroSlides) {
    await prisma.heroSlide.create({ data: slide });
  }

  await prisma.homeCategorySpotlight.deleteMany();
  const spotlightCategories = [
    { categoryId: "cat-fashion", sortOrder: 0, titleOverride: "Apparel" },
    { categoryId: "cat-sports-outdoors", sortOrder: 1, titleOverride: "Activewear" },
    { categoryId: "cat-electronics", sortOrder: 2, titleOverride: "Accessories" },
    { categoryId: "cat-home-garden", sortOrder: 3, titleOverride: "Lifestyle" },
  ];
  for (const row of spotlightCategories) {
    await prisma.homeCategorySpotlight.create({
      data: { ...row, isActive: true },
    });
  }

  await prisma.homeProductPick.deleteMany();
  const picks: Array<{
    productId: string;
    section: HomeProductPickSection;
    sortOrder: number;
  }> = [
    { productId: "prod-designer-jacket", section: HomeProductPickSection.EDITORIAL_GRID, sortOrder: 0 },
    { productId: "prod-running-shoes", section: HomeProductPickSection.EDITORIAL_GRID, sortOrder: 1 },
    { productId: "prod-iphone-15", section: HomeProductPickSection.HERO_SECONDARY, sortOrder: 0 },
    { productId: "prod-macbook-air", section: HomeProductPickSection.TRENDING, sortOrder: 0 },
    { productId: "prod-running-shoes", section: HomeProductPickSection.TRENDING, sortOrder: 1 },
  ];
  for (const p of picks) {
    await prisma.homeProductPick.create({
      data: { ...p, isActive: true },
    });
  }

  await prisma.homePromoBanner.deleteMany();
  await prisma.homePromoBanner.create({
    data: {
      sortOrder: 0,
      title: "Members save more",
      body: "Sign in at checkout to apply promos and track rewards.",
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
      href: "/auth/signup",
      layout: PromoBannerLayout.SPLIT_RIGHT_IMAGE,
      isActive: true,
    },
  });
  await prisma.homePromoBanner.create({
    data: {
      sortOrder: 1,
      title: "Bundle & save",
      body: "Pair essentials and unlock bundle pricing this week only.",
      imageUrl:
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a1?w=1200&q=80",
      href: "/products?onSale=true",
      layout: PromoBannerLayout.SPLIT_LEFT_IMAGE,
      isActive: true,
    },
  });

  console.log("✅ Storefront CMS seeded");
}
