"use client";

import type { Category, HeroSlide, HomePromoBanner, Product } from "@prisma/client";
import type { HomeCategorySpotlight, HomeProductPick, StorefrontSettings } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorefrontSettingsTab } from "./storefront-settings-tab";
import { StorefrontHeroTab } from "./storefront-hero-tab";
import { StorefrontMerchTab } from "./storefront-merch-tab";

type SpotlightRow = HomeCategorySpotlight & { category: Category };
type PickRow = HomeProductPick & { product: Pick<Product, "id" | "name"> };

type Props = {
  initialSettings: StorefrontSettings | null;
  heroSlides: HeroSlide[];
  spotlights: SpotlightRow[];
  picks: PickRow[];
  promos: HomePromoBanner[];
  categories: Category[];
  products: Pick<Product, "id" | "name">[];
};

export function StorefrontAdminClient({
  initialSettings,
  heroSlides,
  spotlights,
  picks,
  promos,
  categories,
  products,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storefront</h1>
        <p className="text-muted-foreground">
          Manage the public home page: announcement, hero carousel, merchandising, and promos.
        </p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="settings" className="cursor-pointer">
            Settings & SEO
          </TabsTrigger>
          <TabsTrigger value="hero" className="cursor-pointer">
            Hero slides
          </TabsTrigger>
          <TabsTrigger value="merch" className="cursor-pointer">
            Merchandising
          </TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="mt-6">
          <StorefrontSettingsTab initial={initialSettings} />
        </TabsContent>
        <TabsContent value="hero" className="mt-6">
          <StorefrontHeroTab slides={heroSlides} />
        </TabsContent>
        <TabsContent value="merch" className="mt-6">
          <StorefrontMerchTab
            spotlights={spotlights}
            picks={picks}
            promos={promos}
            categories={categories}
            products={products}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
