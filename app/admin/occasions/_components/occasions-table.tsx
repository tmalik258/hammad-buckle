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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useOccasions, useDeleteOccasion } from '@/lib/hooks/useOccasions';
import OccasionFormModal from './occasion-form-modal';
import { Occasion, Prisma } from '@prisma/client';

interface OccasionsTableProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default function OccasionsTable({ searchParams }: OccasionsTableProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [occasionToDelete, setOccasionToDelete] = useState<Occasion | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');

  const currentPage = parseInt(searchParams.page || '1');
  const currentSearch = searchParams.search || '';
  const currentStatus = searchParams.status || 'all';

  const isActiveParam = currentStatus === 'active' ? true : currentStatus === 'inactive' ? false : undefined;

  const { data: occasionsResponse, isLoading } = useOccasions({
    page: currentPage,
    limit: 10,
    search: currentSearch,
    isActive: isActiveParam,
  });

  const deleteOccasion = useDeleteOccasion();

  const occasions = occasionsResponse?.occasions || [];
  const totalPages = Math.ceil((occasionsResponse?.pagination?.total || 0) / 10);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filtering
    if (key !== 'page') {
      params.set('page', '1');
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams('search', searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    updateSearchParams('status', status);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams('page', page.toString());
  };

  const handleEdit = (occasion: Prisma.OccasionGetPayload<{
      include: { _count: { select: { products: true } } };
    }>) => {
    setSelectedOccasion(occasion);
    setIsFormModalOpen(true);
  };

  const handleDelete = (occasion: Prisma.OccasionGetPayload<{
      include: { _count: { select: { products: true } } };
    }>) => {
    setOccasionToDelete(occasion);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (occasionToDelete) {
      try {
        await deleteOccasion.mutateAsync(occasionToDelete.id);
        // Only close modal after successful deletion
        setIsDeleteDialogOpen(false);
        setOccasionToDelete(null);
      } catch (error) {
        // Error handling is done in the hook
        // Keep modal open on error so user can retry
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedOccasion(null);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedOccasion(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 bg-muted animate-pulse rounded flex-1" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        <div className="border rounded-lg">
          <div className="h-12 bg-muted animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 animate-pulse border-t" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search occasions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm" className="cursor-pointer">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={currentStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {occasions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {currentSearch ? 'No occasions found.' : 'No occasions found.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              occasions.map((occasion) => (
                <TableRow key={occasion.id}>
                  <TableCell className="font-medium">{occasion.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {occasion.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={occasion.isActive ? 'default' : 'secondary'}>
                      {occasion.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{occasion._count?.products || 0}</TableCell>
                  <TableCell>
                    {new Date(occasion.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(occasion)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(occasion)}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {occasions.length} of {occasionsResponse?.pagination?.total || 0} occasions
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <OccasionFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        occasion={selectedOccasion || undefined}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Occasion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{occasionToDelete?.name}&quot;? This action
              cannot be undone and will remove the occasion from all associated products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteOccasion.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleteOccasion.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}