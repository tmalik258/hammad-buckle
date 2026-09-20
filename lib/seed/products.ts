import { prisma } from "../prisma";
import { WOMENS_PRODUCTS, WOMENS_PRODUCT_VARIANTS } from "./womens-catalog-data";

export async function seedProducts() {
  try {
    for (const product of WOMENS_PRODUCTS) {
      const { images, ...rest } = product;
      await prisma.product.create({
        data: {
          ...rest,
          images: images ?? [product.image],
          isActive: true,
        },
      });
      console.log(`✅ Created product: ${product.name}`);
    }

    for (const variant of WOMENS_PRODUCT_VARIANTS) {
      await prisma.productVariant.create({ data: variant });
      console.log(`✅ Created variant: ${variant.name} - ${variant.value}`);
    }

    const clothingCount = WOMENS_PRODUCTS.filter(
      (product) => product.categoryId === "cat-fashion",
    ).length;
    const shoesCount = WOMENS_PRODUCTS.filter(
      (product) => product.categoryId === "cat-womens-shoes",
    ).length;

    await prisma.category.update({
      where: { id: "cat-fashion" },
      data: { productsCount: clothingCount },
    });
    await prisma.category.update({
      where: { id: "cat-womens-shoes" },
      data: { productsCount: shoesCount },
    });

    console.log(
      `📦 Successfully seeded ${WOMENS_PRODUCTS.length} products and ${WOMENS_PRODUCT_VARIANTS.length} variants`,
    );
  } catch (error) {
    console.log("❌ Error seeding products:", error);
    throw error;
  }
}
