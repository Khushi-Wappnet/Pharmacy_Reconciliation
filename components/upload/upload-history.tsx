// upload-history.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Updated import for App Router
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { fileApi, reconciliationApi } from "@/lib/api";

interface UploadRecord {
  file_id: string;
  filename: string;
  type: string;
  upload_date: string;
  row_count: number;
}

export function UploadHistory() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch upload history from backend
    const loadUploads = async () => {
      try {
        const response = await fileApi.getUploadHistory();
        if (response.success && Array.isArray(response.data)) {
          // Sort by upload date (newest first)
          const sortedUploads = response.data.sort(
            (a: UploadRecord, b: UploadRecord) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
          );
          setUploads(sortedUploads);
          setError(null);
        } else {
          setError(response.error || "Failed to load upload history");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while loading upload history");
      }
    };

    loadUploads();
  }, [router]);

  const deleteUpload = async (file_id: string) => {
    // Since no backend delete, just remove from local
    const newUploads = uploads.filter((upload) => upload.file_id !== file_id);
    localStorage.setItem('upload_history', JSON.stringify(newUploads));
    setUploads(newUploads);
  };

  const downloadUpload = async (file_id: string, filename: string) => {
    // TODO: Implement download API call when backend endpoint is available
    console.log(`Download file with ID: ${file_id}`);
    alert(`Download not implemented yet for file: ${filename}`);
  };

  const handleCompare = async () => {
    // Get latest rx-report and purchase-history
    const rxUploads = uploads.filter(u => u.type === 'rx-report');
    const purchaseUploads = uploads.filter(u => u.type === 'purchase-history');
    const latestRx = rxUploads[0];
    const latestPurchase = purchaseUploads[0];

    if (!latestRx || !latestPurchase) {
      alert('Please upload both an Rx Report and a Purchase History file before comparing.');
      return;
    }

    const response = await reconciliationApi.compareFiles(latestRx.file_id, latestPurchase.file_id);
    if (response.success) {
      console.log('Comparison results:', response.data);
      alert('Files compared successfully! Check console for results.');
    } else {
      alert(`Comparison failed: ${response.error}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "rx-report":
        return "Rx Report";
      case "purchase-history":
        return "Purchase History";
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "rx-report":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "purchase-history":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload History</CardTitle>
        <CardDescription>Recently uploaded files and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCompare} className="mb-6">Compare Both Files</Button>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {uploads.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map((upload) => (
              <div key={upload.file_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{upload.filename}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeBadgeColor(upload.type)}>{getTypeLabel(upload.type)}</Badge>
                      <span className="text-xs text-muted-foreground">{upload.row_count} records</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(upload.upload_date)}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadUpload(upload.file_id, upload.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteUpload(upload.file_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}