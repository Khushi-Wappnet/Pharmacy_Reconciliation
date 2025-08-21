"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"

const categoryData = [
  { category: "Diabetes", matched: 245, discrepancies: 12, total: 257 },
  { category: "Cardiovascular", matched: 189, discrepancies: 8, total: 197 },
  { category: "Respiratory", matched: 156, discrepancies: 15, total: 171 },
  { category: "Pain Management", matched: 134, discrepancies: 18, total: 152 },
  { category: "Antibiotics", matched: 98, discrepancies: 7, total: 105 },
  { category: "Mental Health", matched: 87, discrepancies: 11, total: 98 },
  { category: "Dermatology", matched: 76, discrepancies: 5, total: 81 },
  { category: "Gastrointestinal", matched: 65, discrepancies: 9, total: 74 },
]

const pieData = categoryData.map((item) => ({
  name: item.category,
  value: item.total,
  discrepancyRate: ((item.discrepancies / item.total) * 100).toFixed(1),
}))

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))",
]

const chartConfig = {
  matched: {
    label: "Matched",
    color: "hsl(var(--chart-2))",
  },
  discrepancies: {
    label: "Discrepancies",
    color: "hsl(var(--destructive))",
  },
}

export function DrugCategoryChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Discrepancies by Drug Category</CardTitle>
          <CardDescription>Comparison of matched vs discrepant records by therapeutic category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData} layout="horizontal">
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  width={100}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="matched" fill="var(--color-matched)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="discrepancies" fill="var(--color-discrepancies)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Total prescription volume by therapeutic category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">{data.name}</span>
                              <span className="font-bold text-muted-foreground">{data.value} prescriptions</span>
                              <span className="text-[0.70rem] text-muted-foreground">
                                {data.discrepancyRate}% discrepancy rate
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
