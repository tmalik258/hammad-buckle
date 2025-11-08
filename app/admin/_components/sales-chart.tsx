"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesResponse {
  period: string;
  data: SalesData[];
  totalRevenue: number;
  averageDaily: number;
  growth: number;
  totalOrders: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("7d");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<SalesResponse>(
          "/api/dashboard/sales",
          {
            params: {
              period,
              groupBy: "day",
            },
          }
        );

        setSalesData(response.data.data);
      } catch (err) {
        setError("Failed to load sales data");
        console.error("Error fetching sales data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [period]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-semibold">Sales Overview</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === "7d"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === "30d"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod("90d")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === "90d"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setPeriod("1y")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === "1y"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="h-48 sm:h-56 md:h-64">
            <Skeleton className="h-48 sm:h-56 md:h-64 w-full" />
          </div>
        ) : (
          <>
            <TabsContent value="revenue" className="space-y-4">
              <div className="h-48 sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      className="text-xs fill-muted-foreground"
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      className="text-xs fill-muted-foreground"
                      width={60}
                    />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="h-48 sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      className="text-xs fill-muted-foreground"
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground" 
                      width={40}
                    />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value: number) => [value, "Orders"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#8b5cf6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
