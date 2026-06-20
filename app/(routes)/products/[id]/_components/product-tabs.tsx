"use client";

import { useState } from "react";
import { ProductTabsSkeleton } from "../../_components/product-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function ProductTabs({ product, loading = false }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");

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

  const tabs = [
    { id: "description" as TabType, label: "Description" },
    { id: "specifications" as TabType, label: "Specifications" },
    { id: "shipping" as TabType, label: "Shipping" },
    { id: "returns" as TabType, label: "Returns" },
  ];

  return (
    <div className="rounded-2xl p-8">
      <div className="mb-8 flex space-x-4 overflow-x-auto scroll-auto max-md:py-5">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg p-0 font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <div className="px-4 py-2">{tab.label}</div>
          </Button>
        ))}
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
                "Free shipping on orders over 50 KWD",
                "Standard delivery: 3-5 business days",
                "Express delivery: 1-2 business days (additional charges apply)",
                "Same-day delivery available in Kuwait City",
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
