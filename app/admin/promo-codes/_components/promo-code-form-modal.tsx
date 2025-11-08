'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { promoCodeCreateSchema } from '@/lib/validations/promo-code-schema';
import { PromoCode } from '@prisma/client';

type PromoCodeFormData = z.infer<typeof promoCodeCreateSchema>;

interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode?: PromoCode;
  isEditing: boolean;
}

export function PromoCodeFormModal({
  isOpen,
  onClose,
  promoCode,
  isEditing
}: PromoCodeFormModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeCreateSchema),
    defaultValues: {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minimumOrderAmount: 0,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      expirationDate: new Date(),
      isActive: true
    }
  });

  useEffect(() => {
    if (isEditing && promoCode) {
      form.reset({
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        minimumOrderAmount: promoCode.minimumOrderAmount || 0,
        maxDiscountAmount: promoCode.maxDiscountAmount ?? undefined,
        usageLimit: promoCode.usageLimit ?? undefined,
        expirationDate: promoCode.expirationDate ? new Date(promoCode.expirationDate) : undefined,
        isActive: promoCode.isActive
      });
    } else {
      form.reset({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minimumOrderAmount: 0,
        maxDiscountAmount: undefined,
        usageLimit: undefined,
        expirationDate: new Date(),
        isActive: true
      });
    }
  }, [isEditing, promoCode, form]);

  const onSubmit: SubmitHandler<PromoCodeFormData> = async (data) => {
    try {
      setLoading(true);
      if (isEditing && !promoCode) {
        toast.error('No promo code selected for editing');
        return;
      }
      
      const payload = {
        ...data,
        minimumOrderAmount: data.minimumOrderAmount || null,
        maxDiscountAmount: data.maxDiscountAmount ?? null,
        usageLimit: data.usageLimit ?? null,
        expirationDate: data.expirationDate ? data.expirationDate.toISOString() : null
      };

      const url = isEditing && promoCode
        ? `/api/admin/promo-codes/${promoCode.id}`
        : '/api/admin/promo-codes';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(
          isEditing 
            ? 'Promo code updated successfully'
            : 'Promo code created successfully'
        );
        onClose();
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save promo code');
      }
    } catch (error) {
      toast.error('Error saving promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="promo-code-dialog-desc">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Promo Code' : 'Create New Promo Code'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription id="promo-code-dialog-desc" className="sr-only">
          Create or edit a promo code. Provide code, discount, optional limits and expiry.
        </DialogDescription>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter promo code (e.g., SAVE20)"
                      {...field}
                      className="uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discount Value {form.watch('discountType') === 'PERCENTAGE' ? '(%)' : '($)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter discount value"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimumOrderAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter minimum order amount (optional)"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {form.watch('discountType') === 'PERCENTAGE' && (
              <FormField
                control={form.control}
                name="maxDiscountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter maximum discount amount (optional)"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? undefined : parseFloat(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Enter total usage limit (optional)"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : parseInt(val, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                        field.onChange(dateValue);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={field.disabled}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this promo code
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}