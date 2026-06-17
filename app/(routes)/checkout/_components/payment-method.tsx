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
  paymentData,
  onPaymentDataChange,
  onProceed,
  onOrderSubmit,
  totalAmount,
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
    <Card className="bg-white/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            2
          </div>
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="space-y-4">
            <h3 className="text-purple-200 text-lg font-semibold">
              Payment Options
            </h3>

            {validationErrors.paymentMethod && (
              <p className="text-red-400 text-sm">
                {validationErrors.paymentMethod}
              </p>
            )}

            <div
              className={`bg-black/50 border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ring-2 ring-purple-500 border-purple-500 ${
                validationErrors.paymentMethod
                  ? "border-red-500"
                  : "border-purple-400/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <Banknote className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-base font-medium">
                    Cash on Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {validationErrors.general && (
            <p className="text-red-400 text-sm mt-4">
              {validationErrors.general}
            </p>
          )}

          <div className="flex justify-center pt-6">
            <button
              type="button"
              disabled={processing || !isFormValid}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-12 py-3 flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="text-white text-base font-bold">
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
