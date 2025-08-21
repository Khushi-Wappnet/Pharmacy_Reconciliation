"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Search, Filter } from "lucide-react"
import type { ReconciliationRecord } from "@/app/reconciliation/page"

interface ReconciliationResultsProps {
  results: ReconciliationRecord[]
}

export function ReconciliationResults({ results }: ReconciliationResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.rxNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.ndc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.drugName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || result.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Paginate results
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "matched":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Matched</Badge>
      case "missing":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Missing</Badge>
      case "quantity_mismatch":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Qty Mismatch</Badge>
      case "ndc_mismatch":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">NDC Mismatch</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const exportResults = () => {
    const csvContent = [
      [
        "Rx No",
        "NDC",
        "Drug Name",
        "Rx Quantity",
        "Vendor Quantity",
        "Status",
        "Discrepancy",
        "Vendor Invoice",
        "Vendor Date",
      ],
      ...filteredResults.map((result) => [
        result.rxNo,
        result.ndc,
        result.drugName,
        result.rxQuantity.toString(),
        result.vendorQuantity?.toString() || "",
        result.status,
        result.discrepancy || "",
        result.vendorInvoice || "",
        result.vendorDate || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reconciliation_results_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reconciliation Results</CardTitle>
            <CardDescription>
              {filteredResults.length} of {results.length} records
              {searchTerm && ` matching "${searchTerm}"`}
            </CardDescription>
          </div>
          <Button onClick={exportResults} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Rx No, NDC, or drug name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="quantity_mismatch">Quantity Mismatch</SelectItem>
                <SelectItem value="ndc_mismatch">NDC Mismatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Rx No</th>
                <th className="text-left py-3 font-medium">NDC</th>
                <th className="text-left py-3 font-medium">Drug Name</th>
                <th className="text-left py-3 font-medium">Rx Qty</th>
                <th className="text-left py-3 font-medium">Vendor Qty</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-left py-3 font-medium">Discrepancy</th>
                <th className="text-left py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((result, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-muted/50 ${result.status !== "matched" ? "bg-destructive/5" : ""}`}
                >
                  <td className="py-3 font-mono text-xs">{result.rxNo}</td>
                  <td className="py-3 font-mono text-xs">{result.ndc}</td>
                  <td className="py-3 max-w-[200px] truncate" title={result.drugName}>
                    {result.drugName}
                  </td>
                  <td className="py-3">{result.rxQuantity}</td>
                  <td className="py-3">{result.vendorQuantity || "-"}</td>
                  <td className="py-3">{getStatusBadge(result.status)}</td>
                  <td className="py-3 max-w-[200px] truncate text-xs text-muted-foreground" title={result.discrepancy}>
                    {result.discrepancy || "-"}
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResults.length)} of{" "}
              {filteredResults.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
