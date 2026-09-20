import { AnnouncementStyle, HomeProductPickSection, PromoBannerLayout } from "@prisma/client";
import { prisma } from "../prisma";
import {
  WOMENS_CATEGORY_IDS,
  WOMENS_HERO_SLIDES,
  WOMENS_STOREFRONT_SETTINGS,
} from "./womens-catalog-data";

const preferredSpotlights = [
  { categoryId: WOMENS_CATEGORY_IDS.clothing, titleOverride: "Clothing" },
  { categoryId: WOMENS_CATEGORY_IDS.shoes, titleOverride: "Shoes & Heels" },
];

const preferredProductPicks: Array<{
  productId: string;
  section: HomeProductPickSection;
  sortOrder: number;
}> = [
  { productId: "prod-wrap-dress", section: HomeProductPickSection.EDITORIAL_GRID, sortOrder: 0 },
  { productId: "prod-linen-blazer", section: HomeProductPickSection.EDITORIAL_GRID, sortOrder: 1 },
  { productId: "prod-running-shoes", section: HomeProductPickSection.HERO_SECONDARY, sortOrder: 0 },
  { productId: "prod-block-heels", section: HomeProductPickSection.TRENDING, sortOrder: 0 },
  { productId: "prod-pump-heels", section: HomeProductPickSection.TRENDING, sortOrder: 1 },
];

export async function seedStorefront() {
  await prisma.storefrontSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...WOMENS_STOREFRONT_SETTINGS,
      announcementStyle: AnnouncementStyle.NEUTRAL,
    },
    update: {
      ...WOMENS_STOREFRONT_SETTINGS,
      announcementStyle: AnnouncementStyle.NEUTRAL,
    },
  });

  await prisma.heroSlide.deleteMany();
  for (const slide of WOMENS_HERO_SLIDES) {
    await prisma.heroSlide.create({ data: slide });
    console.log(`✅ Seeded hero slide: ${slide.heading}`);
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  const categoryIds = new Set(categories.map((category) => category.id));

  await prisma.homeCategorySpotlight.deleteMany();

  const spotlightRows = preferredSpotlights
    .filter((row) => categoryIds.has(row.categoryId))
    .map((row, sortOrder) => ({ ...row, sortOrder, isActive: true }));

  for (const row of spotlightRows.length > 0 ? spotlightRows : categories.slice(0, 2).map((category, sortOrder) => ({
    categoryId: category.id,
    sortOrder,
    titleOverride: category.name,
    isActive: true,
  }))) {
    await prisma.homeCategorySpotlight.create({ data: row });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, genderTarget: "WOMENS" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const productIds = new Set(products.map((product) => product.id));

  await prisma.homeProductPick.deleteMany();

  const pickRows = preferredProductPicks.filter((pick) => productIds.has(pick.productId));

  if (pickRows.length === 0 && products.length > 0) {
    for (const [sortOrder, product] of products.slice(0, 5).entries()) {
      await prisma.homeProductPick.create({
        data: {
          productId: product.id,
          section:
            sortOrder === 0
              ? HomeProductPickSection.HERO_SECONDARY
              : sortOrder < 3
                ? HomeProductPickSection.EDITORIAL_GRID
                : HomeProductPickSection.TRENDING,
          sortOrder,
          isActive: true,
        },
      });
    }
  } else {
    for (const pick of pickRows) {
      await prisma.homeProductPick.create({
        data: { ...pick, isActive: true },
      });
    }
  }

  await prisma.homePromoBanner.deleteMany();
  await prisma.homePromoBanner.create({
    data: {
      sortOrder: 0,
      title: "Members save on women's edits",
      body: "Sign in at checkout to apply promos and track rewards on clothing and heels.",
      imageUrl:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
      href: "/auth/signup",
      layout: PromoBannerLayout.SPLIT_RIGHT_IMAGE,
      isActive: true,
    },
  });
  await prisma.homePromoBanner.create({
    data: {
      sortOrder: 1,
      title: "Heels & dresses on sale",
      body: "Limited-time pricing on select women's shoes and occasion wear.",
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80",
      href: "/products?genderTarget=WOMENS&onSale=true",
      layout: PromoBannerLayout.SPLIT_LEFT_IMAGE,
      isActive: true,
    },
  });

  console.log("✅ Storefront CMS seeded");
}
