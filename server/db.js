import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'baznas_demo.db');

export async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS mustahik (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_no TEXT UNIQUE,
      received_date TEXT,
      name TEXT,
      beneficiary_name TEXT,
      nik TEXT,
      kk_number TEXT,
      phone TEXT,
      marital_status TEXT,
      dob TEXT,
      address TEXT,
      rt_rw TEXT,
      kelurahan TEXT,
      kecamatan TEXT,
      kabupaten_kota TEXT,
      province TEXT,
      occupation TEXT,
      education_level TEXT,
      house_ownership TEXT,
      family_dependents INTEGER,
      monthly_income REAL,
      monthly_expense REAL,
      asnaf TEXT,
      program TEXT,
      request_title TEXT,
      status TEXT DEFAULT 'Diajukan',
      priority TEXT,
      recommended_amount REAL,
      approved_amount REAL,
      payment_method TEXT,
      bank_account TEXT,
      bank_name TEXT,
      bank_account_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustahik_id INTEGER,
      application_number TEXT,
      program TEXT,
      request_title TEXT,
      status TEXT DEFAULT 'Diajukan',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustahik_id INTEGER,
      application_id INTEGER,
      surveyor_name TEXT,
      surveyor_phone TEXT,
      survey_date TEXT,
      survey_method TEXT,
      narrative_family TEXT,
      narrative_income TEXT,
      narrative_request TEXT,
      narrative_conclusion TEXT,
      house_index INTEGER,
      asset_index INTEGER,
      income_index INTEGER,
      spiritual_score INTEGER,
      overall_score REAL,
      priority TEXT,
      recommendation TEXT,
      notes TEXT,
      photos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS mpzis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      form_number TEXT,
      mpzis_date TEXT,
      program_classification TEXT,
      purpose TEXT,
      asnaf TEXT,
      fund_source TEXT,
      recipient_name TEXT,
      recipient_type TEXT,
      beneficiary_count INTEGER,
      total_amount REAL,
      proposed_by TEXT,
      examined_by TEXT,
      ashnaf_verifier TEXT,
      responsible TEXT,
      approved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS ppd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      form_number TEXT,
      transaction_number TEXT,
      requester_name TEXT,
      requester_role TEXT,
      requester_department TEXT,
      amount REAL,
      amount_in_words TEXT,
      purpose TEXT,
      fund_source TEXT,
      bank_account_info TEXT,
      payment_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS bot_sessions (
      chat_id INTEGER PRIMARY KEY,
      state TEXT DEFAULT 'idle',
      temp_data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustahik_id INTEGER,
      doc_type TEXT,
      filename TEXT,
      original_name TEXT,
      file_url TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id)
    );
  `);

  await seedData(db);
  return db;
}

async function seedData(db) {
  const count = await db.get('SELECT COUNT(*) as total FROM mustahik');
  if (count.total > 0) return;

  await db.run(`
    INSERT INTO mustahik (file_no, received_date, name, beneficiary_name, nik, kk_number, phone, marital_status, dob, address, rt_rw, kelurahan, kecamatan, kabupaten_kota, province, occupation, education_level, house_ownership, family_dependents, monthly_income, monthly_expense, asnaf, program, request_title, status, priority, recommended_amount, approved_amount, payment_method, bank_account, bank_name, bank_account_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'MST-001', '2026-01-15', 'Yayasan Yatama Tangerang', 'Yayasan Yatama Tangerang', '3171234567890123', '3171234567890123', '081234567890', 'Lembaga', '', 'Jl. Keadilan No. 12', '001/002', 'Cibodasari', 'Cibodas', 'Kota Tangerang', 'Banten', 'Yayasan', '', 'Kontrak', 0, 0, 0, 'Miskin', 'Pendidikan', 'Bantuan biaya pendidikan anak yatim', 'Pengajuan Dana (FPD)', '2', 150000000, 150000000, 'Transfer', '1234567890', 'BCA', 'Yayasan Yatama Tangerang'
  ]);

  await db.run(`
    INSERT INTO applications (mustahik_id, application_number, program, request_title, status)
    VALUES (?, ?, ?, ?, ?)
  `, [1, 'APP-001', 'Pendidikan', 'Bantuan biaya pendidikan anak yatim', 'Pengajuan Dana (FPD)']);
}
