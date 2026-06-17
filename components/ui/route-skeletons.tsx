import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Cart Page Skeleton
export function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-32 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Products Page Skeleton
export const ProductsPageSkeleton = () => {
  return (
    <div className="min-h-screen pt-20 z-0">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        {/* Main Content Layout */}
        <div id="products-section" className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Skeleton className="h-10 w-24" />
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-full">
              <div className="content-rounded-lg flex flex-col w-full">
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  <div className="space-y-4 lg:space-y-6 h-full">
                    {/* Filters Title */}
                    <Skeleton className="h-6 mb-2 lg:mb-4" />
                    
                    {/* Filter sections */}
                    {[1, 2].map((i) => (
                      <div key={i} className="content-rounded-2xl">
                        <div className="p-4 space-y-2 lg:space-y-3 bg-black/10 rounded-2xl">
                          <Skeleton className="h-4 mb-3" />
                          <div className="space-y-1 lg:space-y-2">
                            {[1, 2, 3, 4].map((j) => (
                              <div key={j} className="flex items-center space-x-2">
                                <Skeleton className="w-4 h-4 rounded-full" />
                                <Skeleton className="h-3 flex-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Price Range Filter */}
                    <div className="content-rounded-2xl">
                      <div className="rounded-2xl bg-black/10 p-4 space-y-2 lg:space-y-3">
                        <Skeleton className="h-4 mb-3" />
                        <div className="px-2">
                          <div className="relative">
                            <Skeleton className="h-2 rounded-full" />
                            <div className="flex justify-between text-xs mt-2">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-1 lg:gap-2 mt-2 lg:mt-4">
                          {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-8" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header with Sort and Product Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Skeleton className="w-full sm:w-48 h-10" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Skeleton className="h-4 w-20 sm:hidden" />
                <Skeleton className="h-8 w-32 ml-auto sm:ml-0" />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="content-rounded-lg overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center items-center space-x-4 mt-12">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
};

// Checkout Page Skeleton
export function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 mb-6" />
          
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between font-bold">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Contact Page Skeleton
export function ContactSkeleton() {
  return (
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
  );
}

// My Account Page Skeleton
export function MyAccountSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-32 mx-auto mb-2" />
                  <Skeleton className="h-3 w-40 mx-auto" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <Skeleton className="h-6 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-20" />
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

// Wishlist Page Skeleton
export function WishlistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-20" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
          </CardContent>
        </Card>
        
        {/* Order Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
