'use client';

import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteType } from '@/lib/hooks/useTypes';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';

interface TypeDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: Prisma.TypeGetPayload<{
    include: {
      _count: { select: { products: true } };
    };
  }>;
  onClose: () => void;
}

export default function TypeDeleteModal({
  open,
  onOpenChange,
  type,
  onClose,
}: TypeDeleteModalProps) {
  const deleteTypeMutation = useDeleteType();

  const handleDelete = async () => {
    if (!type) return;

    try {
      await deleteTypeMutation.mutateAsync(type.id);
      toast.success(`Type "${type.name}" deleted successfully`);
      onClose();
    } catch (error) {
      toast.error('Failed to delete type');
      console.error('Delete type error:', error);
    }
  };

  const hasProducts = (type?._count?.products ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Type
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete &quot;{type?.name}&quot;?
            </div>
            {hasProducts && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-red-800">
                      Warning: This type has {type?._count?.products ?? 0} product{(type?._count?.products ?? 0) !== 1 ? 's' : ''} associated with it.
                    </div>
                    <div className="text-red-700 mt-1">
                      Deleting this type will also remove all associated products.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteTypeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTypeMutation.isPending || !!hasProducts}
            className="cursor-pointer"
          >
            {deleteTypeMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}