import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

// Re-export Prisma enums for convenience
export { OrderStatus, PaymentStatus };

// Order with all relations for display
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            image: true;
            price: true;
          };
        };
      };
    };
    shippingAddress: true;
    billingAddress: true;
    timeline: {
      orderBy: {
        timestamp: 'desc';
      };
    };
    payment: true;
  };
}>;

// Simplified order for list display
export type OrderListItem = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
    shippingAddress: {
      select: {
        city: true;
        area: true;
      };
    };
  };
}>;

// Form data interface for creating/updating orders
export interface OrderFormData {
  userId: string;
  orderNumber?: string;
  status?: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  shippingAddressId?: string;
  billingAddressId?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date | string;
  deliveredAt?: Date | string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

// Interface for order timeline entries
export interface OrderTimelineFormData {
  status: string;
  description: string;
  timestamp?: Date | string;
}

// Interface for order update data
export interface OrderUpdateData {
  status?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  timelineEntry?: OrderTimelineFormData;
}

// Interface for order filters and search params
export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interface for orders API
export interface OrdersResponse {
  orders: OrderListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Order status display configuration
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳'
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: '✅'
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    icon: '⚙️'
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800',
    icon: '🚚'
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-orange-100 text-orange-800',
    icon: '🚛'
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: '📦'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌'
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
    icon: '💰'
  }
} as const;