import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'task-2-integration-test-secret';
const uploadDir = mkdtempSync(path.join(tmpdir(), 'baznas-access-control-'));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = JWT_SECRET;
process.env.TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
process.env.UPLOAD_DIR = uploadDir;
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';

const { default: app, buildCorsOptions, memoryCache } = await import('./index.js');

let server;
let baseUrl;

before(async () => {
  app.locals.dataAccessRepository.trackApplication = async (query) => query === 'MST-202609-0001' ? {
    mustahik: {
      id: 81,
      name: 'Siti Aminah',
      file_no: 'MST-202609-0001',
      kecamatan: 'Karawaci',
      program: 'Tangerang Cerdas',
      status: 'Survey',
      received_date: '2026-09-01',
      nik: '3671000000000001',
      phone: '081200000001',
      bank_account: '0011223344',
    },
    status: 'Survey',
    is_rejected: false,
    rejection_reason: '',
    timeline: [{ phase: 1, name: 'Pendaftaran & Berkas', status: 'completed' }],
    applications: [{ id: 91 }],
    assessments: [{ id: 92, narrative_family: 'private' }],
    mpzis: [{ id: 93 }],
    ppd: [{ id: 94, bank_account_info: 'private' }],
    documents: [{ id: 95, file_url: '/uploads/private.pdf' }],
    wa_logs: [{ id: 96, message: 'private' }],
  } : null;
  app.locals.dataAccessRepository.createPublicApplication = async (_body, files) => ({
    id: 901,
    file_no: 'MST-TEST-0901',
    uploaded_files: files.length,
  });
  app.locals.dataAccessRepository.exportLaporanData = async (id, format) => ({
    report_id: id,
    format,
    total_records: 0,
    data: [],
  });
  app.locals.dataAccessRepository.appendActivityLog = async () => ({ id: 1 });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  rmSync(uploadDir, { recursive: true, force: true });
});

function tokenFor(role) {
  return jwt.sign({ id: `user-${role}`, name: `User ${role}`, role }, JWT_SECRET, { expiresIn: '5m' });
}

async function request(route, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${baseUrl}${route}`, { ...options, headers });
}

test('rejects an anonymous Mustahik PII export', async () => {
  const response = await request('/api/mustahik/export/data');
  assert.equal(response.status, 401);
});

test('does not serve a cached protected response before authentication', async () => {
  const route = '/api/mustahik?probe=cache-isolation';
  memoryCache.set(`req:${route}`, { success: true, data: [{ nik: 'PII-MUST-NOT-LEAK' }] }, 60);

  const response = await request(route);
  assert.equal(response.status, 401);
  assert.equal((await response.text()).includes('PII-MUST-NOT-LEAK'), false);
});

test('rejects surveyor access to a PPD mutation', async () => {
  const response = await request('/api/mustahik/1/ppd', {
    method: 'POST',
    token: tokenFor('surveyor'),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved_amount: 1_500_000 }),
  });
  assert.equal(response.status, 403);
});

test('allows an administrator to read cache diagnostics', async () => {
  const response = await request('/api/cache/stats', { token: tokenFor('admin') });
  assert.equal(response.status, 200);
});

test('keeps health public without exposing cache diagnostics', async () => {
  const response = await request('/api/health');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(Object.hasOwn(body, 'cache_stats'), false);
});

test('keeps public tracking reachable without a session', async () => {
  const response = await request('/api/public/lacak/MST-202609-0001');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: {
      mustahik: {
        name: 'Siti A.',
        file_no: 'MST-202609-0001',
        kecamatan: 'Karawaci',
        program: 'Tangerang Cerdas',
        status: 'Survey',
        received_date: '2026-09-01',
      },
      status: 'Survey',
      is_rejected: false,
      rejection_reason: '',
      timeline: [{ phase: 1, name: 'Pendaftaran & Berkas', status: 'completed' }],
    },
  });
});

test('rejects an underspecified public tracking query before repository access', async () => {
  const response = await request('/api/public/lacak/1');
  assert.equal(response.status, 422);
});

test('does not echo a missing tracking identifier in the response', async () => {
  const query = '3671000000000099';
  const response = await request(`/api/public/lacak/${query}`);
  assert.equal(response.status, 404);
  assert.equal((await response.text()).includes(query), false);
});

test('keeps a valid public application submission available without a session', async () => {
  const form = new FormData();
  form.set('ktp', new Blob(['%PDF-1.7'], { type: 'application/pdf' }), 'identity.pdf');

  const response = await request('/api/public/pengajuan', { method: 'POST', body: form });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.data.file_no, 'MST-TEST-0901');
  assert.equal(body.data.uploaded_files, 1);
});

test('rejects unsupported upload MIME types on the public application route', async () => {
  const form = new FormData();
  form.set('attachment', new Blob(['plain text'], { type: 'text/plain' }), 'evidence.txt');

  const response = await request('/api/public/pengajuan', { method: 'POST', body: form });
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), {
    success: false,
    message: 'Jenis file tidak didukung. Gunakan PDF, JPEG, atau PNG.',
  });
});

test('rejects an allowed MIME type when its filename extension does not match', async () => {
  const form = new FormData();
  form.set('attachment', new Blob(['not really a pdf'], { type: 'application/pdf' }), 'evidence.exe');

  const response = await request('/api/public/pengajuan', { method: 'POST', body: form });
  assert.equal(response.status, 422);
});

test('stores an allowed upload under a server-generated basename', async () => {
  const form = new FormData();
  form.set('file', new Blob(['%PDF-1.7'], { type: 'application/pdf' }), '../identity.pdf');

  const response = await request('/api/upload', {
    method: 'POST',
    token: tokenFor('surveyor'),
    body: form,
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.data.filename, /^[0-9a-f-]+\.pdf$/);
  assert.equal(body.data.filename.includes('..'), false);
  assert.equal(body.data.filename.includes('/'), false);
  assert.equal(body.data.filename.includes('\\'), false);
});

test('maps an upload larger than 10 MB to a concise 413 response', async () => {
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array((10 * 1024 * 1024) + 1)], { type: 'application/pdf' }), 'oversize.pdf');

  const response = await request('/api/upload', {
    method: 'POST',
    token: tokenFor('admin'),
    body: form,
  });
  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    success: false,
    message: 'Ukuran file melebihi batas 10 MB.',
  });
});

test('maps a disallowed browser origin to a concise 403 response', async () => {
  const response = await request('/api/health', {
    headers: { Origin: 'https://unexpected.example' },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    success: false,
    message: 'Origin tidak diizinkan',
  });
});

test('production CORS rejects browser origins when FRONTEND_URL is absent', async () => {
  const options = buildCorsOptions({ nodeEnv: 'production', frontendUrl: '' });
  const error = await new Promise((resolve) => {
    options.origin('https://unexpected.example', (originError) => resolve(originError));
  });
  assert.equal(error?.code, 'CORS_ORIGIN_DENIED');
});

test('production CORS accepts each configured origin without a wildcard', async () => {
  const options = buildCorsOptions({
    nodeEnv: 'production',
    frontendUrl: 'https://portal.example, https://admin.example',
  });

  for (const origin of ['https://portal.example', 'https://admin.example']) {
    const allowed = await new Promise((resolve, reject) => {
      options.origin(origin, (error, result) => error ? reject(error) : resolve(result));
    });
    assert.equal(allowed, true);
  }
  assert.equal(options.credentials, true);
});

test('denies a report export without a Bearer token and permits an Amil token', async () => {
  assert.equal((await request('/api/penyaluran/laporan/export/lap-1?format=json')).status, 401);
  assert.equal((await request('/api/penyaluran/laporan/export/lap-1?format=json', { token: tokenFor('penyaluran') })).status, 200);
});

test('returns 401 when the authentication token is invalid or expired', async () => {
  const response = await request('/api/cache/stats', { token: 'invalid.jwt.token' });
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.message.includes('login kembali'), true);
});
