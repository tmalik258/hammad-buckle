// Setting-related type definitions

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'date' | 'email' | 'url' | 'password';
  category: 'general' | 'appearance' | 'security' | 'notifications' | 'integrations' | 'payments' | 'shipping' | 'taxes' | 'analytics' | 'advanced';
  groupId?: string;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ label: string; value: unknown; description?: string }>;
    customValidator?: string;
  };
  isPublic: boolean; // Can be accessed by frontend
  isEditable: boolean;
  isVisible: boolean;
  requiresRestart?: boolean;
  dependsOn?: Array<{
    key: string;
    value: unknown;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  }>;
  metadata: {
    source?: 'system' | 'user' | 'import' | 'api';
    environment?: 'development' | 'staging' | 'production' | 'all';
    version?: string;
    lastModifiedBy?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastModifiedAt?: string;
}

export interface SettingGroup {
  id: string;
  name: string;
  description?: string;
  category: 'general' | 'appearance' | 'security' | 'notifications' | 'integrations' | 'payments' | 'shipping' | 'taxes' | 'analytics' | 'advanced';
  icon?: string;
  order: number;
  isCollapsible: boolean;
  isCollapsed: boolean;
  isVisible: boolean;
  permissions: {
    view: string[]; // Role names
    edit: string[]; // Role names
  };
  settings: Setting[];
  createdAt: string;
  updatedAt: string;
}

export interface SettingFormData {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'date' | 'email' | 'url' | 'password';
  category: 'general' | 'appearance' | 'security' | 'notifications' | 'integrations' | 'payments' | 'shipping' | 'taxes' | 'analytics' | 'advanced';
  groupId?: string;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ label: string; value: unknown; description?: string }>;
  };
  isPublic?: boolean;
  isEditable?: boolean;
  isVisible?: boolean;
  requiresRestart?: boolean;
  dependsOn?: Array<{
    key: string;
    value: unknown;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  }>;
  tags?: string[];
}

export interface SettingHistory {
  id: string;
  settingId: string;
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'create' | 'update' | 'delete' | 'reset';
  changedBy: string;
  changeReason?: string;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    source?: 'admin_panel' | 'api' | 'import' | 'system';
    batchId?: string;
  };
  createdAt: string;
}

export interface SettingTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'ecommerce' | 'blog' | 'portfolio' | 'business' | 'custom';
  settings: Array<{
    key: string;
    value: unknown;
    type: string;
    category: string;
    label: string;
    description?: string;
  }>;
  isPublic: boolean;
  isActive: boolean;
  version: string;
  author: string;
  downloadCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SettingBackup {
  id: string;
  name: string;
  description?: string;
  settings: Record<string, unknown>; // key-value pairs of all settings
  metadata: {
    totalSettings: number;
    categories: string[];
    version: string;
    environment: string;
  };
  createdBy: string;
  createdAt: string;
  restoredAt?: string;
  restoredBy?: string;
}

export interface SettingValidationResult {
  isValid: boolean;
  errors: Array<{
    key: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    key: string;
    message: string;
    code: string;
  }>;
}

export interface SettingBulkOperation {
  id: string;
  operation: 'update' | 'delete' | 'reset' | 'import' | 'export';
  settings: Array<{
    key: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  results: {
    successful: number;
    failed: number;
    skipped: number;
    errors: Array<{
      key: string;
      error: string;
    }>;
  };
  performedBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface SettingPermission {
  id: string;
  roleId: string;
  roleName: string;
  permissions: {
    categories: Record<string, {
      view: boolean;
      edit: boolean;
      delete: boolean;
    }>;
    settings: Record<string, {
      view: boolean;
      edit: boolean;
      delete: boolean;
    }>;
    groups: Record<string, {
      view: boolean;
      edit: boolean;
      delete: boolean;
    }>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}