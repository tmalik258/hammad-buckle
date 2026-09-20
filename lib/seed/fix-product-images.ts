import { prisma } from "../prisma";
import {
  BROKEN_IMAGE_HOST,
  SEED_CATEGORY_IMAGES,
  SEED_PRODUCT_IMAGES,
} from "./product-images";

function usesBrokenHost(url: string | null | undefined): boolean {
  return Boolean(url?.includes(BROKEN_IMAGE_HOST));
}

export async function fixProductImages() {
  let productUpdates = 0;
  let categoryUpdates = 0;

  for (const [id, urls] of Object.entries(SEED_PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) continue;

    const gallery = product.images.filter((url) => !usesBrokenHost(url));
    const nextImages =
      urls.images ??
      (gallery.length > 0 ? gallery : urls.image ? [urls.image] : []);

    const shouldUpdate =
      usesBrokenHost(product.image) ||
      product.images.some((url) => usesBrokenHost(url));

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
      usesBrokenHost(product.image) ||
      product.images.some((url) => usesBrokenHost(url)),
  );

  for (const product of brokenProducts) {
    if (SEED_PRODUCT_IMAGES[product.id]) continue;

    const fallback =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
    await prisma.product.update({
      where: { id: product.id },
      data: { image: fallback, images: [fallback] },
    });
    productUpdates += 1;
    console.log(`✅ Updated fallback image: ${product.name}`);
  }

  for (const [id, image] of Object.entries(SEED_CATEGORY_IMAGES)) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category || !usesBrokenHost(category.image)) continue;

    await prisma.category.update({
      where: { id },
      data: { image },
    });
    categoryUpdates += 1;
    console.log(`✅ Updated category image: ${category.name}`);
  }

  const brokenCategories = await prisma.category.findMany({
    where: { image: { contains: BROKEN_IMAGE_HOST } },
    select: { id: true, name: true },
  });

  for (const category of brokenCategories) {
    if (SEED_CATEGORY_IMAGES[category.id]) continue;

    const fallback =
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";
    await prisma.category.update({
      where: { id: category.id },
      data: { image: fallback },
    });
    categoryUpdates += 1;
    console.log(`✅ Updated fallback category image: ${category.name}`);
  }

  console.log(
    `🖼️ Fixed ${productUpdates} product(s) and ${categoryUpdates} categor(ies).`,
  );
}
