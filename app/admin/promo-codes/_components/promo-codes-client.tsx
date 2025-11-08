'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromoCodeFormModal } from './promo-code-form-modal';
import { PromoCodeDeleteModal } from './promo-code-delete-modal';
import { PromoCodesProvider } from './promo-codes-context';
import type { PromoCode as PrismaPromoCode } from '@prisma/client';

interface PromoCodesClientProps {
  children: React.ReactNode;
}

export function PromoCodesClient({ children }: PromoCodesClientProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PrismaPromoCode | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreate = () => {
    setSelectedPromoCode(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (promoCode: PrismaPromoCode) => {
    setSelectedPromoCode(promoCode);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (promoCode: PrismaPromoCode) => {
    setSelectedPromoCode(promoCode);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedPromoCode(null);
    setIsEditing(false);
  };

  return (
    <PromoCodesProvider
      value={{
        onCreate: handleCreate,
        // Cast to the context's expected function types to maintain compatibility
        onEdit: handleEdit as unknown as import('./promo-codes-context').PromoCodesActions['onEdit'],
        onDelete: handleDelete as unknown as import('./promo-codes-context').PromoCodesActions['onDelete'],
      }}
    >
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
          <p className="text-muted-foreground">
            Manage promotional codes and track their usage
          </p>
        </div>
        <Button onClick={handleCreate} className="cursor-pointer w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Promo Code
        </Button>
      </div>

      {children}

      <PromoCodeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        promoCode={selectedPromoCode ?? undefined}
        isEditing={isEditing}
      />

      <PromoCodeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        // Map Prisma promo code to the minimal shape expected by the delete modal
        promoCode={
          selectedPromoCode
            ? {
                id: selectedPromoCode.id,
                code: selectedPromoCode.code,
                usageCount:
                  // Use Prisma's usageCount aligned with Prisma field names
                  (selectedPromoCode as PrismaPromoCode).usageCount ?? 0,
              }
            : undefined
        }
      />
    </PromoCodesProvider>
  );
}