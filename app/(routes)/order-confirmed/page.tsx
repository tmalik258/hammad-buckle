"use client";

import { Suspense } from "react";
import OrderContent from "./_components/order-confirmed/order-content";

// Main page component with Suspense
export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
