// Review types aligned with Prisma Review + API includes

export type ReviewStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'FLAGGED'
  | 'HIDDEN'
  | 'REPORTED';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
    price?: number;
  };
}

export interface ReviewFormData {
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
