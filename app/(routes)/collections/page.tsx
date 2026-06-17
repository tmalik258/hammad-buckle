import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Page: Collections index
 * Rendering: SSR (DB required; avoids prerender-at-build when DATABASE_URL is unavailable in CI)
 * Reason: Shopify-like collections grid linking into filtered products.
 */

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Collections
          </h1>
          <p className="mt-3 text-zinc-600">
            Browse by category — each collection opens a filtered shop view.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const img = cat.image?.trim() || "/logo-transparent.png";
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80 transition hover:shadow-md cursor-pointer"
              >
                <div className="relative aspect-[16/10] bg-zinc-100">
                  <Image
                    src={img}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="space-y-1 p-5">
                  <h2 className="text-lg font-semibold text-zinc-900">{cat.name}</h2>
                  {cat.description ? (
                    <p className="line-clamp-2 text-sm text-zinc-600">{cat.description}</p>
                  ) : null}
                  <p className="text-xs font-medium text-zinc-500">
                    {cat.productsCount} products
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
