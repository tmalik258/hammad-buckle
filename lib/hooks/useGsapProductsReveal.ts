"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Stagger-fade product cards when the product list changes. */
export function useGsapProductsReveal(depsKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cards = root.querySelectorAll<HTMLElement>("[data-product-card]");
    if (!cards.length) return;

    if (prefersReducedMotion()) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }, root);

    return () => ctx.revert();
  }, [depsKey]);

  return containerRef;
}

/** One-shot fade-in for toolbar / chips strip. */
export function useGsapToolbarReveal() {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return toolbarRef;
}
