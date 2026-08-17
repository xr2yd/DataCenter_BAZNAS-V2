import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'kimi-k2.6';

let ollamaClient = null;

export function getOllamaClient() {
  if (!ollamaClient) {
    const headers = OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {};
    ollamaClient = new Ollama({ host: OLLAMA_HOST, headers });
  }
  return ollamaClient;
}

export async function extractSurveyFromText(text) {
  const client = getOllamaClient();
  const prompt = `Kamu adalah asisten AI untuk BAZNAS. Ekstrak data hasil survey mustahik dari teks berikut dan kembalikan HANYA dalam format JSON valid tanpa penjelasan tambahan.

Teks input:
"""
${text}
"""

Schema JSON yang diinginkan:
{
  "file_no": "nomor berkas (opsional)",
  "name": "nama mustahik",
  "phone": "nomor hp",
  "address": "alamat lengkap",
  "kecamatan": "kecamatan",
  "program": "jenis bantuan/program",
  "request_title": "uraian singkat pengajuan",
  "asnaf": "golongan asnaf",
  "monthly_income": 0,
  "monthly_expense": 0,
  "family_dependents": 0,
  "house_ownership": "Menumpang/Kontrak/Keluarga/Sendiri",
  "recommendation": "Layak/Tidak/Dipertimbangkan",
  "priority": "1/2/3/Tidak Layak",
  "surveyor_name": "nama petugas survey",
  "surveyor_phone": "nomor hp petugas survey",
  "survey_date": "YYYY-MM-DD",
  "notes": "catatan tambahan"
}

Gunakan null atau string kosong untuk field yang tidak ditemukan. Pastikan JSON valid dan bisa diparse.`;

  try {
    const response = await client.chat({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: { temperature: 0.1 },
    });

    const content = response.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Ollama text extraction failed:', err.message);
    // Fallback: parse key=value lines
    return fallbackParseText(text);
  }
}

export async function extractSurveyFromImage(imagePath) {
  const client = getOllamaClient();
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const prompt = `Kamu adalah asisten AI untuk BAZNAS. Analisis gambar formulir hasil survey mustahik (F-BPP/04) dan ekstrak data yang ada. Kembalikan HANYA dalam format JSON valid tanpa penjelasan tambahan.

Schema JSON yang diinginkan:
{
  "file_no": "nomor berkas (opsional)",
  "name": "nama mustahik",
  "phone": "nomor hp",
  "address": "alamat lengkap",
  "kecamatan": "kecamatan",
  "program": "jenis bantuan/program",
  "request_title": "uraian singkat pengajuan",
  "asnaf": "golongan asnaf",
  "monthly_income": 0,
  "monthly_expense": 0,
  "family_dependents": 0,
  "house_ownership": "Menumpang/Kontrak/Keluarga/Sendiri",
  "recommendation": "Layak/Tidak/Dipertimbangkan",
  "priority": "1/2/3/Tidak Layak",
  "surveyor_name": "nama petugas survey",
  "surveyor_phone": "nomor hp petugas survey",
  "survey_date": "YYYY-MM-DD",
  "notes": "catatan tambahan"
}

Gunakan null atau string kosong untuk field yang tidak terbaca. Pastikan JSON valid.`;

  try {
    const response = await client.chat({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt, images: [base64Image] }],
      stream: false,
      options: { temperature: 0.1 },
    });

    const content = response.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM image response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Ollama image extraction failed:', err.message);
    return null;
  }
}

function fallbackParseText(text) {
  const result = {
    file_no: '',
    name: '',
    phone: '',
    address: '',
    kecamatan: '',
    program: '',
    request_title: '',
    asnaf: '',
    monthly_income: null,
    monthly_expense: null,
    family_dependents: null,
    house_ownership: '',
    recommendation: '',
    priority: '',
    surveyor_name: '',
    surveyor_phone: '',
    survey_date: '',
    notes: '',
  };

  const lines = text.split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (!key || rest.length === 0) continue;
    const value = rest.join('=').trim();
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');

    switch (normalizedKey) {
      case 'no_berkas':
      case 'file_no':
        result.file_no = value;
        break;
      case 'nama':
      case 'name':
        result.name = value;
        break;
      case 'hp':
      case 'phone':
      case 'no_hp':
      case 'telepon':
        result.phone = value;
        break;
      case 'alamat':
      case 'address':
        result.address = value;
        break;
      case 'kecamatan':
        result.kecamatan = value;
        break;
      case 'program':
      case 'jenis_bantuan':
      case 'bantuan':
        result.program = value;
        break;
      case 'uraian':
      case 'request_title':
      case 'pengajuan':
        result.request_title = value;
        break;
      case 'asnaf':
      case 'golongan':
        result.asnaf = value;
        break;
      case 'pendapatan':
      case 'monthly_income':
        result.monthly_income = parseFloat(value.replace(/[^0-9]/g, '')) || null;
        break;
      case 'pengeluaran':
      case 'monthly_expense':
        result.monthly_expense = parseFloat(value.replace(/[^0-9]/g, '')) || null;
        break;
      case 'tanggungan':
      case 'family_dependents':
      case 'jumlah_tanggungan':
        result.family_dependents = parseInt(value.replace(/[^0-9]/g, ''), 10) || null;
        break;
      case 'rumah':
      case 'house_ownership':
      case 'kepemilikan_rumah':
        result.house_ownership = value;
        break;
      case 'rekomendasi':
      case 'recommendation':
        result.recommendation = value;
        break;
      case 'prioritas':
      case 'priority':
        result.priority = value;
        break;
      case 'surveyor':
      case 'petugas':
      case 'surveyor_name':
        result.surveyor_name = value;
        break;
      case 'surveyor_phone':
      case 'hp_petugas':
        result.surveyor_phone = value;
        break;
      case 'tanggal_survey':
      case 'survey_date':
        result.survey_date = value;
        break;
      case 'catatan':
      case 'notes':
        result.notes = value;
        break;
    }
  }

  return result;
}

export function normalizeStatus(statusText) {
  const s = (statusText || '').toLowerCase();
  if (s.includes('tolak')) return 'Ditolak';
  if (s.includes('selesai') || s.includes('salur')) return 'Penyaluran Selesai';
  if (s.includes('fpd') || s.includes('ppd') || s.includes('dana') || s.includes('cair')) return 'Pengajuan Dana (FPD)';
  if (s.includes('mpzis') || s.includes('setuju') || s.includes('persetujuan')) return 'Persetujuan MPZIS';
  if (s.includes('survey')) return 'Survey';
  if (s.includes('verifikasi') || s.includes('administrasi')) return 'Verifikasi Administrasi';
  return 'Diajukan';
}
