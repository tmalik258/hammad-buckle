"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { Product, Category, Review } from "@prisma/client";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { ProductWithRelations } from "@/lib/hooks/useProductQueries";

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
      : "/images/logo.png";

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group border content-rounded-xl overflow-hidden transition-all duration-300 cursor-pointer p-0 h-full">
        <CardContent className="p-4 bg-card/80 h-full">
          <div className="relative rounded-2xl">
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-[200px] object-cover rounded-2xl"
            />
            {product.onSale && (
              <Badge className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-primary text-primary-foreground text-xs px-2 py-1">
                Sale
              </Badge>
            )}
            {/* Wishlist Heart Icon */}
            <button
              onClick={handleWishlistClick}
              className="absolute top-2 lg:top-3 right-2 lg:right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 z-10"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 lg:h-5 lg:w-5 transition-all duration-200 ${
                  isWishlisted
                    ? "fill-primary text-primary scale-110"
                    : "text-muted-foreground hover:text-primary"
                }`}
              />
            </button>
            {/* {product.isNew && (
              <Badge className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-green-500 text-white text-xs px-2 py-1">
                New
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge className="bg-red-500 text-white">
                  Out of Stock
                </Badge>
              </div>
            )} */}
          </div>

          <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
            <h3 className="font-bold text-foreground text-sm sm:text-base lg:text-lg group-hover:text-primary transition-colors line-clamp-2">
              &quot;{product.name}&quot;
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              Lightweight, breathable, perfect for running
            </p>
            <div className="flex items-center justify-between h-full flex-row-reverse">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 lg:h-4 lg:w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-col mt-auto">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                  {product.price} KWD
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {product.originalPrice} KWD
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