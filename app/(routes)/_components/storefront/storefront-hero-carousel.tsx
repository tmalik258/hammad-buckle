"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

type Props = {
  slides: HeroSlide[];
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StorefrontHeroCarousel({ slides }: Props) {
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [autoplay.current]
  );
  const [selected, setSelected] = useState(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const animateSlideContent = useCallback((index: number) => {
    const el = contentRefs.current[index];
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el.children, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el.children,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        overwrite: true,
      }
    );
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelected(index);
      animateSlideContent(index);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, animateSlideContent]);

  if (!slides.length) {
    return (
      <section className="relative bg-zinc-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-zinc-600">Add hero slides in Admin → Storefront.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-zinc-50">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative h-[100svh] min-h-[680px] w-full">
                {slide.imageMobile?.trim() ? (
                  <Image
                    src={slide.imageMobile}
                    alt={slide.heading}
                    fill
                    priority={slide.sortOrder === 0}
                    className="object-cover md:hidden"
                    sizes="100vw"
                  />
                ) : null}
                <Image
                  src={slide.imageDesktop}
                  alt={slide.heading}
                  fill
                  priority={slide.sortOrder === 0}
                  className={
                    slide.imageMobile?.trim()
                      ? "hidden object-cover md:block"
                      : "object-cover"
                  }
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
                <div
                  ref={(node) => {
                    contentRefs.current[index] = node;
                  }}
                  className="absolute inset-0 flex flex-col justify-end p-6 pb-16 md:p-12 md:pb-20 lg:max-w-2xl"
                >
                  {slide.badgeText ? (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      {slide.badgeText}
                    </span>
                  ) : null}
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
                    {slide.heading}
                  </h1>
                  {slide.subheading ? (
                    <p className="mt-3 max-w-xl text-base text-white/90 md:text-lg">
                      {slide.subheading}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={slide.primaryCtaHref}
                      className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-none rounded-tr-2xl rounded-bl-2xl bg-white px-6 py-2.5 text-sm font-semibold tracking-wide text-zinc-900 shadow-sm transition hover:bg-zinc-100"
                    >
                      {slide.primaryCtaLabel}
                    </Link>
                    {slide.secondaryCtaLabel && slide.secondaryCtaHref ? (
                      <Link
                        href={slide.secondaryCtaHref}
                        className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-none rounded-tr-2xl rounded-bl-2xl border border-white/70 bg-transparent px-6 py-2.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition hover:bg-white/10"
                      >
                        {slide.secondaryCtaLabel}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-between px-4 md:px-8">
        <button
          type="button"
          onClick={scrollPrev}
          className="pointer-events-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-lg ring-1 ring-black/5 transition hover:bg-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="pointer-events-auto flex gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-md">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 w-2 cursor-pointer rounded-full transition",
                i === selected ? "w-6 bg-white" : "bg-white/40 hover:bg-white/70"
              )}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={scrollNext}
          className="pointer-events-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-lg ring-1 ring-black/5 transition hover:bg-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
