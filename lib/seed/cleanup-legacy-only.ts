import { removeLegacySeedData } from "./cleanup-legacy-seed";
import { prisma } from "../prisma";

async function main() {
  console.log("🧹 Removing previous generic seed data...");
  await removeLegacySeedData();
  console.log("✅ Legacy seed cleanup complete.");
}

main()
  .catch((error) => {
    console.log("💥 Legacy cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
