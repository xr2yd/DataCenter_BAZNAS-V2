import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
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
} from './repository.js';
import './bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDir = process.env.UPLOAD_DIR || './uploads';

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BAZNAS AI Agent API is running', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. PUBLIC PORTAL APIS
// ==========================================

// Public Application Submission with file uploads
app.post('/api/public/pengajuan', upload.any(), async (req, res) => {
  try {
    const result = await createPublicApplication(req.body, req.files || []);
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

// Export 60 Master Columns JSON
app.get('/api/mustahik/export/data', async (req, res) => {
  try {
    const data = await exportMustahikData();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all mustahik with query filter support
app.get('/api/mustahik', async (req, res) => {
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
  console.log(`BAZNAS Data Center V2 API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Telegram Bot polling active`);
  console.log(`====================================================`);
});
