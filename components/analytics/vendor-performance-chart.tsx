"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Scatter, ScatterChart, ZAxis } from "recharts"
import { Badge } from "@/components/ui/badge"

const vendorData = [
  {
    vendor: "McKesson",
    totalOrders: 1245,
    matchedOrders: 1198,
    discrepancies: 47,
    matchRate: 96.2,
    avgDeliveryTime: 2.3,
    performance: "excellent",
  },
  {
    vendor: "Cardinal Health",
    totalOrders: 987,
    matchedOrders: 934,
    discrepancies: 53,
    matchRate: 94.6,
    avgDeliveryTime: 2.8,
    performance: "good",
  },
  {
    vendor: "AmerisourceBergen",
    totalOrders: 756,
    matchedOrders: 708,
    discrepancies: 48,
    matchRate: 93.7,
    avgDeliveryTime: 3.1,
    performance: "good",
  },
  {
    vendor: "Morris & Dickson",
    totalOrders: 432,
    matchedOrders: 398,
    discrepancies: 34,
    matchRate: 92.1,
    avgDeliveryTime: 2.9,
    performance: "fair",
  },
  {
    vendor: "HD Smith",
    totalOrders: 298,
    matchedOrders: 267,
    discrepancies: 31,
    matchRate: 89.6,
    avgDeliveryTime: 3.4,
    performance: "needs_improvement",
  },
]

const scatterData = vendorData.map((vendor) => ({
  ...vendor,
  x: vendor.matchRate,
  y: vendor.avgDeliveryTime,
  z: vendor.totalOrders,
}))

const chartConfig = {
  matchedOrders: {
    label: "Matched Orders",
    color: "hsl(var(--chart-2))",
  },
  discrepancies: {
    label: "Discrepancies",
    color: "hsl(var(--destructive))",
  },
}

export function VendorPerformanceChart() {
  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
      case "fair":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Fair</Badge>
      case "needs_improvement":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Improvement</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Match Rates</CardTitle>
            <CardDescription>Comparison of matched orders vs discrepancies by vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={vendorData} layout="horizontal">
                  <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis
                    dataKey="vendor"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    width={120}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="matchedOrders" fill="var(--color-matchedOrders)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="discrepancies" fill="var(--color-discrepancies)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance vs Delivery Time</CardTitle>
            <CardDescription>Match rate vs average delivery time (bubble size = order volume)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart data={scatterData}>
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Match Rate"
                    unit="%"
                    domain={[85, 100]}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Delivery Time"
                    unit=" days"
                    domain={[2, 4]}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <ChartTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">{data.vendor}</span>
                                <span className="font-bold text-muted-foreground">{data.matchRate}% match rate</span>
                                <span className="text-[0.70rem] text-muted-foreground">
                                  {data.avgDeliveryTime} days avg delivery
                                </span>
                                <span className="text-[0.70rem] text-muted-foreground">
                                  {data.totalOrders} total orders
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter fill="hsl(var(--chart-1))" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Summary</CardTitle>
          <CardDescription>Detailed performance metrics for all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Vendor</th>
                  <th className="text-left py-3 font-medium">Total Orders</th>
                  <th className="text-left py-3 font-medium">Match Rate</th>
                  <th className="text-left py-3 font-medium">Discrepancies</th>
                  <th className="text-left py-3 font-medium">Avg Delivery</th>
                  <th className="text-left py-3 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.map((vendor, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{vendor.vendor}</td>
                    <td className="py-3">{vendor.totalOrders.toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={
                          vendor.matchRate >= 95
                            ? "text-chart-2 font-medium"
                            : vendor.matchRate >= 90
                              ? "text-orange-600 font-medium"
                              : "text-destructive font-medium"
                        }
                      >
                        {vendor.matchRate}%
                      </span>
                    </td>
                    <td className="py-3">{vendor.discrepancies}</td>
                    <td className="py-3">{vendor.avgDeliveryTime} days</td>
                    <td className="py-3">{getPerformanceBadge(vendor.performance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
