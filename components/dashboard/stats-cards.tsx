"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import { reconciliationApi } from "@/lib/api"
import type { ReconciliationSession } from "@/lib/types"

export function StatsCards() {
  const [sessions, setSessions] = useState<ReconciliationSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await reconciliationApi.getSessions()
        if (response.success && response.data) {
          setSessions(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const calculateStats = () => {
    const completedSessions = sessions.filter((s) => s.status === "completed" && s.results)

    if (completedSessions.length === 0) {
      return {
        totalPrescriptions: 0,
        matchedRecords: 0,
        discrepancies: 0,
        matchRate: 0,
      }
    }

    const totals = completedSessions.reduce(
      (acc, session) => {
        if (session.results) {
          acc.totalPrescriptions += session.results.totalRxRecords
          acc.matchedRecords += session.results.matchedRecords
          acc.discrepancies += session.results.missingRx + session.results.quantityMismatches
        }
        return acc
      },
      { totalPrescriptions: 0, matchedRecords: 0, discrepancies: 0 },
    )

    const matchRate = totals.totalPrescriptions > 0 ? (totals.matchedRecords / totals.totalPrescriptions) * 100 : 0

    return { ...totals, matchRate }
  }

  const stats = calculateStats()

  const statsConfig = [
    {
      title: "Total Prescriptions",
      value: stats.totalPrescriptions.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: CheckCircle,
      color: "text-chart-2",
    },
    {
      title: "Matched Records",
      value: stats.matchedRecords.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: CheckCircle,
      color: "text-chart-2",
    },
    {
      title: "Discrepancies",
      value: stats.discrepancies.toLocaleString(),
      change: "-3.1%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Match Rate",
      value: `${stats.matchRate.toFixed(1)}%`,
      change: "+2.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-chart-1",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon className={`mr-1 h-3 w-3 ${stat.trend === "up" ? "text-chart-2" : "text-destructive"}`} />
                {stat.change} from last period
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
