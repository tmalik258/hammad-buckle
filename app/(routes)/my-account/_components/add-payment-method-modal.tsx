'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Loader2 } from 'lucide-react';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddPaymentMethodForm = ({ onSuccess, onCancel }: AddPaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { addPaymentMethod, isAdding } = usePaymentMethods();
  
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
  });
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name || undefined,
          email: billingDetails.email || undefined,
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to create payment method');
        return;
      }

      if (!paymentMethod) {
        toast.error('Failed to create payment method');
        return;
      }

      // Add payment method to customer
      await addPaymentMethod(paymentMethod.id, setAsDefault);
      
      onSuccess();
    } catch (error) {
      console.error('Error adding payment method:', error);
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#9ca3af',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  const isLoading = isSubmitting || isAdding;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Cardholder Name
          </Label>
          <Input
            id="name"
            type="text"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="text-gray-300">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            required
          />
        </div>
      </div>

      {/* Card Element */}
      <div>
        <Label className="text-gray-300 mb-2 block">
          Card Information
        </Label>
        <div className="p-3 bg-gray-800 border border-gray-600 rounded-md focus-within:border-purple-500 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Set as Default */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="setAsDefault"
          checked={setAsDefault}
          onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
          className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
        />
        <Label htmlFor="setAsDefault" className="text-gray-300 cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !stripe}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPaymentMethodModal = ({ isOpen, onClose }: AddPaymentMethodModalProps) => {
  const handleSuccess = () => {
    onClose();
    toast.success('Payment method added successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <CreditCard className="mr-2 h-5 w-5" />
            Add New Payment Method
          </DialogTitle>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};