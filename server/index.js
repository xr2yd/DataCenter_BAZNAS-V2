import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { initDb } from './db.js';
import {
  listMustahik,
  getMustahikById,
  createMustahik,
  updateMustahik,
  deleteMustahik,
  addAssessment,
  addMpzis,
  addPpd,
  addDocument,
  getDocuments,
  createPublicApplication,
  trackApplication,
  generateWaMessage,
  addWaLog,
  getWaLogs,
  exportMustahikData,
  getMustahikStats,
  getDataOverview,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserLastLogin,
  createUser,
  getPenyaluranOverview,
  getPenyaluranByKecamatan,
  listPenyaluranTransactions,
  getPilarPrograms,
  addPilarInitiative,
  updatePilarInitiative,
  deletePilarInitiative,
  getMustahikStageCounts,
  submitMustahikDecision,
  importMustahikBatch,
  getActivityLogs,
  getLaporanList,
  generateLaporan,
  exportLaporanData,
} from './repository.js';
import { generateExcelReport, generatePdfReport } from './report_generator.js';
import './bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// ==========================================
// IN-MEMORY HIGH PERFORMANCE CACHE ENGINE
// ==========================================
class MemoryCache {
  constructor(defaultTtlSeconds = 60) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0
    };

    // Garbage collect expired keys every 60 seconds
    const interval = setInterval(() => this.cleanup(), 60000);
    if (interval.unref) interval.unref();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data;
  }

  set(key, data, ttlSeconds = null) {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
    this.stats.sets++;
  }

  del(key) {
    return this.cache.delete(key);
  }

  delPattern(pattern) {
    let count = 0;
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear() {
    this.cache.clear();
    this.stats.clears++;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) + '%' : '0%';
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatio,
      sets: this.stats.sets,
      clears: this.stats.clears,
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
    };
  }
}

export const memoryCache = new MemoryCache(60);

/**
 * Middleware for caching JSON responses in memory with TTL
 */
export function cacheMiddleware(ttlSeconds = 60) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `req:${req.originalUrl || req.url}`;
    const cached = memoryCache.get(key);

    if (cached !== null) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
      return res.json(cached);
    }

    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(key, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache helper called whenever database data mutations occur
 */
export function invalidateCache(patterns = ['req:/api/mustahik*', 'req:/api/data*', 'req:/api/penyaluran*', 'req:/api/activity*']) {
  patterns.forEach(p => memoryCache.delPattern(p));
}

// ==========================================
// MIDDLEWARES (Compression, CORS, Parsing)
// ==========================================

// 1. Response-Time Tracker Header
app.use((req, res, next) => {
  const start = process.hrtime();
  const originalSend = res.send.bind(res);
  res.send = function (body) {
    if (!res.headersSent) {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      res.setHeader('X-Response-Time', `${timeMs}ms`);
    }
    return originalSend(body);
  };
  next();
});

// 2. Gzip / Deflate Response Compression Middleware
app.use(compression({
  level: 6,
  threshold: 512, // Compress any response payload >= 512 bytes
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max per file
});

// ==========================================
// HEALTH & CACHE DIAGNOSTIC APIS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BAZNAS AI Agent API is running with PostgreSQL Turbo Engine & Compression',
    timestamp: new Date().toISOString(),
    compression: 'active (gzip/deflate)',
    cache_stats: memoryCache.getStats()
  });
});

// Cache Stats & Telemetry
app.get('/api/cache/stats', (req, res) => {
  res.json({
    success: true,
    data: memoryCache.getStats()
  });
});

// Cache Flush
app.post('/api/cache/clear', (req, res) => {
  memoryCache.clear();
  res.json({
    success: true,
    message: 'In-memory cache flushed successfully',
    stats: memoryCache.getStats()
  });
});

// ==========================================
// AUTHENTICATION & MULTI-ROLE ACCESS CONTROL
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'baznas_tangkot_super_secret_jwt_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token otentikasi tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Sesi berakhir atau token tidak valid. Silakan login kembali.' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terotentikasi' });
    }
    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Akses dibatasi. Fitur ini memerlukan hak akses divisi: ${allowedRoles.join(', ')}`
    });
  };
}

// 1. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok' });
    }

    // Update last login
    await updateUserLastLogin(user.id);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      division: user.division,
      avatar: user.avatar
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: `Selamat datang, ${user.name}`,
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat proses login' });
  }
});

// 2. Current User Profile Verification (Me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        division: user.division,
        avatar: user.avatar,
        last_login: user.last_login
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Berhasil keluar dari sistem' });
});

// 4. User Management (Admin Only)
app.get('/api/auth/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// HIGH-SPEED AGGREGATE STATS APIS (<5ms via Cache)
// ==========================================

// Mustahik Aggregate Stats (KPI cards, charts, breakdowns)
app.get('/api/mustahik/stats', cacheMiddleware(60), async (req, res) => {
  try {
    const data = await getMustahikStats();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enterprise Data Overview (All entities summary)
app.get('/api/data/overview', cacheMiddleware(60), async (req, res) => {
  try {
    const data = await getDataOverview();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// PENYALURAN DOMAIN APIS
// ==========================================

// Penyaluran Overview & Dashboard Data (Period-aware)
app.get('/api/penyaluran/overview', cacheMiddleware(30), async (req, res) => {
  try {
    const data = await getPenyaluranOverview(req.query.period || '30d');
    res.json({ success: true, data });
  } catch (err) {
    console.error('Penyaluran overview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Penyaluran By 13 Kecamatan Kota Tangerang (Geospatial)
app.get('/api/penyaluran/by-kecamatan', cacheMiddleware(30), async (req, res) => {
  try {
    const data = await getPenyaluranByKecamatan();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Penyaluran by kecamatan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Read-only Penyaluran transaction journal from PPD records
app.get('/api/penyaluran/transaksi', cacheMiddleware(15), async (req, res) => {
  try {
    const data = await listPenyaluranTransactions({
      status: req.query.status,
      program: req.query.program,
      kecamatan: req.query.kecamatan,
      search: req.query.search,
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Transaction journal error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5 Pilar Programs & Initiatives
app.get('/api/penyaluran/program', cacheMiddleware(30), async (req, res) => {
  try {
    const data = await getPilarPrograms();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Pilar programs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Pilar Initiative
app.post('/api/penyaluran/program/initiatives', async (req, res) => {
  try {
    const id = await addPilarInitiative(req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id }, message: 'Inisiatif program berhasil ditambahkan' });
  } catch (err) {
    console.error('Add initiative error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Pilar Initiative
app.put('/api/penyaluran/program/initiatives/:id', async (req, res) => {
  try {
    const ok = await updatePilarInitiative(req.params.id, req.body);
    if (!ok) return res.status(404).json({ success: false, message: 'Inisiatif tidak ditemukan' });
    invalidateCache();
    res.json({ success: true, message: 'Inisiatif program berhasil diperbarui' });
  } catch (err) {
    console.error('Update initiative error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Pilar Initiative
app.delete('/api/penyaluran/program/initiatives/:id', async (req, res) => {
  try {
    await deletePilarInitiative(req.params.id);
    invalidateCache();
    res.json({ success: true, message: 'Inisiatif program berhasil dihapus' });
  } catch (err) {
    console.error('Delete initiative error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mustahik Stage Counts
app.get('/api/mustahik/stages/count', cacheMiddleware(15), async (req, res) => {
  try {
    const data = await getMustahikStageCounts();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Stage counts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit Mustahik Decision (Advance workflow / Reject)
app.post('/api/mustahik/:id/decision', async (req, res) => {
  try {
    const result = await submitMustahikDecision(req.params.id, req.body);
    invalidateCache();
    res.json(result);
  } catch (err) {
    console.error('Decision error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Batch Import Mustahik
app.post('/api/mustahik/import', async (req, res) => {
  try {
    const items = req.body.items || (Array.isArray(req.body) ? req.body : []);
    const result = await importMustahikBatch(items);
    invalidateCache();
    res.json(result);
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Laporan Penyaluran Catalog & Insights
app.get('/api/penyaluran/laporan', cacheMiddleware(30), async (req, res) => {
  try {
    const data = await getLaporanList(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Laporan list error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate New Laporan
app.post('/api/penyaluran/laporan/generate', async (req, res) => {
  try {
    const result = await generateLaporan(req.body);
    invalidateCache();
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Generate laporan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export Laporan Data (Excel .xlsx, PDF .pdf, CSV, or JSON)
app.get('/api/penyaluran/laporan/export/:id', async (req, res) => {
  try {
    const format = (req.query.format || 'xlsx').toLowerCase();
    const db = await (await import('./db.js')).getDb();
    const mustahikList = await db.all('SELECT * FROM mustahik ORDER BY id ASC');

    const reportMeta = {
      id: req.params.id,
      title: req.query.title || `Laporan Penyaluran ${req.params.id.toUpperCase()}`,
      category: req.query.category || 'Ringkasan',
      period: req.query.period || 'Agustus 2026',
      scope: req.query.scope || '13 Kecamatan Kota Tangerang'
    };

    if (format === 'excel' || format === 'xlsx') {
      const excelBuffer = await generateExcelReport(reportMeta, mustahikList);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Laporan-Penyaluran-BAZNAS-${req.params.id}.xlsx"`);
      return res.send(excelBuffer);
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePdfReport(reportMeta, mustahikList);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Laporan-Penyaluran-BAZNAS-${req.params.id}.pdf"`);
      return res.send(pdfBuffer);
    }

    if (format === 'json') {
      const reportData = await exportLaporanData(req.params.id, 'json');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="laporan-${req.params.id}.json"`);
      return res.json(reportData);
    }

    // Default CSV
    const csvContent = await exportLaporanData(req.params.id, 'csv');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-${req.params.id}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Export laporan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Activity Logs
app.get('/api/activity-logs', cacheMiddleware(15), async (req, res) => {
  try {
    const data = await getActivityLogs(req.query.mustahik_id, parseInt(req.query.limit || '20', 10));
    res.json({ success: true, data });
  } catch (err) {
    console.error('Activity logs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 1. PUBLIC PORTAL APIS
// ==========================================

// Public Application Submission with file uploads
app.post('/api/public/pengajuan', upload.any(), async (req, res) => {
  try {
    const result = await createPublicApplication(req.body, req.files || []);
    invalidateCache();
    res.status(201).json({
      success: true,
      data: result,
      message: 'Pengajuan permohonan bantuan berhasil dikirim.'
    });
  } catch (err) {
    console.error('Public application error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public Tracking by file_no, NIK, or phone
app.get('/api/public/lacak/:query', async (req, res) => {
  try {
    const data = await trackApplication(req.params.query);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Pengajuan dengan kata kunci "${req.params.query}" tidak ditemukan.`
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. MUSTAHIK ADMIN & MANAGEMENT APIS
// ==========================================

// Export 60 Master Columns JSON (Cached for high throughput)
app.get('/api/mustahik/export/data', cacheMiddleware(60), async (req, res) => {
  try {
    const data = await exportMustahikData();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all mustahik with query filter support (Cached per query)
app.get('/api/mustahik', cacheMiddleware(30), async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      program: req.query.program,
      search: req.query.search
    };
    const data = await listMustahik(filters);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('List mustahik error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Detail Mustahik (with relations)
app.get('/api/mustahik/:id', async (req, res) => {
  try {
    const data = await getMustahikById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Mustahik tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get mustahik error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Mustahik
app.post('/api/mustahik', async (req, res) => {
  try {
    const id = await createMustahik(req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id }, message: 'Data mustahik berhasil ditambahkan' });
  } catch (err) {
    console.error('Create mustahik error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Mustahik
app.put('/api/mustahik/:id', async (req, res) => {
  try {
    const ok = await updateMustahik(req.params.id, req.body);
    if (!ok) return res.status(404).json({ success: false, message: 'Mustahik tidak ditemukan atau tidak ada perubahan' });
    invalidateCache();
    res.json({ success: true, message: 'Data mustahik berhasil diperbarui' });
  } catch (err) {
    console.error('Update mustahik error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Mustahik
app.delete('/api/mustahik/:id', async (req, res) => {
  try {
    await deleteMustahik(req.params.id);
    invalidateCache();
    res.json({ success: true, message: 'Data mustahik berhasil dihapus secara permanen' });
  } catch (err) {
    console.error('Delete mustahik error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. ASSESSMENT, MPZIS, PPD, WA APIS
// ==========================================

// Add Assessment (F-BPP/04)
const handleAssessment = async (req, res) => {
  try {
    const assessmentId = await addAssessment(req.params.id, req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id: assessmentId }, message: 'Data assessment survey berhasil disimpan' });
  } catch (err) {
    console.error('Add assessment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
app.post('/api/mustahik/:id/assessment', handleAssessment);
app.post('/api/mustahik/:id/assessments', handleAssessment);

// Add MPZIS (F-BPP/06)
app.post('/api/mustahik/:id/mpzis', async (req, res) => {
  try {
    const mpzisId = await addMpzis(req.params.id, req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id: mpzisId }, message: 'Data persetujuan MPZIS berhasil disimpan' });
  } catch (err) {
    console.error('Add MPZIS error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add PPD (F-PKP/03)
app.post('/api/mustahik/:id/ppd', async (req, res) => {
  try {
    const ppdId = await addPpd(req.params.id, req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id: ppdId }, message: 'Data pengajuan dana (PPD/FPD) berhasil disimpan' });
  } catch (err) {
    console.error('Add PPD error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger WhatsApp Notification (5 Phases)
app.post('/api/mustahik/:id/whatsapp', async (req, res) => {
  try {
    const mustahik = await getMustahikById(req.params.id);
    if (!mustahik) {
      return res.status(404).json({ success: false, message: 'Mustahik tidak ditemukan' });
    }

    const phase = req.body.phase || mustahik.status || 'Diajukan';
    const waInfo = generateWaMessage(phase, mustahik);

    if (req.body.custom_message) {
      waInfo.message = req.body.custom_message;
      const phone = waInfo.phone;
      const encoded = encodeURIComponent(req.body.custom_message);
      waInfo.url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    }

    const logId = await addWaLog({
      mustahik_id: mustahik.id,
      phone: waInfo.phone || mustahik.phone,
      phase,
      message: waInfo.message,
      wa_url: waInfo.url,
      status: 'sent'
    });

    invalidateCache();

    res.json({
      success: true,
      data: {
        log_id: logId,
        phone: waInfo.phone,
        phase,
        message: waInfo.message,
        wa_url: waInfo.url
      },
      message: 'Notifikasi WhatsApp berhasil digenerate'
    });
  } catch (err) {
    console.error('WhatsApp notify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get WhatsApp Logs
app.get('/api/mustahik/:id/whatsapp', async (req, res) => {
  try {
    const logs = await getWaLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. DOCUMENTS & GENERAL UPLOADS
// ==========================================

// General Single File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: `/uploads/${req.file.filename}`
    }
  });
});

// Add Mustahik Document
app.post('/api/mustahik/:id/documents', async (req, res) => {
  try {
    const docId = await addDocument(req.params.id, req.body);
    invalidateCache();
    res.status(201).json({ success: true, data: { id: docId }, message: 'Dokumen berhasil disimpan' });
  } catch (err) {
    console.error('Add document error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// List Mustahik Documents
app.get('/api/mustahik/:id/documents', async (req, res) => {
  try {
    const docs = await getDocuments(req.params.id);
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Initialize DB and start Express server
await initDb();

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ BAZNAS Data Center V2 API Turbo Server on port ${PORT}`);
  console.log(`🚀 Compression: Gzip/Deflate enabled`);
  console.log(`⚡ In-Memory Cache: Active (TTL 60s)`);
  console.log(`📊 Aggregates: /api/mustahik/stats & /api/data/overview (<5ms)`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
