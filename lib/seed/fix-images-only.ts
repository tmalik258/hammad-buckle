import { fixProductImages } from "./fix-product-images";
import { prisma } from "../prisma";

async function main() {
  console.log("🖼️ Replacing broken product/category images with Unsplash URLs...");
  await fixProductImages();
}

main()
  .catch((error) => {
    console.log("💥 Image fix failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
