'use client';

import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_CONFIG } from '@/lib/types/order';
import { OrderStatus } from '@prisma/client';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => {
  const config = ORDER_STATUS_CONFIG[status];
  
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      className={`${config.color} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
};