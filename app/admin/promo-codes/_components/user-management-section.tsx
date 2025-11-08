'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, User, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserWithPromoCodeUsage {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  promoCodeUsage: {
    id: string;
    promoCode: {
      code: string;
      discountType: string;
      discountValue: number;
    };
    order: {
      id: string;
      orderNumber: string;
      total: number;
      status: string;
    };
    discountAmount: number;
    usedAt: string;
  }[];
  totalSavings: number;
  totalOrders: number;
}

interface UserManagementSectionProps {
  className?: string;
}

export function UserManagementSection({ className }: UserManagementSectionProps) {
  const [users, setUsers] = useState<UserWithPromoCodeUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageStatusFilter, setUsageStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (usageStatusFilter !== 'all') params.append('usageStatus', usageStatusFilter);
      if (accountTypeFilter !== 'all') params.append('accountType', accountTypeFilter);
      if (userIdFilter) params.append('userId', userIdFilter);

      const response = await fetch(`/api/admin/promo-codes/users?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, usageStatusFilter, accountTypeFilter, userIdFilter]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.append('export', 'true');
      
      if (searchTerm) params.append('search', searchTerm);
      if (usageStatusFilter !== 'all') params.append('usageStatus', usageStatusFilter);
      if (accountTypeFilter !== 'all') params.append('accountType', accountTypeFilter);
      if (userIdFilter) params.append('userId', userIdFilter);

      const response = await fetch(`/api/admin/promo-codes/users?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promo-code-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Users exported successfully');
      } else {
        toast.error('Failed to export users');
      }
    } catch (error) {
      toast.error('Error exporting users');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getUsageStatusBadge = (usageCount: number) => {
    if (usageCount === 0) {
      return <Badge variant="outline">No Usage</Badge>;
    } else if (usageCount <= 2) {
      return <Badge variant="secondary">Light User</Badge>;
    } else if (usageCount <= 5) {
      return <Badge variant="default">Regular User</Badge>;
    } else {
      return <Badge variant="destructive">Heavy User</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage users who have used promo codes
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            placeholder="Filter by User ID..."
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="w-full sm:w-[150px]"
          />
          <Select value={usageStatusFilter} onValueChange={setUsageStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Usage Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="no-usage">No Usage</SelectItem>
              <SelectItem value="light">Light Users</SelectItem>
              <SelectItem value="regular">Regular Users</SelectItem>
              <SelectItem value="heavy">Heavy Users</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Usage Status</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Savings</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Member Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found with the current filters
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const lastUsage = user.promoCodeUsage.length > 0 
                    ? user.promoCodeUsage.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())[0]
                    : null;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {user.id.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getUsageStatusBadge(user.promoCodeUsage.length)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.totalOrders}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          ${user.totalSavings.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lastUsage ? (
                          <div>
                            <p className="text-sm font-medium">{lastUsage.promoCode.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(lastUsage.usedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}