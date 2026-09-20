import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type NavCategory = {
  id: string;
  name: string;
};

async function loadNavCategories(): Promise<NavCategory[]> {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getNavCategories(): Promise<NavCategory[]> {
  return unstable_cache(loadNavCategories, ["storefront-nav-categories"], {
    tags: ["categories"],
    revalidate: 300,
  })();
}
