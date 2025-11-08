// Inventory-related type definitions

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  location?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  lastStockUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return' | 'damaged' | 'lost';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  reason: string;
  reference?: string; // Order ID, Transfer ID, etc.
  notes?: string;
  performedBy: string;
  performedAt: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  capacity?: number;
  currentUtilization?: number;
  isActive: boolean;
  isDefault: boolean;
  operatingHours?: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_point' | 'expiry_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentStock: number;
  threshold: number;
  recommendedAction: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFormData {
  productId: string;
  warehouseId: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  location?: string;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: Array<{
    inventoryItemId: string;
    quantity: number;
    unitCost: number;
  }>;
  totalItems: number;
  totalValue: number;
  reason: string;
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  shippedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkInventoryUpdate {
  id: string;
  name: string;
  type: 'stock_adjustment' | 'price_update' | 'location_update' | 'threshold_update';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  updates: Array<{
    inventoryItemId: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    status: 'pending' | 'success' | 'failed';
    error?: string;
  }>;
  uploadedBy: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAnalytics {
  period: string;
  totalValue: number;
  totalItems: number;
  turnoverRate: number;
  averageDaysInStock: number;
  topMovingItems: Array<{
    id: string;
    name: string;
    movements: number;
    value: number;
  }>;
  slowMovingItems: Array<{
    id: string;
    name: string;
    daysSinceLastMovement: number;
    currentStock: number;
    value: number;
  }>;
  stockLevels: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    overstock: number;
  };
  warehouseUtilization: Array<{
    warehouseId: string;
    name: string;
    utilization: number;
    capacity: number;
    value: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    items: number;
    value: number;
    percentage: number;
  }>;
}