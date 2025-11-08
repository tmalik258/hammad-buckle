import { PaymentMethod } from "./account";

// Checkout related types
export interface CheckoutFormData {
  // Contact Information
  email: string;
  phone: string;
  
  // Shipping Address
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Billing Address
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Payment
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  
  // Options
  saveAddress: boolean;
  sameAsBilling: boolean;
  newsletter: boolean;
}

export interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

export interface CustomShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  selected: boolean;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

export interface CheckoutState {
  currentStep: number;
  steps: CheckoutStep[];
  formData: Partial<CheckoutFormData>;
  shippingMethods: CustomShippingMethod[];
  selectedShippingMethod: string | null;
  paymentMethods: PaymentMethod[];
  orderSummary: OrderSummary;
  isProcessing: boolean;
  errors: Record<string, string>;
}