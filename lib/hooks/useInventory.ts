import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  InventoryItem,
  InventoryMovement,
  Warehouse,
  StockAlert,
  InventoryReport,
  StockTransfer,
  BulkInventoryUpdate,
  InventoryAnalytics
} from '@/lib/types';

// Inventory Items
export const useInventoryItems = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  warehouse?: string;
  lowStock?: boolean;
}) => {
  return useQuery({
    queryKey: ['inventory', 'items', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.warehouse) searchParams.set('warehouse', params.warehouse);
      if (params?.lowStock) searchParams.set('lowStock', 'true');

      const response = await fetch(`/api/inventory/items?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch inventory items');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Single Inventory Item
export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory', 'items', id],
    queryFn: async (): Promise<InventoryItem> => {
      const response = await fetch(`/api/inventory/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch inventory item');
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Inventory Movements
export const useInventoryMovements = (params?: {
  page?: number;
  limit?: number;
  itemId?: string;
  warehouse?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['inventory', 'movements', params],
    queryFn: async (): Promise<{ movements: InventoryMovement[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.itemId) searchParams.set('itemId', params.itemId);
      if (params?.warehouse) searchParams.set('warehouse', params.warehouse);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

      const response = await fetch(`/api/inventory/movements?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch inventory movements');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Warehouses
export const useWarehouses = () => {
  return useQuery({
    queryKey: ['inventory', 'warehouses'],
    queryFn: async (): Promise<Warehouse[]> => {
      const response = await fetch('/api/inventory/warehouses');
      if (!response.ok) throw new Error('Failed to fetch warehouses');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Stock Alerts
export const useStockAlerts = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: ['inventory', 'alerts', params],
    queryFn: async (): Promise<{ alerts: StockAlert[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.priority) searchParams.set('priority', params.priority);

      const response = await fetch(`/api/inventory/alerts?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch stock alerts');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Inventory Analytics
export const useInventoryAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['inventory', 'analytics', period],
    queryFn: async (): Promise<InventoryAnalytics> => {
      const response = await fetch(`/api/inventory/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch inventory analytics');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Inventory Reports
export const useInventoryReports = (type: string, params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['inventory', 'reports', type, params],
    queryFn: async (): Promise<InventoryReport> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.set(key, value.toString());
        });
      }

      const response = await fetch(`/api/inventory/reports/${type}?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch inventory report');
      return response.json();
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) => {
      const response = await fetch(`/api/inventory/items/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, reason }),
      });
      if (!response.ok) throw new Error('Failed to update stock');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'analytics'] });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    },
  });
};

export const useTransferStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transfer: StockTransfer) => {
      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer),
      });
      if (!response.ok) throw new Error('Failed to transfer stock');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock transferred successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to transfer stock: ${error.message}`);
    },
  });
};

export const useBulkUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: BulkInventoryUpdate[]) => {
      const response = await fetch('/api/inventory/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!response.ok) throw new Error('Failed to bulk update inventory');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update inventory: ${error.message}`);
    },
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/inventory/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });
      if (!response.ok) throw new Error('Failed to create warehouse');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create warehouse: ${error.message}`);
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/inventory/alerts/${alertId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark alert as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      toast.success('Alert marked as read');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark alert as read: ${error.message}`);
    },
  });
};

export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/inventory/alerts/${alertId}/dismiss`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to dismiss alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      toast.success('Alert dismissed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to dismiss alert: ${error.message}`);
    },
  });
};

export const useExportInventory = () => {
  return useMutation({
    mutationFn: async (options: { format: string; filters?: Record<string, unknown> }) => {
      const response = await fetch('/api/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!response.ok) throw new Error('Failed to export inventory');
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Inventory exported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export inventory: ${error.message}`);
    },
  });
};

export const useImportInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/inventory/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to import inventory');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory imported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to import inventory: ${error.message}`);
    },
  });
};