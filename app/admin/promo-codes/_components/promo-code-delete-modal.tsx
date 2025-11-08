'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCodeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode?: {
    id: string;
    code: string;
    usageCount: number;
  };
}

export function PromoCodeDeleteModal({
  isOpen,
  onClose,
  promoCode
}: PromoCodeDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!promoCode) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/promo-codes/${promoCode.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Promo code deleted successfully');
        onClose();
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete promo code');
      }
    } catch (error) {
      toast.error('Error deleting promo code');
    } finally {
      setLoading(false);
    }
  };

  if (!promoCode) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Promo Code</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to delete the promo code &quot;<strong>{promoCode.code}</strong>&quot;?
            {promoCode.usageCount > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This promo code has been used {promoCode.usageCount} time(s). 
                  Deleting it may affect order history and reporting.
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}