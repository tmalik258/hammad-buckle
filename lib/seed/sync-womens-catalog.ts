import { prisma } from "../prisma";
import { removeLegacySeedData } from "./cleanup-legacy-seed";
import {
  WOMENS_CATEGORIES,
  WOMENS_PRODUCTS,
  WOMENS_PRODUCT_VARIANTS,
} from "./womens-catalog-data";

export async function syncWomensCatalog() {
  await removeLegacySeedData();

  for (const category of WOMENS_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: { ...category, isActive: true },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
        featured: category.featured,
        isActive: true,
      },
    });
    console.log(`✅ Synced category: ${category.name}`);
  }

  for (const product of WOMENS_PRODUCTS) {
    const { images, ...rest } = product;
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        ...rest,
        images: images ?? [product.image],
        isActive: true,
      },
      update: {
        ...rest,
        images: images ?? [product.image],
        isActive: true,
      },
    });
    console.log(`✅ Synced product: ${product.name}`);
  }

  for (const variant of WOMENS_PRODUCT_VARIANTS) {
    const existing = await prisma.productVariant.findFirst({
      where: {
        productId: variant.productId,
        name: variant.name,
        value: variant.value,
      },
    });

    if (existing) {
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: { price: variant.price, stock: variant.stock },
      });
    } else {
      await prisma.productVariant.create({ data: variant });
    }
  }

  const clothingCount = await prisma.product.count({
    where: {
      isActive: true,
      categoryId: WOMENS_CATEGORIES[0].id,
    },
  });
  const shoesCount = await prisma.product.count({
    where: {
      isActive: true,
      categoryId: WOMENS_CATEGORIES[1].id,
    },
  });

  await prisma.category.update({
    where: { id: WOMENS_CATEGORIES[0].id },
    data: { productsCount: clothingCount },
  });
  await prisma.category.update({
    where: { id: WOMENS_CATEGORIES[1].id },
    data: { productsCount: shoesCount },
  });

  console.log(
    `👗 Women's catalog synced (${clothingCount} clothing, ${shoesCount} shoes).`,
  );
}
