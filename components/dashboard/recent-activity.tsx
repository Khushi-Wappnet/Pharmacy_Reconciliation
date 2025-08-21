import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, XCircle } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "missing",
      message: "15 missing Rx numbers detected",
      time: "2 minutes ago",
      status: "missing",
      icon: XCircle,
    },
    {
      id: 2,
      type: "quantity_mismatch",
      message: "8 quantity mismatches found",
      time: "15 minutes ago",
      status: "quantity_mismatch",
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: "missing",
      message: "22 missing Rx numbers in session",
      time: "1 hour ago",
      status: "missing",
      icon: XCircle,
    },
    {
      id: 4,
      type: "quantity_mismatch",
      message: "12 quantity discrepancies identified",
      time: "2 hours ago",
      status: "quantity_mismatch",
      icon: AlertTriangle,
    },
    {
      id: 5,
      type: "missing",
      message: "5 missing Rx numbers found",
      time: "3 hours ago",
      status: "missing",
      icon: XCircle,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "missing":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "quantity_mismatch":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Discrepancies</CardTitle>
        <CardDescription>Latest missing Rx and quantity mismatch alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
