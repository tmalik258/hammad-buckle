"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MyAccountSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="container mx-auto mb-8 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="hidden h-10 w-36 sm:block" />
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-4 pb-12">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-56" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
