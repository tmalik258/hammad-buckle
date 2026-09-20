import { seedCategories } from "./categories";
import { seedProducts } from "./products";
import { seedStorefront } from "./storefront";
import { removeLegacySeedData } from "./cleanup-legacy-seed";
import { syncWomensCatalog } from "./sync-womens-catalog";
import { prisma } from "../prisma";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    console.log("🧹 Clearing existing data...");
    await prisma.homeProductPick.deleteMany();
    await prisma.homeCategorySpotlight.deleteMany();
    await prisma.homePromoBanner.deleteMany();
    await prisma.heroSlide.deleteMany();
    await prisma.storefrontSettings.deleteMany();
    await prisma.review.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderTimeline.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.promoCodeUsage.deleteMany();
    await prisma.order.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.address.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log("🏷️ Seeding women's categories...");
    await seedCategories();

    console.log("📦 Seeding women's products...");
    await seedProducts();

    console.log("🪟 Seeding storefront CMS...");
    await seedStorefront();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.log("❌ Error seeding database:", error);
    throw error;
  }
}

export { removeLegacySeedData, syncWomensCatalog };

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding process finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.log("💥 Seeding failed:", error);
      process.exit(1);
    });
}
