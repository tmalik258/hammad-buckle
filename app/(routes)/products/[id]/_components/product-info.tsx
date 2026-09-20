"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { ProductInfoSkeleton } from "../../_components/product-skeleton";
import { Product as PrismaProduct } from "@prisma/client";

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
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0] ?? "");
    setSelectedColor(product.colors[0]?.name ?? "");
  }, [product?.id]);

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

  const activeSize = selectedSize || product.sizes[0] || "";
  const activeColor = selectedColor || product.colors[0]?.name || "";

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, activeSize, activeColor);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product.id, activeSize, activeColor);
    }
  };

  return (
    <div className="space-y-6 text-zinc-900">
      <div>
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{product.name}</h1>
        <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
          {product.description}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.price}</span>
          {product.originalPrice ? (
            <span className="text-lg text-zinc-400 line-through sm:text-xl">
              {product.originalPrice}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
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

      {product.sizes.length > 0 ? (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`cursor-pointer rounded-lg border px-4 py-2 font-medium transition-all ${
                  activeSize === size
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {product.colors.length > 0 ? (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`relative h-10 w-10 cursor-pointer rounded-full border-2 transition-all ${
                  activeColor === color.name
                    ? "scale-110 border-zinc-900"
                    : "border-zinc-300 hover:border-zinc-500"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {activeColor === color.name ? (
                  <div className="absolute inset-0 rounded-full border-2 border-white" />
                ) : null}
              </button>
            ))}
          </div>
          {activeColor ? (
            <p className="mt-2 text-sm capitalize text-zinc-600">Selected: {activeColor}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleAddToCart}
          size="lg"
          className="w-full cursor-pointer bg-zinc-900 text-base font-semibold text-white hover:bg-zinc-800 sm:flex-1 sm:text-lg"
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5 shrink-0" />
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          variant="outline"
          size="lg"
          className="w-full cursor-pointer border-zinc-900 text-base font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white sm:flex-1 sm:text-lg"
          disabled={!product.inStock}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}

export default ProductInfo;
