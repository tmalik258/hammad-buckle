import Image from "next/image";
import Link from "next/link";
import type { ProductWithRelations } from "@/lib/hooks/useProductQueries";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductWithRelations[];
};

export function StorefrontHeroSecondaryStrip({ title, subtitle, products }: Props) {
  if (!products.length) return null;

  return (
    <section
      className="border-b border-zinc-100 bg-white py-6 md:py-8"
      aria-label={title}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory md:gap-4">
          {products.map((product) => {
            const img =
              product.image ||
              (product.images?.length ? product.images[0] : "/logo-transparent.png");
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex w-[140px] shrink-0 snap-start flex-col gap-2 sm:w-[160px] cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/80">
                  <Image src={img} alt={product.name} fill className="object-cover" sizes="160px" />
                </div>
                <p className="line-clamp-2 text-xs font-medium text-zinc-900">{product.name}</p>
                <p className="text-xs font-semibold text-zinc-700">${product.price.toFixed(2)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
