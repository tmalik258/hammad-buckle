"use client";

import { useParams, useRouter } from "next/navigation";
import { useProduct, useRelatedProducts } from "@/lib/hooks/useProductQueries";
import { useCartStore, useWishlistStore } from "@/lib/stores";
import { toast } from "sonner";
import ProductImages from "./_components/product-images";
import ProductInfo from "./_components/product-info";
import ProductTabs from "./_components/product-tabs";
import RelatedProducts from "./_components/related-products";
import {
  ProductError,
  ProductDetailSkeleton,
} from "../_components/product-skeleton";

// Transform hook product data to component format
const transformProduct = (hookProduct: {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  inStock?: boolean | null;
  stockQuantity?: number | null;
  images?: string[];
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    value: string;
  }>;
}) => {
  if (!hookProduct) return null;

  return {
    id: hookProduct.id,
    name: hookProduct.name,
    price: `${hookProduct.price} KWD`,
    originalPrice: hookProduct.originalPrice
      ? `${hookProduct.originalPrice} KWD`
      : undefined,
    description: hookProduct.description || null,
    longDescription: hookProduct.description || undefined,
    rating: hookProduct.averageRating || 0,
    reviewCount: hookProduct.reviewCount || 0,
    inStock: hookProduct.inStock ?? true,
    stockCount: hookProduct.stockQuantity || 0,
    sizes:
      hookProduct.variants
        ?.filter((variant) => variant.name === "size")
        .map((v) => v.value) || [],
    colors:
      hookProduct.variants
        ?.filter((variant) => variant.name === "color")
        ?.map((variant) => ({
          name: variant.value,
          value: getColorValue(variant.value),
        })) || [],
    keyFeatures: [],
    specifications: [],
    images: (() => {
      const allImages: string[] = [];
      // Always add product.image as the first image if it exists
      if (hookProduct.image) {
        allImages.push(hookProduct.image);
      }
      // Add other images from the images array, excluding duplicates
      if (hookProduct.images && hookProduct.images.length > 0) {
        hookProduct.images.forEach((img) => {
          if (img && !allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }
      return allImages;
    })(),
    image: hookProduct.image || undefined,
  };
};

const transformRelatedProducts = (
  products: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    averageRating?: number | null;
    image?: string | null;
    images?: string[];
  }>
) => {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: product.description || undefined,
    price: product.price,
    rating: product.averageRating || 0,
    image: product.image || product.images?.[0] || "/placeholder-product.jpg",
  }));
};

const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    silver: "#C0C0C0",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    yellow: "#FFFF00",
    pink: "#FFC0CB",
    purple: "#800080",
    orange: "#FFA500",
    brown: "#A52A2A",
    gray: "#808080",
    grey: "#808080",
  };
  return colorMap[colorName.toLowerCase()] || "#000000";
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const {
    data: hookProduct,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productId);
  const {
    data: hookRelatedProducts,
    isLoading: relatedLoading,
    error: relatedError,
  } = useRelatedProducts(productId);

  // Cart and wishlist stores
  const { addItem: addToCart, setLoading: setCartLoading } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();

  const product = hookProduct ? transformProduct(hookProduct) : null;
  const relatedProducts = hookRelatedProducts
    ? transformRelatedProducts(hookRelatedProducts)
    : [];

  // Handle add to cart with validation
  const handleAddToCart = async (
    productId: string,
    size: string,
    color: string
  ) => {
    if (!product) {
      toast.error("Product information not available");
      return;
    }

    // Validate stock availability
    if (!product.inStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    // Validate size selection if sizes are available
    if (product.sizes.length > 0 && !size) {
      toast.error("Please select a size");
      return;
    }

    try {
      setCartLoading(true);

      // Prepare cart item data (id is generated automatically by the store)
      const cartItem = {
        id: `${product.id}-${Date.now()}`, // Temporary id for the store
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(" KWD", "")),
        originalPrice: product.originalPrice
          ? parseFloat(product.originalPrice.replace(" KWD", ""))
          : undefined,
        image: product.images[0] || "/placeholder-product.jpg",
        size: size || undefined,
        color: color || undefined,
        quantity: 1,
      };

      addToCart(cartItem);

      // Success feedback is handled by the cart store
    } catch (error) {
      console.log("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = async (productId: string) => {
    if (!product) {
      toast.error("Product information not available");
      return;
    }

    try {
      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(" KWD", "")),
        image: product.images?.[0] || "/placeholder-product.jpg",
        category: "General", // Default category
        inStock: product.inStock,
      };

      addToWishlist(wishlistItem);

      // Success feedback is handled by the wishlist store
    } catch (error) {
      console.log("Failed to add item to wishlist:", error);
      toast.error("Failed to add item to wishlist. Please try again.");
    }
  };

  // Handle buy now - add to cart and redirect to checkout
  const handleBuyNow = async (
    productId: string,
    size: string,
    color: string
  ) => {
    // First add to cart
    await handleAddToCart(productId, size, color);

    // Then redirect to checkout
    router.push("/checkout");
  };

  if (productLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-20">
        <div className="container mx-auto px-4 pb-8">
          <ProductError />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-20 pb-8">
      <div className="container mx-auto space-y-8 px-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {product.images ? (
            <ProductImages
              images={product.images}
              productName={product.name}
              loading={false}
            />
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-center text-zinc-600 shadow-sm">
              No Image
            </div>
          )}
          <ProductInfo
            product={product}
            loading={false}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onBuyNow={handleBuyNow}
          />
        </div>
        <ProductTabs product={product} loading={false} />
        <RelatedProducts
          products={relatedProducts}
          loading={relatedLoading}
          error={relatedError}
        />
      </div>
    </div>
  );
}
