import { seedStorefront } from "./storefront";
import { prisma } from "../prisma";

async function main() {
  console.log("🪟 Seeding storefront CMS only (existing products/users are kept)...");
  await seedStorefront();
  console.log("✅ Storefront seed complete — edit content anytime in Admin → Storefront.");
}

main()
  .catch((error) => {
    console.log("💥 Storefront seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
