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
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8">
        <div className="text-center py-8">
          <p className="text-gray-400">Product details not available</p>
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
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8 scroll-auto overflow-x-auto max-md:py-5">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={"ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`p-0 font-semibold transition-colors rounded-lg z-50 ${
              activeTab === tab.id
                ? "bg-brand-gradient text-white"
                : "text-white hover:text-white"
            }`}
          >
            <div className={cn("p-2 px-4", activeTab === tab.id && "bg-gradient-to-r from-gray-300 to-black")}>{tab.label}</div>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="text-white rounded-2xl  backdrop-blur-sm bg-black/50">
        {activeTab === "description" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl p-4">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {product.longDescription || "No detailed description available."}
              </p>
            </div>
            <div className="rounded-2xl p-4">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              {product.keyFeatures && product.keyFeatures.length > 0 ? (
                <ul className="space-y-3">
                  {product.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No key features listed.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-6">Specifications</h3>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-gray-700">
                    <span className="font-medium text-gray-300">{spec.label}:</span>
                    <span className="text-white text-right flex-1 ml-4">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Free shipping on orders over 50 KWD</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Standard delivery: 3-5 business days</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Express delivery: 1-2 business days (additional charges apply)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Same-day delivery available in Kuwait City</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-4">Returns & Exchanges</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">30-day return policy for all items</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Items must be in original condition with tags attached</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Free returns for defective or damaged items</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Exchange available for different sizes or colors</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">Refunds processed within 5-7 business days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTabs;
