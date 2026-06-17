import Image from "next/image";
import Link from "next/link";
import type { ProductWithRelations } from "@/lib/hooks/useProductQueries";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductWithRelations[];
};

export function StorefrontEditorialGrid({ title, subtitle, products }: Props) {
  if (!products.length) return null;

  return (
    <section className="bg-zinc-50 py-14 md:py-20" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-600 md:text-base">{subtitle}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const img =
              product.image ||
              (product.images?.length ? product.images[0] : "/logo-transparent.png");
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80 transition hover:shadow-md cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {product.category?.name ?? "Collection"}
                  </p>
                  <h3 className="font-semibold text-zinc-900">{product.name}</h3>
                  <p className="text-sm font-semibold text-zinc-900">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
