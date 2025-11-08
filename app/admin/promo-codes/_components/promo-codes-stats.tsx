import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Gift, TrendingUp, Users } from 'lucide-react';

interface PromoCodesStatsProps {
  totalCodes?: number;
  activeCodes?: number;
  totalRevenue?: number;
  topCodes?: Array<{ code: string; usageCount: number }>;
}

export async function PromoCodesStats() {
  // Fetch stats from API
  let stats: PromoCodesStatsProps = {
    totalCodes: 0,
    activeCodes: 0,
    totalRevenue: 0,
    topCodes: []
  };

  try {
    const response = await fetch(`/api/admin/promo-codes/stats`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      stats = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch promo code stats:', error);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Promo Codes</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCodes}</div>
          <p className="text-xs text-muted-foreground">
            All promotional codes created
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCodes}</div>
          <p className="text-xs text-muted-foreground">
            Currently active and usable
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            Total revenue from promo code orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Used Code</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topCodes && stats.topCodes?.length > 0 ? (
              <>
                <div className="text-lg font-bold">{stats.topCodes[0].code}</div>
                <Badge variant="secondary">
                  {stats.topCodes[0].usageCount} uses
                </Badge>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No usage data</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}