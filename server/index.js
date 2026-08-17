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
} from './repository.js';
import './bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDir = process.env.UPLOAD_DIR || './uploads';

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
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

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BAZNAS AI Agent API is running' });
});

// Mustahik CRUD
app.get('/api/mustahik', async (req, res) => {
  try {
    const data = await listMustahik();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mustahik/:id', async (req, res) => {
  try {
    const data = await getMustahikById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Mustahik not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/mustahik', async (req, res) => {
  try {
    const id = await createMustahik(req.body);
    res.status(201).json({ success: true, data: { id }, message: 'Mustahik created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/mustahik/:id', async (req, res) => {
  try {
    const ok = await updateMustahik(req.params.id, req.body);
    if (!ok) return res.status(404).json({ success: false, message: 'Mustahik not found' });
    res.json({ success: true, message: 'Mustahik updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/mustahik/:id', async (req, res) => {
  try {
    await deleteMustahik(req.params.id);
    res.json({ success: true, message: 'Mustahik deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Assessments
app.post('/api/mustahik/:id/assessments', async (req, res) => {
  try {
    const assessmentId = await addAssessment(req.params.id, req.body);
    res.status(201).json({ success: true, data: { id: assessmentId }, message: 'Assessment added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// MPZIS
app.post('/api/mustahik/:id/mpzis', async (req, res) => {
  try {
    const mpzisId = await addMpzis(req.body);
    res.status(201).json({ success: true, data: { id: mpzisId }, message: 'MPZIS added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PPD
app.post('/api/mustahik/:id/ppd', async (req, res) => {
  try {
    const ppdId = await addPpd(req.body);
    res.status(201).json({ success: true, data: { id: ppdId }, message: 'PPD added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, data: { filename: req.file.filename, url: `/uploads/${req.file.filename}` } });
});

// Documents
app.post('/api/mustahik/:id/documents', async (req, res) => {
  try {
    const docId = await addDocument(req.params.id, req.body);
    res.status(201).json({ success: true, data: { id: docId }, message: 'Document added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mustahik/:id/documents', async (req, res) => {
  try {
    const docs = await getDocuments(req.params.id);
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Initialize DB then start server
await initDb();

app.listen(PORT, () => {
  console.log(`BAZNAS AI Agent API listening on http://localhost:${PORT}`);
  console.log(`Telegram bot polling started`);
});
