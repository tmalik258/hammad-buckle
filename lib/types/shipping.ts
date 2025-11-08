// Shipping-related type definitions

export interface CustomShippingMethod {
  id: string;
  name: string;
  description?: string;
  code: string; // Unique identifier for the method
  type: 'standard' | 'express' | 'overnight' | 'same_day' | 'pickup' | 'digital' | 'custom';
  carrier: 'ups' | 'fedex' | 'dhl' | 'usps' | 'royal_mail' | 'canada_post' | 'custom' | 'local';
  serviceCode?: string; // Carrier-specific service code
  isActive: boolean;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'archived';
  availability: {
    countries: string[]; // ISO country codes
    regions: string[]; // State/province codes
    postalCodes: string[]; // Specific postal codes or patterns
    excludedAreas: string[];
  };
  pricing: {
    type: 'flat_rate' | 'weight_based' | 'price_based' | 'zone_based' | 'calculated' | 'free';
    baseRate: number;
    currency: string;
    freeShippingThreshold?: number;
    weightRanges?: Array<{
      minWeight: number;
      maxWeight: number;
      rate: number;
    }>;
    priceRanges?: Array<{
      minPrice: number;
      maxPrice: number;
      rate: number;
    }>;
    zoneRates?: Array<{
      zoneId: string;
      rate: number;
    }>;
  };
  delivery: {
    estimatedDays: {
      min: number;
      max: number;
    };
    cutoffTime?: string; // HH:mm format
    processingDays: number;
    businessDaysOnly: boolean;
    trackingAvailable: boolean;
    signatureRequired: boolean;
    insuranceIncluded: boolean;
    maxInsuranceValue?: number;
  };
  restrictions: {
    minWeight?: number;
    maxWeight?: number;
    minDimensions?: {
      length: number;
      width: number;
      height: number;
    };
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
    prohibitedItems: string[];
    hazardousMaterials: boolean;
    perishableItems: boolean;
    fragileItems: boolean;
  };
  metadata: {
    apiCredentials?: {
      accountNumber?: string;
      accessKey?: string;
      secretKey?: string;
      testMode: boolean;
    };
    webhookUrl?: string;
    customFields?: Record<string, unknown>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  type: 'country' | 'state' | 'postal_code' | 'custom';
  locations: Array<{
    type: 'country' | 'state' | 'city' | 'postal_code';
    code: string;
    name: string;
  }>;
  methods: Array<{
    methodId: string;
    isActive: boolean;
    customRate?: number;
    customDeliveryDays?: {
      min: number;
      max: number;
    };
  }>;
  isActive: boolean;
  priority: number; // Higher priority zones are checked first
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  id: string;
  methodId: string;
  zoneId?: string;
  name: string;
  rate: number;
  currency: string;
  conditions: {
    minWeight?: number;
    maxWeight?: number;
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    maxQuantity?: number;
    productCategories?: string[];
    customerGroups?: string[];
  };
  delivery: {
    estimatedDays: {
      min: number;
      max: number;
    };
    cutoffTime?: string;
  };
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingFormData {
  name: string;
  description?: string;
  code: string;
  type: 'standard' | 'express' | 'overnight' | 'same_day' | 'pickup' | 'digital' | 'custom';
  carrier: 'ups' | 'fedex' | 'dhl' | 'usps' | 'royal_mail' | 'canada_post' | 'custom' | 'local';
  serviceCode?: string;
  isActive: boolean;
  isDefault: boolean;
  availability: {
    countries: string[];
    regions: string[];
    postalCodes: string[];
    excludedAreas: string[];
  };
  pricing: {
    type: 'flat_rate' | 'weight_based' | 'price_based' | 'zone_based' | 'calculated' | 'free';
    baseRate: number;
    currency: string;
    freeShippingThreshold?: number;
    weightRanges?: Array<{
      minWeight: number;
      maxWeight: number;
      rate: number;
    }>;
    priceRanges?: Array<{
      minPrice: number;
      maxPrice: number;
      rate: number;
    }>;
  };
  delivery: {
    estimatedDays: {
      min: number;
      max: number;
    };
    cutoffTime?: string;
    processingDays: number;
    businessDaysOnly: boolean;
    trackingAvailable: boolean;
    signatureRequired: boolean;
    insuranceIncluded: boolean;
  };
  restrictions: {
    minWeight?: number;
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
    prohibitedItems: string[];
    hazardousMaterials: boolean;
    perishableItems: boolean;
    fragileItems: boolean;
  };
}

export interface ShippingCalculation {
  id: string;
  orderId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    category: string;
  }>;
  origin: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  availableMethods: Array<{
    methodId: string;
    name: string;
    rate: number;
    currency: string;
    estimatedDelivery: {
      min: number;
      max: number;
    };
    trackingAvailable: boolean;
    insuranceIncluded: boolean;
  }>;
  selectedMethodId?: string;
  totalWeight: number;
  totalValue: number;
  calculatedAt: string;
}

export interface ShippingLabel {
  id: string;
  orderId: string;
  shipmentId?: string;
  methodId: string;
  trackingNumber: string;
  labelUrl: string;
  labelFormat: 'pdf' | 'png' | 'zpl' | 'epl';
  cost: number;
  currency: string;
  status: 'created' | 'printed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  carrier: string;
  serviceCode: string;
  packageInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    packageType: string;
    insuranceValue?: number;
    signatureRequired: boolean;
  };
  addresses: {
    from: {
      name: string;
      company?: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    to: {
      name: string;
      company?: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
  };
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
}

export interface ShippingTracking {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
  statusDescription: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: Array<{
    timestamp: string;
    status: string;
    description: string;
    location?: {
      city: string;
      state: string;
      country: string;
    };
  }>;
  lastUpdated: string;
}