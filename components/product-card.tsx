"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { Product, Category, Review } from "@prisma/client";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { ProductWithRelations } from "@/lib/hooks/useProductQueries";
import { LOGO_PATH, SITE_CURRENCY } from "@/lib/site-metadata";

export type CardProductType = Product & {
  category?: Category | string;
  reviews?: Review[] | number;
};

// Simplified product type for transformed data
export type TransformedProductType = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  rating: number;
  image: string;
  originalPrice?: number;
  inStock?: boolean;
  category?: string;
  onSale?: boolean;
};

interface ProductCardProps {
  product: ProductWithRelations | CardProductType | TransformedProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle different product types for category name
    let categoryName = 'Unknown';
    if ('category' in product && product.category) {
      if (typeof product.category === 'string') {
        categoryName = product.category;
      } else if (typeof product.category === 'object' && 'name' in product.category) {
        categoryName = product.category.name;
      }
    }
    
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: categoryName,
      inStock: product.inStock ?? true,
    });
  };

  // Ensure a valid, non-empty src string for Image to avoid runtime warnings
  const imageSrc =
    typeof product.image === "string" && product.image.trim() !== ""
      ? product.image
      : LOGO_PATH;

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="group h-full overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm transition-shadow duration-300 cursor-pointer hover:shadow-md">
        <CardContent className="h-full bg-white p-4">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-100">
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={200}
              className="h-[200px] w-full object-cover rounded-2xl"
            />
            {product.onSale && (
              <Badge className="absolute top-2 left-2 bg-zinc-900 px-2 py-1 text-xs text-white lg:top-3 lg:left-3">
                Sale
              </Badge>
            )}
            <button
              onClick={handleWishlistClick}
              className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-white p-2 text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 lg:top-3 lg:right-3"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-200 lg:h-5 lg:w-5 ${
                  isWishlisted
                    ? "fill-zinc-900 text-zinc-900 scale-110"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2 p-3 lg:space-y-3 lg:p-4">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 sm:text-base lg:text-lg">
              {product.name}
            </h3>
            <p className="line-clamp-2 text-xs leading-6 text-zinc-600 sm:text-sm">
              Lightweight, breathable, perfect for running
            </p>
            <div className="mt-auto flex flex-row-reverse items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 lg:h-4 lg:w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-auto flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 sm:text-base lg:text-lg">
                  {product.price} {SITE_CURRENCY}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-zinc-500 line-through">
                    {product.originalPrice} {SITE_CURRENCY}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;
