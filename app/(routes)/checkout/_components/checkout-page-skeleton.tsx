import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Trust Indicators Skeleton */}
        <div className="mb-8 flex items-center justify-center space-x-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Progress Indicator Skeleton */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="ml-2 h-4 w-16" />
                {i < 3 && <Skeleton className="ml-4 h-0.5 w-16" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Skeleton */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>

                <div className="h-px bg-zinc-200" />

                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-16" />
                  </div>
                </div>

                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
