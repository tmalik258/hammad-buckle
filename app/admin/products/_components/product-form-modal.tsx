"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  Info,
  DollarSign,
  Tag,
  Settings,
  Layers,
} from "lucide-react";
import { useProductForm } from "@/lib/hooks/useProductForm";
import { useCategories } from "@/lib/hooks/useCategories";
import ImageUploadWrapper from "@/components/image-upload-wrapper";
import VariantManagement from "./variant-management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductWithRelations } from "@/lib/hooks/useProductQueries";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSuccess?: () => void;
  product?: ProductWithRelations | null;
  mode: "create" | "edit";
}

export default function ProductFormModal({
  open,
  onOpenChange,
  onFormSuccess,
  product,
  mode,
}: ProductFormModalProps) {
  const { data: categoriesData } = useCategories();

  const categories = categoriesData?.categories || [];

  const handleSuccess = () => {
    // Call success callback if provided
    if (onFormSuccess) {
      onFormSuccess();
    } else {
      onOpenChange(false);
    }
    
    toast.success(
      mode === "create"
        ? "Product created successfully!"
        : "Product updated successfully!"
    );
  };

  const {
    form,
    onSubmit,
    isSubmitting,
    isUploading,
    uploadedImageUrl,
    selectedFile,
    handleFileUpload,
  } = useProductForm({
    product: mode === "edit" ? product : null,
    onSuccess: handleSuccess,
  });

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  // Watch form values to ensure image state persists
  const watchedImage = form.watch("image");
  const hasImage = uploadedImageUrl || selectedFile || watchedImage;

  // Watch form values for validation
  const watchedValues = form.watch();
  const isFormValid = form.formState.isValid && (
    watchedValues.name &&
    watchedValues.price > 0 &&
    watchedValues.categoryId &&
    (hasImage || watchedValues.image)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl h-[600px] flex flex-col overflow-y-auto px-3 sm:px-6 pb-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === "create" ? "Create New Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new product to your inventory with all the necessary details."
              : "Update the product information and settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 h-full"
            >
              <div className="flex w-full flex-col gap-6">
                <Tabs defaultValue="basic">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:w-auto lg:grid-cols-5 mb-[30px] sm:mb-0">
                    <TabsTrigger
                      value="basic"
                      className="flex items-center p-2 gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                      <span className="sm:hidden">Basic</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pricing"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Pricing</span>
                      <span className="sm:hidden">Price</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="categories"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Categories</span>
                      <span className="sm:hidden">Cat</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="status"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Status</span>
                      <span className="sm:hidden">Status</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="variants"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Variants</span>
                      <span className="sm:hidden">Var</span>
                    </TabsTrigger>
                  </TabsList>
                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="mt-6 mb-auto">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name..."
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product SKU..."
                                {...field}
                                disabled={isSubmitting}
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
                                placeholder="Enter product description..."
                                rows={3}
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <FormControl>
                              <ImageUploadWrapper
                                onFilesAdded={handleFileUpload}
                                isUploading={isUploading}
                                uploadedImageUrl={uploadedImageUrl}
                                maxSizeMB={2}
                                formImageValue={watchedImage}
                                onFileRemove={() => {
                                  // These will be handled by the hook
                                  form.setValue("image", "");
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  {/* Pricing & Inventory Tab */}
                  <TabsContent
                    value="pricing"
                    className="flex-1 h-full space-y-4 mt-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || 0)
                                }
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  {/* Categories & Classification Tab */}
                  <TabsContent
                    value="categories"
                    className="flex-1 space-y-4 mt-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isSubmitting}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="genderTarget"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Gender target</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isSubmitting}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="WOMENS">Women&apos;s</SelectItem>
                                <SelectItem value="MENS">Men&apos;s</SelectItem>
                                <SelectItem value="UNISEX">Unisex</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  {/* Product Status Tab */}
                  <TabsContent value="status" className="flex-1 space-y-4 mt-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured Product
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Display this product in featured sections
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="onSale"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">On Sale</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark this product as being on sale
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isNew"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                New Product
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark this product as new arrival
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  {/* Variants Tab */}
                  <TabsContent value="variants" className="space-y-4 mt-6">
                    <VariantManagement productId={product?.id} />
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (!isFormValid && mode === "create")}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create" ? "Create Product" : "Update Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
