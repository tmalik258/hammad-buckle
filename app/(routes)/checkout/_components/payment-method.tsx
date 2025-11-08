"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, Banknote, Shield } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_..."
);

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
  onOrderSubmit: (e: React.FormEvent) => Promise<string | null>; // Function to create order and return orderId
  orderId?: string | null;
  totalAmount: number;
  isFormValid?: boolean;
}

// Stripe Elements styling to match the design
const stripeElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "transparent",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

// Payment Form Component (inside Stripe Elements)
const PaymentForm: React.FC<{
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
  orderId?: string | null;
  onOrderSubmit: (e: React.FormEvent) => Promise<string | null>; // Function to create order and return orderId
  totalAmount: number;
  isFormValid?: boolean;
}> = ({
  paymentData,
  onPaymentDataChange,
  onProceed,
  orderId,
  onOrderSubmit,
  totalAmount,
  isFormValid,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPaymentType, setSelectedPaymentType] = useState(
    paymentData.selectedPaymentType || "card"
  );
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous validation errors
    setValidationErrors({});

    // Validate payment method selection
    if (!selectedPaymentType) {
      setValidationErrors({ paymentMethod: "Please select a payment method" });
      return;
    }

    setProcessing(true);

    try {
      // Update parent component with payment data
      onPaymentDataChange({
        paymentMethod: selectedPaymentType,
        paymentStatus: "pending",
      });

      // First, create the order to get the orderId
      const createdOrderId = await onOrderSubmit(e);
      if (!createdOrderId) {
        setValidationErrors({ general: "Failed to create order" });
        setProcessing(false);
        return;
      }

      
      if (selectedPaymentType === "card") {
        toast.info("Processing card payment...");

        // Validate Stripe elements
        if (!stripe || !elements) {
          setValidationErrors({
            card: "Payment system not loaded. Please refresh the page.",
          });
          setProcessing(false);
          return;
        }

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
          setValidationErrors({ card: "Card information is required" });
          setProcessing(false);
          return;
        }

        // Create payment method
        const { error: paymentMethodError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
          });

        if (paymentMethodError) {
          setValidationErrors({
            card: paymentMethodError.message || "Card validation failed",
          });
          setProcessing(false);
          return;
        }

        // Create payment intent with the actual orderId
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrderId,
            amount: totalAmount, // Send amount in dollars, API will convert to cents
          }),
        });

        if (!response.ok) {
          setValidationErrors({ card: "Failed to create payment intent" });
          setProcessing(false);
          return;
        }

        const { clientSecret, customerId } = await response.json();

        // Confirm payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: paymentMethod.id,
          }
        );

        if (confirmError) {
          setValidationErrors({
            card: confirmError.message || "Payment confirmation failed",
          });
          setProcessing(false);
          return;
        }

        // Process payment success directly on frontend
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Send payment success data to server
          const paymentSuccessResponse = await fetch("/api/payments/process-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: createdOrderId,
              paymentIntentId: paymentIntent.id,
              customerId: customerId,
              paymentMethodId: paymentIntent.payment_method,
              amount: totalAmount,
              status: 'PAID'
            }),
          });

          if (!paymentSuccessResponse.ok) {
            console.log("Failed to process payment success on server");
            setValidationErrors({ card: "Payment succeeded but failed to update order status" });
            setProcessing(false);
            return;
          }

          toast.success("Payment successful!");
          onProceed();
        } else {
          setValidationErrors({
            card: "Payment was not completed successfully",
          });
          setProcessing(false);
          return;
        }
      } else if (selectedPaymentType === "cod") {
        // Handle Cash on Delivery - order already created above
        toast.success("Order placed with Cash on Delivery!");
        onProceed();
      }
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

  const handlePaymentTypeChange = (type: string) => {
    setSelectedPaymentType(type);
    onPaymentDataChange({
      ...paymentData,
      selectedPaymentType: type,
    });
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
          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-purple-200 text-lg font-semibold">
              Payment Options
            </h3>

            {/* Display payment method selection error */}
            {validationErrors.paymentMethod && (
              <p className="text-red-400 text-sm">
                {validationErrors.paymentMethod}
              </p>
            )}

            {/* Credit/Debit Card Option */}
            <div
              className={`bg-black/50 border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
                selectedPaymentType === "card"
                  ? "ring-2 ring-purple-500 border-purple-500"
                  : ""
              } ${
                validationErrors.paymentMethod
                  ? "border-red-500"
                  : "border-purple-400/50"
              }`}
              onClick={() => handlePaymentTypeChange("card")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                  {selectedPaymentType === "card" && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-base font-medium">
                    Credit / Debit Card
                  </span>
                </div>
              </div>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Card Details Section */}
          {selectedPaymentType === "card" && (
            <div className="space-y-4">
              <h3 className="text-purple-200 text-lg font-semibold">
                Card Details
              </h3>

              {/* Card Number */}
              <div>
                <Label className="text-purple-200 text-sm font-medium mb-2 block">
                  Card Number *
                </Label>
                <div
                  className={`bg-black/50 border rounded-lg p-4 focus-within:border-purple-400 transition-colors ${
                    validationErrors.cardNumber ||
                    validationErrors.cardDetails ||
                    validationErrors.cardValidation
                      ? "border-red-500"
                      : "border-purple-400/50"
                  }`}
                >
                  <CardNumberElement options={stripeElementOptions} />
                </div>
                {(validationErrors.cardNumber ||
                  validationErrors.cardDetails) && (
                  <p className="text-red-400 text-sm mt-1">
                    {validationErrors.cardNumber ||
                      validationErrors.cardDetails}
                  </p>
                )}
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200 text-sm font-medium mb-2 block">
                    Expiry Date *
                  </Label>
                  <div
                    className={`bg-black/50 border rounded-lg p-4 focus-within:border-purple-400 transition-colors ${
                      validationErrors.cardDetails ||
                      validationErrors.cardValidation
                        ? "border-red-500"
                        : "border-purple-400/50"
                    }`}
                  >
                    <CardExpiryElement options={stripeElementOptions} />
                  </div>
                </div>

                <div>
                  <Label className="text-purple-200 text-sm font-medium mb-2 block">
                    CVC *
                  </Label>
                  <div
                    className={`bg-black/50 border rounded-lg p-4 focus-within:border-purple-400 transition-colors ${
                      validationErrors.cardDetails ||
                      validationErrors.cardValidation
                        ? "border-red-500"
                        : "border-purple-400/50"
                    }`}
                  >
                    <CardCvcElement options={stripeElementOptions} />
                  </div>
                </div>
              </div>

              {/* Display card validation errors */}
              {validationErrors.cardValidation && (
                <p className="text-red-400 text-sm mt-2">
                  {validationErrors.cardValidation}
                </p>
              )}
            </div>
          )}

          {/* Alternative Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-purple-200 text-lg font-semibold">
              Other Payment Options
            </h3>

            {/* Cash on Delivery */}
            <div
              className={`bg-black/50 border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
                selectedPaymentType === "cod"
                  ? "ring-2 ring-purple-500 border-purple-500"
                  : ""
              } ${
                validationErrors.paymentMethod
                  ? "border-red-500"
                  : "border-purple-400/50"
              }`}
              onClick={() => handlePaymentTypeChange("cod")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                  {selectedPaymentType === "cod" && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Banknote className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-base font-medium">
                    Cash on Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Wallets */}
            <div
              className={`bg-black/50 border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 ${
                selectedPaymentType === "wallet"
                  ? "ring-2 ring-purple-500 border-purple-500"
                  : ""
              } ${
                validationErrors.paymentMethod
                  ? "border-red-500"
                  : "border-purple-400/50"
              }`}
              onClick={() => handlePaymentTypeChange("wallet")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center">
                  {selectedPaymentType === "wallet" && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-base font-medium">
                    Apple Pay / Google Pay / KNET
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center pt-6">
            <button
              type="button"
              disabled={!stripe || processing || !isFormValid}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-12 py-3 flex items-center justify-center transition-all"
            >
              <span className="text-white text-base font-bold">
                {processing ? "Processing..." : "Proceed to Payment"}
              </span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main PaymentMethod component wrapped with Stripe Elements
const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentData,
  onPaymentDataChange,
  onProceed,
  onOrderSubmit,
  orderId,
  totalAmount,
  isFormValid,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        paymentData={paymentData}
        onPaymentDataChange={onPaymentDataChange}
        onProceed={onProceed}
        onOrderSubmit={onOrderSubmit}
        orderId={orderId}
        totalAmount={totalAmount}
        isFormValid={isFormValid}
      />
    </Elements>
  );
};

export default PaymentMethod;
