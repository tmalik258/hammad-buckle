'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteOccasion } from '@/lib/hooks/useOccasions';
import { toast } from 'sonner';

interface OccasionDeleteModalProps {
  occasionId: string;
  occasionName: string;
  productsCount?: number;
}

export default function OccasionDeleteModal({
  occasionId,
  occasionName,
  productsCount = 0,
}: OccasionDeleteModalProps) {
  const [open, setOpen] = useState(false);
  const deleteOccasionMutation = useDeleteOccasion();

  const handleDelete = async () => {
    try {
      await deleteOccasionMutation.mutateAsync(occasionId);
      toast.success(`Occasion &quot;${occasionName}&quot; deleted successfully`);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to delete occasion');
      console.error('Delete occasion error:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Occasion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{occasionName}&quot;?
            {productsCount > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                Warning: This occasion has {productsCount} product{productsCount !== 1 ? 's' : ''} associated with it.
                Deleting this occasion may affect those products.
              </span>
            )}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteOccasionMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteOccasionMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}