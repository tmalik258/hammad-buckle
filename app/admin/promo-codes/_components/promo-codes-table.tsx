'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { usePromoCodes } from '@/lib/hooks/usePromoCodes';
import { usePromoCodesActions } from './promo-codes-context';

interface PromoCode {
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
}

interface PromoCodesTableProps {
  page: number;
  search: string;
  status: string;
  discountType: string;
  sortBy: string;
  sortOrder: string;
}

export function PromoCodesTable({
  page,
  search,
  status,
  discountType,
  sortBy,
  sortOrder
}: PromoCodesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(search);
  const { onEdit, onDelete } = usePromoCodesActions();

  // Derive filters from the URL to ensure they update on navigation
  const statusFromUrl = searchParams.get('status') || status || '';
  const discountTypeFromUrl = searchParams.get('discountType') || discountType || '';
  const searchFromUrl = searchParams.get('search') || search || '';

  // Use the new hook instead of manual fetch
  const { data: promoCodesData, isLoading: loading, error, refetch } = usePromoCodes({
    page,
    limit: 10,
    search: searchFromUrl || undefined,
    status: statusFromUrl || undefined,
    discountType: discountTypeFromUrl || undefined,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  const promoCodes = promoCodesData?.promoCodes || [];
  const totalPages = promoCodesData?.pagination?.totalPages || 1;
  const totalCount = promoCodesData?.pagination?.totalCount || 0;

  // Handle errors
  if (error) {
    toast.error('Failed to fetch promo codes');
  }

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/promo-codes?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams('search', searchValue);
  };

  const handleStatusFilter = (value: string) => {
    updateSearchParams('status', value);
  };

  const handleDiscountTypeFilter = (value: string) => {
    updateSearchParams('discountType', value);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(promoCodes.map(code => code.id));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleSelectCode = (codeId: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes([...selectedCodes, codeId]);
    } else {
      setSelectedCodes(selectedCodes.filter(id => id !== codeId));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCodes.length === 0) {
      toast.error('Please select promo codes first');
      return;
    }

    try {
      const response = await fetch('/api/admin/promo-codes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCodes, action })
      });

      if (response.ok) {
        toast.success(`Successfully ${action}d selected promo codes`);
        setSelectedCodes([]);
        // Refresh the list from the server
        await refetch();
      } else {
        toast.error(`Failed to ${action} promo codes`);
      }
    } catch (error) {
      toast.error(`Error ${action}ing promo codes`);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCodes.length > 0) {
        params.set('ids', selectedCodes.join(','));
      }
      const url = `/api/admin/promo-codes/export${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promo-codes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Promo codes exported successfully');
      } else {
        toast.error('Failed to export promo codes');
      }
    } catch (error) {
      toast.error('Error exporting promo codes');
    }
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    const isExpired = promoCode.expirationDate && new Date(promoCode.expirationDate) < new Date();
    const isMaxUsed = promoCode.usageLimit !== null && promoCode.usageCount >= (promoCode.usageLimit ?? 0);
    
    if (!promoCode.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isMaxUsed) {
      return <Badge variant="outline">Max Used</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Promo Codes ({totalCount})</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="cursor-pointer w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {selectedCodes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer w-full sm:w-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    Bulk Actions ({selectedCodes.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleBulkAction('delete')}
                    className="text-destructive"
                  >
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search promo codes..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="sm" className="cursor-pointer">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFromUrl || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={discountTypeFromUrl || 'all'} onValueChange={handleDiscountTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCodes.length === promoCodes.length && promoCodes.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.map((promoCode) => (
              <TableRow key={promoCode.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCodes.includes(promoCode.id)}
                    onCheckedChange={(checked) => handleSelectCode(promoCode.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{promoCode.code}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {promoCode.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {promoCode.discountType === 'PERCENTAGE' 
                    ? `${promoCode.discountValue}%` 
                    : `$${promoCode.discountValue}`
                  }
                </TableCell>
                <TableCell>
                  {promoCode.usageCount}
                  {promoCode.usageLimit !== null && ` / ${promoCode.usageLimit}`}
                </TableCell>
                <TableCell>{getStatusBadge(promoCode)}</TableCell>
                <TableCell>
                  {promoCode.expirationDate 
                    ? format(new Date(promoCode.expirationDate), 'MMM dd, yyyy')
                    : 'No expiry'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onEdit(promoCode)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer text-destructive"
                      onClick={() => onDelete(promoCode)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {promoCodes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No promo codes found
          </div>
        )}
      </CardContent>
    </Card>
  );
}