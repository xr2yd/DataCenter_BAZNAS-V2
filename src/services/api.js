const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchJson(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  listMustahik: () => fetchJson('/mustahik'),
  getMustahik: (id) => fetchJson(`/mustahik/${id}`),
  createMustahik: (data) => fetchJson('/mustahik', { method: 'POST', body: JSON.stringify(data) }),
  updateMustahik: (id, data) => fetchJson(`/mustahik/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMustahik: (id) => fetchJson(`/mustahik/${id}`, { method: 'DELETE' }),
  uploadDocument: (formData) => fetchJson('/upload', { method: 'POST', body: formData, headers: {} }),
  addDocument: (mustahikId, docData) => fetchJson(`/mustahik/${mustahikId}/documents`, { method: 'POST', body: JSON.stringify(docData) }),
};
