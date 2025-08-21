"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, AlertTriangle } from "lucide-react"
import { reconciliationApi } from "@/lib/api"

export function DataTable() {
  const sampleData = [
    {
      rxNo: "425636",
      ndc: "13668-0008-05",
      drugName: "ZOLPIDEM 10MG TAB",
      quantity: 30,
      refillAuth: null,
      status: "matched",
      discrepancy: null,
    },
    {
      rxNo: "425945",
      ndc: "67877-0465-90",
      drugName: "PREGABALIN 100MG CAP",
      quantity: 90,
      refillAuth: null,
      status: "matched",
      discrepancy: null,
    },
    {
      rxNo: "426229",
      ndc: "29300-0355-10",
      drugName: "TRAMADOL 50MG TAB",
      quantity: 60,
      refillAuth: "-",
      status: "missing",
      discrepancy: "Not found in vendor purchases",
    },
    {
      rxNo: "1260155",
      ndc: "27241-0114-03",
      drugName: "TADALAFIL 20MG TAB",
      quantity: 20,
      refillAuth: "-",
      status: "quantity_mismatch",
      discrepancy: "Vendor qty: 15, Rx qty: 20",
    },
    {
      rxNo: "1260367",
      ndc: "70700-0150-10",
      drugName: "OMEPRAZOLE 20MG CAP",
      quantity: 90,
      refillAuth: null,
      status: "matched",
      discrepancy: null,
    },
  ]

  const [rows, setRows] = useState<any[]>(sampleData)
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [total, setTotal] = useState<number>(sampleData.length)

  useEffect(() => {
    const tryFetchComparedResults = async () => {
      try {
        const historyStr = typeof window !== "undefined" ? localStorage.getItem("upload_history") : null
        if (!historyStr) {
          setTotal(sampleData.length)
          return
        }
        const history = JSON.parse(historyStr) as Array<{ file_id: string; type: string; upload_date: string }>
        if (!Array.isArray(history) || history.length === 0) {
          setTotal(sampleData.length)
          return
        }

        const rxUploads = history.filter((u) => u.type === "rx-report").sort((a, b) => (a.upload_date < b.upload_date ? 1 : -1))
        const purchaseUploads = history
          .filter((u) => u.type === "purchase-history")
          .sort((a, b) => (a.upload_date < b.upload_date ? 1 : -1))

        const latestRx = rxUploads[0]
        const latestPurchase = purchaseUploads[0]
        if (!latestRx || !latestPurchase) {
          setTotal(sampleData.length)
          return
        }

        setLoading(true)
        const response = await reconciliationApi.compareFiles(latestRx.file_id, latestPurchase.file_id, page, pageSize)
        if (response.success && response.data) {
          const api = response.data as any
          const unmatched = Array.isArray(api?.unmatched_records) ? api.unmatched_records : []
          const mapped = unmatched.map((r: any) => ({
            rxNo: r?.rx_no ?? "",
            ndc: r?.ndc ?? "",
            drugName: r?.drug_name ?? "",
            quantity: r?.quantity_file1 ? Number(r.quantity_file1) : r?.quantity_file1 ?? "-",
            refillAuth: r?.refill_auth ?? "-",
            status: "missing",
            discrepancy: "Not found in vendor purchases",
          }))
          setRows(mapped)
          setTotal(typeof api?.total === "number" ? api.total : mapped.length)
        }
      } catch (err) {
        console.error("Failed to fetch compared results for dashboard table:", err)
      } finally {
        setLoading(false)
      }
    }

    tryFetchComparedResults()
  }, [page, pageSize])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "matched":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Matched</Badge>
      case "missing":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Missing</Badge>
      case "quantity_mismatch":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Qty Mismatch</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredData = rows.filter((item) => item.status === "missing" || item.status === "quantity_mismatch")
  const totalPages = Math.max(1, Math.ceil((typeof total === "number" ? total : filteredData.length) / pageSize))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reconciliation Results</CardTitle>
        <CardDescription>Latest prescription matching results with discrepancies highlighted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Rx No</th>
                <th className="text-left py-2 font-medium">NDC</th>
                <th className="text-left py-2 font-medium">Drug Name</th>
                <th className="text-left py-2 font-medium">Qty</th>
                <th className="text-left py-2 font-medium">Refill Auth</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : filteredData).map((item, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-muted/50 ${item.status !== "matched" ? "bg-destructive/5" : ""}`}
                >
                  <td className="py-3 font-mono text-xs">{item.rxNo}</td>
                  <td className="py-3 font-mono text-xs">{item.ndc}</td>
                  <td className="py-3 max-w-[200px] truncate">{item.drugName}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3 font-mono text-xs">{item.refillAuth ?? "-"}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {item.discrepancy && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground" colSpan={7}>
                    Loading latest comparison results...
                  </td>
                </tr>
              )}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground" colSpan={7}>
                    No discrepancies to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
