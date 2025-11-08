"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productVariantSchema, ProductVariantData } from "@/lib/validations/product-schema";
import { useProductVariants } from "@/lib/hooks/useVariantQueries";
import { 
  useCreateVariant, 
  useUpdateVariant, 
  useDeleteVariant,
  ProductVariant
} from "@/lib/hooks/useVariantMutations";

interface VariantManagementProps {
  productId?: string;
}

export default function VariantManagement({
  productId,
}: VariantManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Fetch variants for the product
  const { data: variants = [], isLoading } = useProductVariants(productId || '');
  
  // Mutation hooks
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();

  const form = useForm<ProductVariantData>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      name: "",
      value: "",
      price: null,
      stock: 0,
      sku: "",
    },
  });

  const handleAddVariant = async (data: ProductVariantData) => {
    if (!productId) return;
    
    try {
      await createVariantMutation.mutateAsync({
        ...data,
        productId,
      });
      handleCloseAddDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleEditVariant = async (data: ProductVariantData) => {
    if (!editingVariant) return;
    
    try {
      await updateVariantMutation.mutateAsync({
        id: editingVariant.id,
        ...data,
      });
      setEditingVariant(null);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariantMutation.mutateAsync(variantId);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const openEditDialog = (variant: ProductVariant) => {
    setEditingVariant(variant);
    form.reset({
      name: variant.name,
      value: variant.value,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku || "",
    });
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingVariant(null);
    form.reset();
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    form.reset();
  };

  const formatPrice = (price?: number | null) => {
    if (!price || price === 0) return "No additional cost";
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Variants</h3>
          <p className="text-sm text-muted-foreground">
            Manage different variations of this product (size, color, etc.)
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          disabled={!productId || createVariantMutation.isPending}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No variants yet</h4>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add variants to offer different options like sizes, colors, or configurations.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} disabled={!productId || createVariantMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Variant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {variants.length} Variant{variants.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Price Modifier</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{variant.value}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(variant.price)}</TableCell>
                    <TableCell>
                      <Badge variant={variant.stock > 0 ? "default" : "destructive"}>
                        {variant.stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {variant.sku || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(variant)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
                          disabled={deleteVariantMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Variant Dialog */}
      <Dialog open={isAddDialogOpen || !!editingVariant} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </DialogTitle>
            <DialogDescription>
              {editingVariant
                ? "Update the variant details below."
                : "Create a new variant for this product with specific attributes."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                editingVariant ? handleEditVariant : handleAddVariant
              ) as React.FormEventHandler<HTMLFormElement>}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Size, Color"
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
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Value</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Large, Red"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Modifier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : parseFloat(value));
                          }}
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
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
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Unique identifier for this variant"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialogs}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
                >
                  {createVariantMutation.isPending || updateVariantMutation.isPending
                    ? "Saving..."
                    : editingVariant
                    ? "Update Variant"
                    : "Add Variant"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}