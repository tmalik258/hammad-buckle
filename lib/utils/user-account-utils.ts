import { AddressType } from '@prisma/client';
import {
  UserProfileFormData,
  AddressFormData,
  CreateAddressRequest,
  UpdateProfileRequest,
} from '@/lib/types/user-account';

/**
 * Combines first name and last name into a single name string
 */
export function combineName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Splits a full name into first name and last name
 * Handles edge cases where there might be multiple names
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmedName = fullName.trim();
  
  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }
  
  const nameParts = trimmedName.split(' ');
  
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }
  
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  
  return { firstName, lastName };
}

/**
 * Converts user profile form data to API request format
 */
export function userProfileFormToApi(formData: UserProfileFormData): UpdateProfileRequest {
  const { name, email, avatar } = formData;
  
  return {
    name,
    email,
    avatar: avatar || null,
  };
}

/**
 * Converts API user data to form format
 */
export function userProfileApiToForm(apiData: { name: string; email: string; avatar?: string | null }): UserProfileFormData {
  const { name, email, avatar } = apiData;
  
  return {
    name,
    email,
    avatar: avatar || undefined,
  };
}

/**
 * Converts address form data to API request format
 */
export function addressFormToApi(formData: AddressFormData): CreateAddressRequest {
  const { firstName, lastName, type, email, street, city, area, postalCode, phone, isDefault } = formData;
  
  return {
    type,
    firstName,
    lastName,
    email: email || undefined,
    street: street || undefined,
    city,
    area,
    postalCode,
    phone: phone || undefined,
    isDefault,
  };
}

/**
 * Converts API address data to form format
 */
export function addressApiToForm(apiData: {
  type: AddressType;
  name: string;
  email?: string | null;
  street?: string | null;
  city: string;
  area: string;
  postalCode: string;
  phone?: string | null;
  isDefault: boolean;
}): AddressFormData {
  const { type, name, email, street, city, area, postalCode, phone, isDefault } = apiData;
  const { firstName, lastName } = splitName(name);
  
  return {
    type,
    firstName,
    lastName,
    email: email || undefined,
    street: street || undefined,
    city,
    area,
    postalCode,
    phone: phone || undefined,
    isDefault,
  };
}

/**
 * Validates if an email address is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a phone number is valid (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Basic phone validation - allows digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for 10-digit numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
}

/**
 * Validates postal code format (basic validation)
 */
export function isValidPostalCode(postalCode: string): boolean {
  // Basic validation - at least 3 characters, alphanumeric
  const postalRegex = /^[A-Za-z0-9\s\-]{3,}$/;
  return postalRegex.test(postalCode);
}

/**
 * Formats an address for display
 */
export function formatAddress(address: {
  name: string;
  street?: string | null;
  city: string;
  area: string;
  postalCode: string;
}): string {
  const parts = [
    address.name,
    address.street,
    `${address.city}, ${address.area} ${address.postalCode}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

/**
 * Gets the display label for an address type
 */
export function getAddressTypeLabel(type: AddressType): string {
  switch (type) {
    case AddressType.SHIPPING:
      return 'Shipping Address';
    case AddressType.BILLING:
      return 'Billing Address';
    case AddressType.BOTH:
      return 'Shipping & Billing Address';
    default:
      return 'Address';
  }
}

/**
 * Checks if two addresses are the same
 */
export function areAddressesEqual(
  address1: CreateAddressRequest,
  address2: CreateAddressRequest
): boolean {
  return (
    address1.type === address2.type &&
    address1.firstName === address2.firstName &&
    address1.lastName === address2.lastName &&
    address1.email === address2.email &&
    address1.street === address2.street &&
    address1.city === address2.city &&
    address1.area === address2.area &&
    address1.postalCode === address2.postalCode &&
    address1.phone === address2.phone
  );
}

/**
 * Creates a default address object
 */
export function createDefaultAddress(type: AddressType = AddressType.SHIPPING): AddressFormData {
  return {
    type,
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    area: '',
    postalCode: '',
    phone: '',
    isDefault: false,
  };
}

/**
 * Validates if an address is complete (has all required fields)
 */
export function isAddressComplete(address: Partial<AddressFormData>): boolean {
  return !!(
    address.firstName &&
    address.lastName &&
    address.city &&
    address.area &&
    address.postalCode
  );
}

/**
 * Gets validation error message for a field
 */
export function getFieldErrorMessage(
  field: string,
  value: string,
  required: boolean = false
): string | null {
  if (required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${field} is required`;
  }
  
  if (field === 'email' && value && !isValidEmail(value)) {
    return 'Invalid email address';
  }
  
  if (field === 'phone' && value && !isValidPhone(value)) {
    return 'Invalid phone number';
  }
  
  if (field === 'postalCode' && value && !isValidPostalCode(value)) {
    return 'Invalid postal code';
  }
  
  return null;
}

/**
 * Handles default address logic when creating or updating addresses
 * Returns the data needed to unset other default addresses of the same type
 */
export function getDefaultAddressUpdateData(
  userId: string,
  addressType: AddressType,
  isDefault: boolean,
  excludeAddressId?: string
) {
  if (!isDefault) {
    return null;
  }

  const whereClause: Record<string, unknown> = {
    userId,
    type: addressType,
    isDefault: true,
  };

  if (excludeAddressId) {
    whereClause.id = { not: excludeAddressId };
  }

  return {
    where: whereClause,
    data: { isDefault: false },
  };
}

/**
 * Finds the next address to make default when deleting a default address
 */
export function getNextDefaultAddressQuery(
  userId: string,
  addressType: AddressType,
  excludeAddressId: string
) {
  return {
    where: {
      userId,
      type: addressType,
      id: { not: excludeAddressId },
    },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  };
}

/**
 * Validates address data before API operations
 */
export function validateAddressData(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Name is required');
  }

  if (!data.city || typeof data.city !== 'string' || !data.city.trim()) {
    errors.push('City is required');
  }

  if (!data.area || typeof data.area !== 'string' || !data.area.trim()) {
    errors.push('Area is required');
  }

  if (!data.postalCode || typeof data.postalCode !== 'string' || !data.postalCode.trim()) {
    errors.push('Postal code is required');
  }

  if (data.email && (typeof data.email !== 'string' || !isValidEmail(data.email))) {
    errors.push('Invalid email address');
  }

  if (data.phone && (typeof data.phone !== 'string' || !isValidPhone(data.phone))) {
    errors.push('Invalid phone number');
  }

  if (data.type && (typeof data.type !== 'string' || !Object.values(AddressType).includes(data.type as AddressType))) {
    errors.push('Invalid address type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a standardized API error response
 */
export function createApiErrorResponse(
  message: string,
  status: number,
  details?: string | string[]
) {
  const response: Record<string, unknown> = { error: message };
  
  if (details) {
    response.details = details;
  }
  
  return { response, status };
}

/**
 * Handles common API errors and returns appropriate responses
 */
export function handleApiError(error: unknown): {
  response: Record<string, unknown>;
  status: number;
} {
  console.error('API Error:', error);

  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return createApiErrorResponse(
        'Unauthorized: Please log in to perform this action',
        401
      );
    }

    if (error.message.includes('Record to update not found')) {
      return createApiErrorResponse('Resource not found', 404);
    }

    if (error.message.includes('Record to delete does not exist')) {
      return createApiErrorResponse('Resource not found', 404);
    }

    if (error.message.includes('Foreign key constraint')) {
      return createApiErrorResponse(
        'Cannot delete resource as it is referenced by other records',
        400,
        'This resource cannot be deleted because it is associated with other data. You can update it instead.'
      );
    }

    if (error.message.includes('Unique constraint')) {
      return createApiErrorResponse(
        'A resource with this information already exists',
        400
      );
    }
  }

  return createApiErrorResponse('Internal server error', 500);
}