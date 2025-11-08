'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { useCustomers, useDeleteCustomer } from '@/lib/hooks/useCustomers';
import CustomerFormModal from './customer-form-modal';
import { Prisma, User } from '@prisma/client';

type UserListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    avatar: true;
    role: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        orders: true;
        reviews: true;
        addresses: true;
      };
    };
  };
}>;

type EditableUser = Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'role' | 'isActive'>;

interface UsersTableProps {
  page: number;
  search: string;
  role: string;
  status: string;
  sort: string;
}

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'ADMIN', label: 'Admin' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'totalSpent_desc', label: 'Highest Spender' },
  { value: 'totalSpent_asc', label: 'Lowest Spender' },
];

function getRoleBadge(role: string) {
  const roleConfig = {
    CUSTOMER: { label: 'Customer', variant: 'secondary' as const, icon: CheckCircle },
    ADMIN: { label: 'Admin', variant: 'default' as const, icon: Shield },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CUSTOMER;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function getStatusBadge(status: string) {
  const statusConfig = {
    ACTIVE: { label: 'Active', variant: 'default' as const },
    INACTIVE: { label: 'Inactive', variant: 'secondary' as const },
    SUSPENDED: { label: 'Suspended', variant: 'destructive' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export default function UsersTable({
  page,
  search,
  role,
  status,
  sort,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<EditableUser | null>(null);
  const deleteCustomer = useDeleteCustomer();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useCustomers({
    page,
    limit: 10,
    search,
    status: status === 'all' ? '' : status,
    sortBy: sort.split('_')[0],
    sortOrder: sort.split('_')[1] as 'asc' | 'desc',
  });

  const users = useMemo(() => {
    const list = (data?.users || []) as UserListItem[];
    return list.filter((u) => {
      const matchesRole = !role || role === 'all' || u.role === role;
      const isActive = u.isActive;
      const matchesStatus = !status || status === 'all'
        ? true
        : status === 'ACTIVE'
          ? isActive === true
          : status === 'INACTIVE'
            ? isActive === false
            : true;
      return matchesRole && matchesStatus;
    });
  }, [data, role, status]);

  const totalUsers = users.length;
  const usersPerPage = 10;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (page - 1) * usersPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + usersPerPage);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Keep isActive in sync with status for server filter stability
    if (key === 'status') {
      if (value === 'ACTIVE') params.set('isActive', 'true');
      else if (value === 'INACTIVE') params.set('isActive', 'false');
      else params.delete('isActive');
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams('search', searchInput);
  };

  return (
    <>
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search customers by name, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={role} onValueChange={(value) => updateSearchParams('role', value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => updateSearchParams('status', value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => updateSearchParams('sort', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8}>Failed to load users</TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No users found</TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user: UserListItem) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={user.avatar || '/images/avatar-1.png'}
                        alt={user.name || '—'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">{user.name || '—'}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge((user.isActive ? 'ACTIVE' : 'INACTIVE'))}</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{user._count?.orders ?? 0}</div>
                      <div className="text-xs text-muted-foreground">orders</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {/* If you track spend server-side, place it here; default to 0 */}
                    ${Number(0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(user.updatedAt || user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/customers/${user.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingCustomer(user); setIsEditOpen(true); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
                        </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (deletingId || deleteCustomer.isPending) return;
                          const confirmed = window.confirm('Are you sure you want to delete this user?');
                          if (!confirmed) return;
                          try {
                            setDeletingId(user.id);
                            await deleteCustomer.mutateAsync(user.id);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        <span className="text-destructive flex items-center"><svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                          {deletingId === user.id ? 'Deleting...' : 'Delete User'}</span>
                      </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, totalUsers)} of{' '}
          {totalUsers} customers
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(page - 1));
              router.push(`?${params.toString()}`);
            }}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(page + 1));
              router.push(`?${params.toString()}`);
            }}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    {/* Edit User Modal */}
    <CustomerFormModal open={isEditOpen} onOpenChange={(v) => { if (!v) setEditingCustomer(null); setIsEditOpen(v); }} customer={editingCustomer ? {
      id: editingCustomer.id,
      name: editingCustomer.name,
      email: editingCustomer.email,
      avatar: editingCustomer.avatar ?? null,
      role: editingCustomer.role,
      isActive: editingCustomer.isActive,
    } : null} />
    </>
  );
}