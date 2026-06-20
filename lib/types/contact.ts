// Contact related types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  orderNumber?: string;
}

export interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'address' | 'hours';
  icon: string;
  title: string;
  value: string;
  description?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful?: number;
  tags?: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  count: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  responses?: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  message: string;
  author: {
    name: string;
    role: 'customer' | 'support';
  };
  createdAt: Date;
  attachments?: string[];
}

export interface ContactState {
  formData: Partial<ContactFormData>;
  isSubmitting: boolean;
  submitted: boolean;
  errors: Record<string, string>;
  contactInfo: ContactInfo[];
  faqs: FAQ[];
  faqCategories: FAQCategory[];
  selectedCategory: string | null;
  searchQuery: string;
}