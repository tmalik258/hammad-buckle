'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUpdateCustomer } from '@/lib/hooks/useCustomers';

type Props = {
  userId: string;
  currentRole: UserRole;
  currentUserId?: string;
  disabled?: boolean;
};

export function UserRoleSelect({
  userId,
  currentRole,
  currentUserId,
  disabled = false,
}: Props) {
  const updateCustomer = useUpdateCustomer();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const isSelf = currentUserId === userId;

  const handleChange = (value: string) => {
    const nextRole = value as UserRole;
    if (nextRole === currentRole) return;

    if (isSelf && nextRole === UserRole.CUSTOMER) {
      toast.error('You cannot demote your own admin account');
      return;
    }

    setPendingRole(nextRole);
  };

  const confirmChange = async () => {
    if (!pendingRole) return;

    try {
      await updateCustomer.mutateAsync({
        id: userId,
        data: { role: pendingRole },
      });
      toast.success(
        pendingRole === UserRole.ADMIN
          ? 'User promoted to admin'
          : 'User changed to customer'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <>
      <Select
        value={currentRole}
        onValueChange={handleChange}
        disabled={disabled || updateCustomer.isPending || isSelf}
      >
        <SelectTrigger className="w-[130px] cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
          <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={pendingRole !== null} onOpenChange={(open) => !open && setPendingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRole === UserRole.ADMIN ? 'Promote to admin?' : 'Change to customer?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRole === UserRole.ADMIN
                ? 'This user will be able to access the admin dashboard and manage the store.'
                : 'This user will lose admin access and become a customer-only account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={confirmChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
