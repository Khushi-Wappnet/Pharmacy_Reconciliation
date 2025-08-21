"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReconciliationRunner } from "@/components/reconciliation/reconciliation-runner"
import { ReconciliationResults } from "@/components/reconciliation/reconciliation-results"
import { ReconciliationSummary } from "@/components/reconciliation/reconciliation-summary"

export interface ReconciliationRecord {
  rxNo: string
  ndc: string
  drugName: string
  rxQuantity: number
  vendorQuantity?: number
  status: "matched" | "missing" | "quantity_mismatch" | "ndc_mismatch"
  discrepancy?: string
  vendorInvoice?: string
  vendorDate?: string
}

export interface ReconciliationSummaryData {
  totalRxRecords: number
  totalVendorRecords: number
  matchedRecords: number
  missingRecords: number
  quantityMismatches: number
  ndcMismatches: number
  matchRate: number
  discrepancyRate: number
}

export default function ReconciliationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationRecord[]>([])
  const [summaryData, setSummaryData] = useState<ReconciliationSummaryData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleReconciliationComplete = (results: ReconciliationRecord[], summary: ReconciliationSummaryData) => {
    setReconciliationResults(results)
    setSummaryData(summary)
    setIsProcessing(false)

    // Store results in localStorage for persistence
    localStorage.setItem(
      "latest_reconciliation",
      JSON.stringify({
        results,
        summary,
        timestamp: new Date().toISOString(),
      }),
    )
  }

  const handleReconciliationStart = () => {
    setIsProcessing(true)
    setReconciliationResults([])
    setSummaryData(null)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Data Reconciliation</h1>
          <p className="text-muted-foreground">
            Compare Rx reports with vendor purchase history to identify discrepancies
          </p>
        </div>

        <div className="space-y-6">
          {/* Reconciliation Runner */}
          <ReconciliationRunner
            onStart={handleReconciliationStart}
            onComplete={handleReconciliationComplete}
            isProcessing={isProcessing}
          />

          {/* Summary */}
          {summaryData && <ReconciliationSummary data={summaryData} />}

          {/* Results */}
          {reconciliationResults.length > 0 && <ReconciliationResults results={reconciliationResults} />}
        </div>
      </main>
    </div>
  )
}
