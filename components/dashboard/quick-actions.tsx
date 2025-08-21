import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Download, RefreshCw, BarChart3 } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and file operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/upload">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Rx Report
          </Button>
        </Link>
        <Link href="/upload">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Upload Purchase History
          </Button>
        </Link>
        <Link href="/reconciliation">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Reconciliation
          </Button>
        </Link>
        <Link href="/analytics">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </CardContent>
    </Card>
  )
}
