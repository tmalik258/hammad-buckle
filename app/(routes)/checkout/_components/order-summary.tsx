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
  isApplyingPromoCode = false
}: OrderSummaryProps) => {
  return (
    <Card className="sticky top-4 bg-white/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 flex-shrink-0 bg-purple-500/20 rounded-lg p-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-white">
                    &quot;{item.name}&quot;
                  </h4>
                  <p className="text-xs text-purple-300">
                    {item.size && `Size: ${item.size}`}
                    {item.color && `, Color: ${item.color}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-white">
                  KWD {item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-purple-500/30" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-purple-200">
            <span>Subtotal</span>
            <span>KWD {subtotal.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm text-purple-200">
            <span>Shipping</span>
            <span>KWD {shipping.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-sm text-purple-200">
            <span>Tax (5%)</span>
            <span>KWD {tax.toFixed(3)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Discount</span>
              <span>-KWD {discount.toFixed(3)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-white pt-2">
            <span>Total</span>
            <span className="text-purple-300">KWD {total.toFixed(3)}</span>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Promo Code</h3>
          {appliedPromoCode ? (
            <div className="flex items-center justify-between p-3 bg-green-800/20 border border-green-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-700 text-green-100">
                  {appliedPromoCode}
                </Badge>
                <span className="text-sm text-green-400">Applied</span>
              </div>
              <Button
                onClick={removePromoCode}
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-800/30 p-1 h-auto"
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
                className="bg-purple-800/30 border-purple-600 text-white placeholder:text-purple-300"
                disabled={isApplyingPromoCode}
              />
              <Button
                onClick={applyPromoCode}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-700 hover:text-white"
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
        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="flex justify-between font-bold text-lg text-white">
            <span>Total Amount:</span>
            <span className="text-purple-300">KWD {total.toFixed(3)}</span>
          </div>
          <p className="text-xs text-purple-200 mt-2">
            Complete all steps to place your order
          </p>
        </div>
      </CardContent>
    </Card>
  );
};