'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OccasionFormModal from './occasion-form-modal';

interface OccasionsClientProps {
  children: React.ReactNode;
}

export default function OccasionsClient({ children }: OccasionsClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddOccasion = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Occasion button */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Occasions</h1>
          <p className="text-muted-foreground">
            Manage special occasions and events for your products
          </p>
        </div>
        <Button onClick={handleAddOccasion} className="cursor-pointer w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Occasion
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Add Occasion Modal */}
      <OccasionFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}