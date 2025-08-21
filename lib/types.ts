export interface ReconciliationSession {
  id: string
  name: string
  rxReportFile: string
  purchaseHistoryFile: string
  createdAt: string
  status: "processing" | "completed" | "failed"
  results?: ReconciliationResults
}

export interface ReconciliationResults {
  totalRxRecords: number
  totalPurchaseRecords: number
  matchedRecords: number
  missingRx: number
  quantityMismatches: number
  matchRate: number
  discrepancies: DiscrepancyRecord[]
}

export interface DiscrepancyRecord {
  rxNumber: string
  ndcCode: string
  drugName: string
  rxQuantity: number
  purchaseQuantity: number
  status: "missing" | "quantity_mismatch" | "matched"
  vendor?: string
  dateFilled?: string
}

export interface DailyTrendData {
  date: string
  matched: number
  discrepancies: number
  matchRate: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API endpoint types for future backend integration
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  pharmacyName: string
}

export interface FileUploadRequest {
  file: File
  type: "rx_report" | "purchase_history"
  sessionId?: string
}
