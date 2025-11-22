import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Trust Indicators Skeleton */}
        <div className="flex justify-center items-center space-x-8 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded-full bg-purple-500/20" />
              <Skeleton className="h-4 w-24 bg-purple-500/20" />
            </div>
          ))}
        </div>

        {/* Progress Indicator Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full bg-purple-500/20" />
                <Skeleton className="h-4 w-16 ml-2 bg-purple-500/20" />
                {i < 3 && <Skeleton className="h-0.5 w-16 ml-4 bg-purple-500/20" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-purple-500/20" />
                  <Skeleton className="h-10 w-full bg-purple-500/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-purple-500/20" />
                  <Skeleton className="h-10 w-full bg-purple-500/20" />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-purple-500/20" />
                  <Skeleton className="h-10 w-full bg-purple-500/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-purple-500/20" />
                  <Skeleton className="h-10 w-full bg-purple-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-purple-500/20" />
                  <Skeleton className="h-10 w-full bg-purple-500/20" />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full bg-purple-500/20" />
                  <Skeleton className="h-12 w-full bg-purple-500/20" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20 bg-purple-500/20" />
                      <Skeleton className="h-10 w-full bg-purple-500/20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12 bg-purple-500/20" />
                      <Skeleton className="h-10 w-full bg-purple-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-purple-500/20" />
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-purple-500/20" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-lg bg-purple-500/20" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-purple-500/20" />
                          <Skeleton className="h-3 w-24 bg-purple-500/20" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16 bg-purple-500/20" />
                    </div>
                  ))}
                </div>

                <div className="h-px bg-purple-500/30" />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-16 bg-purple-500/20" />
                      <Skeleton className="h-4 w-20 bg-purple-500/20" />
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-purple-500/20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 flex-1 bg-purple-500/20" />
                    <Skeleton className="h-10 w-16 bg-purple-500/20" />
                  </div>
                </div>

                {/* Place Order Button */}
                <Skeleton className="h-12 w-full bg-purple-500/20" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}