// Dashboard-related type definitions

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export interface RevenueChart {
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  totalRevenue: number;
  averageDaily: number;
  growth: number;
}

export interface ActivityFeed {
  id: string;
  type: 'order' | 'customer' | 'product' | 'payment' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'inventory' | 'orders' | 'payments' | 'system' | 'security';
  timestamp: string;
  dismissed: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  period: string;
  description?: string;
  category: 'sales' | 'marketing' | 'operations' | 'finance' | 'customer';
  isActive: boolean;
  updatedAt: string;
}

export interface RealtimeMetrics {
  activeUsers: number;
  onlineVisitors: number;
  currentOrders: number;
  pendingPayments: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
  apiRequests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  salesToday: {
    revenue: number;
    orders: number;
    customers: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  lastUpdated: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dateRange: {
    from: string;
    to: string;
  };
  sections: Array<'stats' | 'revenue' | 'orders' | 'customers' | 'products' | 'analytics'>;
  includeCharts: boolean;
  includeDetails: boolean;
  fileName?: string;
  emailTo?: string[];
  compression?: boolean;
}