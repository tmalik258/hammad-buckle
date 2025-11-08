import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { productFormSchema, ProductFormData, defaultProductFormValues } from '@/lib/validations/product-schema';
import { ProductWithRelations } from './useProductQueries';
import { useCreateProduct, useUpdateProduct } from './useProductMutations';
import { useCategories } from './useCategories';
import { uploadImage } from '@/lib/utils/supabase/uploadImage';
import { FileWithPreview } from './useFileUpload';

interface UseProductFormProps {
  product?: ProductWithRelations | null;
  onSuccess?: () => void;
}

export function useProductForm({ product, onSuccess }: UseProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories } = useCategories();

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
  });

  // Initialize form with product data when editing
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice || undefined,
        categoryId: product.categoryId || undefined,
        typeId: product.typeId || undefined,
        occasionId: product.occasionId || undefined,
        image: product.image || '',
        images: product.images || [],
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
        sku: product.sku || '',
        weight: product.weight || undefined,
        dimensions: product.dimensions || '',
        featured: product.featured,
        isNew: product.isNew,
        onSale: product.onSale,
      });

      if (product.image) {
        setUploadedImageUrl(product.image);
      }
      setSelectedFile(null); // Clear selected file when editing
    } else {
      form.reset(defaultProductFormValues);
      setUploadedImageUrl(null);
      setSelectedFile(null); // Clear selected file for new product
    }
  }, [product, form]);

  // Handle file upload (now just stores the file for later upload)
  const handleFileUpload = async (files: FileWithPreview[]) => {
    if (files.length === 0) return;

    const fileWithPreview = files[0];
    
    // Extract the actual File object from FileWithPreview
    if (fileWithPreview.file instanceof File) {
      setSelectedFile(fileWithPreview.file);
      // Clear any previously uploaded URL since we have a new file
      setUploadedImageUrl(null);
      // Set the preview URL in the form field to maintain persistence across tab switches
      form.setValue('image', fileWithPreview.preview || '');
    } else {
      toast.error('Invalid file type');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = uploadedImageUrl || data.image;

      // If there's a selected file, upload it first
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadImage(selectedFile, 'products');
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

      // Transform form data to match Prisma schema and API expectations
      const productData = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        originalPrice: data.originalPrice || null,
        categoryId: data.categoryId,
        typeId: data.typeId,
        occasionId: data.occasionId,
        image: finalImageUrl,
        images: data.images || [],
        stockQuantity: data.stockQuantity,
        inStock: data.inStock,
        sku: data.sku || null,
        weight: data.weight || null,
        dimensions: data.dimensions || '',
        featured: data.featured,
        isNew: data.isNew,
        onSale: data.onSale,
        isActive: true, // Default to active
      };

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
        toast.success('Product updated successfully!');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created successfully!');
      }

      onSuccess?.();
    } catch (error) {
      console.log('Error saving product:', error);
      toast.error(product ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    uploadedImageUrl,
    selectedFile,
    isSubmitting,
    isUploading,
    categories: categories?.categories || [],
    handleFileUpload,
    onSubmit,
    isEditing: !!product,
  };
}