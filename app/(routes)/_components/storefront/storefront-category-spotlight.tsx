import Image from "next/image";
import Link from "next/link";
import type { Category, HomeCategorySpotlight } from "@prisma/client";

type Row = HomeCategorySpotlight & { category: Category };

type Props = {
  title: string;
  subtitle?: string;
  rows: Row[];
};

export function StorefrontCategorySpotlight({ title, subtitle, rows }: Props) {
  if (!rows.length) return null;

  return (
    <section className="border-y border-zinc-100 bg-white py-14 md:py-20" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
            {subtitle ? (
              <p className="mt-2 max-w-xl text-sm text-zinc-600 md:text-base">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href="/collections"
            className="mt-4 inline-flex w-fit text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline cursor-pointer md:mt-0"
          >
            View all collections
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {rows.map((row) => {
            const src =
              row.imageOverride?.trim() ||
              row.category.image?.trim() ||
              "/logo-transparent.png";
            const title = row.titleOverride?.trim() || row.category.name;
            return (
              <Link
                key={row.id}
                href={`/products?category=${row.category.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/80 cursor-pointer"
              >
                <Image
                  src={src}
                  alt={title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-base font-semibold text-white md:text-lg">{title}</p>
                  <p className="mt-1 text-xs text-white/85">
                    {row.category.productsCount} styles
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
