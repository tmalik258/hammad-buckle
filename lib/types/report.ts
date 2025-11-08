// Report-related type definitions

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'marketing' | 'performance' | 'custom';
  category: 'operational' | 'analytical' | 'compliance' | 'executive';
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  visibility: 'private' | 'team' | 'organization' | 'public';
  data: ReportData;
  filters: ReportFilter[];
  config: ReportConfig;
  schedule?: ReportSchedule;
  fileUrl?: string;
  fileSize?: number;
  generatedBy: string;
  generatedAt?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount: number;
  avgGenerationTime?: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'marketing' | 'performance' | 'custom';
  category: 'operational' | 'analytical' | 'compliance' | 'executive';
  defaultFilters: ReportFilter[];
  defaultConfig: ReportConfig;
  fields: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
    required: boolean;
    defaultValue?: unknown;
    options?: Array<{ label: string; value: unknown }>;
  }>;
  chartTypes: Array<'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table'>;
  isPublic: boolean;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval?: number; // For custom frequency
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  isActive: boolean;
  recipients: Array<{
    type: 'email' | 'webhook' | 'slack';
    address: string;
    format: 'pdf' | 'excel' | 'csv' | 'json';
  }>;
  lastRunAt?: string;
  nextRunAt: string;
  failureCount: number;
  maxFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportData {
  summary: {
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    generatedAt: string;
    processingTime: number; // in seconds
  };
  metrics: Array<{
    key: string;
    label: string;
    value: number | string;
    change?: {
      value: number;
      percentage: number;
      direction: 'up' | 'down' | 'neutral';
    };
    format: 'number' | 'currency' | 'percentage' | 'duration';
  }>;
  charts: Array<{
    id: string;
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    title: string;
    data: Array<{
      label: string;
      value: number;
      color?: string;
      metadata?: Record<string, unknown>;
    }>;
    config: {
      xAxis?: string;
      yAxis?: string;
      showLegend: boolean;
      showGrid: boolean;
      colors?: string[];
    };
  }>;
  tables: Array<{
    id: string;
    title: string;
    headers: Array<{
      key: string;
      label: string;
      type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
      sortable: boolean;
    }>;
    rows: Array<Record<string, unknown>>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  }>;
  insights?: Array<{
    type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    actionable: boolean;
    metadata?: Record<string, unknown>;
  }>;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: unknown;
  label?: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  dateFrom?: string;
  dateTo?: string;
  groupBy?: string;
  productId?: string;
  categoryId?: string;
  warehouseId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  currency?: string;
  segment?: string;
  location?: string;
}

export interface ReportExport {
  id: string;
  reportId: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  downloadCount: number;
  options?: Record<string, unknown>;
  expiresAt: string;
  requestedBy: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ReportStats {
  period: string;
  totalReports: number;
  totalGenerations: number;
  avgGenerationTime: number;
  successRate: number;
  mostPopularTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    reportCount: number;
  }>;
  performanceMetrics: {
    fastestGeneration: number;
    slowestGeneration: number;
    avgFileSize: number;
    totalStorage: number;
  };
}

// Specific report types
export interface SalesReport extends Omit<Report, 'type'> {
  type: 'sales';
  salesData: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    topProducts: Array<{
      id: string;
      name: string;
      revenue: number;
      quantity: number;
    }>;
    salesByPeriod: Array<{
      period: string;
      revenue: number;
      orders: number;
    }>;
  };
}

export interface InventoryReport extends Omit<Report, 'type'> {
  type: 'inventory';
  inventoryData: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    topMovingProducts: Array<{
      id: string;
      name: string;
      quantity: number;
      turnoverRate: number;
    }>;
    stockLevels: Array<{
      category: string;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    }>;
  };
}

export interface CustomerReport extends Omit<Report, 'type'> {
  type: 'customer';
  customerData: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    customerLifetimeValue: number;
    retentionRate: number;
    churnRate: number;
    topCustomers: Array<{
      id: string;
      name: string;
      totalSpent: number;
      orderCount: number;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      percentage: number;
      avgValue: number;
    }>;
  };
}

export interface FinancialReport extends Omit<Report, 'type'> {
  type: 'financial';
  financialData: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    revenueBySource: Array<{
      source: string;
      amount: number;
      percentage: number;
    }>;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    cashFlow: Array<{
      period: string;
      inflow: number;
      outflow: number;
      net: number;
    }>;
  };
}

export interface ReportFormData {
  name: string;
  description?: string;
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'marketing' | 'performance' | 'custom';
  category: 'operational' | 'analytical' | 'compliance' | 'executive';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  visibility: 'private' | 'team' | 'organization' | 'public';
  filters: ReportFilter[];
  config: ReportConfig;
  schedule?: Omit<ReportSchedule, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>;
}

export interface ReportConfig {
  dateRange: {
    type: 'custom' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'year_to_date' | 'month_to_date';
    start?: string;
    end?: string;
  };
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  includeCharts: boolean;
  includeTables: boolean;
  includeInsights: boolean;
  chartTypes: Array<'line' | 'bar' | 'pie' | 'area' | 'scatter'>;
  maxRows?: number;
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  customFields?: Array<{
    key: string;
    label: string;
    calculation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }>;
}