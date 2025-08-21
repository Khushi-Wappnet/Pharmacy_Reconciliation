// api.ts
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  FileUploadRequest,
  ReconciliationSession,
  ReconciliationResults,
  DailyTrendData,
} from './types';

// Base URL for API requests
const BASE_URL = 'http://192.168.10.170:8000';

// Function to get headers with Authorization token if available
const getHeaders = (excludeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (!excludeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for Authorization header');
    }
  }
  return headers;
};

// Mock data for development - replace with actual API calls
const MOCK_SESSIONS: ReconciliationSession[] = [
  {
    id: 'session-1',
    name: 'Weekly Reconciliation - Jan 15',
    rxReportFile: 'rx_report_jan15.csv',
    purchaseHistoryFile: 'purchase_history_jan15.csv',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'completed',
    results: {
      totalRxRecords: 1250,
      totalPurchaseRecords: 1180,
      matchedRecords: 1150,
      missingRx: 100,
      quantityMismatches: 30,
      matchRate: 92.0,
      discrepancies: [],
    },
  },
  {
    id: 'session-2',
    name: 'Monthly Reconciliation - Jan',
    rxReportFile: 'rx_report_jan.csv',
    purchaseHistoryFile: 'purchase_history_jan.csv',
    createdAt: '2024-01-10T14:20:00Z',
    status: 'completed',
    results: {
      totalRxRecords: 5200,
      totalPurchaseRecords: 4980,
      matchedRecords: 4850,
      missingRx: 350,
      quantityMismatches: 130,
      matchRate: 93.3,
      discrepancies: [],
    },
  },
];

const MOCK_DAILY_TRENDS: DailyTrendData[] = [
  { date: '2024-01-15', matched: 180, discrepancies: 15, matchRate: 92.3 },
  { date: '2024-01-14', matched: 165, discrepancies: 12, matchRate: 93.2 },
  { date: '2024-01-13', matched: 172, discrepancies: 18, matchRate: 90.5 },
  { date: '2024-01-12', matched: 158, discrepancies: 10, matchRate: 94.1 },
  { date: '2024-01-11', matched: 145, discrepancies: 8, matchRate: 94.8 },
  { date: '2024-01-10', matched: 162, discrepancies: 14, matchRate: 92.0 },
  { date: '2024-01-09', matched: 155, discrepancies: 11, matchRate: 93.4 },
];

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: getHeaders(true), // Exclude Authorization header
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const rawText = await response.text().catch(() => 'Unable to read response body');
          console.error('Login API Error (Raw Response):', {
            status: response.status,
            statusText: response.statusText,
            rawText,
            url: `${BASE_URL}/login`,
            requestBody: credentials,
          });
        }
        console.error('Login API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: `${BASE_URL}/login`,
          requestBody: credentials,
        });
        throw new Error(
          errorData.message || errorData.detail || `Login failed: ${response.statusText} (${response.status})`,
        );
      }

      const data = await response.json();
      console.log('Login API Response:', data); // Debug: Log full response
      // Relax token_type check to handle case-insensitive or missing token_type
      if (data.token_type && data.token_type.toLowerCase() !== 'bearer') {
        throw new Error(`Invalid token type: ${data.token_type}`);
      }
      return { success: true, data: { token: data.access_token, user: data.user || { email: credentials.email } } };
    } catch (err) {
      console.error('Login API Error (Catch):', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed. Please check your credentials or network connection.',
      };
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: getHeaders(true), // Exclude Authorization header
        body: JSON.stringify({
          full_name: userData.name,
          email: userData.email,
          password: userData.password,
          pharmacy_name: userData.pharmacyName,
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const rawText = await response.text().catch(() => 'Unable to read response body');
          console.error('Register API Error (Raw Response):', {
            status: response.status,
            statusText: response.statusText,
            rawText,
            url: `${BASE_URL}/register`,
            requestBody: { full_name: userData.name, email: userData.email, password: userData.password, pharmacy_name: userData.pharmacyName },
          });
        }
        console.error('Register API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: `${BASE_URL}/register`,
          requestBody: { full_name: userData.name, email: userData.email, password: userData.password, pharmacy_name: userData.pharmacyName },
        });
        const errorMessage =
          typeof errorData.message === 'string'
            ? errorData.message
            : typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail || errorData, null, 2) || `Registration failed: ${response.statusText} (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, data: { message: data.message || 'Registration successful' } };
    } catch (err) {
      console.error('Register API Error (Catch):', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Registration failed. Please check your input and try again.',
      };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Logout failed: ${response.statusText}`);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('pharmacyName');
      return { success: true };
    } catch (err) {
      console.error('Logout API Error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Logout failed.',
      };
    }
  },
};

// File Upload API
export const fileApi = {
  upload: async (request: FileUploadRequest): Promise<ApiResponse<{ file_id: string; filename: string; row_count: number; upload_date: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      // Removed 'type' append to match curl example; backend determines type from endpoint

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };  

      const endpoint = request.type === 'rx_report' ? `${BASE_URL}/upload_rx_data` : `${BASE_URL}/upload_pharmacy_data`;

      console.debug('Upload API Request:', {
        endpoint,
        filename: request.file.name,
        type: request.type,
        headers: { ...headers, Authorization: 'Bearer [REDACTED]' }, // Redact token for logging
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
        // credentials: 'include', 
      });

      if (!response.ok) {
        let errorData: { message?: string; detail?: string } = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const rawText = await response.text().catch(() => 'Unable to read response body');
          console.error('File Upload API Error (Raw Response):', {
            status: response.status,
            statusText: response.statusText,
            rawText,
            url: endpoint,
            requestBody: { filename: request.file.name },
          });
        }
        console.error('File Upload API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: endpoint,
          requestBody: { filename: request.file.name },
        });

        // Specific error messages based on status code
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to upload this file.');
        } else if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint}. Please check the server configuration.`);
        } else if (response.status === 400) {
          throw new Error(errorData.message || errorData.detail || 'Bad request: Invalid file format or data.');
        } else {
          throw new Error(errorData.message || errorData.detail || `File upload failed: ${response.statusText} (${response.status})`);
        }
      }

      const data = await response.json();
      console.debug('Upload API Response:', data);

      const uploadResult = {
        file_id: data.file_id,
        filename: request.file.name,
        row_count: 0, // Assuming backend does not provide; update if it does
        upload_date: new Date().toISOString(),
      };

      let history = JSON.parse(localStorage.getItem('upload_history') || '[]');
      history.push({
        ...uploadResult,
        type: request.type === 'rx_report' ? 'rx-report' : 'purchase-history',
      });
      localStorage.setItem('upload_history', JSON.stringify(history));

      return { success: true, data: uploadResult };
    } catch (err) {
      console.error('File Upload API Error (Catch):', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'File upload failed. Please check your network, token, or server status.',
      };
    }
  },

  getUploadHistory: async (): Promise<ApiResponse<{ file_id: string; filename: string; type: string; upload_date: string; row_count: number }[]>> => {
    try {
      const historyStr = localStorage.getItem('upload_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      return { success: true, data: history };
    } catch (err) {
      console.error('Get Upload History Error:', err);
      return { success: true, data: [] };
    }
  },
};

// Reconciliation API
export const reconciliationApi = {
  createSession: async (
    name: string,
    rxFileId: string,
    purchaseFileId: string,
  ): Promise<ApiResponse<ReconciliationSession>> => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newSession: ReconciliationSession = {
      id: `session-${Date.now()}`,
      name,
      rxReportFile: `rx-${rxFileId}.csv`,
      purchaseHistoryFile: `purchase-${purchaseFileId}.csv`,
      createdAt: new Date().toISOString(),
      status: "processing",
    };
    return { success: true, data: newSession };
  },

  getSessions: async (): Promise<ApiResponse<ReconciliationSession[]>> => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: MOCK_SESSIONS };
  },

  getSessionResults: async (sessionId: string): Promise<ApiResponse<ReconciliationResults>> => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
    return { success: true, data: session?.results };
  },

  getDailyTrends: async (days = 7): Promise<ApiResponse<DailyTrendData[]>> => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: MOCK_DAILY_TRENDS.slice(0, days) };
  },

  compareFiles: async (rxFileId: string, purchaseFileId: string, page: number = 1, pageSize: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(
        `${BASE_URL}/compare_files?file_id_1=${encodeURIComponent(rxFileId)}&file_id_2=${encodeURIComponent(purchaseFileId)}&page=${encodeURIComponent(String(page))}&page_size=${encodeURIComponent(String(pageSize))}`,
        {
          method: 'GET',
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Compare failed: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.error('Compare Files API Error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'File comparison failed.',
      };
    }
  },
};