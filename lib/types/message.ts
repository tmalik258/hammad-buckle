// Message-related type definitions

export interface Message {
  id: string;
  threadId: string;
  customerId?: string;
  userId?: string; // Staff member who sent/received the message
  type: 'customer_inquiry' | 'support_ticket' | 'order_update' | 'marketing' | 'system' | 'internal';
  channel: 'email' | 'chat' | 'sms' | 'phone' | 'social_media' | 'contact_form';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  htmlContent?: string;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'billing' | 'technical' | 'complaint' | 'compliment' | 'refund' | 'shipping';
  tags: string[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    source?: string;
    campaignId?: string;
    orderId?: string;
  };
  readAt?: string;
  repliedAt?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  id: string;
  customerId?: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed' | 'spam';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'billing' | 'technical' | 'complaint' | 'compliment' | 'refund' | 'shipping';
  channel: 'email' | 'chat' | 'sms' | 'phone' | 'social_media' | 'contact_form';
  assignedTo?: string;
  assignedAt?: string;
  tags: string[];
  messageCount: number;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
  customerInfo?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  staffInfo?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  metadata: {
    source?: string;
    orderId?: string;
    productId?: string;
    campaignId?: string;
  };
  firstResponseTime?: number; // in minutes
  averageResponseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  satisfactionRating?: number; // 1-5
  satisfactionFeedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface MessageFormData {
  threadId?: string;
  customerId?: string;
  type: 'customer_inquiry' | 'support_ticket' | 'order_update' | 'marketing' | 'system' | 'internal';
  channel: 'email' | 'chat' | 'sms' | 'phone' | 'social_media' | 'contact_form';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  htmlContent?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'billing' | 'technical' | 'complaint' | 'compliment' | 'refund' | 'shipping';
  tags?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  assignedTo?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    campaignId?: string;
    source?: string;
  };
}