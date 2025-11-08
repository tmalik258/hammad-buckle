"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { ProductInfoSkeleton } from "../../_components/product-skeleton";
import { Product as PrismaProduct } from "@prisma/client";
import { useAuth } from "@/lib/hooks/useAuth";

// Extended interface for product info with computed UI fields
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
  onAddToWishlist,
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
      <div className="space-y-6 text-white">
        <div className="text-center py-8">
          <p className="text-gray-400">Product information not available</p>
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

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Product Name and Description */}
      <div>
        <h1 className="text-3xl font-bold mb-4 z-[1000]">{product.name}</h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price and Rating */}
      <div className="flex flex-col-reverse gap-2 justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-pink-400">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xl text-gray-500 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.floor(product.rating)
                    ? "fill-pink-400 text-pink-400"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stock Status */}
      {/* <div className="flex items-center space-x-2">
        <Badge 
          variant={product.inStock ? "default" : "destructive"}
          className={product.inStock ? "bg-green-500" : ""}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </Badge>
        {product.inStock && product.stockCount <= 10 && (
          <span className="text-orange-400 text-sm">
            Only {product.stockCount} left!
          </span>
        )}
      </div> */}

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                  selectedSize === size
                    ? "border-pink-400 bg-pink-400 text-white"
                    : "border-gray-600 text-gray-300 hover:border-pink-400 hover:text-pink-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === color.name
                    ? "border-pink-400 scale-110"
                    : "border-gray-600 hover:border-gray-400"
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
            <p className="text-sm text-gray-400 mt-2 capitalize">
              Selected: {selectedColor}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isAuthenticated && (
        <div className="space-y-4 grid grid-cols-2 md:grid-cols-3 gap-4 items-start justify-start">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="flex-1 bg-brand-gradient text-white py-3 text-lg font-semibold cursor-pointer"
            disabled={
              !product.inStock || (!selectedSize && product.sizes.length > 0)
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            variant="outline"
            size="lg"
            className="bg-brand-gradient text-white hover:bg-white  py-3 text-lg font-semibold cursor-pointer"
            disabled={
              !product.inStock || (!selectedSize && product.sizes.length > 0)
            }
          >
            Buy Now
          </Button>
        </div>
      )}

      {/* Size Guide Note */}
      {isAuthenticated &&
        product.sizes &&
        product.sizes.length > 0 &&
        !selectedSize && (
          <p className="text-sm text-orange-400">
            Please select a size to continue
          </p>
        )}
    </div>
  );
}

export default ProductInfo;
