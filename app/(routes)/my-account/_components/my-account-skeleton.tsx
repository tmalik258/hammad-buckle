"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MyAccountSkeleton() {
  return (
    <div className="min-h-screen bg-black md:pt-20">
      {/* Hero Section Skeleton */}
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-80 mx-auto bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse" />
          <Skeleton className="h-6 w-96 mx-auto bg-gray-800/60 animate-pulse" />
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Skeleton className="h-4 w-16 bg-gray-800/60 animate-pulse" />
            <Skeleton className="h-4 w-4 bg-pink-400/30 animate-pulse" />
            <Skeleton className="h-4 w-24 bg-gray-800/60 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Welcome Header Skeleton */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Skeleton className="w-20 h-20 rounded-full bg-gray-800/60 border-2 border-pink-500/30 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500/40 to-purple-500/40 rounded-full p-1">
                <Skeleton className="h-3 w-3 bg-pink-400/60 animate-pulse" />
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-64 mb-2 bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse" />
              <Skeleton className="h-4 w-48 mb-1 bg-gray-800/60 animate-pulse" />
              <Skeleton className="h-4 w-24 bg-pink-500/30 animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-36 bg-gray-800/60 border border-gray-600/50 animate-pulse" />
            <Skeleton className="h-10 w-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-8">
        {/* Profile Overview Skeleton */}
        <Card className="bg-transparent border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2 bg-pink-400/40 animate-pulse" />
                <Skeleton className="h-6 w-40 bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Profile fields skeleton */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 bg-gray-800/60 animate-pulse" />
                  <Skeleton className="h-4 w-32 bg-gray-800/60 animate-pulse" />
                </div>
              ))}
              {/* Action buttons skeleton */}
              <div className="flex space-x-2 mt-6">
                <Skeleton className="h-10 flex-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 animate-pulse" />
                <Skeleton className="h-10 flex-1 bg-gray-800/60 border border-gray-600/50 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods and Credit Card Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 content-rounded-[3rem] p-8">
          {/* Payment Methods Skeleton */}
          <Card className="bg-transparent border-none">
            <CardHeader>
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2 bg-pink-400/40 animate-pulse" />
                <Skeleton className="h-6 w-40 bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Payment method cards skeleton */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-600/30">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-6 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded animate-pulse" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1 bg-gray-700/60 animate-pulse" />
                        <Skeleton className="h-3 w-20 bg-gray-700/60 animate-pulse" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-12 bg-pink-400/30 animate-pulse" />
                  </div>
                ))}
                {/* Add payment method button skeleton */}
                <Skeleton className="h-10 w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Credit Card Illustration Skeleton */}
          <div className="flex items-center justify-center">
            <Skeleton className="w-full max-w-[400px] h-[300px] bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-pink-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}