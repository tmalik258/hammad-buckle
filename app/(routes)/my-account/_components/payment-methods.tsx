'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, Plus, MoreVertical, Trash2, Star } from 'lucide-react';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { StripePaymentMethod } from '@/lib/types/stripe-payment-method';
import { AddPaymentMethodModal } from './add-payment-method-modal';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
  paymentMethod: StripePaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  isSettingDefault: boolean;
  isRemoving: boolean;
}

const PaymentMethodCard = ({
  paymentMethod,
  onSetDefault,
  onRemove,
  isSettingDefault,
  isRemoving,
}: PaymentMethodCardProps) => {
  const { card, isDefault, billingDetails } = paymentMethod;
  
  if (!card) return null;

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'bg-blue-600';
      case 'mastercard':
        return 'bg-red-600';
      case 'amex':
      case 'american_express':
        return 'bg-green-600';
      case 'discover':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBrandText = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MC';
      case 'amex':
      case 'american_express':
        return 'AMEX';
      case 'discover':
        return 'DISC';
      default:
        return brand.toUpperCase().slice(0, 4);
    }
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  return (
    <div className="relative flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-8 h-6 rounded flex items-center justify-center text-white text-xs font-bold",
          getBrandColor(card.brand)
        )}>
          {getBrandText(card.brand)}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <p className="text-white font-medium">
              **** **** **** {card.last4}
            </p>
            {isDefault && (
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                <Star className="w-3 h-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Expires {formatExpiry(card.expMonth, card.expYear)}</span>
            {billingDetails?.name && (
              <>
                <span>•</span>
                <span>{billingDetails.name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-sm">
          {formatExpiry(card.expMonth, card.expYear)}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              disabled={isSettingDefault || isRemoving}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            {!isDefault && (
              <DropdownMenuItem
                onClick={() => onSetDefault(paymentMethod.id)}
                disabled={isSettingDefault}
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
              >
                <Star className="mr-2 h-4 w-4" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onRemove(paymentMethod.id)}
              disabled={isRemoving}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {(isSettingDefault || isRemoving) && (
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

const PaymentMethodSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-8 h-6 bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-gray-700" />
        <Skeleton className="h-3 w-24 bg-gray-700" />
      </div>
    </div>
    <Skeleton className="h-4 w-12 bg-gray-700" />
  </div>
);

export const PaymentMethods = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    paymentMethods,
    isLoading,
    isRemoving,
    isSettingDefault,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods();

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRemove = async (paymentMethodId: string) => {
    try {
      await removePaymentMethod(paymentMethodId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <>
      <Card className="bg-transparent border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 2 }).map((_, index) => (
                <PaymentMethodSkeleton key={index} />
              ))
            ) : paymentMethods.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 mb-4">No payment methods added yet</p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Payment Method
                </Button>
              </div>
            ) : (
              // Payment methods list
              <>
                {paymentMethods.map((paymentMethod) => (
                  <PaymentMethodCard
                    key={paymentMethod.id}
                    paymentMethod={paymentMethod}
                    onSetDefault={handleSetDefault}
                    onRemove={handleRemove}
                    isSettingDefault={isSettingDefault === paymentMethod.id}
                    isRemoving={isRemoving === paymentMethod.id}
                  />
                ))}
                
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-purple-600/10 hover:border-purple-500 hover:text-white cursor-pointer transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Payment Method
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};