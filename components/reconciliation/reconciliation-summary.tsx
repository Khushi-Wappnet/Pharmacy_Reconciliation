import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import type { ReconciliationSummaryData } from "@/app/reconciliation/page"

interface ReconciliationSummaryProps {
  data: ReconciliationSummaryData
}

export function ReconciliationSummary({ data }: ReconciliationSummaryProps) {
  const summaryCards = [
    {
      title: "Total Rx Records",
      value: data.totalRxRecords.toLocaleString(),
      icon: CheckCircle,
      color: "text-chart-1",
    },
    {
      title: "Matched Records",
      value: data.matchedRecords.toLocaleString(),
      icon: CheckCircle,
      color: "text-chart-2",
    },
    {
      title: "Missing Records",
      value: data.missingRecords.toLocaleString(),
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Quantity Mismatches",
      value: data.quantityMismatches.toLocaleString(),
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ]

  const getMatchRateColor = (rate: number) => {
    if (rate >= 95) return "text-chart-2"
    if (rate >= 85) return "text-orange-600"
    return "text-destructive"
  }

  const getDiscrepancyRateColor = (rate: number) => {
    if (rate <= 5) return "text-chart-2"
    if (rate <= 15) return "text-orange-600"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Match Rate</CardTitle>
            <CardDescription>Percentage of Rx records successfully matched</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${getMatchRateColor(data.matchRate)}`}>
                {data.matchRate.toFixed(1)}%
              </div>
              {data.matchRate >= 95 ? (
                <TrendingUp className="h-5 w-5 text-chart-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className="mt-2">
              <Badge
                className={
                  data.matchRate >= 95
                    ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                    : data.matchRate >= 85
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {data.matchRate >= 95 ? "Excellent" : data.matchRate >= 85 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discrepancy Rate</CardTitle>
            <CardDescription>Percentage of records with issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${getDiscrepancyRateColor(data.discrepancyRate)}`}>
                {data.discrepancyRate.toFixed(1)}%
              </div>
              {data.discrepancyRate <= 5 ? (
                <TrendingDown className="h-5 w-5 text-chart-2" />
              ) : (
                <TrendingUp className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className="mt-2">
              <Badge
                className={
                  data.discrepancyRate <= 5
                    ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                    : data.discrepancyRate <= 15
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {data.discrepancyRate <= 5 ? "Low" : data.discrepancyRate <= 15 ? "Moderate" : "High"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
