"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useCartStore } from "@/lib/stores/cart-store";
import { useUserStore } from "@/lib/stores/user-store";
import { ErrorComponent } from "@/components/ui/error-component";
import {
  OrderSummary,
  ShippingInformation,
  PaymentMethod,
  CheckoutPageSkeleton,
} from "./_components";
import type { PromoCodeValidationResponse, PromoCodeApplicationResponse } from "@/lib/types/promo-code";

export default function CheckoutPage() {
  const { items: cartItems, getTotalPrice, clearCart, clearCartSilently } = useCartStore();
  const { profile, isAuthenticated } = useUserStore();
  const router = useRouter();

  console.log(profile?.id)

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard");
  // Removed currentStep state for single-page layout
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    area: "",
    postalCode: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0);
  const [isApplyingPromoCode, setIsApplyingPromoCode] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",

    // Shipping Information
    street: "",
    city: "",
    area: "",
    postalCode: "",
  });

  // State to store created order ID
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // State to track form validation
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation function
  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      area: "",
      postalCode: "",
    };

    try {
      // Personal Information
      if (!formData.name.trim()) {
        errors.name = "Full name is required";
      }
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email";
      }
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (
        !/^[\+]?[1-9][\d]{0,15}$/.test(
          formData.phone.replace(/[\s\-\(\)]/g, "")
        )
      ) {
        errors.phone = "Please enter a valid phone number";
      }

      // Shipping Address (street is optional)
      if (!formData.city.trim()) {
        errors.city = "City is required";
      }
      if (!formData.area.trim()) {
        errors.area = "Area is required";
      }
      if (!formData.postalCode.trim()) {
        errors.postalCode = "Postal code is required";
      } else if (formData.postalCode.trim().length < 3) {
        errors.postalCode = "Please enter a valid postal code";
      }

      setFormErrors(errors);

      // Check if all required fields are valid (no errors for required fields)
      const hasErrors =
        errors.name ||
        errors.email ||
        errors.phone ||
        errors.city ||
        errors.area ||
        errors.postalCode;

      return !hasErrors;
    } catch (error) {
      console.log("Form validation error:", error);
      return false;
    }
  };

  // Handle successful payment completion - only called after order is fully processed
  const handlePaymentSuccess = () => {
    // Clear cart silently without showing notification for checkout completion
    clearCartSilently();
    // Redirect to order confirmed page with the created order ID
    if (createdOrderId) {
      router.push(`/order-confirmed?orderId=${createdOrderId}`);
    } else {
      router.push(`/order-confirmed`);
    }
  };

  // Payment data for PaymentMethod component
  const [paymentData, setPaymentData] = useState({
    selectedPaymentType: "card",
    saveCard: false,
  });

  // Wrapper function to handle PaymentMethod's onPaymentDataChange
  const handlePaymentDataChange = (data: {
    paymentMethod?: string;
    paymentStatus?: string;
    selectedPaymentType?: string;
    saveCard?: boolean;
  }) => {
    setPaymentData(prev => ({
      selectedPaymentType: data.selectedPaymentType ?? prev.selectedPaymentType,
      saveCard: data.saveCard ?? prev.saveCard,
    }));
  };

  // Check if cart is empty and redirect
  useEffect(() => {
    setIsLoading(false);
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Redirecting to shop...");
      router.push("/products");
    }
    console.log("Cart Items", cartItems)
  }, [router]);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = promoCodeDiscount;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  // Initialize form validation on component mount
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, []);

  // Show loading skeleton while checking cart
  if (isLoading) {
    return <CheckoutPageSkeleton />;
  }

  // Show error if cart is empty
  if (cartItems.length === 0) {
    return (
      <ErrorComponent
        title="Cart is Empty"
        message="Your cart is empty. Please add some items before proceeding to checkout."
      />
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate form whenever input changes
    setTimeout(() => {
      const isValid = validateForm();
      setIsFormValid(isValid);
    }, 100);
  };

  // Handle promo code application
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a valid promo code");
      return;
    }

    if (appliedPromoCode === promoCode.trim()) {
      toast.info("This promo code is already applied");
      return;
    }

    setIsApplyingPromoCode(true);

    try {
      // First validate the promo code
      const validationResponse = await axios.post<PromoCodeValidationResponse>(
        "/api/promo-codes/validate",
        {
          code: promoCode.trim(),
          orderTotal: subtotal + shipping + tax
        }
      );

      if (!validationResponse.data.valid) {
        toast.error(validationResponse.data.error || "Invalid promo code");
        return;
      }

      // Apply the promo code
      const applicationResponse = await axios.post<PromoCodeApplicationResponse>(
        "/api/promo-codes/apply",
        {
          code: promoCode.trim(),
          orderTotal: subtotal + shipping + tax
        }
      );

      if (applicationResponse.data.success) {
        setAppliedPromoCode(promoCode.trim());
        setPromoCodeDiscount(applicationResponse.data.discountAmount ?? 0);
        toast.success(
          `Promo code applied! You saved KWD ${applicationResponse.data.discountAmount?.toFixed(2) || '0'}`
        );
      } else {
        toast.error(applicationResponse.data.error || "Failed to apply promo code");
      }
    } catch (error) {
      console.error("Promo code application error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to apply promo code. Please try again.");
      }
    } finally {
      setIsApplyingPromoCode(false);
    }
  };

  // Handle promo code removal
  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCodeDiscount(0);
    setPromoCode("");
    toast.success("Promo code removed");
  };

  // Validate shipping address with API
  const validateShippingAddress = async () => {
    try {
      const addressData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        area: formData.area,
        postalCode: formData.postalCode,
      };

      const response = await fetch("/api/shipping/validate-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();

      if (!result.isValid) {
        const errorMessage = result.issues?.join(', ') || 'Invalid address';
        toast.error(`Address validation failed: ${errorMessage}`);
        return false;
      }

      // Show suggestions if any (non-blocking)
      if (result.suggestions && result.suggestions.length > 0) {
        toast.info(`Suggestion: ${result.suggestions.join(', ')}`);
      }

      return true;
    } catch (error) {
      console.log("Address validation error:", error);
      // If the API fails, we'll continue with the checkout process
      toast.warning("Address validation service unavailable, proceeding with checkout");
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<string | null> => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated || !profile?.id) {
      toast.error("Please log in to complete your order");
      router.push("/auth/login");
      return null;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting");
      return null;
    }

    toast.info("Submitting order...");

    try {
      // Validate shipping address
      const isAddressValid = await validateShippingAddress();
      if (!isAddressValid) {
        return null;
      }

      // Prepare order data for submission (matching API schema)
      const orderData = {
        userId: profile.id, // Get actual user ID from auth context
        items: cartItems.map((item) => ({
          productId: item.productId, // Use the actual productId, not the timestamp-modified id
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          name: formData.name,
          street: formData.street,
          city: formData.city,
          area: formData.area,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        discount: discount,
        totalAmount: total,
        promoCode: appliedPromoCode,
      };

      // Submit order to API
      const response = await fetch("/api/orders/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!result.success) {
        // Handle specific error types
        const errorCode = result.error?.code || "unknown_error";
        const errorMessage = result.error?.message || "Failed to place order";

        switch (errorCode) {
          case "validation_error":
            toast.error(`Validation error: ${errorMessage}`);
            break;
          case "payment_failed":
            toast.error(
              `Payment failed: ${errorMessage}. Please check your payment details and try again.`
            );
            break;
          case "order_submission_failed":
            toast.error(
              `Order submission failed: ${errorMessage}. Please try again later.`
            );
            break;
          default:
            toast.error(errorMessage);
        }

        return null;
      }

      console.log("Order placed successfully:", result);
      toast.success("Order placed successfully!");

      // Set the created order ID
      setCreatedOrderId(result.orderId || null);

      // DO NOT clear cart or redirect here - let payment processing complete first
      // The handlePaymentSuccess function will handle clearing cart and redirecting

      // Return the order ID for payment processing
      return result.orderId || null;
    } catch (error: unknown) {
      console.log("Order failed:", error);

      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          toast.error(
            "Network error: Unable to connect to the server. Please check your internet connection and try again."
          );
        } else if (error.name === "SyntaxError") {
          toast.error(
            "Server returned an invalid response. Please try again later."
          );
        } else {
          toast.error(
            error.message || "Failed to place order. Please try again."
          );
        }

        // Log detailed error for debugging
        console.log("Detailed error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      } else {
        toast.error("Failed to place order. Please try again.");
        console.log("Unknown error:", error);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", isActive: true },
  ];

  return (
    <div className="min-h-screen md:pt-20">
      {/* Removed HeroSection */}

      <div className="container mx-auto px-4 pb-16">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <ShippingInformation
                formData={formData}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                selectedMethod={selectedShippingMethod}
                onMethodChange={setSelectedShippingMethod}
              />

              {/* Payment Method */}
              <PaymentMethod
                paymentData={paymentData}
                onPaymentDataChange={handlePaymentDataChange}
                onProceed={handlePaymentSuccess}
                onOrderSubmit={handleSubmit}
                orderId={createdOrderId}
                totalAmount={total}
                isFormValid={isFormValid}
              />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={discount}
                  total={total}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  applyPromoCode={applyPromoCode}
                  appliedPromoCode={appliedPromoCode}
                  removePromoCode={removePromoCode}
                  isApplyingPromoCode={isApplyingPromoCode}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
