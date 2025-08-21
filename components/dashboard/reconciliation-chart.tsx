"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, ResponsiveContainer, XAxis, YAxis, Line, ComposedChart } from "recharts"
import { reconciliationApi } from "@/lib/api"
import type { DailyTrendData } from "@/lib/types"

const chartConfig = {
  matched: {
    label: "Matched Records",
    color: "hsl(var(--chart-2))",
  },
  discrepancies: {
    label: "Discrepancies",
    color: "hsl(var(--destructive))",
  },
  matchRate: {
    label: "Match Rate %",
    color: "hsl(var(--chart-1))",
  },
}

export function ReconciliationChart() {
  const [chartData, setChartData] = useState<DailyTrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDailyTrends = async () => {
      try {
        const response = await reconciliationApi.getDailyTrends(7)
        if (response.success && response.data) {
          // Transform data for chart display
          const transformedData = response.data.map((item) => ({
            ...item,
            day: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }))
          setChartData(transformedData)
        }
      } catch (error) {
        console.error("Failed to fetch daily trends:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyTrends()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Trends</CardTitle>
          <CardDescription>Loading daily trends...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliation Trends</CardTitle>
        <CardDescription>Daily overview of prescription matching and discrepancies for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                className="text-xs"
                interval={0}
                angle={0}
                textAnchor="middle"
              />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar yAxisId="left" dataKey="matched" fill="var(--color-matched)" radius={[0, 0, 4, 4]} />
              <Bar yAxisId="left" dataKey="discrepancies" fill="var(--color-discrepancies)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="matchRate"
                stroke="var(--color-matchRate)"
                strokeWidth={3}
                dot={{ fill: "var(--color-matchRate)", strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
