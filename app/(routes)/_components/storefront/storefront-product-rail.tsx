"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductWithRelations } from "@/lib/hooks/useProductQueries";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductWithRelations[];
  viewAllHref: string;
  viewAllLabel?: string;
};

export function StorefrontProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View all",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-20" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
            {subtitle ? (
              <p className="mt-2 max-w-xl text-sm text-zinc-600 md:text-base">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50"
              aria-label="Scroll products left"
              onClick={() => scrollBy(-320)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50"
              aria-label="Scroll products right"
              onClick={() => scrollBy(320)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <Link
              href={viewAllHref}
              className="ml-2 text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline cursor-pointer"
            >
              {viewAllLabel}
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:gap-6"
        >
          {products.map((product) => {
            const img =
              product.image ||
              (product.images?.length ? product.images[0] : "/logo-transparent.png");
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[280px] cursor-pointer"
              >
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80 transition hover:shadow-md">
                  <div className="relative aspect-[4/5] bg-zinc-100">
                    <Image src={img} alt={product.name} fill className="object-cover" sizes="280px" />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="line-clamp-2 font-medium text-zinc-900">{product.name}</p>
                    <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
