'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TypeFormModal from './type-form-modal';

interface TypesClientProps {
  children: React.ReactNode;
}

export default function TypesClient({ children }: TypesClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddType = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Type button */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Types</h1>
          <p className="text-muted-foreground">
            Manage product types and classifications
          </p>
        </div>
        <Button onClick={handleAddType} className="cursor-pointer w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Add Type Modal */}
      <TypeFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}