"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { ProductInfoSkeleton } from "../../_components/product-skeleton";
import { Product as PrismaProduct } from "@prisma/client";
import { useAuth } from "@/lib/hooks/useAuth";

interface Product
  extends Pick<PrismaProduct, "id" | "name" | "description" | "rating"> {
  price: string;
  originalPrice?: string;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sizes: string[];
  colors: { name: string; value: string }[];
}

interface ProductInfoProps {
  product?: Product;
  loading?: boolean;
  onAddToCart?: (productId: string, size: string, color: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onBuyNow?: (productId: string, size: string, color: string) => void;
}

export function ProductInfo({
  product,
  loading = false,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { isAuthenticated } = useAuth();

  if (loading) {
    return <ProductInfoSkeleton />;
  }

  if (!product) {
    return (
      <div className="space-y-6 text-zinc-900">
        <div className="py-8 text-center">
          <p className="text-zinc-600">Product information not available</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, selectedSize, selectedColor);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product.id, selectedSize, selectedColor);
    }
  };

  return (
    <div className="space-y-6 text-zinc-900">
      <div>
        <h1 className="z-[1000] mb-4 text-3xl font-bold">{product.name}</h1>
        <p className="text-lg leading-relaxed text-zinc-600">{product.description}</p>
      </div>

      <div className="flex flex-col-reverse justify-between gap-2">
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-zinc-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-xl text-zinc-400 line-through">{product.originalPrice}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.floor(product.rating)
                    ? "fill-zinc-900 text-zinc-900"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`cursor-pointer rounded-lg border px-4 py-2 font-medium transition-all ${
                  selectedSize === size
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`relative h-10 w-10 cursor-pointer rounded-full border-2 transition-all ${
                  selectedColor === color.name
                    ? "scale-110 border-zinc-900"
                    : "border-zinc-300 hover:border-zinc-500"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {selectedColor === color.name && (
                  <div className="absolute inset-0 rounded-full border-2 border-white" />
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="mt-2 text-sm capitalize text-zinc-600">Selected: {selectedColor}</p>
          )}
        </div>
      )}

      {isAuthenticated && (
        <div className="grid grid-cols-2 items-start justify-start gap-4 md:grid-cols-3">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="flex-1 cursor-pointer bg-zinc-900 py-3 text-lg font-semibold text-white hover:bg-zinc-800"
            disabled={!product.inStock || (!selectedSize && product.sizes.length > 0)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            variant="outline"
            size="lg"
            className="cursor-pointer border-zinc-900 py-3 text-lg font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white"
            disabled={!product.inStock || (!selectedSize && product.sizes.length > 0)}
          >
            Buy Now
          </Button>
        </div>
      )}

      {isAuthenticated && product.sizes && product.sizes.length > 0 && !selectedSize && (
        <p className="text-sm text-amber-600">Please select a size to continue</p>
      )}
    </div>
  );
}

export default ProductInfo;
