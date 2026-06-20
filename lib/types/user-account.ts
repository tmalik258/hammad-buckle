import { User, Address, AddressType } from '@prisma/client';

// Extended User interface with addresses
export interface UserProfile extends User {
  addresses?: Address[];
}

// Address interface (already defined by Prisma, but we can extend if needed)
export interface AddressWithUser extends Address {
  user?: User;
}

// Form data interfaces for frontend components
export interface UserProfileFormData {
  name: string;
  email: string;
}

export interface AddressFormData {
  type: AddressType;
  firstName: string;
  lastName: string;
  email?: string;
  street?: string;
  city: string;
  area: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
}

// API request/response interfaces
export interface CreateAddressRequest {
  type: AddressType;
  firstName: string;
  lastName: string;
  email?: string;
  street?: string;
  city: string;
  area: string;
  postalCode: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  id?: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// API response interfaces
export interface UserProfileResponse {
  user: UserProfile;
}

export interface AddressesResponse {
  addresses: Address[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AddressResponse {
  address: Address;
}

// Error response interface
export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// State management interfaces
export interface UserAccountState {
  // Profile data
  profile: UserProfile | null;
  addresses: Address[];
  
  // UI state
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Loading states for specific operations
  isLoadingProfile: boolean;
  isLoadingAddresses: boolean;
  isSavingProfile: boolean;
  isSavingAddress: boolean;
  isDeletingAddress: boolean;
}

// Action interfaces for state management
export interface UserAccountActions {
  // Profile actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Address actions
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string, type: AddressType) => void;
  
  // UI state actions
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  
  // Specific loading state actions
  setLoadingProfile: (loading: boolean) => void;
  setLoadingAddresses: (loading: boolean) => void;
  setSavingProfile: (saving: boolean) => void;
  setSavingAddress: (saving: boolean) => void;
  setDeletingAddress: (deleting: boolean) => void;
  
  // Reset actions
  reset: () => void;
  resetError: () => void;
}

// Combined interface for the complete store
export interface UserAccountStore extends UserAccountState, UserAccountActions {}

// Utility types for form handling
export type UserProfileFormFields = keyof UserProfileFormData;
export type AddressFormFields = keyof AddressFormData;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationErrors {
  [key: string]: ValidationError[];
}

// Query and mutation types for TanStack Query
export interface UseUserProfileOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseUserAddressesOptions extends UseUserProfileOptions {
  type?: AddressType;
}

export interface MutationOptions<TData = unknown, TError = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// Helper type for converting form data to API data
export type FormToApiData<T> = Omit<T, 'firstName' | 'lastName'> & {
  name: string;
};

// Utility function type for combining first and last name
export type CombineNameFunction = (firstName: string, lastName: string) => string;

// Utility function type for splitting full name
export type SplitNameFunction = (fullName: string) => { firstName: string; lastName: string };