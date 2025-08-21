"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Generate heatmap data for the last 12 weeks
const generateHeatmapData = () => {
  const weeks = []
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  for (let week = 0; week < 12; week++) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const date = new Date()
      date.setDate(date.getDate() - (12 - week) * 7 + day)

      // Simulate reconciliation activity (higher on weekdays)
      const isWeekday = day < 5
      const baseActivity = isWeekday ? Math.random() * 80 + 20 : Math.random() * 30
      const discrepancies = Math.floor(Math.random() * 15)

      weekData.push({
        date: date.toISOString().split("T")[0],
        day: days[day],
        activity: Math.floor(baseActivity),
        discrepancies,
        matchRate: Math.max(85, 100 - discrepancies * 2 + Math.random() * 10),
      })
    }
    weeks.push(weekData)
  }
  return weeks
}

const heatmapData = generateHeatmapData()

const getActivityColor = (activity: number) => {
  if (activity >= 80) return "bg-chart-1 text-white"
  if (activity >= 60) return "bg-chart-1/80 text-white"
  if (activity >= 40) return "bg-chart-1/60 text-foreground"
  if (activity >= 20) return "bg-chart-1/40 text-foreground"
  return "bg-chart-1/20 text-muted-foreground"
}

const getDiscrepancyColor = (discrepancies: number) => {
  if (discrepancies >= 10) return "bg-destructive text-white"
  if (discrepancies >= 7) return "bg-destructive/80 text-white"
  if (discrepancies >= 4) return "bg-destructive/60 text-foreground"
  if (discrepancies >= 2) return "bg-destructive/40 text-foreground"
  return "bg-chart-2/40 text-foreground"
}

export function ReconciliationHeatmap() {
  const currentWeekData = heatmapData[heatmapData.length - 1]
  const totalActivity = currentWeekData.reduce((sum, day) => sum + day.activity, 0)
  const totalDiscrepancies = currentWeekData.reduce((sum, day) => sum + day.discrepancies, 0)
  const avgMatchRate = currentWeekData.reduce((sum, day) => sum + day.matchRate, 0) / 7

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivity}</div>
            <p className="text-xs text-muted-foreground">reconciliation runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalDiscrepancies}</div>
            <p className="text-xs text-muted-foreground">issues identified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Match Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{avgMatchRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Activity Heatmap</CardTitle>
          <CardDescription>Daily reconciliation activity over the last 12 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-chart-1/20"></div>
                <div className="w-3 h-3 rounded-sm bg-chart-1/40"></div>
                <div className="w-3 h-3 rounded-sm bg-chart-1/60"></div>
                <div className="w-3 h-3 rounded-sm bg-chart-1/80"></div>
                <div className="w-3 h-3 rounded-sm bg-chart-1"></div>
              </div>
              <span>More</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Day labels */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground text-center py-1">
                  {day}
                </div>
              ))}

              {/* Heatmap cells */}
              {heatmapData.flat().map((day, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ${getActivityColor(day.activity)}`}
                  title={`${day.date}: ${day.activity} runs, ${day.discrepancies} discrepancies, ${day.matchRate.toFixed(1)}% match rate`}
                >
                  {day.activity}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discrepancy Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Discrepancy Pattern Heatmap</CardTitle>
          <CardDescription>Daily discrepancy counts over the last 12 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Fewer</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-chart-2/40"></div>
                <div className="w-3 h-3 rounded-sm bg-destructive/40"></div>
                <div className="w-3 h-3 rounded-sm bg-destructive/60"></div>
                <div className="w-3 h-3 rounded-sm bg-destructive/80"></div>
                <div className="w-3 h-3 rounded-sm bg-destructive"></div>
              </div>
              <span>More</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Day labels */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground text-center py-1">
                  {day}
                </div>
              ))}

              {/* Discrepancy heatmap cells */}
              {heatmapData.flat().map((day, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ${getDiscrepancyColor(day.discrepancies)}`}
                  title={`${day.date}: ${day.discrepancies} discrepancies, ${day.matchRate.toFixed(1)}% match rate`}
                >
                  {day.discrepancies}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
