import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Complete 60 columns master schema definition for mustahik
export const MUSTAHIK_COLUMNS = [
  { name: 'id', type: 'SERIAL PRIMARY KEY' },
  { name: 'file_no', type: 'VARCHAR(100) UNIQUE' },
  { name: 'received_date', type: 'VARCHAR(50)' },
  { name: 'name', type: 'VARCHAR(255)' },
  { name: 'applicant_status', type: "VARCHAR(50) DEFAULT 'Perorangan'" },
  { name: 'beneficiary_name', type: 'VARCHAR(255)' },
  { name: 'nik', type: 'VARCHAR(50)' },
  { name: 'kk_number', type: 'VARCHAR(50)' },
  { name: 'phone', type: 'VARCHAR(50)' },
  { name: 'marital_status', type: 'VARCHAR(50)' },
  { name: 'pob', type: 'VARCHAR(100)' },
  { name: 'dob', type: 'VARCHAR(50)' },
  { name: 'occupation', type: 'VARCHAR(100)' },
  { name: 'work_place', type: 'VARCHAR(255)' },
  { name: 'education_level', type: 'VARCHAR(50)' },
  { name: 'address', type: 'TEXT' },
  { name: 'rt_rw', type: 'VARCHAR(50)' },
  { name: 'kelurahan', type: 'VARCHAR(100)' },
  { name: 'kecamatan', type: 'VARCHAR(100)' },
  { name: 'kabupaten_kota', type: "VARCHAR(100) DEFAULT 'Kota Tangerang'" },
  { name: 'province', type: "VARCHAR(100) DEFAULT 'Banten'" },
  { name: 'survey_date', type: 'VARCHAR(50)' },
  { name: 'surveyor_name', type: 'VARCHAR(255)' },
  { name: 'surveyor_phone', type: 'VARCHAR(50)' },
  { name: 'house_ownership', type: 'VARCHAR(100)' },
  { name: 'family_dependents', type: 'INTEGER DEFAULT 0' },
  { name: 'monthly_income', type: 'NUMERIC DEFAULT 0' },
  { name: 'monthly_expense', type: 'NUMERIC DEFAULT 0' },
  { name: 'remaining_income', type: 'NUMERIC DEFAULT 0' },
  { name: 'survey_recommendation', type: 'TEXT' },
  { name: 'survey_notes', type: 'TEXT' },
  { name: 'application_count', type: 'INTEGER DEFAULT 1' },
  { name: 'beneficiary_count', type: 'INTEGER DEFAULT 1' },
  { name: 'priority', type: 'VARCHAR(50)' },
  { name: 'recommended_amount', type: 'NUMERIC DEFAULT 0' },
  { name: 'approved_amount', type: 'NUMERIC DEFAULT 0' },
  { name: 'mpzis_date', type: 'VARCHAR(50)' },
  { name: 'ppd_number', type: 'VARCHAR(100)' },
  { name: 'disbursement_date', type: 'VARCHAR(50)' },
  { name: 'payment_method', type: 'VARCHAR(100)' },
  { name: 'bank_account', type: 'VARCHAR(100)' },
  { name: 'bank_name', type: 'VARCHAR(100)' },
  { name: 'bank_account_name', type: 'VARCHAR(255)' },
  { name: 'asnaf', type: "VARCHAR(100) DEFAULT 'Fakir Miskin'" },
  { name: 'fund_source', type: "VARCHAR(100) DEFAULT 'Zakat'" },
  { name: 'distribution_purpose', type: 'TEXT' },
  { name: 'parent_occupation', type: 'VARCHAR(100)' },
  { name: 'desil_score', type: 'INTEGER' },
  { name: 'program', type: 'VARCHAR(100)' },
  { name: 'request_title', type: 'TEXT' },
  { name: 'status', type: "VARCHAR(100) DEFAULT 'Diajukan'" },
  { name: 'rejection_reason', type: 'TEXT' },
  { name: 'house_index', type: 'INTEGER' },
  { name: 'asset_index', type: 'INTEGER' },
  { name: 'income_index', type: 'INTEGER' },
  { name: 'spiritual_score', type: 'INTEGER' },
  { name: 'overall_score', type: 'NUMERIC' },
  { name: 'notes', type: 'TEXT' },
  { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
  { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
];

let poolInstance = null;
let dbWrapper = null;
let isPgActive = false;

/**
 * Returns optimized PostgreSQL Connection Pool instance
 * Configured with:
 * - max: 20 connection pool limit
 * - idleTimeoutMillis: 30000 (30 seconds)
 * - connectionTimeoutMillis: 5000 (5 seconds fast-fail)
 */
export function getPool() {
  if (!poolInstance) {
    const connectionConfig = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.PGSSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
        }
      : {
          host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
          database: process.env.PGDATABASE || process.env.DB_NAME || 'baznas_db',
          user: process.env.PGUSER || process.env.DB_USER || 'postgres',
          password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
          ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
        };

    poolInstance = new Pool({
      ...connectionConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client pool:', err.message);
    });
  }
  return poolInstance;
}

/**
 * Helper to adapt PostgreSQL queries ($1, $2, RETURNING, ILIKE) for SQLite fallback
 */
function adaptSqlForSqlite(sql) {
  let adapted = sql;
  adapted = adapted.replace(/ILIKE/gi, 'LIKE');
  adapted = adapted.replace(/\$([0-9]+)/g, '?');
  adapted = adapted.replace(/\s+RETURNING\s+[\w\s,*()]+/gi, '');
  adapted = adapted.replace(/SERIAL\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  adapted = adapted.replace(/TIMESTAMP\s+WITH\s+TIME\s+ZONE/gi, 'TIMESTAMP');
  adapted = adapted.replace(/TIMESTAMPTZ/gi, 'TIMESTAMP');
  adapted = adapted.replace(/JSONB/gi, 'TEXT');
  adapted = adapted.replace(/::jsonb/gi, '');
  return adapted;
}

/**
 * Provides a database adapter with SQLite-compatible method ergonomics
 * (get, all, run, query, exec) powered by PostgreSQL Pool with resilient local fallback.
 */
export async function getDb() {
  if (dbWrapper) return dbWrapper;

  const pool = getPool();

  try {
    // Probe PostgreSQL connection with timeout
    const testClient = await pool.connect();
    testClient.release();
    isPgActive = true;
    console.log('⚡ Connected to PostgreSQL Database Engine (Pool max: 20, idle: 30s)');

    dbWrapper = {
      isPg: true,
      pool,

      async query(text, params = []) {
        const normalizedParams = Array.isArray(params) ? params : [params];
        return pool.query(text, normalizedParams);
      },

      async get(text, params = []) {
        const normalizedParams = Array.isArray(params) ? params : [params];
        const res = await pool.query(text, normalizedParams);
        return res.rows && res.rows.length > 0 ? res.rows[0] : null;
      },

      async all(text, params = []) {
        const normalizedParams = Array.isArray(params) ? params : [params];
        const res = await pool.query(text, normalizedParams);
        return res.rows || [];
      },

      async run(text, params = []) {
        const normalizedParams = Array.isArray(params) ? params : [params];
        const res = await pool.query(text, normalizedParams);
        const firstRow = res.rows && res.rows[0] ? res.rows[0] : null;
        const lastID = firstRow ? (firstRow.id !== undefined ? firstRow.id : (firstRow.chat_id !== undefined ? firstRow.chat_id : null)) : null;

        return {
          lastID,
          rowCount: res.rowCount,
          rows: res.rows || []
        };
      },

      async exec(sql) {
        return pool.query(sql);
      }
    };
  } catch (pgErr) {
    console.warn(`⚠️ PostgreSQL unavailable (${pgErr.message}), activating high-speed SQLite adapter engine...`);
    const sqlitePath = path.resolve(__dirname, 'baznas_demo.db');
    const sqliteDb = await open({
      filename: sqlitePath,
      driver: sqlite3.Database
    });

    dbWrapper = {
      isPg: false,
      pool: null,
      sqliteDb,

      async query(text, params = []) {
        const adapted = adaptSqlForSqlite(text);
        const normalizedParams = Array.isArray(params) ? params : [params];
        const rows = await sqliteDb.all(adapted, normalizedParams);
        return { rows, rowCount: rows.length };
      },

      async get(text, params = []) {
        const adapted = adaptSqlForSqlite(text);
        const normalizedParams = Array.isArray(params) ? params : [params];
        return sqliteDb.get(adapted, normalizedParams);
      },

      async all(text, params = []) {
        const adapted = adaptSqlForSqlite(text);
        const normalizedParams = Array.isArray(params) ? params : [params];
        return sqliteDb.all(adapted, normalizedParams);
      },

      async run(text, params = []) {
        const adapted = adaptSqlForSqlite(text);
        const normalizedParams = Array.isArray(params) ? params : [params];
        const res = await sqliteDb.run(adapted, normalizedParams);
        return {
          lastID: res.lastID,
          rowCount: res.changes,
          rows: []
        };
      },

      async exec(sql) {
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(Boolean);

        for (const stmt of statements) {
          const adapted = adaptSqlForSqlite(stmt);
          try {
            await sqliteDb.exec(adapted);
          } catch (e) {
            // Ignore index or column exists notices
          }
        }
      }
    };
  }

  return dbWrapper;
}

export async function initDb() {
  const db = await getDb();

  try {
    // Create tables if not exist in PostgreSQL
    await db.exec(`
      CREATE TABLE IF NOT EXISTS mustahik (
        id SERIAL PRIMARY KEY,
        file_no VARCHAR(100) UNIQUE,
        received_date VARCHAR(50),
        name VARCHAR(255),
        applicant_status VARCHAR(50) DEFAULT 'Perorangan',
        beneficiary_name VARCHAR(255),
        nik VARCHAR(50),
        kk_number VARCHAR(50),
        phone VARCHAR(50),
        marital_status VARCHAR(50),
        pob VARCHAR(100),
        dob VARCHAR(50),
        occupation VARCHAR(100),
        work_place VARCHAR(255),
        education_level VARCHAR(50),
        address TEXT,
        rt_rw VARCHAR(50),
        kelurahan VARCHAR(100),
        kecamatan VARCHAR(100),
        kabupaten_kota VARCHAR(100) DEFAULT 'Kota Tangerang',
        province VARCHAR(100) DEFAULT 'Banten',
        survey_date VARCHAR(50),
        surveyor_name VARCHAR(255),
        surveyor_phone VARCHAR(50),
        house_ownership VARCHAR(100),
        family_dependents INTEGER DEFAULT 0,
        monthly_income NUMERIC DEFAULT 0,
        monthly_expense NUMERIC DEFAULT 0,
        remaining_income NUMERIC DEFAULT 0,
        survey_recommendation TEXT,
        survey_notes TEXT,
        application_count INTEGER DEFAULT 1,
        beneficiary_count INTEGER DEFAULT 1,
        priority VARCHAR(50),
        recommended_amount NUMERIC DEFAULT 0,
        approved_amount NUMERIC DEFAULT 0,
        mpzis_date VARCHAR(50),
        ppd_number VARCHAR(100),
        disbursement_date VARCHAR(50),
        payment_method VARCHAR(100),
        bank_account VARCHAR(100),
        bank_name VARCHAR(100),
        bank_account_name VARCHAR(255),
        asnaf VARCHAR(100) DEFAULT 'Fakir Miskin',
        fund_source VARCHAR(100) DEFAULT 'Zakat',
        distribution_purpose TEXT,
        parent_occupation VARCHAR(100),
        desil_score INTEGER,
        program VARCHAR(100),
        request_title TEXT,
        status VARCHAR(100) DEFAULT 'Diajukan',
        rejection_reason TEXT,
        house_index INTEGER,
        asset_index INTEGER,
        income_index INTEGER,
        spiritual_score INTEGER,
        overall_score NUMERIC,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        application_number VARCHAR(100),
        program VARCHAR(100),
        request_title TEXT,
        status VARCHAR(100) DEFAULT 'Diajukan',
        notes TEXT,
        rejection_reason TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
        surveyor_name VARCHAR(255),
        surveyor_phone VARCHAR(50),
        survey_date VARCHAR(50),
        survey_method VARCHAR(100),
        narrative_family TEXT,
        narrative_income TEXT,
        narrative_request TEXT,
        narrative_conclusion TEXT,
        house_index INTEGER,
        asset_index INTEGER,
        income_index INTEGER,
        spiritual_score INTEGER,
        overall_score NUMERIC,
        priority VARCHAR(50),
        recommendation TEXT,
        notes TEXT,
        photos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mpzis (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
        form_number VARCHAR(100),
        mpzis_date VARCHAR(50),
        program_classification VARCHAR(100),
        purpose TEXT,
        asnaf VARCHAR(100),
        fund_source VARCHAR(100),
        recipient_name VARCHAR(255),
        recipient_type VARCHAR(100),
        beneficiary_count INTEGER,
        total_amount NUMERIC,
        proposed_by VARCHAR(255),
        examined_by VARCHAR(255),
        ashnaf_verifier VARCHAR(255),
        responsible VARCHAR(255),
        approved_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ppd (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
        form_number VARCHAR(100),
        ppd_number VARCHAR(100),
        transaction_number VARCHAR(100),
        requester_name VARCHAR(255),
        requester_role VARCHAR(255),
        requester_department VARCHAR(255),
        amount NUMERIC,
        amount_in_words TEXT,
        purpose TEXT,
        fund_source TEXT,
        bank_account_info TEXT,
        payment_type VARCHAR(100),
        disbursement_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        doc_type VARCHAR(100),
        filename VARCHAR(255),
        original_name VARCHAR(255),
        file_url TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wa_logs (
        id SERIAL PRIMARY KEY,
        mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE CASCADE,
        phone VARCHAR(50),
        phase VARCHAR(100),
        message TEXT,
        wa_url TEXT,
        status VARCHAR(50) DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bot_sessions (
        chat_id BIGINT PRIMARY KEY,
        state VARCHAR(50) DEFAULT 'idle',
        temp_data TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'penyaluran',
        division VARCHAR(100) DEFAULT 'Divisi Penyaluran',
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_mustahik_file_no ON mustahik(file_no);
      CREATE INDEX IF NOT EXISTS idx_mustahik_nik ON mustahik(nik);
      CREATE INDEX IF NOT EXISTS idx_mustahik_phone ON mustahik(phone);
      CREATE INDEX IF NOT EXISTS idx_mustahik_status ON mustahik(status);
      CREATE INDEX IF NOT EXISTS idx_mustahik_program ON mustahik(program);
      CREATE INDEX IF NOT EXISTS idx_mustahik_received_date ON mustahik(received_date);
      CREATE INDEX IF NOT EXISTS idx_mustahik_kecamatan ON mustahik(kecamatan);
      CREATE INDEX IF NOT EXISTS idx_mustahik_created_at ON mustahik(created_at);
      CREATE INDEX IF NOT EXISTS idx_mustahik_asnaf ON mustahik(asnaf);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_applications_mustahik ON applications(mustahik_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_mustahik ON assessments(mustahik_id);
      CREATE INDEX IF NOT EXISTS idx_mpzis_mustahik ON mpzis(mustahik_id);
      CREATE INDEX IF NOT EXISTS idx_ppd_mustahik ON ppd(mustahik_id);
      CREATE INDEX IF NOT EXISTS idx_documents_mustahik ON documents(mustahik_id);
      CREATE INDEX IF NOT EXISTS idx_wa_logs_mustahik ON wa_logs(mustahik_id);
    `);

    // Ensure all 60 columns exist in mustahik (schema evolution)
    try {
      let existingCols = [];
      if (db.isPg) {
        const colRes = await db.all(`
          SELECT column_name FROM information_schema.columns WHERE table_name = 'mustahik'
        `);
        existingCols = colRes.map(r => r.column_name.toLowerCase());
      } else {
        const colRes = await db.all(`PRAGMA table_info(mustahik)`);
        existingCols = colRes.map(r => r.name.toLowerCase());
      }

      for (const col of MUSTAHIK_COLUMNS) {
        if (col.name === 'id') continue;
        if (!existingCols.includes(col.name.toLowerCase())) {
          let colDef = col.type;
          if (!db.isPg) {
            colDef = adaptSqlForSqlite(colDef);
          }
          try {
            await db.exec(`ALTER TABLE mustahik ADD COLUMN ${col.name} ${colDef}`);
          } catch (e) {
            // Ignore if added concurrently
          }
        }
      }

      // Ensure all fields exist on relation tables (schema evolution)
      const tableSchemas = {
        ppd: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'application_id', type: 'INTEGER' },
          { name: 'form_number', type: 'VARCHAR(100)' },
          { name: 'ppd_number', type: 'VARCHAR(100)' },
          { name: 'transaction_number', type: 'VARCHAR(100)' },
          { name: 'requester_name', type: 'VARCHAR(255)' },
          { name: 'requester_role', type: 'VARCHAR(255)' },
          { name: 'requester_department', type: 'VARCHAR(255)' },
          { name: 'amount', type: 'NUMERIC' },
          { name: 'amount_in_words', type: 'TEXT' },
          { name: 'purpose', type: 'TEXT' },
          { name: 'fund_source', type: 'TEXT' },
          { name: 'bank_account_info', type: 'TEXT' },
          { name: 'payment_type', type: 'VARCHAR(100)' },
          { name: 'disbursement_date', type: 'VARCHAR(50)' },
        ],
        mpzis: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'application_id', type: 'INTEGER' },
          { name: 'form_number', type: 'VARCHAR(100)' },
          { name: 'mpzis_date', type: 'VARCHAR(50)' },
          { name: 'program_classification', type: 'VARCHAR(100)' },
          { name: 'purpose', type: 'TEXT' },
          { name: 'asnaf', type: 'VARCHAR(100)' },
          { name: 'fund_source', type: 'VARCHAR(100)' },
          { name: 'recipient_name', type: 'VARCHAR(255)' },
          { name: 'recipient_type', type: 'VARCHAR(100)' },
          { name: 'beneficiary_count', type: 'INTEGER' },
          { name: 'total_amount', type: 'NUMERIC' },
          { name: 'proposed_by', type: 'VARCHAR(255)' },
          { name: 'examined_by', type: 'VARCHAR(255)' },
          { name: 'ashnaf_verifier', type: 'VARCHAR(255)' },
          { name: 'responsible', type: 'VARCHAR(255)' },
          { name: 'approved_by', type: 'VARCHAR(255)' },
        ],
        assessments: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'application_id', type: 'INTEGER' },
          { name: 'surveyor_name', type: 'VARCHAR(255)' },
          { name: 'surveyor_phone', type: 'VARCHAR(50)' },
          { name: 'survey_date', type: 'VARCHAR(50)' },
          { name: 'survey_method', type: 'VARCHAR(100)' },
          { name: 'narrative_family', type: 'TEXT' },
          { name: 'narrative_income', type: 'TEXT' },
          { name: 'narrative_request', type: 'TEXT' },
          { name: 'narrative_conclusion', type: 'TEXT' },
          { name: 'house_index', type: 'INTEGER' },
          { name: 'asset_index', type: 'INTEGER' },
          { name: 'income_index', type: 'INTEGER' },
          { name: 'spiritual_score', type: 'INTEGER' },
          { name: 'overall_score', type: 'NUMERIC' },
          { name: 'priority', type: 'VARCHAR(50)' },
          { name: 'recommendation', type: 'TEXT' },
          { name: 'notes', type: 'TEXT' },
          { name: 'photos', type: 'TEXT' },
        ],
        applications: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'application_number', type: 'VARCHAR(100)' },
          { name: 'program', type: 'VARCHAR(100)' },
          { name: 'request_title', type: 'TEXT' },
          { name: 'status', type: 'VARCHAR(100)' },
          { name: 'notes', type: 'TEXT' },
          { name: 'rejection_reason', type: 'TEXT' },
        ],
        documents: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'doc_type', type: 'VARCHAR(100)' },
          { name: 'filename', type: 'VARCHAR(255)' },
          { name: 'original_name', type: 'VARCHAR(255)' },
          { name: 'file_url', type: 'TEXT' },
        ],
        wa_logs: [
          { name: 'mustahik_id', type: 'INTEGER' },
          { name: 'phone', type: 'VARCHAR(50)' },
          { name: 'phase', type: 'VARCHAR(100)' },
          { name: 'message', type: 'TEXT' },
          { name: 'wa_url', type: 'TEXT' },
          { name: 'status', type: 'VARCHAR(50)' },
        ],
        bot_sessions: [
          { name: 'state', type: 'VARCHAR(50)' },
          { name: 'temp_data', type: 'TEXT' },
        ]
      };

      for (const [table, colDefs] of Object.entries(tableSchemas)) {
        let cols = [];
        if (db.isPg) {
          const colRes = await db.all(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
          cols = colRes.map(r => r.column_name.toLowerCase());
        } else {
          const colRes = await db.all(`PRAGMA table_info(${table})`);
          cols = colRes.map(r => r.name.toLowerCase());
        }

        for (const col of colDefs) {
          if (!cols.includes(col.name.toLowerCase())) {
            let colType = col.type;
            if (!db.isPg) colType = adaptSqlForSqlite(colType);
            try {
              await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${colType}`);
            } catch (e) {}
          }
        }
      }
    } catch (colErr) {
      console.warn('Column sync notice:', colErr.message);
    }

    await seedDataIfEmpty(db);
    await seedDefaultUsers(db);
    return db;
  } catch (err) {
    console.error('Database initialization notice/error:', err.message);
    throw err;
  }
}

async function seedDataIfEmpty(db) {
  try {
    const countRes = await db.get('SELECT COUNT(*) as total FROM mustahik');
    const total = parseInt(countRes?.total || 0, 10);
    if (total > 0) return;

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
      const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const values = keys.map(k => m[k]);

      const res = await db.run(
        `INSERT INTO mustahik (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`,
        values
      );
      const mustahikId = res.lastID;

      await db.run(
        `INSERT INTO applications (mustahik_id, application_number, program, request_title, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [mustahikId, m.file_no, m.program, m.request_title, m.status]
      );

      if (m.survey_date) {
        await db.run(
          `INSERT INTO assessments (mustahik_id, surveyor_name, surveyor_phone, survey_date, survey_method, narrative_family, narrative_income, narrative_conclusion, house_index, asset_index, income_index, spiritual_score, overall_score, priority, recommendation, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING id`,
          [mustahikId, m.surveyor_name, m.surveyor_phone, m.survey_date, 'On Location', m.survey_notes, `Pendapatan: ${m.monthly_income}`, m.survey_notes, m.house_index, m.asset_index, m.income_index, m.spiritual_score, m.overall_score, m.priority, m.survey_recommendation, m.survey_notes]
        );
      }
    }
  } catch (err) {
    console.warn('Seeding notice (non-fatal):', err.message);
  }
}

export async function seedDefaultUsers(db) {
  try {
    const userCount = await db.get('SELECT COUNT(*) as cnt FROM users');
    const cnt = userCount ? parseInt(userCount.cnt || userCount.count || 0, 10) : 0;
    if (cnt > 0) return;

    console.log('Seeding default BAZNAS role accounts...');
    const defaultAccounts = [
      {
        name: 'Ahmad Naufal, S.E.I',
        email: 'admin@baznas.go.id',
        password: 'admin123',
        role: 'admin',
        division: 'Pimpinan & Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'H. Rahmat Hidayat (Kabid Penyaluran)',
        email: 'penyaluran@baznas.go.id',
        password: 'penyaluran123',
        role: 'penyaluran',
        division: 'Bidang Pendistribusian & Pendayagunaan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Siti Rahmah, M.E (Kabid Penerimaan)',
        email: 'penerimaan@baznas.go.id',
        password: 'penerimaan123',
        role: 'penerimaan',
        division: 'Bidang Pengumpulan & ZIS',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Bambang Irawan (Surveyor BAZNAS)',
        email: 'surveyor@baznas.go.id',
        password: 'surveyor123',
        role: 'surveyor',
        division: 'Tim Asesmen & Survey Lapangan',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
    ];

    for (const acc of defaultAccounts) {
      const passwordHash = await bcrypt.hash(acc.password, 10);
      await db.run(
        `INSERT INTO users (name, email, password_hash, role, division, avatar, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
        [acc.name, acc.email, passwordHash, acc.role, acc.division, acc.avatar]
      );
    }
    console.log('Default BAZNAS role accounts successfully seeded.');
  } catch (err) {
    console.warn('User seeding notice (non-fatal):', err.message);
  }
}

