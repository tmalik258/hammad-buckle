'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarCheck, CalendarX, Package } from 'lucide-react';
import { useOccasions } from '@/lib/hooks/useOccasions';

export default function OccasionsStats() {
  const { data: occasions, isLoading } = useOccasions({
    page: 1,
    limit: 1000, // Get all occasions for stats
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const occasionsData = occasions?.occasions || [];
  const totalOccasions = occasionsData.length;
  const activeOccasions = occasionsData.filter((occasion) => occasion.isActive).length;
  const inactiveOccasions = totalOccasions - activeOccasions;
  const totalProducts = occasionsData.reduce(
    (sum, occasion) => sum + (occasion._count?.products || 0),
    0
  );

  const stats = [
    {
      title: 'Total Occasions',
      value: totalOccasions,
      description: 'All occasions in system',
      icon: Calendar,
      color: 'default' as const,
    },
    {
      title: 'Active Occasions',
      value: activeOccasions,
      description: 'Currently available',
      icon: CalendarCheck,
      color: 'default' as const,
    },
    {
      title: 'Inactive Occasions',
      value: inactiveOccasions,
      description: 'Currently disabled',
      icon: CalendarX,
      color: 'secondary' as const,
    },
    {
      title: 'Total Products',
      value: totalProducts,
      description: 'Across all occasions',
      icon: Package,
      color: 'default' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge variant={stat.color} className="text-xs">
                  {stat.value > 0 ? 'Active' : 'Empty'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}