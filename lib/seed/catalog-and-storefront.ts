import { seedCategories } from "./categories";
import { seedProducts } from "./products";
import { seedStorefront } from "./storefront";
import { removeLegacySeedData } from "./cleanup-legacy-seed";
import { syncWomensCatalog } from "./sync-womens-catalog";
import { prisma } from "../prisma";

async function main() {
  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  console.log("🧹 Removing previous generic seed data...");
  await removeLegacySeedData();

  if (categoryCount === 0 && productCount === 0) {
    console.log("🏷️ Seeding women's categories...");
    await seedCategories();
    console.log("📦 Seeding women's products...");
    await seedProducts();
  } else {
    console.log("👗 Realigning catalog to women's assortment...");
    await syncWomensCatalog();
  }

  console.log("🪟 Seeding storefront CMS + hero slides...");
  await seedStorefront();

  console.log("✅ Catalog + storefront seed complete.");
}

main()
  .catch((error) => {
    console.log("💥 Catalog seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
