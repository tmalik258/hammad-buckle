"use client";

import { toast } from "sonner";
import { useDeleteCategory } from "@/lib/hooks/useCategories";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    productsCount?: number;
  };
  onClose: () => void;
}

export default function CategoryDeleteModal({
  isOpen,
  onClose,
  category,
}: CategoryDeleteModalProps) {
  const deleteCategoryMutation = useDeleteCategory();

  const handleDelete = async () => {
    if (!category) return;

    try {
      await deleteCategoryMutation.mutateAsync({
        id: category.id,
      });

      toast.success(`Category "${category.name}" deleted successfully!`);
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };
  console.log(category)

  const hasProducts = category?.productsCount && category.productsCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Category
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete the category 
              <span className="font-semibold">
                &quot;{category?.name}&quot;
              </span>
              ?
            </div>
            {hasProducts && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium mb-1">Warning:</div>
                    <ul className="space-y-1">
                      <li>
                        This category contains {category.productsCount}{" "}
                        product(s). Remove all products before deleting the
                        category.
                      </li>
                    </ul>
                    <div className="mt-2">
                      Deleting this category will also remove all associated
                      products.
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
            disabled={deleteCategoryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending || !!hasProducts}
            className="cursor-pointer"
          >
            {deleteCategoryMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
