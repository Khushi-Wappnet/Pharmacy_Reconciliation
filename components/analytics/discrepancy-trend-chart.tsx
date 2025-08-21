"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts"

const trendData = [
  { month: "Jan", discrepancies: 145, matchRate: 94.2, totalRecords: 2520 },
  { month: "Feb", discrepancies: 132, matchRate: 94.8, totalRecords: 2308 },
  { month: "Mar", discrepancies: 128, matchRate: 95.1, totalRecords: 2395 },
  { month: "Apr", discrepancies: 119, matchRate: 95.7, totalRecords: 2089 },
  { month: "May", discrepancies: 125, matchRate: 95.3, totalRecords: 2275 },
  { month: "Jun", discrepancies: 134, matchRate: 94.9, totalRecords: 2610 },
  { month: "Jul", discrepancies: 116, matchRate: 95.9, totalRecords: 2847 },
]

const chartConfig = {
  discrepancies: {
    label: "Discrepancies",
    color: "hsl(var(--destructive))",
  },
  matchRate: {
    label: "Match Rate %",
    color: "hsl(var(--chart-2))",
  },
  totalRecords: {
    label: "Total Records",
    color: "hsl(var(--chart-1))",
  },
}

export function DiscrepancyTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discrepancy Trends</CardTitle>
        <CardDescription>Monthly discrepancy patterns and match rate improvements</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="discrepancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="matchRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="discrepancies"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#discrepancyGradient)"
              />
              <Line
                type="monotone"
                dataKey="matchRate"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
