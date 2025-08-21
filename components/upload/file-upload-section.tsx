"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, File, CheckCircle, AlertTriangle, X } from "lucide-react"
import { fileApi } from "@/lib/api"

interface FileUploadSectionProps {
  fileType: "rx-report" | "purchase-history"
  acceptedFormats: string
  maxSize: number
  expectedColumns: string[]
}

interface UploadedFile {
  file: File
  status: "uploading" | "success" | "error"
  error?: string
}

export function FileUploadSection({ fileType, acceptedFormats, maxSize, expectedColumns }: FileUploadSectionProps) {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    const isRxReport = fileType === "rx-report";
    const expectedExtension = isRxReport ? ".csv" : ".xlsx";
    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      return `File must be ${isRxReport ? "CSV" : "XLSX"} format`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  }

  const processFile = async (file: File): Promise<void> => {
    const validation = validateFile(file)
    if (validation) {
      setUploadedFiles((prev) => [
        ...prev,
        {
          file,
          status: "error",
          error: validation,
        },
      ])
      return
    }

    // Check if token exists before attempting upload
    const token = localStorage.getItem('token');
    if (!token) {
      setUploadedFiles((prev) => [
        ...prev,
        {
          file,
          status: "error",
          error: "Not authenticated. Please log in and try again.",
        },
      ]);
      router.push("/login");
      return;
    }

    // Add file with uploading status
    const fileIndex = uploadedFiles.length
    setUploadedFiles((prev) => [
      ...prev,
      {
        file,
        status: "uploading",
      },
    ])

    try {
      // Call actual API to upload
      const apiFileType = fileType === "rx-report" ? "rx_report" : "purchase_history";
      const response = await fileApi.upload({ file, type: apiFileType })
      if (!response.success) {
        throw new Error(response.error || "Upload failed")
      }

      setUploadedFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex ? { ...f, status: "success" } : f,
        ),
      )
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed. Please check your network or try logging in again.",
              }
            : f,
        ),
      )
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile)
    setIsDragActive(false)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileType === "rx-report" ? {
      "text/csv": [".csv"],
    } : {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: maxSize * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-accent/5"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop files here" : `Upload ${fileType === "rx-report" ? "CSV" : "Excel"} File`}</h3>
        <p className="text-muted-foreground mb-4">Drag and drop your {fileType === "rx-report" ? "CSV" : "Excel"} file here, or click to browse</p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {expectedColumns.map((column) => (
            <Badge key={column} variant="outline" className="text-xs">
              {column}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Supports: {acceptedFormats} • Max size: {maxSize}MB
        </p>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{uploadedFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploadedFile.status === "success" && <CheckCircle className="h-5 w-5 text-chart-2" />}
                  {uploadedFile.status === "error" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadedFile.status === "uploading" && <div className="mb-3 text-muted-foreground">Uploading...</div>}

              {uploadedFile.error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{uploadedFile.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}