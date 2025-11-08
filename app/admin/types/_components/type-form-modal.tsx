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
import { Loader2, Tag } from 'lucide-react';
import { typeFormSchema, TypeFormData } from '@/lib/validations/type-schema';
import { useCreateType, useUpdateType } from '@/lib/hooks/useTypes';
import { Type } from '@prisma/client';

interface TypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: Type;
  onClose: () => void;
}

export default function TypeFormModal({
  open,
  onOpenChange,
  type,
  onClose,
}: TypeFormModalProps) {
  const isEditing = !!type;
  const createType = useCreateType();
  const updateType = useUpdateType();

  const form = useForm<TypeFormData>({
    resolver: zodResolver(typeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (open) {
      if (isEditing && type) {
        form.reset({
          name: type.name || '',
          description: type.description || '',
          isActive: type.isActive ?? true,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, isEditing, type, form]);

  const onSubmit = async (data: TypeFormData) => {
    try {
      if (isEditing) {
        await updateType.mutateAsync({
          id: type.id,
          ...data,
        });
      } else {
        await createType.mutateAsync(data);
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

  const isLoading = createType.isPending || updateType.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isEditing ? 'Edit Type' : 'Create New Type'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the type information below.'
              : 'Add a new type to organize your products.'}
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
                      placeholder="Enter type name..."
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
                      placeholder="Enter type description..."
                      rows={3}
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this type for product classification
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
                {isEditing ? 'Update Type' : 'Create Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}