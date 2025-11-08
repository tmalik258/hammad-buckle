'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import CustomerFormModal from './customer-form-modal';

export default function AddUserButton() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer w-full sm:w-auto">
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
      <CustomerFormModal open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}


