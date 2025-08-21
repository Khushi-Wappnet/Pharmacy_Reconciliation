"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import type { ReconciliationRecord, ReconciliationSummaryData } from "@/app/reconciliation/page"

interface ReconciliationRunnerProps {
  onStart: () => void
  onComplete: (results: ReconciliationRecord[], summary: ReconciliationSummaryData) => void
  isProcessing: boolean
}

interface UploadedFile {
  filename: string
  type: string
  data: string[][]
  uploadDate: string
}

export function ReconciliationRunner({ onStart, onComplete, isProcessing }: ReconciliationRunnerProps) {
  const [availableFiles, setAvailableFiles] = useState<UploadedFile[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadAvailableFiles()
  }, [])

  const loadAvailableFiles = () => {
    const files: UploadedFile[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("uploaded_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}")
          files.push(data)
        } catch (error) {
          console.error("Error loading file:", error)
        }
      }
    }

    setAvailableFiles(files)
  }

  const normalizeNDC = (ndc: string): string => {
    // Remove any non-numeric characters and normalize NDC format
    const cleaned = ndc.replace(/[^0-9]/g, "")

    // Handle different NDC formats (5-4-2, 4-4-2, etc.)
    if (cleaned.length === 11) {
      return cleaned
    } else if (cleaned.length === 10) {
      // Add leading zero to first segment
      return "0" + cleaned
    }

    return cleaned
  }

  const runReconciliation = async () => {
    setError("")
    onStart()

    try {
      const rxFiles = availableFiles.filter((f) => f.type === "rx-report")
      const purchaseFiles = availableFiles.filter((f) => f.type === "purchase-history")

      if (rxFiles.length === 0) {
        throw new Error("No Rx report files found. Please upload an Rx report first.")
      }

      if (purchaseFiles.length === 0) {
        throw new Error("No purchase history files found. Please upload a purchase history file first.")
      }

      // Use the most recent files
      const rxFile = rxFiles.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0]
      const purchaseFile = purchaseFiles.sort(
        (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
      )[0]

      setCurrentStep("Loading Rx data...")
      setProgress(10)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Parse Rx data
      const rxHeaders = rxFile.data[0]
      const rxRows = rxFile.data.slice(1)

      const rxNoIndex = rxHeaders.findIndex((h) => h.toLowerCase().includes("rxno"))
      const ndcIndex = rxHeaders.findIndex((h) => h.toLowerCase().includes("ndc"))
      const drugNameIndex = rxHeaders.findIndex((h) => h.toLowerCase().includes("drugname"))
      const quantIndex = rxHeaders.findIndex((h) => h.toLowerCase().includes("quant"))

      setCurrentStep("Loading purchase data...")
      setProgress(30)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Parse purchase data
      const purchaseHeaders = purchaseFile.data[0]
      const purchaseRows = purchaseFile.data.slice(1)

      const purchaseNdcIndex = purchaseHeaders.findIndex((h) => h.toLowerCase().includes("ndc"))
      const purchaseQtyIndex = purchaseHeaders.findIndex((h) => h.toLowerCase().includes("qty"))
      const purchaseInvoiceIndex = purchaseHeaders.findIndex((h) => h.toLowerCase().includes("invoice"))
      const purchaseDateIndex = purchaseHeaders.findIndex((h) => h.toLowerCase().includes("date"))

      setCurrentStep("Building purchase lookup...")
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Build purchase lookup by NDC
      const purchaseLookup = new Map<string, any[]>()
      purchaseRows.forEach((row) => {
        if (row[purchaseNdcIndex]) {
          const ndc = normalizeNDC(row[purchaseNdcIndex])
          if (!purchaseLookup.has(ndc)) {
            purchaseLookup.set(ndc, [])
          }
          purchaseLookup.get(ndc)?.push({
            quantity: Number.parseInt(row[purchaseQtyIndex]) || 0,
            invoice: row[purchaseInvoiceIndex] || "",
            date: row[purchaseDateIndex] || "",
          })
        }
      })

      setCurrentStep("Performing reconciliation...")
      setProgress(70)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Perform reconciliation
      const results: ReconciliationRecord[] = []
      let matched = 0
      let missing = 0
      let quantityMismatches = 0
      const ndcMismatches = 0

      for (const rxRow of rxRows) {
        if (!rxRow[rxNoIndex] || !rxRow[ndcIndex]) continue

        const rxNo = rxRow[rxNoIndex]
        const ndc = normalizeNDC(rxRow[ndcIndex])
        const drugName = rxRow[drugNameIndex] || ""
        const rxQuantity = Number.parseInt(rxRow[quantIndex]) || 0

        const purchaseRecords = purchaseLookup.get(ndc)

        if (!purchaseRecords || purchaseRecords.length === 0) {
          // Missing in vendor purchases
          results.push({
            rxNo,
            ndc: rxRow[ndcIndex],
            drugName,
            rxQuantity,
            status: "missing",
            discrepancy: "Not found in vendor purchases",
          })
          missing++
        } else {
          // Found in purchases, check quantities
          const totalVendorQuantity = purchaseRecords.reduce((sum, record) => sum + record.quantity, 0)
          const latestPurchase = purchaseRecords[purchaseRecords.length - 1]

          if (totalVendorQuantity === rxQuantity) {
            // Perfect match
            results.push({
              rxNo,
              ndc: rxRow[ndcIndex],
              drugName,
              rxQuantity,
              vendorQuantity: totalVendorQuantity,
              status: "matched",
              vendorInvoice: latestPurchase.invoice,
              vendorDate: latestPurchase.date,
            })
            matched++
          } else {
            // Quantity mismatch
            results.push({
              rxNo,
              ndc: rxRow[ndcIndex],
              drugName,
              rxQuantity,
              vendorQuantity: totalVendorQuantity,
              status: "quantity_mismatch",
              discrepancy: `Rx qty: ${rxQuantity}, Vendor qty: ${totalVendorQuantity}`,
              vendorInvoice: latestPurchase.invoice,
              vendorDate: latestPurchase.date,
            })
            quantityMismatches++
          }
        }
      }

      setCurrentStep("Generating summary...")
      setProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const summary: ReconciliationSummaryData = {
        totalRxRecords: rxRows.length,
        totalVendorRecords: purchaseRows.length,
        matchedRecords: matched,
        missingRecords: missing,
        quantityMismatches,
        ndcMismatches,
        matchRate: (matched / rxRows.length) * 100,
        discrepancyRate: ((missing + quantityMismatches + ndcMismatches) / rxRows.length) * 100,
      }

      setProgress(100)
      setCurrentStep("Complete!")
      await new Promise((resolve) => setTimeout(resolve, 500))

      onComplete(results, summary)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Reconciliation failed")
      onComplete([], {
        totalRxRecords: 0,
        totalVendorRecords: 0,
        matchedRecords: 0,
        missingRecords: 0,
        quantityMismatches: 0,
        ndcMismatches: 0,
        matchRate: 0,
        discrepancyRate: 0,
      })
    }
  }

  const rxFiles = availableFiles.filter((f) => f.type === "rx-report")
  const purchaseFiles = availableFiles.filter((f) => f.type === "purchase-history")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Reconciliation</CardTitle>
        <CardDescription>
          Compare uploaded Rx reports with vendor purchase history to identify discrepancies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Rx Reports</p>
              <p className="text-sm text-muted-foreground">{rxFiles.length} files available</p>
            </div>
            {rxFiles.length > 0 ? (
              <CheckCircle className="h-5 w-5 text-chart-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Purchase History</p>
              <p className="text-sm text-muted-foreground">{purchaseFiles.length} files available</p>
            </div>
            {purchaseFiles.length > 0 ? (
              <CheckCircle className="h-5 w-5 text-chart-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{currentStep}</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Run Button */}
        <Button
          onClick={runReconciliation}
          disabled={isProcessing || rxFiles.length === 0 || purchaseFiles.length === 0}
          className="w-full"
        >
          <Play className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : "Run Reconciliation"}
        </Button>

        {/* File List */}
        {availableFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Available Files:</h4>
            {availableFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.filename}</span>
                </div>
                <Badge variant={file.type === "rx-report" ? "default" : "secondary"}>
                  {file.type === "rx-report" ? "Rx Report" : "Purchase History"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
