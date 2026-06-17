import { prisma } from "@/lib/prisma";
import { StorefrontAdminClient } from "./_components/storefront-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminStorefrontPage() {
  const [settings, heroSlides, spotlights, picks, promos, categories, products] = await Promise.all([
    prisma.storefrontSettings.findUnique({ where: { id: "default" } }),
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homeCategorySpotlight.findMany({
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
    prisma.homeProductPick.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
      include: { product: { select: { id: true, name: true } } },
    }),
    prisma.homePromoBanner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  return (
    <StorefrontAdminClient
      initialSettings={settings}
      heroSlides={heroSlides}
      spotlights={spotlights}
      picks={picks}
      promos={promos}
      categories={categories}
      products={products}
    />
  );
}
