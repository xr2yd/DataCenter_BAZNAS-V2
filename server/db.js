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

// Complete 60 columns master schema definition for mustahik
export const MUSTAHIK_COLUMNS = [
  { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
  { name: 'file_no', type: 'TEXT UNIQUE' },
  { name: 'received_date', type: 'TEXT' },
  { name: 'name', type: 'TEXT' },
  { name: 'applicant_status', type: "TEXT DEFAULT 'Perorangan'" },
  { name: 'beneficiary_name', type: 'TEXT' },
  { name: 'nik', type: 'TEXT' },
  { name: 'kk_number', type: 'TEXT' },
  { name: 'phone', type: 'TEXT' },
  { name: 'marital_status', type: 'TEXT' },
  { name: 'pob', type: 'TEXT' },
  { name: 'dob', type: 'TEXT' },
  { name: 'occupation', type: 'TEXT' },
  { name: 'work_place', type: 'TEXT' },
  { name: 'education_level', type: 'TEXT' },
  { name: 'address', type: 'TEXT' },
  { name: 'rt_rw', type: 'TEXT' },
  { name: 'kelurahan', type: 'TEXT' },
  { name: 'kecamatan', type: 'TEXT' },
  { name: 'kabupaten_kota', type: "TEXT DEFAULT 'Kota Tangerang'" },
  { name: 'province', type: "TEXT DEFAULT 'Banten'" },
  { name: 'survey_date', type: 'TEXT' },
  { name: 'surveyor_name', type: 'TEXT' },
  { name: 'surveyor_phone', type: 'TEXT' },
  { name: 'house_ownership', type: 'TEXT' },
  { name: 'family_dependents', type: 'INTEGER DEFAULT 0' },
  { name: 'monthly_income', type: 'REAL DEFAULT 0' },
  { name: 'monthly_expense', type: 'REAL DEFAULT 0' },
  { name: 'remaining_income', type: 'REAL DEFAULT 0' },
  { name: 'survey_recommendation', type: 'TEXT' },
  { name: 'survey_notes', type: 'TEXT' },
  { name: 'application_count', type: 'INTEGER DEFAULT 1' },
  { name: 'beneficiary_count', type: 'INTEGER DEFAULT 1' },
  { name: 'priority', type: 'TEXT' },
  { name: 'recommended_amount', type: 'REAL DEFAULT 0' },
  { name: 'approved_amount', type: 'REAL DEFAULT 0' },
  { name: 'mpzis_date', type: 'TEXT' },
  { name: 'ppd_number', type: 'TEXT' },
  { name: 'disbursement_date', type: 'TEXT' },
  { name: 'payment_method', type: 'TEXT' },
  { name: 'bank_account', type: 'TEXT' },
  { name: 'bank_name', type: 'TEXT' },
  { name: 'bank_account_name', type: 'TEXT' },
  { name: 'asnaf', type: "TEXT DEFAULT 'Fakir Miskin'" },
  { name: 'fund_source', type: "TEXT DEFAULT 'Zakat'" },
  { name: 'distribution_purpose', type: 'TEXT' },
  { name: 'parent_occupation', type: 'TEXT' },
  { name: 'desil_score', type: 'INTEGER' },
  { name: 'program', type: 'TEXT' },
  { name: 'request_title', type: 'TEXT' },
  { name: 'status', type: "TEXT DEFAULT 'Diajukan'" },
  { name: 'rejection_reason', type: 'TEXT' },
  { name: 'house_index', type: 'INTEGER' },
  { name: 'asset_index', type: 'INTEGER' },
  { name: 'income_index', type: 'INTEGER' },
  { name: 'spiritual_score', type: 'INTEGER' },
  { name: 'overall_score', type: 'REAL' },
  { name: 'notes', type: 'TEXT' },
  { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
  { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
];

export async function initDb() {
  const db = await getDb();

  // Create tables if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mustahik (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_no TEXT UNIQUE,
      received_date TEXT,
      name TEXT,
      applicant_status TEXT DEFAULT 'Perorangan',
      beneficiary_name TEXT,
      nik TEXT,
      kk_number TEXT,
      phone TEXT,
      marital_status TEXT,
      pob TEXT,
      dob TEXT,
      occupation TEXT,
      work_place TEXT,
      education_level TEXT,
      address TEXT,
      rt_rw TEXT,
      kelurahan TEXT,
      kecamatan TEXT,
      kabupaten_kota TEXT DEFAULT 'Kota Tangerang',
      province TEXT DEFAULT 'Banten',
      survey_date TEXT,
      surveyor_name TEXT,
      surveyor_phone TEXT,
      house_ownership TEXT,
      family_dependents INTEGER DEFAULT 0,
      monthly_income REAL DEFAULT 0,
      monthly_expense REAL DEFAULT 0,
      remaining_income REAL DEFAULT 0,
      survey_recommendation TEXT,
      survey_notes TEXT,
      application_count INTEGER DEFAULT 1,
      beneficiary_count INTEGER DEFAULT 1,
      priority TEXT,
      recommended_amount REAL DEFAULT 0,
      approved_amount REAL DEFAULT 0,
      mpzis_date TEXT,
      ppd_number TEXT,
      disbursement_date TEXT,
      payment_method TEXT,
      bank_account TEXT,
      bank_name TEXT,
      bank_account_name TEXT,
      asnaf TEXT DEFAULT 'Fakir Miskin',
      fund_source TEXT DEFAULT 'Zakat',
      distribution_purpose TEXT,
      parent_occupation TEXT,
      desil_score INTEGER,
      program TEXT,
      request_title TEXT,
      status TEXT DEFAULT 'Diajukan',
      rejection_reason TEXT,
      house_index INTEGER,
      asset_index INTEGER,
      income_index INTEGER,
      spiritual_score INTEGER,
      overall_score REAL,
      notes TEXT,
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
      notes TEXT,
      rejection_reason TEXT,
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
      mustahik_id INTEGER,
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
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );

    CREATE TABLE IF NOT EXISTS ppd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustahik_id INTEGER,
      application_id INTEGER,
      form_number TEXT,
      ppd_number TEXT,
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
      disbursement_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
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

    CREATE TABLE IF NOT EXISTS wa_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustahik_id INTEGER,
      phone TEXT,
      phase TEXT,
      message TEXT,
      wa_url TEXT,
      status TEXT DEFAULT 'sent',
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mustahik_id) REFERENCES mustahik(id)
    );

    CREATE TABLE IF NOT EXISTS bot_sessions (
      chat_id INTEGER PRIMARY KEY,
      state TEXT DEFAULT 'idle',
      temp_data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Run schema migration for existing sqlite db
  await migrateColumns(db);

  await seedData(db);
  return db;
}

async function migrateColumns(db) {
  try {
    const existingCols = await db.all("PRAGMA table_info(mustahik)");
    const existingColNames = new Set(existingCols.map(c => c.name));

    for (const col of MUSTAHIK_COLUMNS) {
      if (!existingColNames.has(col.name) && col.name !== 'id') {
        const colDef = col.type.replace('PRIMARY KEY AUTOINCREMENT', '').replace('UNIQUE', '');
        await db.exec(`ALTER TABLE mustahik ADD COLUMN ${col.name} ${colDef}`);
      }
    }

    // Check mpzis mustahik_id
    const mpzisCols = await db.all("PRAGMA table_info(mpzis)");
    const mpzisColNames = new Set(mpzisCols.map(c => c.name));
    if (!mpzisColNames.has('mustahik_id')) {
      await db.exec(`ALTER TABLE mpzis ADD COLUMN mustahik_id INTEGER`);
    }

    // Check ppd mustahik_id & ppd_number & disbursement_date
    const ppdCols = await db.all("PRAGMA table_info(ppd)");
    const ppdColNames = new Set(ppdCols.map(c => c.name));
    if (!ppdColNames.has('mustahik_id')) {
      await db.exec(`ALTER TABLE ppd ADD COLUMN mustahik_id INTEGER`);
    }
    if (!ppdColNames.has('ppd_number')) {
      await db.exec(`ALTER TABLE ppd ADD COLUMN ppd_number TEXT`);
    }
    if (!ppdColNames.has('disbursement_date')) {
      await db.exec(`ALTER TABLE ppd ADD COLUMN disbursement_date TEXT`);
    }
  } catch (err) {
    console.error('Migration warning (non-fatal):', err.message);
  }
}

async function seedData(db) {
  const count = await db.get('SELECT COUNT(*) as total FROM mustahik');
  if (count.total > 0) return;

  const initialMustahik = [
    {
      file_no: 'MST-202608-0001',
      received_date: '2026-08-01',
      name: 'Yayasan Yatama Tangerang',
      applicant_status: 'Lembaga',
      beneficiary_name: 'Yayasan Yatama Tangerang',
      nik: '3671012345670001',
      kk_number: '3671012345670001',
      phone: '081234567890',
      marital_status: 'Lembaga',
      pob: 'Tangerang',
      dob: '2015-05-10',
      occupation: 'Pengurus Yayasan',
      work_place: 'Yayasan Yatama',
      education_level: 'S1',
      address: 'Jl. Keadilan No. 12 RT 001/002',
      rt_rw: '001/002',
      kelurahan: 'Cibodasari',
      kecamatan: 'Cibodas',
      kabupaten_kota: 'Kota Tangerang',
      province: 'Banten',
      survey_date: '2026-08-05',
      surveyor_name: 'H. Ahmad Subarkah',
      surveyor_phone: '081398765432',
      house_ownership: 'Kontrak',
      family_dependents: 45,
      monthly_income: 15000000,
      monthly_expense: 28000000,
      remaining_income: -13000000,
      survey_recommendation: 'Layak',
      survey_notes: 'Lembaga aktif membina 45 anak yatim dhuafa, membutuhkan dukungan biaya SPP semester gasal.',
      application_count: 1,
      beneficiary_count: 45,
      priority: '1',
      recommended_amount: 15000000,
      approved_amount: 15000000,
      mpzis_date: '2026-08-10',
      ppd_number: 'PPD/202608/001',
      disbursement_date: '',
      payment_method: 'Transfer',
      bank_account: '1234567890',
      bank_name: 'BCA',
      bank_account_name: 'Yayasan Yatama Tangerang',
      asnaf: 'Fakir Miskin',
      fund_source: 'Zakat',
      distribution_purpose: 'Bantuan biaya pendidikan semester gasal 45 santri yatim dhuafa',
      parent_occupation: '-',
      desil_score: 2,
      program: 'Pendidikan',
      request_title: 'Bantuan biaya pendidikan santri yatim dhuafa',
      status: 'Pengajuan Dana (FPD)',
      rejection_reason: '',
      house_index: 3,
      asset_index: 3,
      income_index: 2,
      spiritual_score: 90,
      overall_score: 88.5,
      notes: 'Disetujui dalam rapat pleno MPZIS'
    },
    {
      file_no: 'MST-202608-0002',
      received_date: '2026-08-03',
      name: 'Siti Aminah',
      applicant_status: 'Perorangan',
      beneficiary_name: 'Siti Aminah',
      nik: '3671025508820003',
      kk_number: '3671025508820001',
      phone: '085712345678',
      marital_status: 'Janda',
      pob: 'Tangerang',
      dob: '1982-08-15',
      occupation: 'Buruh Cuci',
      work_place: 'Rumah Tangga',
      education_level: 'SMP',
      address: 'Jl. Merak No. 45 RT 003/005',
      rt_rw: '003/005',
      kelurahan: 'Sukasari',
      kecamatan: 'Tangerang',
      kabupaten_kota: 'Kota Tangerang',
      province: 'Banten',
      survey_date: '2026-08-08',
      surveyor_name: 'Bambang Irawan',
      surveyor_phone: '081287654321',
      house_ownership: 'Menumpang',
      family_dependents: 3,
      monthly_income: 1200000,
      monthly_expense: 1900000,
      remaining_income: -700000,
      survey_recommendation: 'Layak',
      survey_notes: 'Janda dengan 3 anak sekolah, membutuhkan bantuan modal usaha warung kecil.',
      application_count: 1,
      beneficiary_count: 4,
      priority: '1',
      recommended_amount: 3500000,
      approved_amount: 3500000,
      mpzis_date: '2026-08-12',
      ppd_number: 'PPD/202608/002',
      disbursement_date: '2026-08-15',
      payment_method: 'Transfer',
      bank_account: '9876543210',
      bank_name: 'BRI',
      bank_account_name: 'Siti Aminah',
      asnaf: 'Fakir Miskin',
      fund_source: 'Zakat',
      distribution_purpose: 'Bantuan modal usaha mikro warung jajanan anak',
      parent_occupation: 'Pedagang Keliling',
      desil_score: 1,
      program: 'Ekonomi',
      request_title: 'Bantuan modal usaha mikro dhuafa',
      status: 'Penyaluran Selesai',
      rejection_reason: '',
      house_index: 2,
      asset_index: 1,
      income_index: 1,
      spiritual_score: 85,
      overall_score: 92.0,
      notes: 'Dana telah disalurkan via transfer BRI'
    }
  ];

  for (const m of initialMustahik) {
    const keys = Object.keys(m);
    const placeholders = keys.map(() => '?').join(',');
    const values = keys.map(k => m[k]);

    const res = await db.run(
      `INSERT INTO mustahik (${keys.join(',')}) VALUES (${placeholders})`,
      values
    );
    const mustahikId = res.lastID;

    await db.run(
      `INSERT INTO applications (mustahik_id, application_number, program, request_title, status) VALUES (?, ?, ?, ?, ?)`,
      [mustahikId, m.file_no, m.program, m.request_title, m.status]
    );

    if (m.survey_date) {
      await db.run(
        `INSERT INTO assessments (mustahik_id, surveyor_name, surveyor_phone, survey_date, survey_method, narrative_family, narrative_income, narrative_conclusion, house_index, asset_index, income_index, spiritual_score, overall_score, priority, recommendation, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mustahikId, m.surveyor_name, m.surveyor_phone, m.survey_date, 'On Location', m.survey_notes, `Pendapatan: ${m.monthly_income}`, m.survey_notes, m.house_index, m.asset_index, m.income_index, m.spiritual_score, m.overall_score, m.priority, m.survey_recommendation, m.survey_notes]
      );
    }
  }
}
