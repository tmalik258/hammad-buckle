// Review-related type definitions

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  orderId?: string;
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden';
  isVerifiedPurchase: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    caption?: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    duration?: number;
    caption?: string;
  }>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    source?: 'website' | 'mobile_app' | 'email' | 'import';
    purchaseDate?: string;
    usageDuration?: string; // How long they used the product
  };
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  customerInfo: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    reviewCount: number;
    averageRating: number;
  };
  productInfo: {
    id: string;
    name: string;
    image?: string;
    category: string;
    brand?: string;
    sku: string;
  };
  responses: Array<{
    id: string;
    type: 'vendor' | 'customer_service' | 'admin';
    authorId: string;
    authorName: string;
    content: string;
    isOfficial: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number; // -1 to 1
  languageCode: string;
  translatedContent?: Record<string, string>; // language code -> translated content
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ReviewFormData {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  isAnonymous?: boolean;
  images?: Array<{
    file: File;
    caption?: string;
  }>;
  videos?: Array<{
    file: File;
    caption?: string;
  }>;
  usageDuration?: string;
  wouldRecommend?: boolean;
  tags?: string[];
}

export interface ReviewStats {
  productId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonTags: Array<{
    tag: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  topReviewers: Array<{
    customerId: string;
    customerName: string;
    reviewCount: number;
    averageRating: number;
  }>;
}

export interface ReviewFilter {
  rating?: number[];
  status?: ('pending' | 'approved' | 'rejected' | 'flagged' | 'hidden')[];
  isVerifiedPurchase?: boolean;
  sentiment?: ('positive' | 'neutral' | 'negative')[];
  dateRange?: {
    start: string;
    end: string;
  };
  hasImages?: boolean;
  hasVideos?: boolean;
  minHelpfulCount?: number;
  tags?: string[];
  customerId?: string;
  productId?: string;
  searchQuery?: string;
}

export interface ReviewModerationAction {
  id: string;
  reviewId: string;
  action: 'approve' | 'reject' | 'flag' | 'hide' | 'unhide' | 'delete';
  reason?: string;
  notes?: string;
  performedBy: string;
  performedAt: string;
  previousStatus: string;
  newStatus: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'email_request' | 'follow_up' | 'response' | 'moderation';
  subject?: string;
  content: string;
  variables: string[]; // Available template variables like {customerName}, {productName}
  isActive: boolean;
  isDefault: boolean;
  language: string;
  createdBy: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewIncentive {
  id: string;
  name: string;
  description?: string;
  type: 'discount' | 'points' | 'coupon' | 'gift_card' | 'free_shipping';
  value: number;
  currency?: string;
  conditions: {
    minRating?: number;
    requiresImages?: boolean;
    requiresVideo?: boolean;
    minContentLength?: number;
    productCategories?: string[];
    customerSegments?: string[];
  };
  limits: {
    perCustomer?: number;
    perProduct?: number;
    totalLimit?: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}