'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCustomer, useUpdateCustomer } from '@/lib/hooks/useCustomers';
import { Customer } from '@/lib/types';

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: {
    id: string;
    name?: string | null;
    email: string;
    avatar?: string | null;
    role: 'CUSTOMER' | 'ADMIN';
    isActive?: boolean;
  } | null;
}

export default function CustomerFormModal({ open, onOpenChange, customer }: CustomerFormModalProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const isEdit = !!customer?.id;

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setAvatar(customer.avatar || '');
      setRole(customer.role);
      setIsActive(customer.isActive ?? true);
    } else {
      reset();
    }
   
  }, [customer, open]);

  const reset = () => {
    setName('');
    setEmail('');
    setAvatar('');
    setRole('CUSTOMER');
    setPassword('');
    setIsActive(true);
  };

  const handleSubmit = async () => {
    if (!name || !email) return;
    try {
      if (isEdit && customer?.id) {
        await updateCustomer.mutateAsync({
          id: customer.id,
          data: {
            name,
            email,
            avatar: avatar || undefined,
            role,
            isActive,
            ...(password ? { password } : {}),
          },
        });
      } else {
        await createCustomer.mutateAsync({
          name,
          email,
          avatar: avatar || undefined,
          role,
          password: password || undefined,
        });
      }
      reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!(createCustomer.isPending || updateCustomer.isPending)) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update user account details.' : 'Create a new user account.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" disabled={createCustomer.isPending || updateCustomer.isPending} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" disabled={createCustomer.isPending || updateCustomer.isPending} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar URL (optional)</label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." disabled={createCustomer.isPending || updateCustomer.isPending} />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a login password" disabled={createCustomer.isPending} />
            </div>
          )}
          {isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password (optional)</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" disabled={updateCustomer.isPending} />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as 'CUSTOMER' | 'ADMIN')}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-sm font-medium">Active</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                onBlur={() => { if (isEdit && customer?.id && isActive === undefined) setIsActive(false); }}
                disabled={updateCustomer.isPending}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createCustomer.isPending || updateCustomer.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={(createCustomer.isPending || updateCustomer.isPending) || !name || !email || (!isEdit && !password)}>
            {isEdit ? (updateCustomer.isPending ? 'Saving...' : 'Save Changes') : (createCustomer.isPending ? 'Creating...' : 'Create User')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


