import Image from "next/image";
import Link from "next/link";
import { PromoBannerLayout } from "@prisma/client";

type Banner = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string;
  href: string;
  layout: PromoBannerLayout;
};

type Props = {
  banners: Banner[];
};

export function StorefrontPromoBanners({ banners }: Props) {
  if (!banners.length) return null;

  return (
    <div className="space-y-10 py-14 md:py-16">
      {banners.map((b) => {
        const isFull = b.layout === PromoBannerLayout.FULL_WIDTH;
        const imageLeft = b.layout === PromoBannerLayout.SPLIT_LEFT_IMAGE;

        if (isFull) {
          return (
            <section key={b.id} className="relative mx-auto max-w-7xl overflow-hidden px-4">
              <Link href={b.href} className="relative block aspect-[21/9] min-h-[220px] overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer md:min-h-[280px]">
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-90" sizes="100vw" />
                <div className="absolute inset-0 flex flex-col justify-center bg-black/35 p-8 md:p-12">
                  <h3 className="max-w-xl text-2xl font-semibold text-white md:text-4xl">{b.title}</h3>
                  {b.body ? (
                    <p className="mt-3 max-w-xl text-sm text-white/90 md:text-base">{b.body}</p>
                  ) : null}
                  <span className="mt-6 inline-flex w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900">
                    Shop now
                  </span>
                </div>
              </Link>
            </section>
          );
        }

        return (
          <section key={b.id} className="mx-auto max-w-7xl px-4" aria-label={b.title}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80">
              <div className="grid md:grid-cols-2">
                <div
                  className={`relative aspect-[4/3] md:aspect-auto md:min-h-[320px] ${imageLeft ? "md:order-first" : "md:order-last"}`}
                >
                  <Link href={b.href} className="relative block h-full min-h-[240px] cursor-pointer md:min-h-[320px]">
                    <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </Link>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{b.title}</h3>
                  {b.body ? <p className="mt-4 text-zinc-600">{b.body}</p> : null}
                  <Link
                    href={b.href}
                    className="mt-8 inline-flex w-fit rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 cursor-pointer"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
