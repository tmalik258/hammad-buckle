"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  User,
  Package,
  DollarSign,
  MapPin,
} from "lucide-react";
import { useCreateOrder, useUpdateOrder } from "@/lib/hooks/useOrders";
import { useProducts } from "@/lib/hooks/useProducts";
import { OrderWithRelations, OrderListItem } from "@/lib/types/order";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Address } from "@prisma/client";

// Updated Zod schema that matches your Prisma Order model structure
const orderFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  orderNumber: z.string().optional(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  discount: z.number().min(0),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(), // Convert to Date when submitting
  deliveredAt: z.string().optional(), // Convert to Date when submitting

  // For form UI purposes - these will be used to create/update Address records
  shippingAddress: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required").optional(),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().optional(),
  }),

  billingAddress: z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required").optional(),
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      area: z.string().min(1, "Area is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      phone: z.string().optional(),
    })
    .optional(),

  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be positive"),
        total: z.number().min(0, "Total must be positive"),
      })
    )
    .min(1, "At least one product is required"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: OrderWithRelations | OrderListItem | null;
  mode: "create" | "edit";
}

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_REFUNDED", label: "Partially Refunded" },
];

export default function OrderFormModal({
  open,
  onOpenChange,
  order,
  mode,
}: OrderFormModalProps) {
  const { data: productsData } = useProducts();
  const products = productsData?.products || [];

  const [items, setItems] = useState([
    { productId: "", quantity: 1, price: 0, total: 0 },
  ]);

  // Initialize mutation hooks
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  // Function to check for validation errors in each tab
  const getTabErrors = (formErrors: FieldErrors<OrderFormData>) => {
    const customerErrors = formErrors?.userId || formErrors?.orderNumber || formErrors?.status || formErrors?.paymentStatus;
    const productsErrors = formErrors?.items;
    const shippingErrors = formErrors?.shippingAddress || formErrors?.billingAddress || formErrors?.trackingNumber || formErrors?.estimatedDelivery || formErrors?.deliveredAt;
    const paymentErrors = formErrors?.totalAmount || formErrors?.subtotal || formErrors?.tax || formErrors?.shipping || formErrors?.discount || formErrors?.paymentMethod;

    return {
      customer: !!customerErrors,
      products: !!productsErrors,
      shipping: !!shippingErrors,
      payment: !!paymentErrors,
    };
  };

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userId: "",
      orderNumber: "",
      status: "PENDING",
      totalAmount: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      paymentMethod: "",
      paymentStatus: "PENDING",
      shippingAddressId: "",
      billingAddressId: "",
      trackingNumber: "",
      estimatedDelivery: "",
      deliveredAt: "",
      shippingAddress: {
        name: "",
        email: "",
        street: "",
        city: "",
        area: "",
        postalCode: "",
        phone: "",
      },
      billingAddress: {
        name: "",
        email: "",
        street: "",
        city: "",
        area: "",
        postalCode: "",
        phone: "",
      },
      items: items || [],
    },
  });

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (open && mode === "edit" && order) {
      form.reset({
        userId: order.userId || "",
        orderNumber: order.orderNumber || "",
        status: order.status || "PENDING",
        totalAmount: order.totalAmount || 0,
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        paymentMethod: order.paymentMethod || "",
        paymentStatus: order.paymentStatus || "PENDING",
        trackingNumber: order.trackingNumber || "",
        estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0] || "",
        deliveredAt: order.deliveredAt?.toISOString().split("T")[0] || "",
        shippingAddress: order.shippingAddress ? {
          name: (order.shippingAddress as Address).name || "",
          email: (order.shippingAddress as Address).email || "",
          street: (order.shippingAddress as Address).street || "",
          city: (order.shippingAddress as Address).city || "",
          area: (order.shippingAddress as Address).area || "",
          postalCode: (order.shippingAddress as Address).postalCode || "",
          phone: (order.shippingAddress as Address).phone || "",
        } : {
          name: "",
          email: "",
          street: "",
          city: "",
          area: "",
          postalCode: "",
          phone: "",
        },
        billingAddress: (order as OrderWithRelations).billingAddress ? {
          name: ((order as OrderWithRelations).billingAddress as Address).name || "",
          email: ((order as OrderWithRelations).billingAddress as Address).email || "",
          street: ((order as OrderWithRelations).billingAddress as Address).street || "",
          city: ((order as OrderWithRelations).billingAddress as Address).city || "",
          area: ((order as OrderWithRelations).billingAddress as Address).area || "",
          postalCode: ((order as OrderWithRelations).billingAddress as Address).postalCode || "",
          phone: ((order as OrderWithRelations).billingAddress as Address).phone || "",
        } : {
          name: "",
          email: "",
          street: "",
          city: "",
          area: "",
          postalCode: "",
          phone: "",
        },
        items: order.items || items,
      });
      setItems(order.items || items);
    } else if (open && mode === "create") {
      form.reset();
      setItems([{ productId: "", quantity: 1, price: 0, total: 0 }]);
    }
  }, [open, mode, order, form]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      if (mode === "create") {
        const orderData = {
          ...data,
          items: items.filter(item => item.productId).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        };
        await createOrderMutation.mutateAsync(orderData);
        toast.success("Order created successfully!");
      } else {
        // For updates, only send the fields that OrderUpdateData expects
        const updateData = {
          status: data.status,
          trackingNumber: data.trackingNumber,
        };
        await updateOrderMutation.mutateAsync({
          orderId: order?.id || "",
          updateData,
        });
        toast.success("Order updated successfully!");
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order. Please try again.");
    }
  };

  const addLineItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue("items", newItems);
    }
  };

  const updateLineItem = (index: number, field: string, value: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-set price when product is selected
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].total = product.price * newItems[index].quantity;
      }
    }

    // Update total when quantity changes
    if (field === "quantity") {
      newItems[index].total = newItems[index].price * (value as number);
    }

    setItems(newItems);
    form.setValue("items", newItems);
  };

  const isSubmitting =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[700px] flex flex-col overflow-y-auto px-3 sm:px-6 pb-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {mode === "create" ? "Create New Order" : "Edit Order"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new order with customer details and products."
              : "Update the order information and details."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 h-full"
            >
              <Tabs defaultValue="customer" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 mb-4 sm:mb-0">
                  <TabsTrigger
                    value="customer"
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getTabErrors(form.formState.errors).customer ? 'border-red-500 border-2' : ''}`}
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Customer</span>
                    <span className="sm:hidden">Cust</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="products"
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getTabErrors(form.formState.errors).products ? 'border-red-500 border-2' : ''}`}
                  >
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Products</span>
                    <span className="sm:hidden">Prod</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getTabErrors(form.formState.errors).shipping ? 'border-red-500 border-2' : ''}`}
                  >
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Shipping</span>
                    <span className="sm:hidden">Ship</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getTabErrors(form.formState.errors).payment ? 'border-red-500 border-2' : ''}`}
                  >
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Payment</span>
                    <span className="sm:hidden">Pay</span>
                  </TabsTrigger>
                </TabsList>

                {/* Customer Tab */}
                <TabsContent value="customer" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter user ID..."
                              {...field}
                              disabled
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Auto-generated..."
                              {...field}
                              disabled
                              readOnly
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
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
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select payment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_STATUSES.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="billingAddress.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter billing name..."
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
                    name="billingAddress.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter billing email..."
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
                    name="billingAddress.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phone number..."
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
                    name="billingAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter street address..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter city..."
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
                      name="billingAddress.area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter area..."
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="billingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter postal code..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-4">
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Product {index + 1}</h4>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Product
                            </label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) =>
                                updateLineItem(index, "productId", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} - ${product.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-between gap-4">
                            <div className="flex-1">
                              <label className="text-sm font-medium">
                                Quantity
                              </label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium">Price</label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.price}
                                onChange={(e) =>
                                  updateLineItem(
                                    index,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLineItem}
                    >
                      Add Product
                    </Button>
                  </div>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use billing address for shipping.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name..."
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
                      name="shippingAddress.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email..."
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter street address..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter city..."
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
                      name="shippingAddress.area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter area..."
                              {...field}
                              disabled={isSubmitting}
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
                      name="shippingAddress.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter postal code..."
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
                      name="shippingAddress.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number..."
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
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
                      name="subtotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtotal</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter payment method..."
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
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
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
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Order" : "Update Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
