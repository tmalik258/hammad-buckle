'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, FolderOpen } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/useCategories';
import { categoryFormSchema, type CategoryFormData } from '@/lib/validations/category-schema';
import ImageUploadWrapper from '@/components/image-upload-wrapper';
import { type FileWithPreview } from '@/lib/hooks/useFileUpload';
import { uploadImage } from '@/lib/utils/supabase/uploadImage';
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
import { Category } from '@prisma/client';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onClose: () => void;
}

export default function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onClose,
}: CategoryFormModalProps) {
  const isEditing = !!category;

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      featured: false,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (isEditing && category) {
        form.reset({
          name: category.name || '',
          description: category.description || '',
          image: category.image || '',
          featured: category.featured ?? false,
          isActive: category.isActive ?? true,
        });
        setUploadedImageUrl(category.image || null);
        setSelectedFile(null); // Clear selected file when editing
      } else {
        form.reset({
          name: '',
          description: '',
          image: '',
          featured: false,
          isActive: true,
        });
        setUploadedImageUrl(null);
        setSelectedFile(null); // Clear selected file for new category
      }
    }
  }, [open, isEditing, category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      let finalImageUrl = uploadedImageUrl || data.image;

      // If there's a selected file, upload it first
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadImage(selectedFile, 'categories');
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            toast.success('Image uploaded successfully!');
          } else {
            toast.error('Failed to upload image');
            return; // Stop submission if upload fails
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image');
          return; // Stop submission if upload fails
        } finally {
          setIsUploading(false);
        }
      }

      // Prepare final data with uploaded image URL
      const finalData = {
        ...data,
        image: finalImageUrl,
      };

      if (isEditing && category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          ...finalData,
        });
        toast.success('Category updated successfully!');
      } else {
        await createCategoryMutation.mutateAsync(finalData);
        toast.success('Category created successfully!');
      }
      
      form.reset();
      setUploadedImageUrl(null);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(isEditing ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleClose = () => {
    form.reset();
    setUploadedImageUrl(null);
    setSelectedFile(null);
    onClose();
  };

  // Handle file upload (now just stores the file for later upload)
  const handleFileUpload = async (files: FileWithPreview[]) => {
    if (files.length === 0) return;

    const fileWithPreview = files[0];
    
    // Extract the actual File object from FileWithPreview
    if (fileWithPreview.file instanceof File) {
      setSelectedFile(fileWithPreview.file);
      // Clear any previously uploaded URL since we have a new file
      setUploadedImageUrl(null);
      form.setValue('image', ''); // Clear the form field
    } else {
      toast.error('Invalid file type');
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the category information below.'
              : 'Add a new category to organize your products.'}
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
                      placeholder="Enter category name..."
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
                      placeholder="Enter category description..."
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
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <ImageUploadWrapper
                      onFilesAdded={handleFileUpload}
                      isUploading={isUploading}
                      uploadedImageUrl={uploadedImageUrl}
                      maxSizeMB={2}
                      onFileRemove={() => {
                        setSelectedFile(null);
                        setUploadedImageUrl(null);
                        form.setValue('image', '');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Featured Category</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Display this category prominently on the homepage
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this category for product classification
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
              <Button 
                type="submit" 
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}