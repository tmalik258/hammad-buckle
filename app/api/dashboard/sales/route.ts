import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { apiCache, generateCacheKey } from "@/lib/cache";

const salesQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).optional().default("30d"),
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { period, groupBy } = salesQuerySchema.parse({
      period: searchParams.get("period"),
      groupBy: searchParams.get("groupBy"),
    });

    const cacheKey = generateCacheKey('dashboard-sales', {
      period,
      groupBy,
    });
    const cached = await apiCache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Fetch orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group data by the specified period
    const salesData: Array<{
      date: string;
      revenue: number;
      orders: number;
    }> = [];

    if (groupBy === "day") {
      // Group by day
      const dailyData = new Map<string, { revenue: number; orders: number }>();

      // Initialize all days in the range with zero values
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateKey = d.toISOString().split("T")[0];
        dailyData.set(dateKey, { revenue: 0, orders: 0 });
      }

      // Aggregate order data
      orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split("T")[0];
        const existing = dailyData.get(dateKey) || { revenue: 0, orders: 0 };
        dailyData.set(dateKey, {
          revenue: existing.revenue + order.totalAmount,
          orders: existing.orders + 1,
        });
      });

      // Convert to array format
      dailyData.forEach((data, date) => {
        salesData.push({
          date,
          revenue: Math.round(data.revenue * 100) / 100, // Round to 2 decimal places
          orders: data.orders,
        });
      });
    } else if (groupBy === "week") {
      // Group by week
      const weeklyData = new Map<string, { revenue: number; orders: number }>();

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split("T")[0];

        const existing = weeklyData.get(weekKey) || { revenue: 0, orders: 0 };
        weeklyData.set(weekKey, {
          revenue: existing.revenue + order.totalAmount,
          orders: existing.orders + 1,
        });
      });

      weeklyData.forEach((data, date) => {
        salesData.push({
          date,
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.orders,
        });
      });
    } else if (groupBy === "month") {
      // Group by month
      const monthlyData = new Map<
        string,
        { revenue: number; orders: number }
      >();

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-01`;

        const existing = monthlyData.get(monthKey) || { revenue: 0, orders: 0 };
        monthlyData.set(monthKey, {
          revenue: existing.revenue + order.totalAmount,
          orders: existing.orders + 1,
        });
      });

      monthlyData.forEach((data, date) => {
        salesData.push({
          date,
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.orders,
        });
      });
    }

    // Sort by date
    salesData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate summary statistics
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const averageDaily =
      salesData.length > 0 ? totalRevenue / salesData.length : 0;

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate);
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    previousPeriodStart.setDate(startDate.getDate() - periodDays);

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const growth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const response = {
      period,
      data: salesData,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageDaily: Math.round(averageDaily * 100) / 100,
      growth: Math.round(growth * 100) / 100,
      totalOrders,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    await apiCache.set(cacheKey, response, 60 * 5); // Cache for 5 minutes

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[API/Dashboard/Sales] Zod Error:", error.issues);
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[API/Dashboard/Sales] Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
