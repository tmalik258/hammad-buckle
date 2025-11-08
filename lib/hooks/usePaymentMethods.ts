'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  StripePaymentMethod,
  PaymentMethodsResponse,
  AddPaymentMethodRequest,
  AddPaymentMethodResponse,
  SetDefaultPaymentMethodRequest,
  PaymentMethodResponse,
} from '@/lib/types/stripe-payment-method';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get<PaymentMethodsResponse>('/api/payment-methods');
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods');
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new payment method
  const addPaymentMethod = useCallback(async (
    paymentMethodId: string,
    setAsDefault: boolean = false
  ) => {
    try {
      setIsAdding(true);
      setError(null);
      
      const requestData: AddPaymentMethodRequest = {
        paymentMethodId,
        setAsDefault,
      };
      
      const response = await axios.post<AddPaymentMethodResponse>(
        '/api/payment-methods',
        requestData
      );
      
      // Update local state
      const newPaymentMethod = response.data.paymentMethod;
      
      setPaymentMethods(prev => {
        // If setting as default, update other methods
        if (setAsDefault) {
          const updatedMethods = prev.map(pm => ({ ...pm, isDefault: false }));
          return [...updatedMethods, newPaymentMethod];
        }
        return [...prev, newPaymentMethod];
      });
      
      toast.success(response.data.message);
      return response.data.paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || 'Failed to add payment method'
        : 'Failed to add payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAdding(false);
    }
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsRemoving(paymentMethodId);
      setError(null);
      
      const response = await axios.delete<PaymentMethodResponse>(
        `/api/payment-methods/${paymentMethodId}`
      );
      
      // Update local state
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      
      toast.success(response.data.message);
      
      // If the removed method was default, show a message
      if (response.data.wasDefault) {
        toast.info('Please set a new default payment method');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || 'Failed to remove payment method'
        : 'Failed to remove payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsRemoving(null);
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      setError(null);
      
      const requestData: SetDefaultPaymentMethodRequest = {
        paymentMethodId,
      };
      
      const response = await axios.post<PaymentMethodResponse>(
        '/api/payment-methods/default',
        requestData
      );
      
      // Update local state
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }))
      );
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || 'Failed to set default payment method'
        : 'Failed to set default payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSettingDefault(null);
    }
  }, []);

  // Get default payment method
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault);

  // Load payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    defaultPaymentMethod,
    isLoading,
    isAdding,
    isRemoving,
    isSettingDefault,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
};