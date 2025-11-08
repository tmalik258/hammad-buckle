// Notification-related type definitions

export interface Notification {
  id: string;
  userId?: string;
  customerId?: string;
  type: 'order' | 'payment' | 'shipping' | 'inventory' | 'system' | 'marketing' | 'security';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channel: 'in_app' | 'email' | 'sms' | 'push' | 'webhook';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
  readAt?: string;
  clickedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: {
    orderUpdates: boolean;
    paymentConfirmations: boolean;
    shippingUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    systemAlerts: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    paymentConfirmations: boolean;
    shippingUpdates: boolean;
    securityAlerts: boolean;
  };
  pushNotifications: {
    orderUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
    systemAlerts: boolean;
  };
  inAppNotifications: {
    all: boolean;
    orderUpdates: boolean;
    systemMessages: boolean;
    promotions: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'order' | 'payment' | 'shipping' | 'inventory' | 'system' | 'marketing' | 'security';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  content: string;
  htmlContent?: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  isDefault: boolean;
  language: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'discord';
  config: {
    // Email
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    // SMS
    provider?: string;
    apiKey?: string;
    fromNumber?: string;
    // Push
    fcmServerKey?: string;
    apnsCertificate?: string;
    // Webhook
    url?: string;
    headers?: Record<string, string>;
    // Slack/Discord
    webhookUrl?: string;
  };
  isActive: boolean;
  isDefault: boolean;
  rateLimits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  period: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  failureRate: number;
  byChannel: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
  }>;
  byType: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
  }>;
  topPerforming: Array<{
    templateId: string;
    name: string;
    sent: number;
    readRate: number;
    clickRate: number;
  }>;
}

export interface NotificationFormData {
  type: 'order' | 'payment' | 'shipping' | 'inventory' | 'system' | 'marketing' | 'security';
  title: string;
  message: string;
  channel: 'in_app' | 'email' | 'sms' | 'push' | 'webhook';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'success' | 'warning' | 'error';
  recipients: Array<{
    type: 'user' | 'customer' | 'role' | 'all';
    id?: string;
    email?: string;
  }>;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  scheduleAt?: string;
  expiresAt?: string;
}

export interface BulkNotificationAction {
  id: string;
  action: 'mark_read' | 'mark_unread' | 'delete' | 'archive';
  notificationIds: string[];
  performedBy: string;
  performedAt: string;
  results: {
    successful: number;
    failed: number;
    errors: string[];
  };
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  categories: Record<string, {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>;
  globalSettings: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}