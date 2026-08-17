import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { extractSurveyFromText, extractSurveyFromImage, normalizeStatus } from './ai.js';
import {
  getMustahikByFileNo,
  createMustahik,
  addAssessment,
  addMpzis,
  addPpd,
  getStatusByFileNo,
  getDb,
} from './repository.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const uploadDir = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const bot = new TelegramBot(token, { polling: true });

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `<b>Selamat datang di BAZNAS AI Agent Demo!</b>\n\n` +
      `Perintah yang tersedia:\n` +
      `<code>/survey</code> - input hasil survey teks\n` +
      `<code>/survey &lt;data&gt;</code> - input dengan key=value\n` +
      `Kirim foto form F-BPP/04 dengan caption <code>/survey no_berkas=XXX</code>\n` +
      `<code>/mpzis</code> - input data MPZIS\n` +
      `<code>/ppd</code> - input data PPD\n` +
      `<code>/status &lt;no_berkas&gt;</code> - cek status pengajuan\n` +
      `<code>/help</code> - bantuan`,
    { parse_mode: 'HTML' }
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `<b>Cara pakai BAZNAS AI Agent Demo</b>\n\n` +
      `<b>1. Input survey teks:</b>\n` +
      `<code>/survey\nno_berkas=MST-001\nnama=Ahmad Fauzi\nkecamatan=Karawaci\npendapatan=2500000\npengeluaran=3000000\nrekomendasi=Layak</code>\n\n` +
      `<b>2. Input survey foto:</b>\n` +
      `Kirim foto form F-BPP/04 dengan caption <code>/survey no_berkas=MST-001</code>\n\n` +
      `<b>3. Input MPZIS:</b>\n` +
      `<code>/mpzis no_berkas=MST-001 nominal=150000000 tujuan=Bantuan Pendidikan</code>\n\n` +
      `<b>4. Input PPD:</b>\n` +
      `<code>/ppd no_berkas=MST-001 nominal=150000000 tujuan=Pencairan Dana Pendidikan</code>\n\n` +
      `<b>5. Cek status:</b>\n` +
      `<code>/status MST-001</code>`,
    { parse_mode: 'HTML' }
  );
});

bot.onText(/\/survey(?:\s([\s\S]*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1] || '';

  if (!text.trim()) {
    bot.sendMessage(
      chatId,
      `Silakan kirim data survey dengan format:\n\n` +
        `<code>/survey\nno_berkas=MST-XXX\nnama=Nama Mustahik\nkecamatan=...\npendapatan=...\npengeluaran=...\nrekomendasi=Layak/Tidak/Dipertimbangkan</code>`,
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
    return;
  }

  await handleSurveyText(chatId, text, msg.message_id);
});

bot.onText(/\/mpzis(?:\s([\s\S]*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1] || '';

  if (!text.trim()) {
    bot.sendMessage(
      chatId,
      `Format: <code>/mpzis no_berkas=MST-XXX nominal=150000000 tujuan=... asnaf=... sumber_dana=...</code>`,
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
    return;
  }

  await handleMpzisText(chatId, text, msg.message_id);
});

bot.onText(/\/ppd(?:\s([\s\S]*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1] || '';

  if (!text.trim()) {
    bot.sendMessage(
      chatId,
      `Format: <code>/ppd no_berkas=MST-XXX nominal=150000000 tujuan=... rekening=... bank=...</code>`,
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
    return;
  }

  await handlePpdText(chatId, text, msg.message_id);
});

bot.onText(/\/status\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fileNo = match[1].trim();

  try {
    const data = await getStatusByFileNo(fileNo);
    if (!data) {
      bot.sendMessage(
        chatId,
        `Nomor berkas <code>${escapeHtml(fileNo)}</code> tidak ditemukan.`,
        { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
      );
      return;
    }

    bot.sendMessage(
      chatId,
      `<b>Status Pengajuan</b>\n\n` +
        `No Berkas: <code>${escapeHtml(data.file_no)}</code>\n` +
        `Nama: <b>${escapeHtml(data.name)}</b>\n` +
        `Program: ${escapeHtml(data.program || '-')}\n` +
        `Uraian: ${escapeHtml(data.request_title || '-')}\n` +
        `Status: <b>${escapeHtml(data.status)}</b>`,
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat cek status.', { reply_to_message_id: msg.message_id });
  }
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const caption = msg.caption || '';

  if (!caption.startsWith('/survey')) {
    bot.sendMessage(
      chatId,
      'Kirim foto dengan caption <code>/survey no_berkas=MST-XXX</code> untuk memproses form survey.',
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
    return;
  }

  try {
    const match = caption.match(/no_berkas\s*=\s*([^\s]+)/i);
    const fileNo = match ? match[1].trim() : null;

    bot.sendMessage(chatId, 'Sedang memproses foto dan membaca form...', { reply_to_message_id: msg.message_id });

    const photo = msg.photo[msg.photo.length - 1];
    const fileLink = await bot.getFileLink(photo.file_id);
    const response = await fetch(fileLink);
    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `survey_${Date.now()}_${photo.file_id}.jpg`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const extracted = await extractSurveyFromImage(filePath);

    if (!extracted || !extracted.name) {
      bot.sendMessage(
        chatId,
        'Maaf, tidak dapat membaca data dari foto. Coba kirim ulang dengan pencahayaan lebih baik atau gunakan input teks.',
        { reply_to_message_id: msg.message_id }
      );
      return;
    }

    if (fileNo) extracted.file_no = fileNo;

    const mustahikId = await upsertMustahikFromSurvey(extracted);
    await addAssessment(mustahikId, {
      ...extracted,
      photos: [filename],
      survey_method: 'On Location',
    });

    bot.sendMessage(
      chatId,
      `<b>Foto survey berhasil diproses!</b>\n\n` +
        `No Berkas: <code>${escapeHtml(extracted.file_no || '-')}</code>\n` +
        `Nama: <b>${escapeHtml(extracted.name)}</b>\n` +
        `Kecamatan: ${escapeHtml(extracted.kecamatan || '-')}\n` +
        `Program: ${escapeHtml(extracted.program || '-')}\n` +
        `Rekomendasi: ${escapeHtml(extracted.recommendation || '-')}\n` +
        `Prioritas: ${escapeHtml(extracted.priority || '-')}\n\n` +
        `Data sudah masuk ke web BAZNAS.`,
      { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
    );
  } catch (err) {
    console.error('Photo processing error:', err);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses foto: ' + escapeHtml(err.message), {
      reply_to_message_id: msg.message_id,
    });
  }
});

async function handleSurveyText(chatId, text, messageId) {
  try {
    bot.sendMessage(chatId, 'Sedang menganalisis data survey...', { reply_to_message_id: messageId });

    const extracted = await extractSurveyFromText(text);

    if (!extracted.name) {
      bot.sendMessage(
        chatId,
        'Tidak dapat menemukan nama mustahik dalam data. Pastikan format sudah benar.',
        { reply_to_message_id: messageId }
      );
      return;
    }

    const mustahikId = await upsertMustahikFromSurvey(extracted);
    await addAssessment(mustahikId, {
      ...extracted,
      survey_method: 'On Location',
    });

    bot.sendMessage(
      chatId,
      `<b>Data survey berhasil disimpan!</b>\n\n` +
        `No Berkas: <code>${escapeHtml(extracted.file_no || '-')}</code>\n` +
        `Nama: <b>${escapeHtml(extracted.name)}</b>\n` +
        `Kecamatan: ${escapeHtml(extracted.kecamatan || '-')}\n` +
        `Program: ${escapeHtml(extracted.program || '-')}\n` +
        `Rekomendasi: ${escapeHtml(extracted.recommendation || '-')}\n` +
        `Prioritas: ${escapeHtml(extracted.priority || '-')}\n` +
        `Status: <b>Survey</b>`,
      { parse_mode: 'HTML', reply_to_message_id: messageId }
    );
  } catch (err) {
    console.error('Survey text error:', err);
    bot.sendMessage(chatId, 'Terjadi kesalahan: ' + escapeHtml(err.message), { reply_to_message_id: messageId });
  }
}

async function handleMpzisText(chatId, text, messageId) {
  try {
    const parsed = fallbackParseLines(text);
    const fileNo = parsed.no_berkas || parsed.file_no;
    const mustahik = fileNo ? await getMustahikByFileNo(fileNo) : null;

    if (!mustahik) {
      bot.sendMessage(
        chatId,
        `Nomor berkas <code>${escapeHtml(fileNo || '-')}</code> tidak ditemukan. Buat dulu via /survey.`,
        { parse_mode: 'HTML', reply_to_message_id: messageId }
      );
      return;
    }

    const db = await getDb();
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahik.id);

    const nominal = parseFloat((parsed.nominal || parsed.total_amount || '0').replace(/[^0-9]/g, '')) || 0;

    await addMpzis({
      application_id: latestApp?.id,
      form_number: parsed.form_number || '',
      mpzis_date: parsed.tanggal || new Date().toISOString().split('T')[0],
      program_classification: parsed.klasifikasi || mustahik.program,
      purpose: parsed.tujuan || parsed.purpose || mustahik.request_title,
      asnaf: parsed.asnaf || mustahik.asnaf,
      fund_source: parsed.sumber_dana || 'Zakat',
      recipient_name: parsed.penerima || mustahik.name,
      recipient_type: parsed.tipe_penerima || 'Individu',
      beneficiary_count: parseInt((parsed.jumlah_penerima || '1').replace(/[^0-9]/g, ''), 10) || 1,
      total_amount: nominal,
      proposed_by: parsed.diajukan_oleh || '',
      examined_by: parsed.diperiksa_oleh || '',
      ashnaf_verifier: parsed.verifikator || '',
      responsible: parsed.penanggungjawab || '',
      approved_by: parsed.disetujui_oleh || '',
    });

    bot.sendMessage(
      chatId,
      `<b>Data MPZIS berhasil disimpan!</b>\n\n` +
        `No Berkas: <code>${escapeHtml(fileNo)}</code>\n` +
        `Penerima: <b>${escapeHtml(mustahik.name)}</b>\n` +
        `Nominal: <b>${formatRupiah(nominal)}</b>\n` +
        `Tujuan: ${escapeHtml(parsed.tujuan || mustahik.request_title || '-')}\n` +
        `Status: <b>Persetujuan MPZIS</b>`,
      { parse_mode: 'HTML', reply_to_message_id: messageId }
    );
  } catch (err) {
    console.error('MPZIS error:', err);
    bot.sendMessage(chatId, 'Terjadi kesalahan: ' + escapeHtml(err.message), { reply_to_message_id: messageId });
  }
}

async function handlePpdText(chatId, text, messageId) {
  try {
    const parsed = fallbackParseLines(text);
    const fileNo = parsed.no_berkas || parsed.file_no;
    const mustahik = fileNo ? await getMustahikByFileNo(fileNo) : null;

    if (!mustahik) {
      bot.sendMessage(
        chatId,
        `Nomor berkas <code>${escapeHtml(fileNo || '-')}</code> tidak ditemukan. Buat dulu via /survey.`,
        { parse_mode: 'HTML', reply_to_message_id: messageId }
      );
      return;
    }

    const db = await getDb();
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahik.id);

    const nominal = parseFloat((parsed.nominal || parsed.jumlah_dana || '0').replace(/[^0-9]/g, '')) || 0;

    await addPpd({
      application_id: latestApp?.id,
      form_number: parsed.form_number || '',
      transaction_number: parsed.no_transaksi || '',
      requester_name: parsed.pemohon || 'Staff BPP',
      requester_role: parsed.jabatan || 'Staff BPP',
      requester_department: parsed.bidang || 'Bidang Pendistribusian & Pendayagunaan',
      amount: nominal,
      amount_in_words: parsed.terbilang || '',
      purpose: parsed.tujuan || parsed.purpose || mustahik.request_title,
      fund_source: parsed.sumber_dana ? [parsed.sumber_dana] : ['Zakat'],
      bank_account_info: `${parsed.rekening || ''} ${parsed.bank || ''} ${parsed.atas_nama || ''}`.trim(),
      payment_type: parsed.jenis_pembayaran || 'Pembayaran',
    });

    bot.sendMessage(
      chatId,
      `<b>Data PPD berhasil disimpan!</b>\n\n` +
        `No Berkas: <code>${escapeHtml(fileNo)}</code>\n` +
        `Penerima: <b>${escapeHtml(mustahik.name)}</b>\n` +
        `Jumlah Dana: <b>${formatRupiah(nominal)}</b>\n` +
        `Tujuan: ${escapeHtml(parsed.tujuan || mustahik.request_title || '-')}\n` +
        `Status: <b>Pengajuan Dana (FPD)</b>`,
      { parse_mode: 'HTML', reply_to_message_id: messageId }
    );
  } catch (err) {
    console.error('PPD error:', err);
    bot.sendMessage(chatId, 'Terjadi kesalahan: ' + escapeHtml(err.message), { reply_to_message_id: messageId });
  }
}

async function upsertMustahikFromSurvey(data) {
  let mustahik = data.file_no ? await getMustahikByFileNo(data.file_no) : null;

  const status = normalizeStatus(data.status);

  const payload = {
    file_no: data.file_no || generateFileNo(),
    received_date: new Date().toISOString().split('T')[0],
    name: data.name,
    beneficiary_name: data.name,
    phone: data.phone || '',
    address: data.address || '',
    kecamatan: data.kecamatan || '',
    program: data.program || '',
    request_title: data.request_title || '',
    asnaf: data.asnaf || 'Miskin',
    monthly_income: data.monthly_income,
    monthly_expense: data.monthly_expense,
    family_dependents: data.family_dependents,
    house_ownership: data.house_ownership || '',
    status,
    priority: data.priority ? String(data.priority) : '',
    recommended_amount: null,
  };

  if (mustahik) {
    const { updateMustahik } = await import('./repository.js');
    await updateMustahik(mustahik.id, payload);
    return mustahik.id;
  }

  return createMustahik(payload);
}

function fallbackParseLines(text) {
  const result = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

function generateFileNo() {
  return `MST-${Date.now().toString().slice(-6)}`;
}

function formatRupiah(amount) {
  if (!amount && amount !== 0) return '-';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export default bot;
