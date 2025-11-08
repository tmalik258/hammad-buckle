'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderFormModal from './order-form-modal';

interface OrdersClientProps {
  children: React.ReactNode;
}

export default function OrdersClient({ children }: OrdersClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track order fulfillment
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="cursor-pointer w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Content */}
      {children}

      {/* Add Order Modal */}
      <OrderFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        mode="create"
      />
    </div>
  );
}