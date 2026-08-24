import { getClientToken } from '../auth/session';
import type { ApiEnvelope, CurrentUser, Mustahik, PenyaluranByKecamatan } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

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
  const url = `${API_BASE}${normalizedPath}`;

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

  // Penyaluran & Mustahik
  async getMustahikList(params?: Record<string, string>): Promise<ApiEnvelope<Mustahik[]>> {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<Mustahik[]>(`/api/mustahik${search}`);
  },

  async getMustahikById(id: string | number): Promise<ApiEnvelope<Mustahik>> {
    return apiFetch<Mustahik>(`/api/mustahik/${id}`);
  },

  async createMustahik(data: Partial<Mustahik>): Promise<ApiEnvelope<Mustahik>> {
    return apiFetch<Mustahik>('/api/mustahik', {
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

  // Penyaluran by Kecamatan
  async getPenyaluranByKecamatan(): Promise<ApiEnvelope<PenyaluranByKecamatan[]>> {
    return apiFetch<PenyaluranByKecamatan[]>('/api/penyaluran/by-kecamatan');
  },
};
