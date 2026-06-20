"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodProps {
  paymentData: {
    selectedPaymentType: string;
    saveCard: boolean;
  };
  onPaymentDataChange: (data: {
    paymentMethod?: string;
    paymentStatus?: string;
    selectedPaymentType?: string;
    saveCard?: boolean;
  }) => void;
  onProceed: () => void;
  onOrderSubmit: (e: React.FormEvent) => Promise<string | null>;
  orderId?: string | null;
  totalAmount: number;
  isFormValid?: boolean;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  onPaymentDataChange,
  onProceed,
  onOrderSubmit,
  isFormValid,
}) => {
  const [selectedPaymentType] = useState("cod");
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!selectedPaymentType) {
      setValidationErrors({ paymentMethod: "Please select a payment method" });
      return;
    }

    setProcessing(true);

    try {
      onPaymentDataChange({
        paymentMethod: selectedPaymentType,
        paymentStatus: "pending",
      });

      const createdOrderId = await onOrderSubmit(e);
      if (!createdOrderId) {
        setValidationErrors({ general: "Failed to create order" });
        setProcessing(false);
        return;
      }

      toast.success("Order placed with Cash on Delivery!");
      onProceed();
    } catch (error) {
      console.log("Payment error:", error);
      setValidationErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-zinc-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-zinc-900">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
            2
          </div>
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              Payment Options
            </h3>

            {validationErrors.paymentMethod && (
              <p className="text-sm text-red-600">
                {validationErrors.paymentMethod}
              </p>
            )}

            <div
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ring-2 ring-zinc-900 transition-all ${
                validationErrors.paymentMethod
                  ? "border-red-500"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-900">
                  <div className="h-3 w-3 rounded-full bg-zinc-900" />
                </div>
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-zinc-700" />
                  <span className="text-base font-medium text-zinc-900">
                    Cash on Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {validationErrors.general && (
            <p className="mt-4 text-sm text-red-600">
              {validationErrors.general}
            </p>
          )}

          <div className="flex justify-center pt-6">
            <button
              type="button"
              disabled={processing || !isFormValid}
              onClick={handleSubmit}
              className="flex cursor-pointer items-center justify-center rounded-none rounded-tr-2xl rounded-bl-2xl bg-zinc-900 px-12 py-3 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base font-bold text-white">
                {processing ? "Processing..." : "Place Order"}
              </span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethod;
