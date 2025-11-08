'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { useTypes } from '@/lib/hooks/useTypes';

export default function TypesStats() {
  const { data: activeTypesData } = useTypes({ isActive: true, limit: 1000 });
  const { data: inactiveTypesData } = useTypes({ isActive: false, limit: 1000 });
  const { data: allTypesData } = useTypes({ limit: 1000 });

  const activeTypes = activeTypesData?.types || [];
  const inactiveTypes = inactiveTypesData?.types || [];
  const allTypes = allTypesData?.types || [];

  const totalProducts = allTypes.reduce((sum, type) => sum + (type._count?.products || 0), 0);

  const stats = [
    {
      title: 'Total Types',
      value: allTypes.length,
      icon: Tag,
      description: 'All product types',
      trend: null,
    },
    {
      title: 'Active Types',
      value: activeTypes.length,
      icon: TrendingUp,
      description: 'Currently active',
      trend: 'positive',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      description: 'Across all types',
      trend: null,
    },
    {
      title: 'Inactive Types',
      value: inactiveTypes.length,
      icon: AlertCircle,
      description: 'Need attention',
      trend: inactiveTypes.length > 0 ? 'negative' : null,
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.trend && (
                  <Badge
                    variant={stat.trend === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.trend === 'positive' ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}