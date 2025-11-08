"use client";

import { toast } from "sonner";
import { useDeleteOrder } from "@/lib/hooks/useOrders";
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

interface OrderDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    user?: {
      name: string | null;
      email: string;
    };
  };
  onClose: () => void;
}

export default function OrderDeleteModal({
  open,
  onOpenChange,
  order,
  onClose,
}: OrderDeleteModalProps) {
  const deleteOrderMutation = useDeleteOrder();

  const handleDelete = async () => {
    if (!order) return;

    try {
      await deleteOrderMutation.mutateAsync(order.id);
      onClose();
    } catch (error) {
      console.log("Error deleting order:", error);
    }
  };

  const isProcessedOrder = order?.status === "DELIVERED" || order?.status === "SHIPPED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Order
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete order 
              <span className="font-semibold">
                &quot;{order?.orderNumber}&quot;
              </span>
              ?
            </div>
            {order?.user && (
              <div className="text-sm text-muted-foreground">
                Customer: {order.user.name || order.user.email}
              </div>
            )}
            {isProcessedOrder && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium mb-1">Warning:</div>
                    <div>
                      This order has been {order.status.toLowerCase()}. Deleting processed orders 
                      may affect your sales records and customer history.
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
            disabled={deleteOrderMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteOrderMutation.isPending}
            className="cursor-pointer"
          >
            {deleteOrderMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}