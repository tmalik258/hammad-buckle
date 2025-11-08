'use client';

import { createContext, useContext } from 'react';

type PromoCode = {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expirationDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromoCodesActions = {
  onCreate: () => void;
  onEdit: (promoCode: PromoCode) => void;
  onDelete: (promoCode: PromoCode) => void;
};

const PromoCodesActionsContext = createContext<PromoCodesActions | null>(null);

export function PromoCodesProvider({
  value,
  children,
}: {
  value: PromoCodesActions;
  children: React.ReactNode;
}) {
  return (
    <PromoCodesActionsContext.Provider value={value}>
      {children}
    </PromoCodesActionsContext.Provider>
  );
}

export function usePromoCodesActions() {
  const ctx = useContext(PromoCodesActionsContext);
  if (!ctx) {
    throw new Error('usePromoCodesActions must be used within PromoCodesProvider');
  }
  return ctx;
}


