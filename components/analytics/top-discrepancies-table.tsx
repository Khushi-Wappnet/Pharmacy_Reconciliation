import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const topDiscrepancies = [
  {
    drugName: "LANTUS INSULIN VIAL 10ML",
    ndc: "00088222033",
    frequency: 23,
    trend: "up",
    trendValue: "+15%",
    category: "Diabetes",
    avgDiscrepancy: 2.3,
  },
  {
    drugName: "ALBUTEROL INH AERO 90MCG",
    ndc: "00054074287",
    frequency: 18,
    trend: "down",
    trendValue: "-8%",
    category: "Respiratory",
    avgDiscrepancy: 1.8,
  },
  {
    drugName: "METHYLPREDNISOLONE PACK 4MG",
    ndc: "42806040021",
    frequency: 16,
    trend: "up",
    trendValue: "+22%",
    category: "Anti-inflammatory",
    avgDiscrepancy: 3.1,
  },
  {
    drugName: "TRULICITY PENS 4.5MG/.5ML",
    ndc: "00002318280",
    frequency: 14,
    trend: "stable",
    trendValue: "0%",
    category: "Diabetes",
    avgDiscrepancy: 1.2,
  },
  {
    drugName: "DEXCOM G6 SENSORS 3PK RETAIL",
    ndc: "08627005303",
    frequency: 12,
    trend: "down",
    trendValue: "-12%",
    category: "Medical Device",
    avgDiscrepancy: 0.8,
  },
]

export function TopDiscrepanciesTable() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-chart-2" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Diabetes":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Respiratory":
        return "bg-green-100 text-green-800 border-green-200"
      case "Anti-inflammatory":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medical Device":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Top Discrepancy Items
        </CardTitle>
        <CardDescription>Most frequently discrepant drugs and their trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topDiscrepancies.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{item.drugName}</h4>
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{item.ndc}</p>
                <p className="text-xs text-muted-foreground">Avg discrepancy: {item.avgDiscrepancy} units</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-destructive">{item.frequency}</div>
                  <div className="text-xs text-muted-foreground">occurrences</div>
                </div>

                <div className="flex items-center gap-1">
                  {getTrendIcon(item.trend)}
                  <span
                    className={`text-xs font-medium ${
                      item.trend === "up"
                        ? "text-destructive"
                        : item.trend === "down"
                          ? "text-chart-2"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.trendValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Items with increasing trends may indicate systematic issues with vendor deliveries or
            inventory management that require attention.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
