import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CarouselSection } from "./carousel-section";
import { ContentSection } from "./content-section";
import { HeroSection } from "./hero-section";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  status: string;
  date: string;
  estimatedDelivery: string;
  trackingNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  payment: {
    method: string;
    amount: number;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

// Default order data to use as a base template
const defaultOrder: Order = {
  id: "ORD-2024-001",
  status: "confirmed",
  date: "2024-01-15",
  estimatedDelivery: "3-5 business days",
  trackingNumber: "TRK123456789",
  customer: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+965 1234 5678"
  },
  items: [
    {
      id: "1",
      name: "Nike Air Max 270",
      image: "/images/nike-air-max.jpg",
      price: 45.500,
      quantity: 1,
      size: "42",
      color: "Black/White"
    },
    {
      id: "2",
      name: "AirPods Pro - Wireless Earbuds",
      image: "/images/airpods-pro.jpg",
      price: 89.900,
      quantity: 1,
      color: "White"
    }
  ],
  shippingAddress: {
    name: "John Doe",
    street: "Block 3, St 15, House 22",
    city: "Kuwait City",
    state: "Al Asimah",
    zipCode: "13001",
    country: "Kuwait"
  },
  billingAddress: {
    name: "John Doe",
    street: "Block 3, St 15, House 22",
    city: "Kuwait City",
    state: "Al Asimah",
    zipCode: "13001",
    country: "Kuwait"
  },
  payment: {
    method: "Visa ending in 4242",
    amount: 138.400
  },
  pricing: {
    subtotal: 135.400,
    shipping: 3.000,
    tax: 0.000,
    total: 138.400
  }
};

// Mock recommended products for carousel
const recommendedProducts = [
  {
    id: "rec-1",
    name: "Classic Hat Lipstick",
    image: "/images/lipstick.jpg",
    price: 15.000,
    originalPrice: 20.000,
    rating: 4.5,
    reviewCount: 128,
    category: "Beauty",
    discount: 25
  },
  {
    id: "rec-2",
    name: "Black Leather Belt with Gold Buckle",
    image: "/images/belt.jpg",
    price: 35.000,
    rating: 4.8,
    reviewCount: 89,
    category: "Accessories",
    isNew: true
  },
  {
    id: "rec-3",
    name: "Gold Light Hanging Lamp",
    image: "/images/lamp.jpg",
    price: 125.000,
    rating: 4.7,
    reviewCount: 45,
    category: "Home & Decor"
  },
  {
    id: "rec-4",
    name: "Aero Kit",
    image: "/images/shoes.jpg",
    price: 89.000,
    originalPrice: 110.000,
    rating: 4.6,
    reviewCount: 203,
    category: "Footwear",
    discount: 19
  },
  {
    id: "rec-5",
    name: "Wireless Bluetooth Headphones",
    image: "/images/headphones.jpg",
    price: 65.000,
    rating: 4.4,
    reviewCount: 156,
    category: "Electronics",
    isNew: true
  }
];

// OrderContent component that uses useSearchParams
export default function OrderContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderId = searchParams.get("orderId");
        
        if (!orderId) {
          setError("Order ID not found in URL parameters");
          setLoading(false);
          return;
        }
        
        // In a real app, this would be an API call to fetch order details
        // For now, we'll simulate an API call with a timeout
        setTimeout(() => {
          // Simulate successful order fetch
          // In production, replace with actual API call:
          // const response = await fetch(`/api/orders/${orderId}`);
          // const data = await response.json();
          // if (!response.ok) throw new Error(data.message || "Failed to fetch order");
          
          // Using default order with the provided ID
          setOrder({
            ...defaultOrder,
            id: orderId
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 pt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent"></div>
          <p className="text-lg font-medium text-zinc-900">Loading your order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 pt-20">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="text-gray-700 mb-6">{error || "Unable to load order details. Please check the URL or try again later."}</p>
          <Link href="/">
            <Button size="lg" className="font-medium">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Hero Section */}
      <HeroSection 
        orderNumber={order.id}
        customerEmail={order.customer.email}
      />

      {/* Content Section */}
      <ContentSection 
        orderItems={order.items}
        shippingAddress={order.shippingAddress}
        paymentMethod={order.payment.method}
        estimatedDelivery={order.estimatedDelivery}
      />

      {/* Carousel Section */}
      <CarouselSection 
        products={recommendedProducts}
      />

      {/* Action Buttons */}
      <div className="bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="w-full cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl bg-zinc-900 px-8 hover:bg-zinc-800 sm:w-auto"
            asChild
          >
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full cursor-pointer border-zinc-900 px-8 text-zinc-900 hover:bg-zinc-900 hover:text-white sm:w-auto"
            asChild
          >
            <Link href="/my-account">View All Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}