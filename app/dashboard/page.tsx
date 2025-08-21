"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ReconciliationChart } from "@/components/dashboard/reconciliation-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DataTable } from "@/components/dashboard/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { reconciliationApi } from "@/lib/api"
import type { ReconciliationSession } from "@/lib/types"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessions, setSessions] = useState<ReconciliationSession[]>([])
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSessions = async () => {
        try {
          const response = await reconciliationApi.getSessions()
          if (response.success && response.data) {
            setSessions(response.data)
          }
        } catch (error) {
          console.error("Failed to fetch sessions:", error)
        }
      }
      fetchSessions()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsCards />

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReconciliationChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Sessions</CardTitle>
                <CardDescription>Recent reconciliation sessions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()} •{session.rxReportFile} +{" "}
                            {session.purchaseHistoryFile}
                          </p>
                          {session.results && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.results.matchedRecords} matched,{" "}
                              {session.results.missingRx + session.results.quantityMismatches} issues
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : session.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {session.status}
                          </span>
                          {session.results && (
                            <p className="text-sm font-medium mt-1">{session.results.matchRate.toFixed(1)}% match</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reconciliation sessions yet</p>
                      <p className="text-sm text-muted-foreground">Upload files to create your first session</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Data Table */}
        <DataTable />
      </main>
    </div>
  )
}
