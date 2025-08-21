"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FileUploadSection } from "@/components/upload/file-upload-section"
import { UploadHistory } from "@/components/upload/upload-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UploadPage() {
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
          <h1 className="text-3xl font-bold text-foreground">File Upload</h1>
          <p className="text-muted-foreground">
            Upload Rx reports and vendor purchase history files for reconciliation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="rx-report" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rx-report">Rx Report</TabsTrigger>
                <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
              </TabsList>

              <TabsContent value="rx-report" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Rx Report</CardTitle>
                    <CardDescription>
                      Upload your prescription report CSV file containing RXNO, NDC, DRUGNAME, QUANT, and REFILL/AUTH
                      columns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploadSection
                      fileType="rx-report"
                      acceptedFormats=".csv"
                      maxSize={10}
                      expectedColumns={["RXNO", "NDC", "DRUGNAME", "QUANT", "REFILL/AUTH"]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchase-history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Purchase History</CardTitle>
                    <CardDescription>
                      Upload your vendor purchase history CSV file containing Pack Sz, Desc, Inv Date, Invoice #, QTY,
                      and NDC columns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploadSection
                      fileType="purchase-history"
                      acceptedFormats=".csv"
                      maxSize={10}
                      expectedColumns={["Pack Sz", "Desc", "Inv Date", "Invoice #", "QTY", "NDC"]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <UploadHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
