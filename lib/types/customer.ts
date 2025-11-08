// Customer-related type definitions

export interface Customer {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}