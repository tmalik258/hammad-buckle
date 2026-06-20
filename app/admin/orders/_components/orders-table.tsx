'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserInitialsAvatar } from '@/components/ui/user-initials-avatar';
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
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useOrdersAdmin, useUpdateOrder } from '@/lib/hooks/useOrders';
import { OrderListItem, OrderStatus } from '@/lib/types/order';
import OrderFormModal from './order-form-modal';
import OrderDeleteModal from './order-delete-modal';

interface OrdersTableProps {
  page: number;
  search: string;
  status: string;
  sort: string;
}


const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'total_desc', label: 'Highest Value' },
  { value: 'total_asc', label: 'Lowest Value' },
];

function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: { label: 'Pending', variant: 'secondary' as const, icon: Calendar },
    CONFIRMED: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
    PROCESSING: { label: 'Processing', variant: 'default' as const, icon: Truck },
    SHIPPED: { label: 'Shipped', variant: 'default' as const, icon: Truck },
    DELIVERED: { label: 'Delivered', variant: 'default' as const, icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function OrdersTable({
  page,
  search,
  status,
  sort,
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for filters
  const [searchInput, setSearchInput] = useState(search);
  const [localStatus, setLocalStatus] = useState(status);
  const [localSort, setLocalSort] = useState(sort);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderListItem | null>(null);

  // API hooks - fetch all orders without server-side filtering
  const updateOrderMutation = useUpdateOrder();
  
  // Fetch all orders (we'll filter client-side)
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrdersAdmin({
    filters: {
      page: 1,
      limit: 1000, // Fetch more orders for client-side filtering
    },
  });

  // Update URL without page reload
  const updateURL = (newSearch: string, newStatus: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newSort) params.set('sort', newSort);
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newURL);
  };

  // Client-side filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = ordersData?.orders || [];

    // Apply search filter
    if (searchInput.trim()) {
      const searchTerm = searchInput.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.user?.name?.toLowerCase().includes(searchTerm) ||
        order.user?.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (localStatus && localStatus !== 'all') {
      filtered = filtered.filter(order => order.status === localStatus);
    }

    // Apply sorting
    const [sortBy, sortOrder] = localSort.split('_');
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortBy === 'total') {
        aValue = a.totalAmount;
        bValue = b.totalAmount;
      } else {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    return filtered;
  }, [ordersData?.orders, searchInput, localStatus, localSort]);

  // Pagination for filtered results
  const itemsPerPage = 10;
  const totalFilteredOrders = filteredAndSortedOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleEditOrder = (order: OrderListItem) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteOrder = (order: OrderListItem) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedOrder(null);
    setEditingOrder(null);
  };

  // Filter and sort orders - now using client-side filtered data
  const orders = paginatedOrders;
  const totalOrders = totalFilteredOrders;

  const handleSearch = () => {
    const trimmedSearch = searchInput.trim();
    setSearchInput(trimmedSearch);
    updateURL(trimmedSearch, localStatus, localSort);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus);
    updateURL(searchInput, newStatus, localSort);
  };

  const handleSortChange = (newSort: string) => {
    setLocalSort(newSort);
    updateURL(searchInput, localStatus, newSort);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId: orderId,
        updateData: { status: newStatus },
      });
      refetch(); // Refresh the orders list
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search orders, customers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={localStatus} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-40">
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
          <Select 
            value={localSort} 
            onValueChange={handleSortChange}
          >
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
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center p-8 text-red-500">
            <XCircle className="h-8 w-8 mr-2" />
            <span>Error loading orders: {error?.message || 'Unknown error'}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <span>No orders found</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserInitialsAvatar
                        name={order.user?.name}
                        email={order.user?.email}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium">{order.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.items && order.items.length > 0 ? (
                        <>
                          <Image
                            src={order.items[0].product?.image || '/default-product.png'}
                            alt={order.items[0].product?.name || 'Product'}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {order.items[0].product?.name || 'Unknown Product'}
                            </div>
                            {order.items.length > 1 && (
                              <div className="text-xs text-muted-foreground">
                                +{order.items.length - 1} more items
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
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
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOrder(order)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                        {order.status === 'PENDING' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, OrderStatus.CONFIRMED)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Order
                          </DropdownMenuItem>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, OrderStatus.SHIPPED)}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalOrders)} of{' '}
          {totalOrders} orders
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page - 1).toString());
              router.push(`?${params.toString()}`);
            }}
            disabled={page <= 1 || isLoading}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm px-2">
            Page {page} of {Math.ceil(totalOrders / 10)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page + 1).toString());
              router.push(`?${params.toString()}`);
            }}
            disabled={page >= Math.ceil(totalOrders / 10) || isLoading}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Edit Modal */}
      <OrderFormModal
        open={isEditModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) handleCloseModals();
        }}
        order={editingOrder}
        mode={editingOrder ? "edit" : "create"}
      />

      {/* Order Delete Modal */}
      <OrderDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) handleCloseModals();
        }}
        order={selectedOrder ? {
          id: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          status: selectedOrder.status,
          totalAmount: selectedOrder.totalAmount,
          user: selectedOrder.user ? {
            name: selectedOrder.user.name,
            email: selectedOrder.user.email
          } : undefined
        } : undefined}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}