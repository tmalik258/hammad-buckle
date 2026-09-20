import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Cart Page Skeleton
export function CartSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-32 mb-6 bg-zinc-200/80" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-md bg-zinc-200/80" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 bg-zinc-200/80" />
                    <Skeleton className="h-3 w-32 bg-zinc-200/80" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-24 bg-zinc-200/80" />
                      <Skeleton className="h-4 w-16 bg-zinc-200/80" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 bg-zinc-200/80" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-zinc-200/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
              </div>
              <Skeleton className="h-10 w-full bg-zinc-200/80" />
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

// Products Page Skeleton
export const ProductsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Page Skeleton
export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Skeleton className="mb-6 h-8 w-40 bg-zinc-200/80" />
          
          {/* Contact Information */}
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-zinc-200/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full bg-zinc-200/80" />
              <Skeleton className="h-10 w-full bg-zinc-200/80" />
            </CardContent>
          </Card>
          
          {/* Shipping Address */}
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-36 bg-zinc-200/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full bg-zinc-200/80" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full bg-zinc-200/80" />
                <Skeleton className="h-10 w-full bg-zinc-200/80" />
              </div>
              <Skeleton className="h-10 w-full bg-zinc-200/80" />
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-zinc-200/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-zinc-200/80" />
                    <Skeleton className="h-4 w-24 bg-zinc-200/80" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-zinc-200/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-md bg-zinc-200/80" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 bg-zinc-200/80" />
                    <Skeleton className="h-3 w-20 bg-zinc-200/80" />
                  </div>
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
              ))}
              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-12 bg-zinc-200/80" />
                </div>
                <div className="flex justify-between font-bold">
                  <Skeleton className="h-5 w-12 bg-zinc-200/80" />
                  <Skeleton className="h-5 w-16 bg-zinc-200/80" />
                </div>
              </div>
              <Skeleton className="h-12 w-full bg-zinc-200/80" />
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

// Contact Page Skeleton
export function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// My Account Page Skeleton — shared with my-account route
export { MyAccountSkeleton } from "@/app/(routes)/my-account/_components/my-account-skeleton";

// Wishlist Page Skeleton
export function WishlistSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-32 bg-zinc-200/80" />
          <Skeleton className="h-4 w-48 bg-zinc-200/80" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="relative">
                  <Skeleton className="aspect-[4/5] w-full rounded-none bg-zinc-200/80" />
                  <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full bg-zinc-200/80" />
                </div>
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full bg-zinc-200/80" />
                  <Skeleton className="h-3 w-24 bg-zinc-200/80" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-5 w-16 bg-zinc-200/80" />
                    <Skeleton className="h-8 w-20 bg-zinc-200/80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Track Order Page Skeleton
export function TrackOrderSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48 bg-zinc-200/80" />
          <Skeleton className="h-4 w-64 bg-zinc-200/80" />
        </div>
        
        {/* Search Form */}
        <Card className="mb-8 rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1 bg-zinc-200/80" />
              <Skeleton className="h-12 w-32 bg-zinc-200/80" />
            </div>
          </CardContent>
        </Card>
        
        {/* Order Status */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32 bg-zinc-200/80" />
                <Skeleton className="h-6 w-20 bg-zinc-200/80" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-32 bg-zinc-200/80" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-zinc-200/80" />
                  <Skeleton className="h-4 w-28 bg-zinc-200/80" />
                </div>
              </div>
              <Skeleton className="h-2 w-full bg-zinc-200/80" />
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-zinc-200/80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full bg-zinc-200/80" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 bg-zinc-200/80" />
                      <Skeleton className="h-3 w-32 bg-zinc-200/80" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
