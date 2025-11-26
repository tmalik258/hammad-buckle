"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ErrorComponent } from "@/components/ui/error-component";
import { CartSkeleton } from "@/components/ui/route-skeletons";
 
import { Trash2, Plus, Minus, Heart, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items: cartItems,
    loading,
    error,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCartStore();
  
  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const taxVat = Math.round(subtotal * 0.15); // 15% tax
  const finalTotal = subtotal + taxVat;

  // Loading state
  if (loading) {
    return <CartSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16">
          <ErrorComponent
            title="Cart Error"
            message={error}
            onRefresh={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen md:pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full"
                style={{
                  background: "#000000",
                  opacity: 0.05,
                  boxShadow: `
                    0 0 200px 100px rgba(0, 0, 0, 0.3),
                    0 0 400px 200px rgba(0, 0, 0, 0.2),
                    0 0 800px 400px rgba(0, 0, 0, 0.1)
                  `,
                  filter: "blur(400px)",
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="bg-black/40 border border-purple-500/30 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <ShoppingBag className="h-24 w-24 text-black mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
                <p className="text-gray-300 mb-8 leading-relaxed">Looks like you haven&apos;t added anything to your cart yet. Start exploring our amazing products!</p>
              </div>
              
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-black hover:from-purple-700 hover:to-black text-white cursor-pointer px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", isActive: true }
  ];

  return (
    <div className="min-h-screen bg-black md:pt-20">
      {/* Removed HeroSection */}

      {/* Discount Badge */}
      {/* <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-start">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 flex items-center space-x-3">
            <div className="bg-white rounded-full p-2">
              <span className="text-purple-600 font-bold text-lg">%</span>
            </div>
            <div className="text-white">
              <p className="font-semibold">Get 50% off with code WIZZAFY</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Your Cart</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg p-2">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                            <div className="text-purple-200 text-sm mt-1">
                              <p>Size: {item.size}</p>
                              <p>Color: {item.color}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="font-bold text-white">KMC {item.price.toLocaleString()}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-purple-300 line-through">
                                  KMC {item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loading}
                              className="text-purple-300 hover:text-white cursor-pointer"
                              onClick={() => {
                                // TODO: Integrate with wishlist store
                                toast.success("Added to wishlist");
                              }}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={loading}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || loading}
                              className="border-purple-500/50 text-white hover:bg-purple-500/20 cursor-pointer"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={loading}
                              className="border-purple-500/50 text-white hover:bg-purple-500/20 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">
                              KMC {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                <div className="space-y-4 text-white">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">{subtotal.toFixed(3)} KWD</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-purple-200">Tax/VAT</span>
                    <span>{taxVat.toFixed(3)} KWD</span>
                  </div>
                  
                  <Separator className="bg-purple-500/30" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(3)} KWD</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    size="lg" 
                    disabled={loading || cartItems.length === 0}
                    className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    asChild
                  >
                    <Link href={"/checkout"}>{loading ? "Processing..." : "Proceed to Checkout"}</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-purple-500/50 text-white hover:bg-purple-500/20 cursor-pointer"
                    asChild
                  >
                    <Link href={"/products"}>Continue to Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
