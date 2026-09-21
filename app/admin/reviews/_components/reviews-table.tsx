'use client';

import { useState } from 'react';
import { useReviews, useUpdateReviewStatus } from '@/lib/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Star, Check, X } from 'lucide-react';
import type { ReviewStatus } from '@/lib/types';

type ReviewsTableProps = {
  page?: number;
  search?: string;
  rating?: string;
  status?: string;
  sort?: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
        />
      ))}
    </div>
  );
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'APPROVED') return 'default';
  if (status === 'REJECTED' || status === 'HIDDEN') return 'destructive';
  if (status === 'PENDING') return 'secondary';
  return 'outline';
}

export default function ReviewsTable({
  page: initialPage = 1,
  rating: initialRating = '',
  status: initialStatus = '',
}: ReviewsTableProps) {
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const ratingNum = initialRating ? Number(initialRating) : undefined;

  const { data, isLoading, error } = useReviews({
    page,
    limit: 20,
    status: statusFilter === 'all' ? '' : statusFilter,
    rating: ratingNum,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateStatus = useUpdateReviewStatus();
  const reviews = data?.reviews ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load reviews. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading reviews…
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="max-w-[160px] truncate font-medium">
                    {review.product.name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{review.user.name}</div>
                    {review.user.email ? (
                      <div className="text-xs text-muted-foreground">{review.user.email}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Stars rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <div className="truncate font-medium">{review.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{review.comment}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(review.status)}>{review.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {review.status === 'PENDING' ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer text-green-600"
                          onClick={() =>
                            updateStatus.mutate({ id: review.id, status: 'APPROVED' as ReviewStatus })
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer text-red-600"
                          onClick={() =>
                            updateStatus.mutate({ id: review.id, status: 'REJECTED' as ReviewStatus })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="cursor-pointer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" className="cursor-pointer" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
