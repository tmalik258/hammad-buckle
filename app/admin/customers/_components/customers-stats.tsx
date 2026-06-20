import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { 
  Users, 
  UserCheck, 
  Crown,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default async function UsersStats() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get user statistics
  const [totalUsers, activeUsers, newUsersThisMonth, adminUsers] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Active users (users who have placed orders in the last 30 days)
    prisma.user.count({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    }),
    
    // New users this month
    prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    
    // Admin users
    prisma.user.count({
      where: {
        role: 'ADMIN'
      }
    })
  ]);

  // Get users who joined this week
  const newUsersThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  });

  // Calculate activity rate
  const activityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  
  // Calculate growth rate (comparing this month vs last month)
  const lastMonthStart = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lt: thirtyDaysAgo
      }
    }
  });
  
  const growthRate = lastMonthUsers > 0 ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100 : 0;

  // Get user registration trend
  const registrationTrend = newUsersThisWeek > (newUsersThisMonth / 4) ? 'up' : 'down';

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      description: `${newUsersThisMonth} new this month`,
      icon: Users,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      description: `${activityRate.toFixed(1)}% activity rate`,
      icon: UserCheck,
      trend: activityRate > 50 ? 'up' : 'down',
      color: activityRate > 50 ? 'text-green-600' : 'text-orange-600',
      bgColor: activityRate > 50 ? 'bg-green-100' : 'bg-orange-100',
    },
    {
      title: 'New This Month',
      value: newUsersThisMonth.toLocaleString(),
      description: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}% vs last month`,
      icon: Calendar,
      trend: growthRate > 0 ? 'up' : 'down',
      color: growthRate > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: growthRate > 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Admins',
      value: adminUsers.toLocaleString(),
      description: `${totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : '0'}% of all users`,
      icon: Crown,
      trend: 'up',
      color: 'text-foreground',
      bgColor: 'bg-accent',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    stat.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {stat.trend === 'up' ? 'Good' : 'Low'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}