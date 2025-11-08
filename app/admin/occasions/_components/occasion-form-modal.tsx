'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Calendar } from 'lucide-react';
import { occasionFormSchema, OccasionFormData } from '@/lib/validations/occasion-schema';
import { useCreateOccasion, useUpdateOccasion } from '@/lib/hooks/useOccasions';
import { Occasion } from '@prisma/client';

interface OccasionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occasion?: Occasion;
  onClose: () => void;
}

export default function OccasionFormModal({
  open,
  onOpenChange,
  occasion,
  onClose,
}: OccasionFormModalProps) {
  const isEditing = !!occasion;
  const createOccasion = useCreateOccasion();
  const updateOccasion = useUpdateOccasion();

  const form = useForm<OccasionFormData>({
    resolver: zodResolver(occasionFormSchema),
    defaultValues: {
      name: '',
      description: null,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or occasion changes
  useEffect(() => {
    if (open) {
      if (isEditing && occasion) {
        form.reset({
          name: occasion.name || '',
          description: occasion.description || null,
          isActive: occasion.isActive ?? true,
        });
      } else {
        form.reset({
          name: '',
          description: null,
          isActive: true,
        });
      }
    }
  }, [open, isEditing, occasion, form]);

  const onSubmit = async (data: OccasionFormData) => {
    try {
      if (isEditing) {
        await updateOccasion.mutateAsync({
          id: occasion.id,
          data: {
            name: data.name,
            description: data.description ?? null,
            isActive: data.isActive,
          },
        });
      } else {
        await createOccasion.mutateAsync(data);
      }
      
      handleClose();
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = createOccasion.isPending || updateOccasion.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? 'Edit Occasion' : 'Create New Occasion'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the occasion information below.'
              : 'Add a new occasion for special events and holidays.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter occasion name..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter occasion description..."
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                      disabled={isLoading}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this occasion for product classification
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Occasion' : 'Create Occasion'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}