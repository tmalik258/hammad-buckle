import { prisma } from "../prisma";
import {
  BROKEN_IMAGE_HOST,
  SEED_CATEGORY_IMAGES,
  SEED_PRODUCT_IMAGES,
} from "./product-images";

const DEAD_UNSPLASH_PHOTO_IDS = [
  "photo-1496747611176-843222e1ad57",
  "photo-1515372039744-b8a02bd438ca",
  "photo-1594633313593-bab3825df0bd",
  "photo-1551028718-0016710586ab",
  "photo-1585487003540-76018ecdebca",
  "photo-1560767559-724f8b3a0703",
  "photo-1562184652-ee9453401da0",
] as const;

function usesBrokenHost(url: string | null | undefined): boolean {
  return Boolean(url?.includes(BROKEN_IMAGE_HOST));
}

function usesDeadUnsplash(url: string | null | undefined): boolean {
  if (!url) return false;
  return DEAD_UNSPLASH_PHOTO_IDS.some((id) => url.includes(id));
}

function needsImageRepair(url: string | null | undefined): boolean {
  return usesBrokenHost(url) || usesDeadUnsplash(url);
}

function imagesEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export async function fixProductImages() {
  let productUpdates = 0;
  let categoryUpdates = 0;
  let bannerUpdates = 0;

  for (const [id, urls] of Object.entries(SEED_PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) continue;

    const nextImages = urls.images ?? (urls.image ? [urls.image] : []);
    const shouldUpdate =
      needsImageRepair(product.image) ||
      product.images.some((url) => needsImageRepair(url)) ||
      product.image !== urls.image ||
      !imagesEqual(product.images, nextImages);

    if (!shouldUpdate) continue;

    await prisma.product.update({
      where: { id },
      data: {
        image: urls.image,
        images: nextImages,
      },
    });
    productUpdates += 1;
    console.log(`✅ Updated product images: ${product.name}`);
  }

  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, image: true, images: true },
  });

  const brokenProducts = allProducts.filter(
    (product) =>
      needsImageRepair(product.image) ||
      product.images.some((url) => needsImageRepair(url)),
  );

  for (const product of brokenProducts) {
    if (SEED_PRODUCT_IMAGES[product.id]) continue;

    const fallback =
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80";
    await prisma.product.update({
      where: { id: product.id },
      data: { image: fallback, images: [fallback] },
    });
    productUpdates += 1;
    console.log(`✅ Updated fallback image: ${product.name}`);
  }

  for (const [id, image] of Object.entries(SEED_CATEGORY_IMAGES)) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) continue;
    if (!needsImageRepair(category.image) && category.image === image) continue;

    await prisma.category.update({
      where: { id },
      data: { image },
    });
    categoryUpdates += 1;
    console.log(`✅ Updated category image: ${category.name}`);
  }

  const brokenCategories = await prisma.category.findMany({
    select: { id: true, name: true, image: true },
  });

  for (const category of brokenCategories) {
    if (SEED_CATEGORY_IMAGES[category.id]) continue;
    if (!needsImageRepair(category.image)) continue;

    const fallback =
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80";
    await prisma.category.update({
      where: { id: category.id },
      data: { image: fallback },
    });
    categoryUpdates += 1;
    console.log(`✅ Updated fallback category image: ${category.name}`);
  }

  const banners = await prisma.homePromoBanner.findMany({
    select: { id: true, title: true, imageUrl: true },
  });

  for (const banner of banners) {
    if (!needsImageRepair(banner.imageUrl)) continue;

    const fallback =
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80";
    await prisma.homePromoBanner.update({
      where: { id: banner.id },
      data: { imageUrl: fallback },
    });
    bannerUpdates += 1;
    console.log(`✅ Updated promo banner image: ${banner.title}`);
  }

  console.log(
    `🖼️ Fixed ${productUpdates} product(s), ${categoryUpdates} categor(ies), ${bannerUpdates} banner(s).`,
  );
}
