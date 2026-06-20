"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorComponent } from "@/components/ui/error-component";
import { CartSkeleton } from "@/components/ui/route-skeletons";

import { Trash2, Plus, Minus, Heart, ShoppingBag } from "lucide-react";
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
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const taxVat = Math.round(subtotal * 0.15);
  const finalTotal = subtotal + taxVat;

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-20">
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
      <div className="min-h-screen bg-zinc-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="relative z-10">
              <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-zinc-400" />
                <h1 className="mb-4 text-3xl font-bold text-zinc-900">Your cart is empty</h1>
                <p className="mb-8 leading-relaxed text-zinc-600">
                  Looks like you haven&apos;t added anything to your cart yet. Start exploring our
                  amazing products!
                </p>
              </div>

              <Link href="/products">
                <Button
                  size="lg"
                  className="cursor-pointer rounded-xl bg-zinc-900 px-8 py-3 text-lg font-semibold text-white hover:bg-zinc-800"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900">Your Cart</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border-zinc-200 bg-white shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-zinc-100 p-2">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900">{item.name}</h3>
                            <div className="mt-1 text-sm text-zinc-600">
                              <p>Size: {item.size}</p>
                              <p>Color: {item.color}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="font-bold text-zinc-900">
                                KMC {item.price.toLocaleString()}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-zinc-400 line-through">
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
                              className="cursor-pointer text-zinc-600 hover:text-zinc-900"
                              onClick={() => {
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
                              className="cursor-pointer text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || loading}
                              className="cursor-pointer border-zinc-300 text-zinc-900 hover:bg-zinc-100"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-zinc-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={loading}
                              className="cursor-pointer border-zinc-300 text-zinc-900 hover:bg-zinc-100"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-zinc-900">
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
            <Card className="sticky top-4 rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <h2 className="mb-6 text-xl font-semibold text-zinc-900">Order Summary</h2>

                <div className="space-y-4 text-zinc-900">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">{subtotal.toFixed(3)} KWD</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Tax/VAT</span>
                    <span>{taxVat.toFixed(3)} KWD</span>
                  </div>

                  <Separator className="bg-zinc-200" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(3)} KWD</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    size="lg"
                    disabled={loading || cartItems.length === 0}
                    className="w-full cursor-pointer bg-zinc-900 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    asChild
                  >
                    <Link href="/checkout">{loading ? "Processing..." : "Proceed to Checkout"}</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full cursor-pointer border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                    asChild
                  >
                    <Link href="/products">Continue to Shopping</Link>
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
