'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteProduct } from '@/lib/hooks/useProductMutations';
import { useQueryClient } from '@tanstack/react-query';

interface ProductDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
  product: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
}

export default function ProductDeleteModal({
  open,
  onOpenChange,
  onDeleteSuccess,
  product,
}: ProductDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      await deleteProduct.mutateAsync(product.id);
      
      // Force refetch all product queries immediately
      await queryClient.refetchQueries({ 
        queryKey: ['products'],
        type: 'active'
      });
      
      toast.success(`Product "${product.name}" has been deleted successfully.`);
      
      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Product</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="font-medium text-sm mb-2">Product to be deleted:</h4>
            <div className="space-y-1">
              <p className="font-semibold">{product.name}</p>
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Warning: This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Product information and details</li>
              <li>• Product images and gallery</li>
              <li>• Inventory and stock data</li>
              <li>• Product reviews and ratings</li>
              <li>• Sales history and analytics</li>
            </ul>
          </div>

          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive font-medium">
              💡 Consider deactivating the product instead of deleting it to preserve historical data.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}