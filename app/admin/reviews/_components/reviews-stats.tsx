import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, AlertTriangle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function ReviewsStats() {
  // Fetch review statistics
  const [totalReviews, averageRating, pendingReviews, reportedReviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    }),
    prisma.review.count({
      where: {
        status: 'PENDING',
      },
    }),
    prisma.review.count({
      where: {
        status: 'REPORTED',
      },
    }),
  ]);

  // Calculate rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    _count: {
      rating: true,
    },
    orderBy: {
      rating: 'desc',
    },
  });

  // Calculate growth rate (reviews this month vs last month)
  const currentMonth = new Date();
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  const [thisMonthReviews, lastMonthReviews] = await Promise.all([
    prisma.review.count({
      where: {
        createdAt: {
          gte: thisMonthStart,
        },
      },
    }),
    prisma.review.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: thisMonthStart,
        },
      },
    }),
  ]);

  const growthRate = lastMonthReviews > 0 
    ? ((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100 
    : 0;

  const stats = [
    {
      title: 'Total Reviews',
      value: totalReviews.toLocaleString(),
      description: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}% from last month`,
      icon: MessageSquare,
      trend: growthRate >= 0 ? 'up' : 'down',
    },
    {
      title: 'Average Rating',
      value: averageRating._avg.rating?.toFixed(1) || '0.0',
      description: 'Overall customer satisfaction',
      icon: Star,
      trend: 'neutral',
    },
    {
      title: 'Pending Reviews',
      value: pendingReviews.toLocaleString(),
      description: 'Awaiting moderation',
      icon: ThumbsUp,
      trend: pendingReviews > 10 ? 'down' : 'neutral',
    },
    {
      title: 'Reported Reviews',
      value: reportedReviews.toLocaleString(),
      description: 'Flagged for review',
      icon: AlertTriangle,
      trend: reportedReviews > 0 ? 'down' : 'up',
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {stat.trend === 'up' && (
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    ↗ Positive
                  </Badge>
                )}
                {stat.trend === 'down' && (
                  <Badge variant="secondary" className="text-red-600 bg-red-50">
                    ↘ Needs Attention
                  </Badge>
                )}
                {stat.trend === 'neutral' && (
                  <Badge variant="secondary">
                    → Stable
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}