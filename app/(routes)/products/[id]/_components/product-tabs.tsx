"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ProductTabsSkeleton } from "../../_components/product-skeleton";
import { cn } from "@/lib/utils";
import { SITE_CURRENCY } from "@/lib/site-metadata";

interface Specification {
  label: string;
  value: string;
}

interface Product {
  longDescription?: string;
  keyFeatures: string[];
  specifications: Specification[];
}

interface ProductTabsProps {
  product?: Product;
  loading?: boolean;
}

type TabType = "description" | "specifications" | "shipping" | "returns";

const TABS: { id: TabType; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns" },
];

export function ProductTabs({ product, loading = false }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateIndicator = useCallback(() => {
    const list = listRef.current;
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const tab = tabRefs.current[index];
    if (!list || !tab) return;

    setIndicator({
      left: tab.offsetLeft,
      width: tab.offsetWidth,
      ready: true,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();

    const list = listRef.current;
    if (!list) return;

    const resizeObserver = new ResizeObserver(() => updateIndicator());
    resizeObserver.observe(list);
    tabRefs.current.forEach((tab) => {
      if (tab) resizeObserver.observe(tab);
    });

    window.addEventListener("resize", updateIndicator);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  if (loading) {
    return <ProductTabsSkeleton />;
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="py-8 text-center">
          <p className="text-zinc-600">Product details not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-8">
      <div
        ref={listRef}
        className="relative mb-8 flex max-w-full gap-3 overflow-x-auto scroll-smooth max-md:py-1 sm:gap-4"
        role="tablist"
        aria-label="Product details"
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 h-full rounded-lg bg-zinc-900",
            indicator.ready
              ? "transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              : "opacity-0"
          )}
          style={{ left: indicator.left, width: indicator.width }}
        />

        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative z-10 cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:text-base",
                isActive
                  ? "text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
        {activeTab === "description" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl p-4">
              <h3 className="mb-4 text-xl font-semibold">Description</h3>
              <p className="mb-6 leading-relaxed text-zinc-600">
                {product.longDescription || "No detailed description available."}
              </p>
            </div>
            <div className="rounded-2xl p-4">
              <h3 className="mb-4 text-xl font-semibold">Key Features</h3>
              {product.keyFeatures && product.keyFeatures.length > 0 ? (
                <ul className="space-y-3">
                  {product.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-900" />
                      <span className="text-zinc-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500">No key features listed.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="rounded-2xl p-4">
            <h3 className="mb-6 text-xl font-semibold">Specifications</h3>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between border-b border-zinc-200 py-3">
                    <span className="font-medium text-zinc-600">{spec.label}:</span>
                    <span className="ml-4 flex-1 text-right text-zinc-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="rounded-2xl p-4">
            <h3 className="mb-4 text-xl font-semibold">Shipping Information</h3>
            <div className="space-y-4">
              {[
                `Free shipping on orders over 50 ${SITE_CURRENCY}`,
                "Standard delivery: 3-5 business days",
                "Express delivery: 1-2 business days (additional charges apply)",
                "Same-day delivery available in Lahore",
              ].map((text) => (
                <div key={text} className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-900" />
                  <p className="text-zinc-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="rounded-2xl p-4">
            <h3 className="mb-4 text-xl font-semibold">Returns & Exchanges</h3>
            <div className="space-y-4">
              {[
                "30-day return policy for all items",
                "Items must be in original condition with tags attached",
                "Free returns for defective or damaged items",
                "Exchange available for different sizes or colors",
                "Refunds processed within 5-7 business days",
              ].map((text) => (
                <div key={text} className="flex items-start space-x-3">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-900" />
                  <p className="text-zinc-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTabs;
