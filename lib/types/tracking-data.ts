import { OrderItem, Product } from "@prisma/client";
import { Customer } from "./customer";

export interface TrackingData {
  orderNumber: string;
  trackingNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  carrier: string;
  currentLocation: string;
  orderDate: string;
  shippedDate: string;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface TimelineEvent {
  status: string;
  date: string;
  location: string;
  completed: boolean;
  description: string;
}

export interface TrackOrderHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
  ctaText?: string;
  onCtaClick?: () => void;
  mapImage?: string;
  statusBadgeText?: string;
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

export interface SearchFormProps {
  trackingInput: string;
  isSearching: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface OrderStatusProps {
  trackingData: TrackingData | null;
  isLoading: boolean;
}

export interface TimelineProps {
  timeline: TimelineEvent[];
  currentStatus: string;
}

export interface OrderItemsProps {
  items: (OrderItem & {
    product: Product;
  })[];
}

export interface ShippingInfoProps {
  shippingAddress: ShippingAddress;
  estimatedDelivery: string;
  carrier: string;
}