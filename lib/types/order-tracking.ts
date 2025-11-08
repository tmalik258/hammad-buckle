import { OrderStatus } from "@prisma/client";
import { OrderItem } from "../generated/prisma";

// Order tracking related types
export interface TrackingInfo {
  orderNumber: string;
  trackingNumber?: string;
  status: OrderStatus;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  carrier?: string;
  shippingMethod: string;
}

export type OrderStatusType = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderStatusEvent {
  id: string;
  status: OrderStatusType;
  title: string;
  description: string;
  timestamp: Date;
  location?: string;
  completed: boolean;
}

export interface TrackingFormData {
  orderNumber: string;
  email?: string;
  zipCode?: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatusType;
  placedAt: Date;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  tracking?: TrackingInfo;
}

export interface TrackingState {
  formData: TrackingFormData;
  orderDetails: OrderDetails | null;
  isLoading: boolean;
  error: string | null;
  searched: boolean;
}

// Predefined status events for consistent tracking
export const ORDER_STATUS_EVENTS: Record<OrderStatusType, { title: string; description: string }> = {
  pending: {
    title: 'Order Placed',
    description: 'Your order has been received and is being reviewed.',
  },
  confirmed: {
    title: 'Order Confirmed',
    description: 'Your order has been confirmed and payment processed.',
  },
  processing: {
    title: 'Processing',
    description: 'Your order is being prepared for shipment.',
  },
  shipped: {
    title: 'Shipped',
    description: 'Your order has been shipped and is on its way.',
  },
  out_for_delivery: {
    title: 'Out for Delivery',
    description: 'Your order is out for delivery and will arrive soon.',
  },
  delivered: {
    title: 'Delivered',
    description: 'Your order has been successfully delivered.',
  },
  cancelled: {
    title: 'Cancelled',
    description: 'Your order has been cancelled.',
  },
  returned: {
    title: 'Returned',
    description: 'Your order has been returned.',
  },
};