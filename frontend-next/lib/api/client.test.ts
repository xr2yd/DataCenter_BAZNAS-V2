import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiFetch, ApiError } from './client';

describe('apiFetch client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('normalizes path and sends json headers', async () => {
    const mockResponse = { success: true, data: { count: 10 } };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const res = await apiFetch('/api/test');
    expect(res).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('throws ApiError with normalized message on non-2xx response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: false, message: 'Resource not found' }),
    });

    await expect(apiFetch('/api/notfound')).rejects.toThrow(ApiError);
  });
});
