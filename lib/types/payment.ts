// Payment-related type definitions

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash' | 'crypto' | 'apple_pay' | 'google_pay';
  provider: 'stripe' | 'paypal' | 'square' | 'razorpay' | 'mollie' | 'adyen' | 'braintree' | 'authorize_net';
  providerTransactionId?: string;
  providerPaymentId?: string;
  description?: string;
  metadata: {
    customerIp?: string;
    userAgent?: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    shippingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  fees: {
    processingFee: number;
    platformFee: number;
    totalFees: number;
  };
  refunds: Array<{
    id: string;
    amount: number;
    reason: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    processedAt?: string;
  }>;
  disputes: Array<{
    id: string;
    amount: number;
    reason: string;
    status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost';
    evidence?: Record<string, unknown>;
    createdAt: string;
    dueBy?: string;
  }>;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  fraudFlags?: string[];
  capturedAt?: string;
  authorizedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'stripe' | 'cash';
  icon: string;
  description?: string;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  paymentMethodId?: string;
  clientSecret: string;
  provider: 'stripe' | 'paypal' | 'square' | 'razorpay' | 'mollie' | 'adyen';
  providerIntentId: string;
  description?: string;
  metadata: Record<string, unknown>;
  setupFutureUsage?: 'on_session' | 'off_session';
  captureMethod: 'automatic' | 'manual';
  confirmationMethod: 'automatic' | 'manual';
  paymentMethodTypes: string[];
  nextAction?: {
    type: string;
    redirectToUrl?: {
      url: string;
      returnUrl: string;
    };
    useStripeSdk?: Record<string, unknown>;
  };
  lastPaymentError?: {
    code: string;
    message: string;
    type: string;
  };
  receiptEmail?: string;
  shipping?: {
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    name: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  canceledAt?: string;
  cancellationReason?: string;
}

export interface PaymentFormData {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  receiptEmail?: string;
}