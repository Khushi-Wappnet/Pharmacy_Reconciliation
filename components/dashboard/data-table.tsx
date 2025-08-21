import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, AlertTriangle } from "lucide-react"

export function DataTable() {
  const sampleData = [
    {
      rxNo: "425636",
      ndc: "13668-0008-05",
      drugName: "ZOLPIDEM 10MG TAB",
      quantity: 30,
      status: "matched",
      discrepancy: null,
    },
    {
      rxNo: "425945",
      ndc: "67877-0465-90",
      drugName: "PREGABALIN 100MG CAP",
      quantity: 90,
      status: "matched",
      discrepancy: null,
    },
    {
      rxNo: "426229",
      ndc: "29300-0355-10",
      drugName: "TRAMADOL 50MG TAB",
      quantity: 60,
      status: "missing",
      discrepancy: "Not found in vendor purchases",
    },
    {
      rxNo: "1260155",
      ndc: "27241-0114-03",
      drugName: "TADALAFIL 20MG TAB",
      quantity: 20,
      status: "quantity_mismatch",
      discrepancy: "Vendor qty: 15, Rx qty: 20",
    },
    {
      rxNo: "1260367",
      ndc: "70700-0150-10",
      drugName: "OMEPRAZOLE 20MG CAP",
      quantity: 90,
      status: "matched",
      discrepancy: null,
    },
  ]

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

  const filteredData = sampleData.filter((item) => item.status === "missing" || item.status === "quantity_mismatch")

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
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-muted/50 ${item.status !== "matched" ? "bg-destructive/5" : ""}`}
                >
                  <td className="py-3 font-mono text-xs">{item.rxNo}</td>
                  <td className="py-3 font-mono text-xs">{item.ndc}</td>
                  <td className="py-3 max-w-[200px] truncate">{item.drugName}</td>
                  <td className="py-3">{item.quantity}</td>
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
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
