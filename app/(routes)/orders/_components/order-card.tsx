'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from './order-status-badge';
import type { OrderListItem } from '@/lib/types/order';
import { 
  CalendarIcon, 
  PackageIcon, 
  CreditCardIcon,
  TruckIcon,
  EyeIcon
} from 'lucide-react';

interface OrderCardProps {
  order: OrderListItem;
  className?: string;
}

export const OrderCard = ({ order, className }: OrderCardProps) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const getItemsCount = () => {
    return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const getFirstProductImage = () => {
    const firstItem = order.items?.[0];
    return firstItem?.product?.image || '/placeholder-product.jpg';
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={getFirstProductImage()}
                alt="Order item"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Items:</span>
            <span className="font-medium">{getItemsCount()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-primary">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="flex items-start gap-2 text-sm">
            <TruckIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-muted-foreground">Shipping to:</span>
              <p className="font-medium">
                {order.shippingAddress.area}, {order.shippingAddress.city}
              </p>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <Badge variant="outline" className="ml-2">
              {order.paymentMethod}
            </Badge>
          </div>
        )}

        <Separator />

        {/* Order Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
            <div className="space-y-2">
              {order.items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
                    <Image
                      src={item.product?.image || '/placeholder-product.jpg'}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {item.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-sm text-muted-foreground">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {/* <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/orders/${order.id}`}>
              <EyeIcon className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
          {order.status === 'DELIVERED' && (
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link href={`/orders/${order.id}/review`}>
                Review Order
              </Link>
            </Button>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};