export interface StripeCard {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  funding: string;
}

export interface StripeBillingDetails {
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  } | null;
  email: string | null;
  name: string | null;
  phone: string | null;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card: StripeCard | null;
  billingDetails: StripeBillingDetails;
  isDefault: boolean;
  created: number;
}

export interface PaymentMethodsResponse {
  paymentMethods: StripePaymentMethod[];
}

export interface AddPaymentMethodRequest {
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface AddPaymentMethodResponse {
  paymentMethod: StripePaymentMethod;
  message: string;
}

export interface SetDefaultPaymentMethodRequest {
  paymentMethodId: string;
}

export interface PaymentMethodResponse {
  message: string;
  wasDefault?: boolean;
}