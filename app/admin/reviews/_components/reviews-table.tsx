'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MoreHorizontal,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

interface ReviewsTableProps {
  page: number;
  search: string;
  rating: string;
  status: string;
  sort: string;
}

// Mock data for reviews
const mockReviews = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    product: {
      name: 'Wireless Headphones',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20headphones%20product%20photo&image_size=square',
    },
    rating: 5,
    title: 'Excellent sound quality!',
    content: 'These headphones exceeded my expectations. The sound quality is amazing and they are very comfortable to wear for long periods.',
    status: 'APPROVED',
    createdAt: '2024-01-15T10:30:00Z',
    helpful: 12,
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    product: {
      name: 'Smart Watch',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20watch%20product%20photo&image_size=square',
    },
    rating: 4,
    title: 'Good value for money',
    content: 'The watch works well and has all the features I need. Battery life could be better but overall satisfied.',
    status: 'PENDING',
    createdAt: '2024-01-14T15:45:00Z',
    helpful: 8,
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
    },
    product: {
      name: 'Gaming Mouse',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=gaming%20mouse%20product%20photo&image_size=square',
    },
    rating: 2,
    title: 'Not as expected',
    content: 'The mouse feels cheap and the buttons are not responsive. Would not recommend.',
    status: 'REPORTED',
    createdAt: '2024-01-13T09:20:00Z',
    helpful: 3,
  },
];

const statusColors = {
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  REPORTED: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function ReviewsTable({
  page,
  search,
  rating,
  status,
  sort,
}: ReviewsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams('search', searchValue);
  };

  const handleStatusChange = (reviewId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating review ${reviewId} status to ${newStatus}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter and sort reviews based on current parameters
  let filteredReviews = mockReviews;

  if (search) {
    filteredReviews = filteredReviews.filter(
      (review) =>
        review.user.name.toLowerCase().includes(search.toLowerCase()) ||
        review.product.name.toLowerCase().includes(search.toLowerCase()) ||
        review.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (rating) {
    filteredReviews = filteredReviews.filter(
      (review) => review.rating.toString() === rating
    );
  }

  if (status) {
    filteredReviews = filteredReviews.filter(
      (review) => review.status === status
    );
  }

  // Sort reviews
  filteredReviews.sort((a, b) => {
    switch (sort) {
      case 'createdAt_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'createdAt_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating_asc':
        return a.rating - b.rating;
      case 'rating_desc':
        return b.rating - a.rating;
      case 'helpful_desc':
        return b.helpful - a.helpful;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const totalPages = Math.ceil(filteredReviews.length / 10);
  const startIndex = (page - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search reviews, users, or products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select
            value={rating}
            onValueChange={(value) => updateSearchParams('rating', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => updateSearchParams('status', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="REPORTED">Reported</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => updateSearchParams('sort', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="rating_desc">Highest Rating</SelectItem>
              <SelectItem value="rating_asc">Lowest Rating</SelectItem>
              <SelectItem value="helpful_desc">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Helpful</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.user.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.product.image}
                      alt={review.product.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="font-medium">{review.product.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium">{review.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[review.status as keyof typeof statusColors]}
                  >
                    {review.status.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{review.helpful}</span>
                    <span className="text-xs text-muted-foreground">helpful</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(review.id, 'APPROVED')}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(review.id, 'REJECTED')}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(review.id, 'REPORTED')}
                        className="text-orange-600"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredReviews.length)} of{' '}
          {filteredReviews.length} reviews
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateSearchParams('page', (page - 1).toString())}
            disabled={page <= 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateSearchParams('page', (page + 1).toString())}
            disabled={page >= totalPages}
            className="cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}