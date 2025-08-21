"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DiscrepancyTrendChart } from "@/components/analytics/discrepancy-trend-chart"
import { DrugCategoryChart } from "@/components/analytics/drug-category-chart"
import { VendorPerformanceChart } from "@/components/analytics/vendor-performance-chart"
import { ReconciliationHeatmap } from "@/components/analytics/reconciliation-heatmap"
import { TopDiscrepanciesTable } from "@/components/analytics/top-discrepancies-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground">Advanced data visualization and analytics for pharmacy reconciliation</p>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DiscrepancyTrendChart />
              <TopDiscrepanciesTable />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <DrugCategoryChart />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <VendorPerformanceChart />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <ReconciliationHeatmap />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
