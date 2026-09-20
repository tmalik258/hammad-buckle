import { prisma } from "../prisma";
import { WOMENS_CATEGORIES } from "./womens-catalog-data";

export async function seedCategories() {
  try {
    for (const category of WOMENS_CATEGORIES) {
      await prisma.category.create({
        data: { ...category, isActive: true },
      });
      console.log(`✅ Created category: ${category.name}`);
    }
    console.log(`🏷️ Successfully seeded ${WOMENS_CATEGORIES.length} categories`);
  } catch (error) {
    console.log("❌ Error seeding categories:", error);
    throw error;
  }
}
