import { syncWomensCatalog } from "./sync-womens-catalog";
import { seedStorefront } from "./storefront";
import { prisma } from "../prisma";

async function main() {
  console.log("👗 Syncing women's catalog and storefront...");
  await syncWomensCatalog();
  await seedStorefront();
  console.log("✅ Women's catalog + hero slides ready in Admin → Storefront.");
}

main()
  .catch((error) => {
    console.log("💥 Women's catalog sync failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
