'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryFormModal from './category-form-modal';

interface CategoriesClientProps {
  children: React.ReactNode;
}

export default function CategoriesClient({ children }: CategoriesClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and organize your catalog
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Content */}
      {children}

      {/* Add Category Modal */}
      <CategoryFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}