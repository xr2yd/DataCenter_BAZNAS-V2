import { getClientToken } from '../auth/session';
import type {
  ApiEnvelope,
  CurrentUser,
  Mustahik,
  PenyaluranByKecamatan,
  PenyaluranOverviewResponse,
  PilarProgramData,
  PilarInitiative,
  MustahikStageCounts,
  MustahikDecisionPayload,
  ReportListResponse,
  ReportItem,
  ActivityLogItem,
  PublicApplicationResult,
  PublicTrackingResult,
  PenyaluranTransaction,
  MasterDataRecord,
} from './types';

// In browser, if NEXT_PUBLIC_API_BASE_URL is set, use it; otherwise use same origin (relative /api)
// In browser, ALWAYS use relative path '' so Nginx proxies /api to port 3001
// On server SSR, use internal port 3001
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // If running in browser on localhost with a custom API port, allow NEXT_PUBLIC_API_BASE_URL only if local
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
    return '';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  const url = `${base}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if present in browser
  const token = getClientToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg =
      payload?.message || payload?.error || `HTTP ${response.status}: Request failed`;
    throw new ApiError(errorMsg, response.status, payload);
  }

  return payload as ApiEnvelope<T>;
}

// Typed API services
export const api = {
  // Auth
  async getMe(): Promise<{ success: boolean; user: CurrentUser }> {
    const res = await apiFetch<CurrentUser>('/api/auth/me');
    return { success: res.success, user: (res.data || res) as unknown as CurrentUser };
  },

  async login(credentials: { email?: string; username?: string; password?: string }) {
    return apiFetch<{ token: string; user: CurrentUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 1. Penyaluran Overview & Dashboard
  async getPenyaluranOverview(period: string = '30d'): Promise<ApiEnvelope<PenyaluranOverviewResponse>> {
    return apiFetch<PenyaluranOverviewResponse>(`/api/penyaluran/overview?period=${encodeURIComponent(period)}`);
  },

  // 2. Penyaluran By Kecamatan (Geospatial)
  async getPenyaluranByKecamatan(): Promise<ApiEnvelope<PenyaluranByKecamatan[]>> {
    return apiFetch<PenyaluranByKecamatan[]>('/api/penyaluran/by-kecamatan');
  },

  // 3. 5 Pilar Programs & Initiatives
  async getPilarPrograms(): Promise<ApiEnvelope<PilarProgramData[]>> {
    return apiFetch<PilarProgramData[]>('/api/penyaluran/program');
  },

  async createPilarInitiative(data: Partial<PilarInitiative>): Promise<ApiEnvelope<{ id: number }>> {
    return apiFetch<{ id: number }>('/api/penyaluran/program/initiatives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePilarInitiative(id: number | string, data: Partial<PilarInitiative>): Promise<ApiEnvelope<{ success: boolean }>> {
    return apiFetch<{ success: boolean }>(`/api/penyaluran/program/initiatives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePilarInitiative(id: number | string): Promise<ApiEnvelope<{ success: boolean }>> {
    return apiFetch<{ success: boolean }>(`/api/penyaluran/program/initiatives/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Mustahik Directory & Workflow
  async getMustahikList(params?: Record<string, string>): Promise<ApiEnvelope<Mustahik[]>> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<Mustahik[]>(`/api/mustahik${search}`);
  },

  async getMustahikStageCounts(): Promise<ApiEnvelope<MustahikStageCounts>> {
    return apiFetch<MustahikStageCounts>('/api/mustahik/stages/count');
  },

  async getMustahikById(id: string | number): Promise<ApiEnvelope<Mustahik>> {
    return apiFetch<Mustahik>(`/api/mustahik/${id}`);
  },

  async createMustahik(data: Partial<Mustahik>): Promise<ApiEnvelope<{ id: number }>> {
    return apiFetch<{ id: number }>('/api/mustahik', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMustahik(id: string | number, data: Partial<Mustahik>): Promise<ApiEnvelope<Mustahik>> {
    return apiFetch<Mustahik>(`/api/mustahik/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMustahik(id: string | number): Promise<ApiEnvelope<{ id: string | number }>> {
    return apiFetch<{ id: string | number }>(`/api/mustahik/${id}`, {
      method: 'DELETE',
    });
  },

  async submitMustahikDecision(id: string | number, payload: MustahikDecisionPayload): Promise<ApiEnvelope<{ old_status: string; new_status: string; message: string }>> {
    return apiFetch<{ old_status: string; new_status: string; message: string }>(`/api/mustahik/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getApprovalDecisions(mustahikId: string | number): Promise<ApiEnvelope<import('./types').ApprovalDecision[]>> {
    return apiFetch<import('./types').ApprovalDecision[]>(`/api/mustahik/${mustahikId}/approvals`);
  },

  async getApprovalAudit(params?: Record<string, string>): Promise<ApiEnvelope<import('./types').ApprovalDecision[]>> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<import('./types').ApprovalDecision[]>(`/api/penyaluran/audit-decisions${search}`);
  },

  async importMustahikBatch(items: Partial<Mustahik>[]): Promise<ApiEnvelope<{ count: number }>> {
    return apiFetch<{ count: number }>('/api/mustahik/import', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // 5. Public mustahik portal (no amil session required)
  async submitPublicApplication(payload: FormData): Promise<ApiEnvelope<PublicApplicationResult>> {
    return apiFetch<PublicApplicationResult>('/api/public/pengajuan', {
      method: 'POST',
      body: payload,
    });
  },

  async trackPublicApplication(query: string): Promise<ApiEnvelope<PublicTrackingResult>> {
    return apiFetch<PublicTrackingResult>(`/api/public/lacak/${encodeURIComponent(query)}`);
  },

  async getPenyaluranTransactions(params?: Record<string, string>): Promise<ApiEnvelope<PenyaluranTransaction[]>> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PenyaluranTransaction[]>(`/api/penyaluran/transaksi${search}`);
  },

  async getMasterData(params?: Record<string, string>): Promise<ApiEnvelope<MasterDataRecord[]>> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<MasterDataRecord[]>(`/api/penyaluran/master-data${search}`);
  },

  async getPublicMasterData(category: string): Promise<ApiEnvelope<MasterDataRecord[]>> {
    return apiFetch<MasterDataRecord[]>(`/api/public/master-data?category=${encodeURIComponent(category)}`);
  },

  async createMasterData(record: Omit<MasterDataRecord, 'id' | 'updated_at'>): Promise<ApiEnvelope<{ id: number | string }>> {
    return apiFetch<{ id: number | string }>('/api/penyaluran/master-data', { method: 'POST', body: JSON.stringify(record) });
  },

  async updateMasterData(id: number | string, record: Partial<MasterDataRecord>): Promise<ApiEnvelope<{ id: number | string }>> {
    return apiFetch<{ id: number | string }>(`/api/penyaluran/master-data/${id}`, { method: 'PUT', body: JSON.stringify(record) });
  },

  // 6. Laporan Penyaluran & Exports
  async getLaporanList(params?: Record<string, string>): Promise<ReportListResponse> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch<unknown>(`/api/penyaluran/laporan${search}`);
    return res as unknown as ReportListResponse;
  },

  async generateLaporan(data: Partial<ReportItem>): Promise<ApiEnvelope<{ id: string }>> {
    return apiFetch<{ id: string }>('/api/penyaluran/laporan/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getExportUrl(
    reportId: string,
    format: 'xlsx' | 'pdf' | 'csv' | 'json' = 'xlsx',
    meta?: { title?: string; category?: string; period?: string; scope?: string }
  ): string {
    const base = getApiBase();
    const params = new URLSearchParams({ format });
    if (meta?.title) params.set('title', meta.title);
    if (meta?.category) params.set('category', meta.category);
    if (meta?.period) params.set('period', meta.period);
    if (meta?.scope) params.set('scope', meta.scope);
    return `${base}/api/penyaluran/laporan/export/${encodeURIComponent(reportId)}?${params.toString()}`;
  },

  // 6. Activity Logs
  async getActivityLogs(mustahikId?: string | number, limit?: number): Promise<ApiEnvelope<ActivityLogItem[]>> {
    const params = new URLSearchParams();
    if (mustahikId) params.set('mustahik_id', String(mustahikId));
    if (limit) params.set('limit', String(limit));
    const search = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<ActivityLogItem[]>(`/api/activity-logs${search}`);
  },
};
