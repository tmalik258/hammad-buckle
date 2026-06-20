"use client";

import { Suspense } from "react";
import OrderContent from "./_components/order-confirmed/order-content";

// Main page component with Suspense
export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 pt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
            <p className="text-lg font-medium text-zinc-900">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
