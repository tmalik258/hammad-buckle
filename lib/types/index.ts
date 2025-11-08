export * from "./tracking-data";
export * from "./order";
export * from './dashboard';
export * from './inventory';
export * from './customer';
export * from './message';
export * from './notification';
export * from './payment';
export * from './report';
export * from './review';
export * from './setting';
export * from './shipping';
export * from './category';
export * from './promo-code';

export { type CustomShippingMethod } from "./shipping";
export { type CustomPaymentMethod } from "./payment";

// Route-specific types
export * from './checkout';
export * from './contact';
export * from './order-tracking';
export * from './account';
export * from './user-account';

// Common UI types used across routes
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: unknown;
}

export interface SearchState {
  query: string;
  results: unknown[];
  isSearching: boolean;
}

// Common form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
}

export interface FormState {
  data: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ErrorComponentProps extends BaseComponentProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRefresh?: () => void;
  variant?: 'inline' | 'card' | 'fullpage';
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}