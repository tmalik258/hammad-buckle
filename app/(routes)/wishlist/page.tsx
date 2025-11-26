"use client";

import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem, toggleItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  const handleAddToCart = async (item: {
    id: string;
    productId?: string;
    name: string;
    price: number;
    image: string;
    inStock: boolean;
  }) => {
    try {
      // Check if item is in stock
      if (!item.inStock) {
        toast.error(`${item.name} is currently out of stock`);
        return;
      }

      // Fetch product with variants
      const response = await fetch(`/api/products/${item.productId || item.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const product = await response.json();
      
      // Check if product has variants
      if (!product.variants || product.variants.length === 0) {
        toast.error(`${item.name} has no available variants`);
        return;
      }

      // Select the first variant
      const firstVariant = product.variants[0];
      
      // Check variant stock
      if (firstVariant.stock <= 0) {
        toast.error(`${item.name} (${firstVariant.name}: ${firstVariant.value}) is out of stock`);
        return;
      }

      // Create cart item with variant data
      const cartItem = {
        productId: item.productId || item.id,
        id: firstVariant.id,
        name: item.name,
        price: firstVariant.price ? item.price + firstVariant.price : item.price, // Add variant price modifier to base price
        image: item.image, // Use item image since variants don't have images
        quantity: 1,
        inStock: firstVariant.stock > 0,
        size: firstVariant.name === 'Size' ? firstVariant.value : undefined,
        color: firstVariant.name === 'Color' ? firstVariant.value : undefined,
        variant: `${firstVariant.name}: ${firstVariant.value}`,
      };

      // Add to cart
      addToCart(cartItem);
      
      toast.success(`${item.name} (${firstVariant.name}: ${firstVariant.value}) added to cart`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Wishlist", isActive: true },
  ];

  return (
    <div className="container mx-auto min-h-screen md:pt-20">
      {/* Removed HeroSection */}

      {/* Wishlist Content */}
      <div className="container mx-auto px-4 lg:px-0 pb-16">
        <h2 className="text-3xl lg:text-4xl font-semibold mb-8">
          Your Wishlist
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <Heart className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-400 mb-6">
                Start adding products you love to your wishlist
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-purple-400 to-black hover:from-purple-500 hover:to-black px-8 py-3 rounded-xl font-semibold">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
                >
                  <CardContent className="p-4">
                    {/* Stock Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className={`px-3 py-1 text-sm font-medium rounded-tr-2xl rounded-bl-2xl ${
                          item.inStock
                            ? "bg-gradient-to-r from-purple-400 to-black"
                            : "bg-purple-400"
                        }`}
                      >
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    {/* Product Image */}
                    <div className="relative mb-4">
                      <Image
                        src={
                          item.image ||
                          "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder%20image&image_size=square"
                        }
                        alt={item.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold line-clamp-2">
                        {item.name}
                      </h3>
                      {/* <p className="text-gray-300 text-sm line-clamp-2">
                        {item.description ||
                          "Premium quality product with excellent features."}
                      </p> */}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-black bg-clip-text text-transparent">
                          {item.price} KWD
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Heart Icon */}
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveFromWishlist(item.id, item.name);
                            }}
                            className="p-0 transition-all duration-200"
                            variant="link"
                          >
                            <Trash2 className="w-5 h-5 text-black hover:text-black" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            variant="link"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-black border-0 px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-black"
                >
                  <ArrowLeft className="w-4 h-4 rotate-90" />
                  Back to Profile
                </Button>
              </Link>

              <Link href="/products">
                <Button className="bg-gradient-to-r from-purple-400 to-black hover:from-purple-500 hover:to-black px-6 py-3 rounded-xl font-semibold">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
