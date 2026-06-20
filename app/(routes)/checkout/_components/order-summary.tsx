"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import Image from "next/image";
import { CartItem } from "@/lib/stores/cart-store";

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  promoCode?: string;
  setPromoCode?: (value: string) => void;
  applyPromoCode?: () => void;
  appliedPromoCode?: string | null;
  removePromoCode?: () => void;
  isApplyingPromoCode?: boolean;
}

export const OrderSummary = ({
  cartItems,
  subtotal,
  shipping,
  tax,
  discount = 0,
  total,
  promoCode = "",
  setPromoCode = () => {},
  applyPromoCode = () => {},
  appliedPromoCode = null,
  removePromoCode = () => {},
  isApplyingPromoCode = false,
}: OrderSummaryProps) => {
  return (
    <Card className="sticky top-4 rounded-2xl border-zinc-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-zinc-900">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-zinc-100 p-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-zinc-900">
                    &quot;{item.name}&quot;
                  </h4>
                  <p className="text-xs text-zinc-600">
                    {item.size && `Size: ${item.size}`}
                    {item.color && `, Color: ${item.color}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">
                  KWD {item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-zinc-200" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>KWD {subtotal.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Shipping</span>
            <span>KWD {shipping.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Tax (5%)</span>
            <span>KWD {tax.toFixed(3)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-KWD {discount.toFixed(3)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-lg font-bold text-zinc-900">
            <span>Total</span>
            <span>KWD {total.toFixed(3)}</span>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-zinc-900">Promo Code</h3>
          {appliedPromoCode ? (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {appliedPromoCode}
                </Badge>
                <span className="text-sm text-green-600">Applied</span>
              </div>
              <Button
                onClick={removePromoCode}
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-green-600 hover:bg-green-100 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
                disabled={isApplyingPromoCode}
              />
              <Button
                onClick={applyPromoCode}
                variant="outline"
                className="cursor-pointer border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                disabled={isApplyingPromoCode || !promoCode.trim()}
              >
                {isApplyingPromoCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Order Total Summary */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex justify-between text-lg font-bold text-zinc-900">
            <span>Total Amount:</span>
            <span>KWD {total.toFixed(3)}</span>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            Complete all steps to place your order
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
