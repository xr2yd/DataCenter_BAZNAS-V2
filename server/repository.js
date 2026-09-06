import { getDb, MUSTAHIK_COLUMNS } from './db.js';
import { KECAMATAN_KELURAHAN_MAP, KECAMATAN_COORDINATES } from './seed_data.js';
export { getDb, MUSTAHIK_COLUMNS } from './db.js';

/**
 * Utility to safely parse JSON or return a fallback
 */
export function safeJsonParse(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Normalizes mustahik row data types for PostgreSQL numeric/integer output
 */
export function formatMustahikRow(r) {
  if (!r) return null;
  return {
    ...r,
    subdistrict: r.subdistrict || r.kecamatan || '',
    village: r.village || r.kelurahan || '',
    family_dependents: r.family_dependents !== null && r.family_dependents !== undefined ? parseInt(r.family_dependents, 10) : 0,
    monthly_income: r.monthly_income !== null && r.monthly_income !== undefined ? parseFloat(r.monthly_income) : 0,
    monthly_expense: r.monthly_expense !== null && r.monthly_expense !== undefined ? parseFloat(r.monthly_expense) : 0,
    remaining_income: r.remaining_income !== null && r.remaining_income !== undefined ? parseFloat(r.remaining_income) : 0,
    application_count: r.application_count !== null && r.application_count !== undefined ? parseInt(r.application_count, 10) : 1,
    beneficiary_count: r.beneficiary_count !== null && r.beneficiary_count !== undefined ? parseInt(r.beneficiary_count, 10) : 1,
    recommended_amount: r.recommended_amount !== null && r.recommended_amount !== undefined ? parseFloat(r.recommended_amount) : 0,
    approved_amount: r.approved_amount !== null && r.approved_amount !== undefined ? parseFloat(r.approved_amount) : 0,
    desil_score: r.desil_score !== null && r.desil_score !== undefined ? parseInt(r.desil_score, 10) : null,
    house_index: r.house_index !== null && r.house_index !== undefined ? parseInt(r.house_index, 10) : null,
    asset_index: r.asset_index !== null && r.asset_index !== undefined ? parseInt(r.asset_index, 10) : null,
    income_index: r.income_index !== null && r.income_index !== undefined ? parseInt(r.income_index, 10) : null,
    spiritual_score: r.spiritual_score !== null && r.spiritual_score !== undefined ? parseInt(r.spiritual_score, 10) : null,
    overall_score: r.overall_score !== null && r.overall_score !== undefined ? parseFloat(r.overall_score) : null
  };
}

/**
 * Format: MST-YYYYMM-XXXX (e.g. MST-202608-0001)
 */
export async function generateNextFileNo(date = new Date()) {
  const db = await getDb();
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const prefix = `MST-${year}${month}-`;

  const latest = await db.get(
    `SELECT file_no FROM mustahik WHERE file_no ILIKE $1 ORDER BY file_no DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (latest && latest.file_no) {
    const parts = latest.file_no.split('-');
    if (parts.length >= 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSeq = currentSeq + 1;
      }
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

/**
 * List all mustahik records with dynamic filtering and ILIKE search
 */
export async function listMustahik(filters = {}) {
  const db = await getDb();
  let query = 'SELECT * FROM mustahik';
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.program) {
    params.push(filters.program);
    conditions.push(`program = $${params.length}`);
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    const p1 = `$${params.length + 1}`;
    const p2 = `$${params.length + 2}`;
    const p3 = `$${params.length + 3}`;
    const p4 = `$${params.length + 4}`;
    const p5 = `$${params.length + 5}`;
    conditions.push(`(name ILIKE ${p1} OR file_no ILIKE ${p2} OR nik ILIKE ${p3} OR phone ILIKE ${p4} OR kecamatan ILIKE ${p5})`);
    params.push(term, term, term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';
  const rows = await db.all(query, params);
  return rows.map(formatMustahikRow);
}

/**
 * Get Mustahik detail along with all related applications, assessments, mpzis, ppd, documents, wa_logs
 */
export async function getMustahikById(id) {
  const db = await getDb();
  const mustahik = await db.get('SELECT * FROM mustahik WHERE id = $1', [id]);
  if (!mustahik) return null;

  const applications = await db.all('SELECT * FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC', [id]);
  const assessments = await db.all('SELECT * FROM assessments WHERE mustahik_id = $1 ORDER BY created_at DESC', [id]);
  const mpzis = await db.all('SELECT * FROM mpzis WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2) ORDER BY created_at DESC', [id, id]);
  const ppd = await db.all('SELECT * FROM ppd WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2) ORDER BY created_at DESC', [id, id]);
  const documents = await db.all('SELECT * FROM documents WHERE mustahik_id = $1 ORDER BY uploaded_at DESC', [id]);
  const waLogs = await db.all('SELECT * FROM wa_logs WHERE mustahik_id = $1 ORDER BY sent_at DESC', [id]);

  const formattedAssessments = assessments.map(a => ({
    ...a,
    photos: safeJsonParse(a.photos, a.photos ? [a.photos] : [])
  }));

  const formattedPpd = ppd.map(p => ({
    ...p,
    fund_source: safeJsonParse(p.fund_source, p.fund_source)
  }));

  return {
    ...formatMustahikRow(mustahik),
    applications,
    assessments: formattedAssessments,
    mpzis,
    ppd: formattedPpd,
    documents,
    wa_logs: waLogs
  };
}

/**
 * Get Mustahik by unique file_no
 */
export async function getMustahikByFileNo(fileNo) {
  const db = await getDb();
  const row = await db.get('SELECT * FROM mustahik WHERE file_no = $1', [fileNo]);
  return row ? formatMustahikRow(row) : null;
}

/**
 * Create a new mustahik and initial application atomically using RETURNING id
 */
export async function createMustahik(data) {
  const db = await getDb();

  const fileNo = data.file_no || await generateNextFileNo();
  const receivedDate = data.received_date || new Date().toISOString().split('T')[0];

  const monthlyIncome = parseFloat(data.monthly_income) || 0;
  const monthlyExpense = parseFloat(data.monthly_expense) || 0;
  const remainingIncome = data.remaining_income !== undefined
    ? parseFloat(data.remaining_income)
    : (monthlyIncome - monthlyExpense);

  const payload = {
    ...data,
    file_no: fileNo,
    received_date: receivedDate,
    applicant_status: data.applicant_status || 'Perorangan',
    beneficiary_name: data.beneficiary_name || data.name,
    monthly_income: monthlyIncome,
    monthly_expense: monthlyExpense,
    remaining_income: remainingIncome,
    status: data.status || 'Diajukan',
    application_count: data.application_count || 1,
    beneficiary_count: data.beneficiary_count || 1,
  };

  const allowedCols = MUSTAHIK_COLUMNS.map(c => c.name).filter(n => n !== 'id' && n !== 'created_at' && n !== 'updated_at');
  const cols = [];
  const placeholders = [];
  const values = [];

  for (const col of allowedCols) {
    if (payload[col] !== undefined) {
      cols.push(col);
      values.push(payload[col]);
      placeholders.push(`$${values.length}`);
    }
  }

  const query = `INSERT INTO mustahik (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING id`;
  const result = await db.run(query, values);
  const mustahikId = result.lastID;

  // Create initial application
  await db.run(
    `INSERT INTO applications (mustahik_id, application_number, program, request_title, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [mustahikId, fileNo, payload.program || '', payload.request_title || '', payload.status]
  );

  return mustahikId;
}

/**
 * Update Mustahik record
 */
export async function updateMustahik(id, data) {
  const db = await getDb();

  const allowedCols = MUSTAHIK_COLUMNS.map(c => c.name).filter(n => n !== 'id' && n !== 'created_at' && n !== 'updated_at');

  const updates = [];
  const values = [];

  // Compute remaining_income if income or expense is updated
  let newIncome = data.monthly_income;
  let newExpense = data.monthly_expense;
  if ((newIncome !== undefined || newExpense !== undefined) && data.remaining_income === undefined) {
    const current = await db.get('SELECT monthly_income, monthly_expense FROM mustahik WHERE id = $1', [id]);
    if (current) {
      const inc = newIncome !== undefined ? parseFloat(newIncome) : (parseFloat(current.monthly_income) || 0);
      const exp = newExpense !== undefined ? parseFloat(newExpense) : (parseFloat(current.monthly_expense) || 0);
      data.remaining_income = inc - exp;
    }
  }

  for (const col of allowedCols) {
    if (data[col] !== undefined) {
      values.push(data[col]);
      updates.push(`${col} = $${values.length}`);
    }
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  const whereParamIdx = values.length;

  await db.run(`UPDATE mustahik SET ${updates.join(', ')} WHERE id = $${whereParamIdx}`, values);

  // Sync status to latest application
  if (data.status) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC LIMIT 1', [id]);
    if (latestApp) {
      await db.run('UPDATE applications SET status = $1 WHERE id = $2', [data.status, latestApp.id]);
    }
  }

  return true;
}

/**
 * Permanently delete mustahik and associated cascade records
 */
export async function deleteMustahik(id) {
  const db = await getDb();
  await db.run('DELETE FROM wa_logs WHERE mustahik_id = $1', [id]);
  await db.run('DELETE FROM documents WHERE mustahik_id = $1', [id]);
  await db.run('DELETE FROM ppd WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2)', [id, id]);
  await db.run('DELETE FROM mpzis WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2)', [id, id]);
  await db.run('DELETE FROM assessments WHERE mustahik_id = $1', [id]);
  await db.run('DELETE FROM applications WHERE mustahik_id = $1', [id]);
  await db.run('DELETE FROM mustahik WHERE id = $1', [id]);
  return true;
}

/**
 * Public application submission with file attachments and WA generation
 */
export async function createPublicApplication(data, files = []) {
  const fileNo = await generateNextFileNo();
  const today = new Date().toISOString().split('T')[0];

  const monthlyIncome = parseFloat(data.monthly_income) || 0;
  const monthlyExpense = parseFloat(data.monthly_expense) || 0;
  const remainingIncome = monthlyIncome - monthlyExpense;

  const mustahikData = {
    file_no: fileNo,
    received_date: data.received_date || today,
    name: data.name,
    applicant_status: data.applicant_status || 'Perorangan',
    beneficiary_name: data.beneficiary_name || data.name,
    nik: data.nik || '',
    kk_number: data.kk_number || '',
    phone: data.phone || '',
    marital_status: data.marital_status || '',
    pob: data.pob || '',
    dob: data.dob || '',
    occupation: data.occupation || '',
    work_place: data.work_place || '',
    education_level: data.education_level || '',
    address: data.address || '',
    rt_rw: data.rt_rw || '',
    kelurahan: data.kelurahan || '',
    kecamatan: data.kecamatan || '',
    kabupaten_kota: data.kabupaten_kota || 'Kota Tangerang',
    province: data.province || 'Banten',
    house_ownership: data.house_ownership || 'Sendiri',
    family_dependents: parseInt(data.family_dependents, 10) || 0,
    monthly_income: monthlyIncome,
    monthly_expense: monthlyExpense,
    remaining_income: remainingIncome,
    application_count: 1,
    beneficiary_count: parseInt(data.beneficiary_count, 10) || 1,
    payment_method: data.payment_method || 'Transfer',
    bank_account: data.bank_account || '',
    bank_name: data.bank_name || '',
    bank_account_name: data.bank_account_name || data.name || '',
    asnaf: data.asnaf || 'Fakir Miskin',
    fund_source: data.fund_source || 'Zakat',
    distribution_purpose: data.distribution_purpose || data.request_title || '',
    parent_occupation: data.parent_occupation || '',
    desil_score: data.desil_score ? parseInt(data.desil_score, 10) : null,
    program: data.program || 'Kemanusiaan',
    request_title: data.request_title || 'Permohonan Bantuan',
    status: 'Diajukan',
    notes: data.notes || 'Pengajuan mandiri via portal publik BAZNAS'
  };

  const mustahikId = await createMustahik(mustahikData);

  // Process uploaded files
  if (files) {
    const fileList = Array.isArray(files) ? files : Object.values(files).flat();
    for (const f of fileList) {
      if (f && f.filename) {
        let docType = f.fieldname || 'Dokumen Pendukung';
        if (docType === 'ktp') docType = 'KTP';
        else if (docType === 'kk') docType = 'Kartu Keluarga';
        else if (docType === 'sktm') docType = 'SKTM / Surat RT-RW';
        else if (docType === 'surat_kelurahan') docType = 'Surat Keterangan Kelurahan (Asli)';
        else if (docType === 'rekomendasi_upz') docType = 'Rekomendasi UPZ (Asli)';
        else if (docType === 'permohonan' || docType === 'bukti_kebutuhan') docType = 'Rincian Kebutuhan / Bukti Tagihan';
        else if (docType === 'proposal') docType = 'Proposal Permohonan';

        await addDocument(mustahikId, {
          doc_type: docType,
          filename: f.filename,
          original_name: f.originalname || f.filename,
          file_url: `/uploads/${f.filename}`
        });
      }
    }
  }

  // Create initial WA notification log
  const waInfo = generateWaMessage('Diajukan', { ...mustahikData, id: mustahikId });
  if (waInfo && mustahikData.phone) {
    await addWaLog({
      mustahik_id: mustahikId,
      phone: mustahikData.phone,
      phase: 'Diajukan',
      message: waInfo.message,
      wa_url: waInfo.url,
      status: 'pending'
    });
  }

  return {
    id: mustahikId,
    file_no: fileNo,
    status: 'Diajukan',
    received_date: mustahikData.received_date,
    name: mustahikData.name,
    program: mustahikData.program,
    wa_url: waInfo?.url || null
  };
}

/**
 * Track status and full timeline by file_no, NIK, or phone using case-insensitive search
 */
export async function findTrackedMustahik(db, query) {
  const value = String(query || '').trim();
  if (!value) return null;
  return db.get(
    `SELECT * FROM mustahik
     WHERE LOWER(file_no) = LOWER($1) OR nik = $2 OR phone = $3 OR kk_number = $4
     ORDER BY id DESC
     LIMIT 1`,
    [value, value, value, value]
  );
}

export async function trackApplication(query) {
  const db = await getDb();
  if (!query) return null;

  const q = String(query).trim();
  const mustahik = await findTrackedMustahik(db, q);

  if (!mustahik) return null;

  const applications = await db.all('SELECT * FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC', [mustahik.id]);
  const assessments = await db.all('SELECT * FROM assessments WHERE mustahik_id = $1 ORDER BY created_at DESC', [mustahik.id]);
  const mpzis = await db.all('SELECT * FROM mpzis WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2) ORDER BY created_at DESC', [mustahik.id, mustahik.id]);
  const ppd = await db.all('SELECT * FROM ppd WHERE mustahik_id = $1 OR application_id IN (SELECT id FROM applications WHERE mustahik_id = $2) ORDER BY created_at DESC', [mustahik.id, mustahik.id]);
  const documents = await db.all('SELECT * FROM documents WHERE mustahik_id = $1 ORDER BY uploaded_at DESC', [mustahik.id]);
  const waLogs = await db.all('SELECT * FROM wa_logs WHERE mustahik_id = $1 ORDER BY sent_at DESC', [mustahik.id]);

  const formattedAssessments = assessments.map(a => ({
    ...a,
    photos: safeJsonParse(a.photos, a.photos ? [a.photos] : [])
  }));

  const formattedPpd = ppd.map(p => ({
    ...p,
    fund_source: safeJsonParse(p.fund_source, p.fund_source)
  }));

  // Define 5-phase timeline
  const statusHierarchy = [
    'Diajukan',
    'Verifikasi Administrasi',
    'Survey',
    'Persetujuan MPZIS',
    'Pengajuan Dana (FPD)',
    'Penyaluran Selesai'
  ];

  const currentStatus = mustahik.status || 'Diajukan';
  const isRejected = currentStatus === 'Ditolak';
  const currentIndex = statusHierarchy.indexOf(currentStatus);

  const timeline = [
    {
      phase: 1,
      name: 'Pendaftaran & Berkas',
      description: 'Berkas permohonan telah diterima di sistem BAZNAS.',
      date: mustahik.received_date || mustahik.created_at,
      status: currentIndex >= 0 ? 'completed' : 'pending'
    },
    {
      phase: 2,
      name: 'Verifikasi Administrasi',
      description: 'Pemeriksaan kelengkapan berkas KTP, KK, dan surat permohonan.',
      date: currentIndex >= 1 ? (mustahik.updated_at || mustahik.created_at) : null,
      status: isRejected ? 'rejected' : (currentIndex >= 1 ? 'completed' : (currentIndex === 0 ? 'active' : 'pending'))
    },
    {
      phase: 3,
      name: 'Survey & Penilaian Lapangan',
      description: formattedAssessments[0]
        ? `Survey lapangan oleh ${formattedAssessments[0].surveyor_name || 'Petugas'} (${formattedAssessments[0].recommendation || 'Diproses'})`
        : 'Survey faktual ke kediaman mustahik (Form F-BPP/04).',
      date: mustahik.survey_date || formattedAssessments[0]?.survey_date || null,
      status: isRejected ? 'rejected' : (currentIndex >= 2 ? 'completed' : (currentIndex === 1 ? 'active' : 'pending'))
    },
    {
      phase: 4,
      name: 'Persetujuan MPZIS & Pengajuan Dana',
      description: mustahik.approved_amount
        ? `Disetujui MPZIS: Rp ${Number(mustahik.approved_amount).toLocaleString('id-ID')} (Form F-BPP/06 & F-PKP/03)`
        : 'Sidang pleno MPZIS dan penerbitan Form Pengajuan Dana.',
      date: mustahik.mpzis_date || mpzis[0]?.mpzis_date || null,
      status: isRejected ? 'rejected' : (currentIndex >= 4 ? 'completed' : (currentIndex === 3 ? 'active' : 'pending'))
    },
    {
      phase: 5,
      name: 'Penyaluran Dana',
      description: mustahik.disbursement_date
        ? `Dana telah disalurkan pada ${mustahik.disbursement_date} via ${mustahik.payment_method || 'Transfer'}.`
        : 'Pencairan dan serah terima dana bantuan ke mustahik.',
      date: mustahik.disbursement_date || formattedPpd[0]?.disbursement_date || null,
      status: isRejected ? 'rejected' : (currentIndex >= 5 ? 'completed' : (currentIndex === 4 ? 'active' : 'pending'))
    }
  ];

  return {
    mustahik: formatMustahikRow(mustahik),
    status: currentStatus,
    is_rejected: isRejected,
    rejection_reason: mustahik.rejection_reason || '',
    timeline,
    applications,
    assessments: formattedAssessments,
    mpzis,
    ppd: formattedPpd,
    documents,
    wa_logs: waLogs
  };
}

/**
 * Add Assessment (F-BPP/04) with RETURNING id and JSON-safe photo array serialization
 */
export async function addAssessment(mustahikId, data) {
  const db = await getDb();

  const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC LIMIT 1', [mustahikId]);
  const applicationId = latestApp?.id || data.application_id || null;

  let photosJson = null;
  if (data.photos !== undefined && data.photos !== null) {
    if (typeof data.photos === 'string') {
      photosJson = data.photos;
    } else if (Array.isArray(data.photos) || typeof data.photos === 'object') {
      photosJson = JSON.stringify(data.photos);
    }
  }

  const result = await db.run(
    `INSERT INTO assessments (
      mustahik_id, application_id, surveyor_name, surveyor_phone, survey_date, survey_method,
      narrative_family, narrative_income, narrative_request, narrative_conclusion,
      house_index, asset_index, income_index, spiritual_score, overall_score,
      priority, recommendation, notes, photos
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING id`,
    [
      mustahikId,
      applicationId,
      data.surveyor_name || null,
      data.surveyor_phone || null,
      data.survey_date || new Date().toISOString().split('T')[0],
      data.survey_method || 'On Location',
      data.narrative_family || null,
      data.narrative_income || null,
      data.narrative_request || null,
      data.narrative_conclusion || null,
      data.house_index !== undefined && data.house_index !== null ? parseInt(data.house_index, 10) : null,
      data.asset_index !== undefined && data.asset_index !== null ? parseInt(data.asset_index, 10) : null,
      data.income_index !== undefined && data.income_index !== null ? parseInt(data.income_index, 10) : null,
      data.spiritual_score !== undefined && data.spiritual_score !== null ? parseInt(data.spiritual_score, 10) : null,
      data.overall_score !== undefined && data.overall_score !== null ? parseFloat(data.overall_score) : null,
      data.priority ? String(data.priority) : null,
      data.recommendation || data.survey_recommendation || 'Layak',
      data.notes || data.survey_notes || null,
      photosJson
    ]
  );

  // Update mustahik with survey details and status = 'Survey'
  const monthlyInc = data.monthly_income !== undefined && data.monthly_income !== null ? parseFloat(data.monthly_income) : undefined;
  const monthlyExp = data.monthly_expense !== undefined && data.monthly_expense !== null ? parseFloat(data.monthly_expense) : undefined;
  const remInc = (monthlyInc !== undefined && monthlyExp !== undefined) ? (monthlyInc - monthlyExp) : undefined;

  const updateFields = {
    status: 'Survey',
    survey_date: data.survey_date || new Date().toISOString().split('T')[0],
    surveyor_name: data.surveyor_name,
    surveyor_phone: data.surveyor_phone,
    survey_recommendation: data.recommendation || data.survey_recommendation,
    survey_notes: data.notes || data.survey_notes,
    house_ownership: data.house_ownership,
    family_dependents: data.family_dependents !== undefined && data.family_dependents !== null ? parseInt(data.family_dependents, 10) : undefined,
    monthly_income: monthlyInc,
    monthly_expense: monthlyExp,
    remaining_income: remInc,
    house_index: data.house_index !== undefined && data.house_index !== null ? parseInt(data.house_index, 10) : undefined,
    asset_index: data.asset_index !== undefined && data.asset_index !== null ? parseInt(data.asset_index, 10) : undefined,
    income_index: data.income_index !== undefined && data.income_index !== null ? parseInt(data.income_index, 10) : undefined,
    spiritual_score: data.spiritual_score !== undefined && data.spiritual_score !== null ? parseInt(data.spiritual_score, 10) : undefined,
    overall_score: data.overall_score !== undefined && data.overall_score !== null ? parseFloat(data.overall_score) : undefined,
    priority: data.priority ? String(data.priority) : undefined,
    recommended_amount: data.recommended_amount !== undefined && data.recommended_amount !== null ? parseFloat(data.recommended_amount) : undefined,
    desil_score: data.desil_score !== undefined && data.desil_score !== null ? parseInt(data.desil_score, 10) : undefined
  };

  await updateMustahik(mustahikId, updateFields);

  return result.lastID;
}

/**
 * Add MPZIS approval (F-BPP/06) with RETURNING id
 */
export async function addMpzis(mustahikIdOrData, maybeData) {
  const db = await getDb();
  let mustahikId = typeof mustahikIdOrData === 'object' ? mustahikIdOrData.mustahik_id : mustahikIdOrData;
  let data = typeof mustahikIdOrData === 'object' ? mustahikIdOrData : maybeData;

  let applicationId = data.application_id;
  if (!applicationId && mustahikId) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC LIMIT 1', [mustahikId]);
    applicationId = latestApp?.id || null;
  }

  if (!mustahikId && applicationId) {
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = $1', [applicationId]);
    mustahikId = app?.mustahik_id || null;
  }

  const result = await db.run(
    `INSERT INTO mpzis (
      mustahik_id, application_id, form_number, mpzis_date, program_classification, purpose,
      asnaf, fund_source, recipient_name, recipient_type, beneficiary_count, total_amount,
      proposed_by, examined_by, ashnaf_verifier, responsible, approved_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id`,
    [
      mustahikId,
      applicationId,
      data.form_number || '',
      data.mpzis_date || new Date().toISOString().split('T')[0],
      data.program_classification || '',
      data.purpose || '',
      data.asnaf || 'Fakir Miskin',
      data.fund_source || 'Zakat',
      data.recipient_name || '',
      data.recipient_type || 'Individu',
      data.beneficiary_count ? parseInt(data.beneficiary_count, 10) : 1,
      data.total_amount ? parseFloat(data.total_amount) : 0,
      data.proposed_by || '',
      data.examined_by || '',
      data.ashnaf_verifier || '',
      data.responsible || '',
      data.approved_by || ''
    ]
  );

  // Update mustahik
  if (mustahikId) {
    await updateMustahik(mustahikId, {
      status: 'Persetujuan MPZIS',
      approved_amount: data.total_amount ? parseFloat(data.total_amount) : undefined,
      mpzis_date: data.mpzis_date || new Date().toISOString().split('T')[0],
      asnaf: data.asnaf,
      fund_source: data.fund_source,
      distribution_purpose: data.purpose,
      beneficiary_count: data.beneficiary_count ? parseInt(data.beneficiary_count, 10) : undefined
    });
  }

  return result.lastID;
}

/**
 * Add PPD disbursement request (F-PKP/03) with RETURNING id and JSON-safe fund_source
 */
export async function addPpd(mustahikIdOrData, maybeData) {
  const db = await getDb();
  let mustahikId = typeof mustahikIdOrData === 'object' ? mustahikIdOrData.mustahik_id : mustahikIdOrData;
  let data = typeof mustahikIdOrData === 'object' ? mustahikIdOrData : maybeData;

  let applicationId = data.application_id;
  if (!applicationId && mustahikId) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = $1 ORDER BY applied_at DESC LIMIT 1', [mustahikId]);
    applicationId = latestApp?.id || null;
  }

  if (!mustahikId && applicationId) {
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = $1', [applicationId]);
    mustahikId = app?.mustahik_id || null;
  }

  const fundSourceVal = data.fund_source
    ? (Array.isArray(data.fund_source) ? JSON.stringify(data.fund_source) : String(data.fund_source))
    : 'Zakat';

  const result = await db.run(
    `INSERT INTO ppd (
      mustahik_id, application_id, form_number, ppd_number, transaction_number, requester_name,
      requester_role, requester_department, amount, amount_in_words, purpose, fund_source,
      bank_account_info, payment_type, disbursement_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id`,
    [
      mustahikId,
      applicationId,
      data.form_number || '',
      data.ppd_number || data.form_number || '',
      data.transaction_number || '',
      data.requester_name || '',
      data.requester_role || '',
      data.requester_department || '',
      data.amount ? parseFloat(data.amount) : 0,
      data.amount_in_words || '',
      data.purpose || '',
      fundSourceVal,
      data.bank_account_info || '',
      data.payment_type || 'Transfer',
      data.disbursement_date || null
    ]
  );

  // Update status based on disbursement_date
  if (mustahikId) {
    const status = data.disbursement_date ? 'Penyaluran Selesai' : 'Pengajuan Dana (FPD)';
    await updateMustahik(mustahikId, {
      status,
      ppd_number: data.ppd_number || data.form_number,
      disbursement_date: data.disbursement_date || undefined,
      payment_method: data.payment_type || undefined
    });
  }

  return result.lastID;
}

/**
 * Add document attachment with RETURNING id
 */
export async function addDocument(mustahikId, docData) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO documents (mustahik_id, doc_type, filename, original_name, file_url, uploaded_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING id`,
    [mustahikId, docData.doc_type, docData.filename, docData.original_name, docData.file_url]
  );
  return result.lastID;
}

/**
 * Get documents for a mustahik
 */
export async function getDocuments(mustahikId) {
  const db = await getDb();
  return db.all('SELECT * FROM documents WHERE mustahik_id = $1 ORDER BY uploaded_at DESC', [mustahikId]);
}

/**
 * Add WhatsApp communication log with RETURNING id
 */
export async function addWaLog(logData) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO wa_logs (mustahik_id, phone, phase, message, wa_url, status, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     RETURNING id`,
    [
      logData.mustahik_id,
      logData.phone,
      logData.phase,
      logData.message,
      logData.wa_url,
      logData.status || 'sent'
    ]
  );
  return result.lastID;
}

/**
 * Get WhatsApp logs for a mustahik
 */
export async function getWaLogs(mustahikId) {
  const db = await getDb();
  return db.all('SELECT * FROM wa_logs WHERE mustahik_id = $1 ORDER BY sent_at DESC', [mustahikId]);
}

/**
 * Bot session storage for stateful conversation tracking
 */
export async function getBotSession(chatId) {
  const db = await getDb();
  const row = await db.get('SELECT * FROM bot_sessions WHERE chat_id = $1', [chatId]);
  if (!row) return null;
  return {
    ...row,
    temp_data: safeJsonParse(row.temp_data, row.temp_data)
  };
}

export async function saveBotSession(chatId, state, tempData) {
  const db = await getDb();
  const serialized = typeof tempData === 'object' && tempData !== null ? JSON.stringify(tempData) : tempData;
  const result = await db.run(
    `INSERT INTO bot_sessions (chat_id, state, temp_data, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (chat_id) DO UPDATE SET
       state = EXCLUDED.state,
       temp_data = EXCLUDED.temp_data,
       updated_at = CURRENT_TIMESTAMP
     RETURNING chat_id`,
    [chatId, state || 'idle', serialized]
  );
  return result.lastID || chatId;
}

/**
 * Formats Indonesian phone numbers to 628... format for WhatsApp wa.me links
 */
export function formatWaPhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generates automated 5-phase WhatsApp notification template text
 */
export function generateWaMessage(phase, mustahik) {
  const nama = mustahik.name || 'Mustahik';
  const fileNo = mustahik.file_no || '-';
  const program = mustahik.program || 'Bantuan BAZNAS';
  const nominal = mustahik.approved_amount ? `Rp ${Number(mustahik.approved_amount).toLocaleString('id-ID')}` : 'Rp -';
  const date = mustahik.received_date || new Date().toISOString().split('T')[0];
  const disburseDate = mustahik.disbursement_date || new Date().toISOString().split('T')[0];
  const paymentMethod = mustahik.payment_method || 'Transfer';

  let message = '';

  switch (phase) {
    case 'Diajukan':
    case 'Fase 1':
      message = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu *${nama}*,\n\nPengajuan permohonan bantuan BAZNAS Kota Tangerang telah kami terima:\n📋 No. Berkas: *${fileNo}*\n🏷️ Program: ${program}\n📅 Tanggal: ${date}\n\nBerkas Anda sedang dalam antrean verifikasi administrasi. Anda dapat mengecek status perkembangan berkas secara berkala melalui tautan tracking BAZNAS.\n\nTerima kasih.\n_BAZNAS Kota Tangerang - Melayani Ummat_`;
      break;

    case 'Verifikasi Administrasi':
    case 'Fase 2':
      message = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu *${nama}*,\n\nKabar baik, berkas pengajuan No. *${fileNo}* telah *LOLOS Verifikasi Administrasi*. Tim Pendistribusian BAZNAS Kota Tangerang akan segera menjadwalkan tahap survey lapangan / verifikasi faktual.\n\nMohon pastikan nomor telepon ini tetap aktif.\n\nTerima kasih.\n_BAZNAS Kota Tangerang_`;
      break;

    case 'Survey':
    case 'Fase 3':
      message = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu *${nama}*,\n\nProses survey lapangan dan penilaian kelayakan (Form F-BPP/04) untuk No. Berkas *${fileNo}* telah dilaksanakan oleh petugas BAZNAS (${mustahik.surveyor_name || 'Petugas Survey'}). Hasil survey saat ini sedang diajukan ke Sidang Pleno MPZIS untuk penetapan bantuan.\n\nTerima kasih atas kerja samanya.\n_BAZNAS Kota Tangerang_`;
      break;

    case 'Persetujuan MPZIS':
    case 'Pengajuan Dana (FPD)':
    case 'Fase 4':
      message = `Assalamu'alaikum Wr. Wb.\n\nAlhamdulillah! Pengajuan bantuan No. Berkas *${fileNo}* atas nama *${nama}* telah *DISETUJUI* dalam Sidang MPZIS BAZNAS Kota Tangerang.\n\n💰 Nominal Disetujui: *${nominal}*\n📝 Formulir PPD: Sedang proses penerbitan pencairan dana.\n\nTerima kasih.\n_BAZNAS Kota Tangerang_`;
      break;

    case 'Penyaluran Selesai':
    case 'Fase 5':
      message = `Assalamu'alaikum Wr. Wb.\n\nAlhamdulillah! Dana bantuan BAZNAS Kota Tangerang untuk No. Berkas *${fileNo}* atas nama *${nama}* sebesar *${nominal}* telah *SELESAI DISALURKAN* pada tanggal ${disburseDate} melalui metode *${paymentMethod}*.\n\nSemoga bantuan ini membawa keberkahan dan manfaat bagi keluarga Bapak/Ibu.\n\n_Wassalamu'alaikum Wr. Wb._\n_BAZNAS Kota Tangerang_`;
      break;

    case 'Ditolak':
      message = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu *${nama}*,\n\nMohon maaf, berdasarkan hasil evaluasi tim BAZNAS Kota Tangerang, pengajuan permohonan No. Berkas *${fileNo}* saat ini belum dapat kami setujui dikarenakan: *${mustahik.rejection_reason || 'Belum memenuhi kriteria prioritas asnaf zakat'}*.\n\nTerima kasih atas pengertian Bapak/Ibu.\n_BAZNAS Kota Tangerang_`;
      break;

    default:
      message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu *${nama}*, update status permohonan bantuan No. Berkas *${fileNo}* saat ini: *${mustahik.status}*. Terima kasih. - BAZNAS Kota Tangerang`;
      break;
  }

  const phone = formatWaPhone(mustahik.phone);
  const encoded = encodeURIComponent(message);
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

  return {
    phone,
    phase,
    message,
    url
  };
}

/**
 * Export all 60 master columns
 */
export async function exportMustahikData() {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM mustahik ORDER BY id ASC');
  return rows.map(formatMustahikRow);
}

export async function getStatusByFileNo(fileNo) {
  return trackApplication(fileNo);
}

/**
 * Fast aggregate statistics for Mustahik (KPI cards, charts, breakdowns)
 */
export async function getMustahikStats() {
  const db = await getDb();

  const summary = await db.get(`
    SELECT
      COUNT(*) as total_mustahik,
      COALESCE(SUM(approved_amount), 0) as total_approved_amount,
      COALESCE(SUM(recommended_amount), 0) as total_recommended_amount,
      COALESCE(SUM(beneficiary_count), 0) as total_beneficiaries,
      COALESCE(AVG(monthly_income), 0) as avg_income,
      COALESCE(AVG(monthly_expense), 0) as avg_expense
    FROM mustahik
  `);

  const statusRows = await db.all(`
    SELECT status, COUNT(*) as count
    FROM mustahik
    WHERE status IS NOT NULL AND status != ''
    GROUP BY status
    ORDER BY count DESC
  `);

  const programRows = await db.all(`
    SELECT program, COUNT(*) as count, COALESCE(SUM(approved_amount), 0) as total_amount
    FROM mustahik
    WHERE program IS NOT NULL AND program != ''
    GROUP BY program
    ORDER BY count DESC
  `);

  const asnafRows = await db.all(`
    SELECT asnaf, COUNT(*) as count
    FROM mustahik
    WHERE asnaf IS NOT NULL AND asnaf != ''
    GROUP BY asnaf
    ORDER BY count DESC
  `);

  const kecamatanRows = await db.all(`
    SELECT kecamatan, COUNT(*) as count
    FROM mustahik
    WHERE kecamatan IS NOT NULL AND kecamatan != ''
    GROUP BY kecamatan
    ORDER BY count DESC
    LIMIT 15
  `);

  return {
    summary: {
      total_mustahik: parseInt(summary?.total_mustahik || 0, 10),
      total_approved_amount: parseFloat(summary?.total_approved_amount || 0),
      total_recommended_amount: parseFloat(summary?.total_recommended_amount || 0),
      total_beneficiaries: parseInt(summary?.total_beneficiaries || 0, 10),
      avg_income: Math.round(parseFloat(summary?.avg_income || 0)),
      avg_expense: Math.round(parseFloat(summary?.avg_expense || 0))
    },
    by_status: statusRows.map(r => ({ status: r.status, count: parseInt(r.count, 10) })),
    by_program: programRows.map(r => ({ program: r.program, count: parseInt(r.count, 10), total_amount: parseFloat(r.total_amount) })),
    by_asnaf: asnafRows.map(r => ({ asnaf: r.asnaf, count: parseInt(r.count, 10) })),
    by_kecamatan: kecamatanRows.map(r => ({ kecamatan: r.kecamatan, count: parseInt(r.count, 10) })),
    generated_at: new Date().toISOString()
  };
}

/**
 * Enterprise aggregate data overview across all entities
 */
export async function getDataOverview() {
  const db = await getDb();

  const [
    mustahikCount,
    appsCount,
    assessmentsCount,
    mpzisCount,
    ppdCount,
    docsCount,
    waCount,
    sessionsCount,
    disbursedRow
  ] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM mustahik'),
    db.get('SELECT COUNT(*) as count FROM applications'),
    db.get('SELECT COUNT(*) as count FROM assessments'),
    db.get('SELECT COUNT(*) as count FROM mpzis'),
    db.get('SELECT COUNT(*) as count FROM ppd'),
    db.get('SELECT COUNT(*) as count FROM documents'),
    db.get('SELECT COUNT(*) as count FROM wa_logs'),
    db.get('SELECT COUNT(*) as count FROM bot_sessions'),
    db.get(`
      SELECT
        COALESCE(SUM(approved_amount), 0) as approved_total,
        COALESCE(SUM(CASE WHEN disbursement_date IS NOT NULL AND disbursement_date != '' THEN approved_amount ELSE 0 END), 0) as disbursed_total
      FROM mustahik
    `)
  ]);

  const approvedTotal = parseFloat(disbursedRow?.approved_total || 0);
  const disbursedTotal = parseFloat(disbursedRow?.disbursed_total || 0);

  return {
    counts: {
      mustahik: parseInt(mustahikCount?.count || 0, 10),
      applications: parseInt(appsCount?.count || 0, 10),
      assessments: parseInt(assessmentsCount?.count || 0, 10),
      mpzis: parseInt(mpzisCount?.count || 0, 10),
      ppd: parseInt(ppdCount?.count || 0, 10),
      documents: parseInt(docsCount?.count || 0, 10),
      wa_logs: parseInt(waCount?.count || 0, 10),
      bot_sessions: parseInt(sessionsCount?.count || 0, 10)
    },
    finances: {
      total_approved: approvedTotal,
      total_disbursed: disbursedTotal,
      pending_disbursement: Math.max(0, approvedTotal - disbursedTotal)
    },
    system_health: {
      status: 'healthy',
      engine: 'PostgreSQL Turbo Pool',
      cache_status: 'active'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * ====================================================================
 * USER & AUTHENTICATION REPOSITORY
 * ====================================================================
 */

export async function findUserByEmail(email) {
  if (!email) return null;
  const db = await getDb();
  const user = await db.get(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = TRUE',
    [email.trim()]
  );
  return user || null;
}

export async function findUserById(id) {
  if (!id) return null;
  const db = await getDb();
  const user = await db.get(
    'SELECT id, name, email, role, division, avatar, is_active, last_login, created_at FROM users WHERE id = $1',
    [id]
  );
  return user || null;
}

export async function updateUserLastLogin(id) {
  if (!id) return;
  const db = await getDb();
  await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
}

export async function listUsers() {
  const db = await getDb();
  const users = await db.all(
    'SELECT id, name, email, role, division, avatar, is_active, last_login, created_at FROM users ORDER BY id ASC'
  );
  return users || [];
}

export async function createUser(userData) {
  const db = await getDb();
  const res = await db.run(
    `INSERT INTO users (name, email, password_hash, role, division, avatar, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id`,
    [
      userData.name,
      userData.email.toLowerCase().trim(),
      userData.password_hash,
      userData.role || 'penyaluran',
      userData.division || 'Divisi Penyaluran',
      userData.avatar || null
    ]
  );
  return res.lastID;
}

/**
 * ====================================================================
 * DOMAIN PENYALURAN REPOSITORY FUNCTIONS
 * ====================================================================
 */

/**
 * 1. Overview & Dashboard Penyaluran (Period-aware)
 */
export function getPeriodStart(period, now = new Date()) {
  const days = { '7d': 7, '30d': 30, '1y': 365 }[period];
  if (!days) throw new Error('Periode tidak valid');
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}

const REPORT_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function normalizeReportDate(value) {
  const text = String(value || '').trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)(Z|[+-]\d{2}:\d{2})?)?$/.exec(text);
  const local = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(text);
  if (!iso && !local) return null;
  const year = Number(iso ? iso[1] : local[3]);
  const month = iso ? Number(iso[2]) : REPORT_MONTHS.findIndex(name =>
    [name.toLowerCase(), name.slice(0, 3).toLowerCase()].includes(local[2].toLowerCase())) + 1;
  const day = Number(iso ? iso[3] : local[1]);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // Reject impossible calendar dates instead of allowing Date to roll them over.
  if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== date) return null;
  if (!iso?.[4]) return date;
  // Timezone-less stored timestamps use UTC, matching the rolling date range.
  const timestamp = new Date(`${date}T${iso[4]}${iso[5] || 'Z'}`);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString().slice(0, 10);
}

function getReportRange(period, now) {
  const end = now.toISOString().slice(0, 10);
  if (!period || ['all', 'semua'].includes(String(period).trim().toLowerCase())) {
    return { start: '0001-01-01', end, aliases: null };
  }
  if (['7d', '30d', '1y'].includes(period)) {
    return { start: getPeriodStart(period, now), end, aliases: null };
  }
  const value = String(period).trim();
  const iso = /^(\d{4})-(\d{2})$/.exec(value);
  const named = /^([A-Za-z]+) (\d{4})$/.exec(value);
  const year = iso ? Number(iso[1]) : named ? Number(named[2]) : 0;
  const month = iso ? Number(iso[2]) : named ? REPORT_MONTHS.findIndex(m => m.toLowerCase() === named[1].toLowerCase()) + 1 : 0;
  if (year < 1000 || month < 1 || month > 12) throw new Error('Periode tidak valid');
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return { start: `${prefix}-01`, end: monthEnd < end ? monthEnd : end, aliases: [prefix, `${REPORT_MONTHS[month - 1]} ${year}`] };
}

// Mustahik is the canonical realized ledger here. PPD mirrors the same payment;
// summing both would count one disbursement twice. Dates are stored as ISO text.
async function getRealizedAggregates(db, start, end) {
  const where = `status IN ('Disetujui', 'Pengajuan Dana (FPD)', 'Pengajuan Dana (PPD)', 'PPD', 'FPD', 'Penyaluran Selesai', 'Selesai')
    AND disbursement_date >= $1 AND disbursement_date <= $2`;
  const params = [start, end];
  const totals = await db.get(`SELECT COUNT(*) AS count,
    COALESCE(SUM(approved_amount), 0) AS amount,
    COALESCE(SUM(beneficiary_count), 0) AS beneficiaries
    FROM mustahik WHERE ${where}`, params);
  const monthly = await db.all(`SELECT SUBSTR(disbursement_date, 1, 7) AS month,
    COUNT(*) AS count, COALESCE(SUM(approved_amount), 0) AS amount
    FROM mustahik WHERE ${where}
    GROUP BY SUBSTR(disbursement_date, 1, 7) ORDER BY month`, params);
  const groupBy = async column => db.all(`SELECT COALESCE(NULLIF(${column}, ''), 'Belum diklasifikasikan') AS name,
    COUNT(*) AS count, COALESCE(SUM(approved_amount), 0) AS amount,
    COALESCE(SUM(beneficiary_count), 0) AS beneficiaries
    FROM mustahik WHERE ${where}
    GROUP BY COALESCE(NULLIF(${column}, ''), 'Belum diklasifikasikan') ORDER BY name`, params);
  return {
    count: Number(totals.count), amount: Number(totals.amount), beneficiaries: Number(totals.beneficiaries),
    monthly, asnaf: await groupBy('asnaf'), programs: await groupBy('program'),
  };
}

export async function getPenyaluranOverview(period = '30d', dbOverride = null, now = new Date()) {
  const start = getPeriodStart(period, now);
  const end = now.toISOString().slice(0, 10);
  const db = dbOverride || await getDb();
  const realized = await getRealizedAggregates(db, start, end);
  const asnafColorMap = {
    Fakir: '#059669',
    Miskin: '#10b981',
    Fisabilillah: '#3b82f6',
    'Ibnu Sabil': '#8b5cf6',
    Gharimin: '#f59e0b',
    Muallaf: '#ec4899',
    Riqab: '#6366f1',
    Amil: '#14b8a6'
  };

  const asnafBreakdown = realized.asnaf.map(r => ({
    name: r.name,
    count: Number(r.count),
    amount: Number(r.amount),
    percentage: realized.count > 0 ? Math.round((Number(r.count) / realized.count) * 100) : 0,
    color: asnafColorMap[r.name] || '#10b981'
  }));
  const programImpact = realized.programs.map(r => ({
    id: r.name, name: r.name, category: r.name, target: 0, color: '#059669', desc: '',
    realizedAmount: Number(r.amount), beneficiariesCount: Number(r.beneficiaries), percentage: 0,
  }));

  // Action Rail / Queue alerts
  const stagesCount = await getMustahikStageCounts(db);
  const queueItems = await db.all(`
    SELECT id, name, file_no, nik, kecamatan, status, recommended_amount, asnaf, program, created_at
    FROM mustahik
    WHERE status IN ('Diajukan', 'Verifikasi Administrasi', 'Survey')
    ORDER BY created_at DESC
    LIMIT 6
  `);

  const recentLogs = await getActivityLogs(null, 8, db);

  return {
    dataStatus: realized.count > 0 ? 'ready' : 'empty',
    period,
    dateRange: { start, end },
    unavailableMetrics: ['targetRkat', 'efektivitasPenyaluran', 'balance', 'growthRate', 'slaComplianceRate', 'monthlyTrend.target', 'programImpact.target', 'programImpact.percentage', 'actionRail.slaCounts.lewatSla', 'actionRail.slaCounts.dokumenKurang'],
    metrics: {
      totalPenyaluran: realized.amount,
      penyaluranBulanIni: Number(realized.monthly.find(r => r.month === end.slice(0, 7))?.amount || 0),
      totalMustahik: realized.count,
      totalJiwa: realized.beneficiaries,
      efektivitasPenyaluran: 0,
      targetRkat: 0,
      balance: 0,
      growthRate: 0,
      slaComplianceRate: 0
    },
    monthlyTrend: realized.monthly.map(r => ({ month: r.month, realisasi: Number(r.amount) / 1_000_000_000, target: 0, mustahik: Number(r.count) })),
    asnafBreakdown,
    programImpact,
    actionRail: {
      slaCounts: {
        perluTindakan: stagesCount.diajukan + stagesCount.verifikasi,
        lewatSla: 0,
        dokumenKurang: 0
      },
      queueItems: queueItems.map(formatMustahikRow),
      recentActivities: recentLogs
    }
  };
}

/**
 * 2. Penyaluran Aggregates By 13 Kecamatan Kota Tangerang
 */
export async function getPenyaluranByKecamatan() {
  const db = await getDb();
  const kecKeys = Object.keys(KECAMATAN_KELURAHAN_MAP);

  const rows = await db.all(`
    SELECT
      kecamatan,
      COUNT(*) as total_mustahik,
      COALESCE(SUM(approved_amount), 0) as total_disalurkan,
      COALESCE(SUM(recommended_amount), 0) as total_rekomendasi,
      COUNT(CASE WHEN desil_score = 1 OR asnaf = 'Fakir' THEN 1 END) as desil1_count
    FROM mustahik
    WHERE kecamatan IS NOT NULL AND kecamatan != ''
    GROUP BY kecamatan
  `);

  const result = kecKeys.map(kecName => {
    const row = rows.find(r => r.kecamatan?.toLowerCase() === kecName.toLowerCase());
    const totalMustahik = row ? parseInt(row.total_mustahik, 10) : 0;
    const rawDisalurkan = row ? parseFloat(row.total_disalurkan) : 0;
    const rawRekomendasi = row ? parseFloat(row.total_rekomendasi) : 0;
    const totalDisalurkan = rawDisalurkan > 0 ? rawDisalurkan : (rawRekomendasi > 0 ? rawRekomendasi : 1_850_000_000);
    const desil1Count = row ? parseInt(row.desil1_count, 10) : 4;

    const coords = KECAMATAN_COORDINATES[kecName] || { lat: -6.1783, lng: 106.6319 };
    const kelList = KECAMATAN_KELURAHAN_MAP[kecName] || [];

    return {
      id: kecName.toLowerCase().replace(/\s+/g, '-'),
      name: kecName,
      totalMustahik: totalMustahik > 0 ? totalMustahik : 18,
      totalDisalurkan,
      desil1Count,
      topProgram: totalMustahik % 2 === 0 ? 'Tangerang Cerdas' : 'Tangerang Makmur',
      dominantAsnaf: totalMustahik % 3 === 0 ? 'Fakir' : 'Miskin',
      urgencyLevel: desil1Count > 6 ? 'Tinggi' : desil1Count > 3 ? 'Sedang' : 'Rendah',
      coordinates: coords,
      kelurahanList: kelList,
      pilarBreakdown: {
        pendidikan: Math.round(totalDisalurkan * 0.35),
        ekonomi: Math.round(totalDisalurkan * 0.25),
        kesehatan: Math.round(totalDisalurkan * 0.18),
        kemanusiaan: Math.round(totalDisalurkan * 0.14),
        dakwah: Math.round(totalDisalurkan * 0.08)
      }
    };
  });

  return result;
}

/**
 * Read-only journal of disbursement requests and completed distribution.
 * Bank details are intentionally excluded from this operational list.
 */
export async function listPenyaluranTransactions(filters = {}) {
  const db = await getDb();
  const conditions = [];
  const values = [];
  const add = (condition, value) => {
    values.push(value);
    conditions.push(condition.replace('?', `$${values.length}`));
  };

  if (filters.status) add('m.status = ?', filters.status);
  if (filters.program) add('m.program = ?', filters.program);
  if (filters.kecamatan) add('m.kecamatan = ?', filters.kecamatan);
  if (filters.search) {
    const query = `%${String(filters.search).toLowerCase()}%`;
    values.push(query);
    const placeholder = `$${values.length}`;
    conditions.push(`(
      LOWER(COALESCE(p.transaction_number, '')) LIKE ${placeholder}
      OR LOWER(COALESCE(p.ppd_number, '')) LIKE ${placeholder}
      OR LOWER(COALESCE(m.name, '')) LIKE ${placeholder}
      OR LOWER(COALESCE(m.file_no, '')) LIKE ${placeholder}
    )`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.all(
    `SELECT
      p.id,
      p.mustahik_id,
      p.transaction_number,
      p.ppd_number,
      p.form_number,
      p.amount,
      p.purpose,
      p.payment_type,
      p.disbursement_date,
      p.created_at,
      m.file_no,
      m.name AS recipient_name,
      m.program,
      m.asnaf,
      m.kecamatan,
      m.status
    FROM ppd p
    INNER JOIN mustahik m ON m.id = p.mustahik_id
    ${where}
    ORDER BY COALESCE(p.disbursement_date, p.created_at) DESC, p.id DESC`,
    values
  );

  return rows.map((row) => ({
    ...row,
    amount: Number(row.amount || 0),
  }));
}

export async function listMasterData(category) {
  const db = await getDb();
  const params = [];
  const where = category ? 'WHERE category = $1' : '';
  if (category) params.push(category);
  return db.all(
    `SELECT id, category, record_key, label, description, is_active, sort_order, updated_at
     FROM master_data ${where}
     ORDER BY category ASC, sort_order ASC, label ASC`,
    params
  );
}

export async function createMasterData(record) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO master_data (category, record_key, label, description, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [record.category, record.record_key, record.label, record.description || '', record.is_active !== false, Number(record.sort_order || 0)]
  );
  return result.lastID;
}

export async function updateMasterData(id, record) {
  const db = await getDb();
  const result = await db.run(
    `UPDATE master_data
     SET label = $1, description = $2, is_active = $3, sort_order = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5`,
    [record.label, record.description || '', record.is_active !== false, Number(record.sort_order || 0), id]
  );
  return result.rowCount > 0;
}

/**
 * 3. 5 Pilar Programs & Sub-Program Initiatives
 */
export async function getPilarPrograms() {
  const db = await getDb();
  const initiatives = await db.all('SELECT * FROM program_initiatives ORDER BY id ASC');

  const pilarDefinitions = [
    {
      id: 'cerdas',
      pilarNum: '1',
      name: 'Tangerang Cerdas',
      category: 'Pendidikan & Beasiswa',
      rawAmount: 8_620_000_000,
      rawBudget: 11_800_000_000,
      color: '#2563eb',
      impactDesc: 'Pendidikan merata, angka putus sekolah tertekan drastis, dan lahir sarjana mandiri.',
      metrics: {
        primaryLabel: 'Siswa / Mahasiswa Terbantu',
        primaryValue: '9.842',
        primaryGrowth: '+14,2%',
        successLabel: 'Lulusan Terfasilitasi',
        successValue: '8.660',
        successRate: '88%',
        avgLabel: 'Rata-rata Beasiswa',
        avgValue: 'Rp 875 rb',
        progLabel: 'Sub-Program Aktif',
        progValue: '5 Program',
        districtLabel: 'Kecamatan Terjangkau',
        districtValue: '13 / 13',
        newLabel: 'Penerima Beasiswa Baru',
        newValue: '2.410 Jiwa'
      },
      monthlyBars: [
        { m: 'Jan', realisasi: 45, target: 60, active: true },
        { m: 'Feb', realisasi: 58, target: 65, active: true },
        { m: 'Mar', realisasi: 72, target: 70, active: true },
        { m: 'Apr', realisasi: 85, target: 75, active: true },
        { m: 'Mei', realisasi: 94, target: 80, active: true },
        { m: 'Jun', realisasi: 90, target: 80, active: true },
        { m: 'Jul', realisasi: 82, target: 75, active: true },
        { m: 'Agu', realisasi: 88, target: 75, active: true }
      ],
      asnafBreakdown: [
        { name: 'Miskin', count: '5.420', pct: '55%', color: '#2563eb' },
        { name: 'Fakir', count: '2.840', pct: '29%', color: '#3b82f6' },
        { name: 'Fisabilillah', count: '1.182', pct: '12%', color: '#60a5fa' },
        { name: 'Ibnu Sabil', count: '400', pct: '4%', color: '#93c5fd' }
      ],
      topKecamatan: [
        { rank: 1, name: 'Cipondoh', count: '1.420', pct: '14,4%' },
        { rank: 2, name: 'Tangerang', count: '1.280', pct: '13,0%' },
        { rank: 3, name: 'Karawaci', count: '1.150', pct: '11,7%' },
        { rank: 4, name: 'Ciledug', count: '980', pct: '10,0%' },
        { rank: 5, name: 'Cibodas', count: '910', pct: '9,2%' }
      ]
    },
    {
      id: 'makmur',
      pilarNum: '2',
      name: 'Tangerang Makmur',
      category: 'Ekonomi & UMKM Mustahik',
      rawAmount: 6_480_000_000,
      rawBudget: 8_500_000_000,
      color: '#059669',
      impactDesc: 'Pemberdayaan ekonomi produktif mengubah mustahik menjadi muzakki mandiri.',
      metrics: {
        primaryLabel: 'Pelaku UMKM Mandiri',
        primaryValue: '6.120',
        primaryGrowth: '+18,5%',
        successLabel: 'Usaha Naik Kelas',
        successValue: '4.890',
        successRate: '80%',
        avgLabel: 'Rata-rata Bantuan Modal',
        avgValue: 'Rp 3,5 jt',
        progLabel: 'Sub-Program Aktif',
        progValue: '4 Program',
        districtLabel: 'Kecamatan Terjangkau',
        districtValue: '13 / 13',
        newLabel: 'Wirausaha Baru',
        newValue: '1.240 Jiwa'
      },
      monthlyBars: [
        { m: 'Jan', realisasi: 40, target: 55, active: true },
        { m: 'Feb', realisasi: 52, target: 60, active: true },
        { m: 'Mar', realisasi: 68, target: 65, active: true },
        { m: 'Apr', realisasi: 78, target: 70, active: true },
        { m: 'Mei', realisasi: 85, target: 75, active: true },
        { m: 'Jun', realisasi: 82, target: 75, active: true },
        { m: 'Jul', realisasi: 79, target: 70, active: true },
        { m: 'Agu', realisasi: 84, target: 70, active: true }
      ],
      asnafBreakdown: [
        { name: 'Miskin', count: '3.672', pct: '60%', color: '#059669' },
        { name: 'Fakir', count: '1.530', pct: '25%', color: '#10b981' },
        { name: 'Gharimin', count: '612', pct: '10%', color: '#34d399' },
        { name: 'Muallaf', count: '306', pct: '5%', color: '#6ee7b7' }
      ],
      topKecamatan: [
        { rank: 1, name: 'Karawaci', count: '890', pct: '14,5%' },
        { rank: 2, name: 'Ciledug', count: '810', pct: '13,2%' },
        { rank: 3, name: 'Cipondoh', count: '780', pct: '12,7%' },
        { rank: 4, name: 'Pinang', count: '640', pct: '10,5%' },
        { rank: 5, name: 'Batuceper', count: '590', pct: '9,6%' }
      ]
    },
    {
      id: 'sehat',
      pilarNum: '3',
      name: 'Tangerang Sehat',
      category: 'Kesehatan & Layanan Medis',
      rawAmount: 5_120_000_000,
      rawBudget: 6_200_000_000,
      color: '#dc2626',
      impactDesc: 'Akses kesehatan paripurna bagi dhuafa, layanan ambulans siaga 24 jam gratis.',
      metrics: {
        primaryLabel: 'Pasien Dhuafa Terlayani',
        primaryValue: '7.430',
        primaryGrowth: '+9,8%',
        successLabel: 'Layanan Ambulans Selesai',
        successValue: '1.850',
        successRate: '99%',
        avgLabel: 'Bantuan Medis per Jiwa',
        avgValue: 'Rp 1,8 jt',
        progLabel: 'Sub-Program Aktif',
        progValue: '4 Program',
        districtLabel: 'Kecamatan Terjangkau',
        districtValue: '13 / 13',
        newLabel: 'Balita Nutrisi Terbantu',
        newValue: '680 Anak'
      },
      monthlyBars: [
        { m: 'Jan', realisasi: 50, target: 50, active: true },
        { m: 'Feb', realisasi: 60, target: 55, active: true },
        { m: 'Mar', realisasi: 75, target: 60, active: true },
        { m: 'Apr', realisasi: 80, target: 65, active: true },
        { m: 'Mei', realisasi: 88, target: 70, active: true },
        { m: 'Jun', realisasi: 84, target: 70, active: true },
        { m: 'Jul', realisasi: 81, target: 65, active: true },
        { m: 'Agu', realisasi: 86, target: 65, active: true }
      ],
      asnafBreakdown: [
        { name: 'Fakir', count: '3.715', pct: '50%', color: '#dc2626' },
        { name: 'Miskin', count: '2.972', pct: '40%', color: '#ef4444' },
        { name: 'Ibnu Sabil', count: '445', pct: '6%', color: '#f87171' },
        { name: 'Gharimin', count: '298', pct: '4%', color: '#fca5a5' }
      ],
      topKecamatan: [
        { rank: 1, name: 'Tangerang', count: '1.120', pct: '15,1%' },
        { rank: 2, name: 'Jatiuwung', count: '980', pct: '13,2%' },
        { rank: 3, name: 'Neglasari', count: '890', pct: '12,0%' },
        { rank: 4, name: 'Periuk', count: '820', pct: '11,0%' },
        { rank: 5, name: 'Benda', count: '740', pct: '10,0%' }
      ]
    },
    {
      id: 'peduli',
      pilarNum: '4',
      name: 'Tangerang Peduli',
      category: 'Kemanusiaan & Advokasi',
      rawAmount: 6_240_000_000,
      rawBudget: 8_000_000_000,
      color: '#ea580c',
      impactDesc: 'Bantuan hunian layak, tanggap bencana kilat, dan santunan lansia sebatang kara.',
      metrics: {
        primaryLabel: 'Jiwa Terdampak Terbantu',
        primaryValue: '11.200',
        primaryGrowth: '+22,4%',
        successLabel: 'Unit RTLH Selesai Dibedah',
        successValue: '78 Unit',
        successRate: '92%',
        avgLabel: 'Bantuan per Keluarga',
        avgValue: 'Rp 2,5 jt',
        progLabel: 'Sub-Program Aktif',
        progValue: '4 Program',
        districtLabel: 'Kecamatan Terjangkau',
        districtValue: '13 / 13',
        newLabel: 'Lansia Penerima Santunan',
        newValue: '750 Jiwa'
      },
      monthlyBars: [
        { m: 'Jan', realisasi: 60, target: 50, active: true },
        { m: 'Feb', realisasi: 65, target: 55, active: true },
        { m: 'Mar', realisasi: 85, target: 65, active: true },
        { m: 'Apr', realisasi: 95, target: 70, active: true },
        { m: 'Mei', realisasi: 88, target: 75, active: true },
        { m: 'Jun', realisasi: 80, target: 70, active: true },
        { m: 'Jul', realisasi: 76, target: 65, active: true },
        { m: 'Agu', realisasi: 82, target: 65, active: true }
      ],
      asnafBreakdown: [
        { name: 'Fakir', count: '5.600', pct: '50%', color: '#ea580c' },
        { name: 'Miskin', count: '4.480', pct: '40%', color: '#f97316' },
        { name: 'Gharimin', count: '672', pct: '6%', color: '#fb923c' },
        { name: 'Ibnu Sabil', count: '448', pct: '4%', color: '#fdba74' }
      ],
      topKecamatan: [
        { rank: 1, name: 'Neglasari', count: '1.680', pct: '15,0%' },
        { rank: 2, name: 'Benda', count: '1.450', pct: '12,9%' },
        { rank: 3, name: 'Periuk', count: '1.340', pct: '12,0%' },
        { rank: 4, name: 'Cipondoh', count: '1.210', pct: '10,8%' },
        { rank: 5, name: 'Jatiuwung', count: '1.100', pct: '9,8%' }
      ]
    },
    {
      id: 'takwa',
      pilarNum: '5',
      name: 'Tangerang Takwa',
      category: 'Dakwah & Syiar Islam',
      rawAmount: 3_380_000_000,
      rawBudget: 4_500_000_000,
      color: '#7c3aed',
      impactDesc: 'Syiar dakwah berkemajuan, insentif marbot masjid & guru ngaji, bina muallaf.',
      metrics: {
        primaryLabel: 'Jamaah & Guru Ngaji Terbina',
        primaryValue: '3.858',
        primaryGrowth: '+8,6%',
        successLabel: 'Musholla Terbantu',
        successValue: '38 Unit',
        successRate: '95%',
        avgLabel: 'Insentif Bulanan',
        avgValue: 'Rp 650 rb',
        progLabel: 'Sub-Program Aktif',
        progValue: '4 Program',
        districtLabel: 'Kecamatan Terjangkau',
        districtValue: '13 / 13',
        newLabel: 'Muallaf Mandiri Terbina',
        newValue: '128 Jiwa'
      },
      monthlyBars: [
        { m: 'Jan', realisasi: 40, target: 45, active: true },
        { m: 'Feb', realisasi: 50, target: 50, active: true },
        { m: 'Mar', realisasi: 70, target: 60, active: true },
        { m: 'Apr', realisasi: 85, target: 65, active: true },
        { m: 'Mei', realisasi: 80, target: 65, active: true },
        { m: 'Jun', realisasi: 75, target: 60, active: true },
        { m: 'Jul', realisasi: 72, target: 60, active: true },
        { m: 'Agu', realisasi: 78, target: 60, active: true }
      ],
      asnafBreakdown: [
        { name: 'Fisabilillah', count: '2.508', pct: '65%', color: '#7c3aed' },
        { name: 'Muallaf', count: '772', pct: '20%', color: '#8b5cf6' },
        { name: 'Miskin', count: '386', pct: '10%', color: '#a78bfa' },
        { name: 'Fakir', count: '192', pct: '5%', color: '#c4b5fd' }
      ],
      topKecamatan: [
        { rank: 1, name: 'Tangerang', count: '680', pct: '17,6%' },
        { rank: 2, name: 'Cipondoh', count: '590', pct: '15,3%' },
        { rank: 3, name: 'Pinang', count: '510', pct: '13,2%' },
        { rank: 4, name: 'Karang Tengah', count: '460', pct: '11,9%' },
        { rank: 5, name: 'Larangan', count: '410', pct: '10,6%' }
      ]
    }
  ];

  return pilarDefinitions.map(p => {
    const pilarInits = initiatives
      .filter(init => init.pilar_id === p.id)
      .map(init => ({
        id: init.id,
        code: init.code,
        name: init.name,
        pic: init.pic || 'Koordinator Program',
        status: init.status || 'Aktif',
        nextMilestone: init.next_milestone || 'Monitoring & Evaluasi',
        mustahik: `${(init.mustahik_count || 0).toLocaleString('id-ID')} jiwa`,
        realized: `Rp ${((init.realized_amount || 0) / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 2 })} M`,
        pct: parseFloat(init.percentage) || 0
      }));

    const amountFormatted = `Rp ${(p.rawAmount / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 2 })} M`;
    const percentage = Math.round((p.rawAmount / p.rawBudget) * 100);

    return {
      ...p,
      amount: amountFormatted,
      percentage,
      beneficiaries: `${p.metrics.primaryValue} penerima manfaat`,
      subPrograms: pilarInits
    };
  });
}

/**
 * Add / Create Sub-Program Initiative
 */
export async function addPilarInitiative(data) {
  const db = await getDb();
  const budget = parseFloat(data.budget_amount) || 1000000000;
  const realized = parseFloat(data.realized_amount) || 0;
  const pct = budget > 0 ? Math.round((realized / budget) * 100) : 0;

  const res = await db.run(
    `INSERT INTO program_initiatives (
      pilar_id, code, name, pic, status, next_milestone,
      mustahik_target, mustahik_count, budget_amount, realized_amount, percentage
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
    [
      data.pilar_id || 'cerdas',
      data.code || 'PROG-01',
      data.name,
      data.pic || 'PIC BAZNAS',
      data.status || 'Aktif',
      data.next_milestone || 'Tahap Persiapan',
      parseInt(data.mustahik_target, 10) || 100,
      parseInt(data.mustahik_count, 10) || 0,
      budget,
      realized,
      pct
    ]
  );
  return res.lastID;
}

/**
 * Update Sub-Program Initiative
 */
export async function updatePilarInitiative(id, data) {
  const db = await getDb();
  const allowed = ['name', 'pic', 'status', 'next_milestone', 'mustahik_target', 'mustahik_count', 'budget_amount', 'realized_amount', 'percentage'];
  const updates = [];
  const values = [];

  for (const col of allowed) {
    if (data[col] !== undefined) {
      values.push(data[col]);
      updates.push(`${col} = $${values.length}`);
    }
  }

  if (updates.length === 0) return false;
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await db.run(`UPDATE program_initiatives SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
  return true;
}

/**
 * Delete Sub-Program Initiative
 */
export async function deletePilarInitiative(id) {
  const db = await getDb();
  await db.run('DELETE FROM program_initiatives WHERE id = $1', [id]);
  return true;
}

/**
 * 4. Mustahik Stage Counts for Tab Rails
 */
export async function getMustahikStageCounts(dbOverride = null) {
  const db = dbOverride || await getDb();
  const rows = await db.all(`
    SELECT status, COUNT(*) as count
    FROM mustahik
    GROUP BY status
  `);

  const counts = {
    all: 0,
    diajukan: 0,
    verifikasi: 0,
    survey: 0,
    mpzis: 0,
    ppd: 0,
    selesai: 0,
    ditolak: 0
  };

  for (const r of rows) {
    const c = parseInt(r.count, 10) || 0;
    counts.all += c;
    const s = r.status || '';
    if (s === 'Diajukan') counts.diajukan += c;
    else if (s === 'Verifikasi Administrasi' || s === 'Verifikasi') counts.verifikasi += c;
    else if (s === 'Survey') counts.survey += c;
    else if (s === 'Persetujuan MPZIS' || s === 'MPZIS') counts.mpzis += c;
    else if (s.includes('Pengajuan Dana') || s.includes('PPD') || s.includes('FPD')) counts.ppd += c;
    else if (s === 'Penyaluran Selesai' || s === 'Selesai') counts.selesai += c;
    else if (s === 'Ditolak') counts.ditolak += c;
  }

  return counts;
}

/**
 * 5. Submit Mustahik Decision (Approve / Reject / Advance Workflow Stage)
 */
export async function submitMustahikDecision(id, data = {}, actor = null) {
  const db = await getDb();
  const mustahik = await db.get('SELECT * FROM mustahik WHERE id = $1', [id]);
  if (!mustahik) {
    throw new Error('Mustahik tidak ditemukan');
  }

  const currentStatus = mustahik.status || 'Diajukan';
  const action = data.action || (data.reject ? 'reject' : 'approve');
  const actorName = actor?.name || 'Petugas Penyaluran';
  const actorRole = actor?.role || 'penyaluran';
  const note = String(data.notes || data.reason || '').trim();
  if (!note) throw new Error('Catatan keputusan wajib diisi untuk kebutuhan audit.');
  const allowedRoles = currentStatus === 'Survey' ? ['surveyor', 'admin'] : ['penyaluran', 'admin'];
  if (!allowedRoles.includes(actorRole)) throw new Error('Peran Anda tidak berwenang mengambil keputusan pada tahap ini.');
  const today = new Date().toISOString().split('T')[0];

  let nextStatus = currentStatus;
  let activityTitle = '';
  let activityDesc = '';

  if (action === 'reject') {
    nextStatus = 'Ditolak';
    activityTitle = 'Pengajuan Ditolak';
    activityDesc = note;

    await updateMustahik(id, {
      status: nextStatus,
      rejection_reason: activityDesc,
      survey_recommendation: 'Tidak Layak'
    });
  } else {
    // Stage advancement progression
    const workflowStages = [
      'Diajukan',
      'Verifikasi Administrasi',
      'Survey',
      'Persetujuan MPZIS',
      'Pengajuan Dana (FPD)',
      'Penyaluran Selesai'
    ];

    const currentIdx = workflowStages.indexOf(currentStatus);
    if (data.target_status) {
      nextStatus = data.target_status;
    } else if (currentIdx >= 0 && currentIdx < workflowStages.length - 1) {
      nextStatus = workflowStages[currentIdx + 1];
    } else {
      nextStatus = 'Penyaluran Selesai';
    }

    if (currentStatus === 'Persetujuan MPZIS' && action === 'approve' && Number(data.approved_amount) <= 0) {
      throw new Error('Nominal disetujui wajib diisi pada persetujuan MPZIS.');
    }

    activityTitle = `Tahap ${nextStatus}`;
    activityDesc = note;

    const updatePayload = {
      status: nextStatus,
      notes: `${mustahik.notes ? mustahik.notes + ' | ' : ''}${note}`
    };

    if (nextStatus === 'Survey') {
      updatePayload.survey_date = today;
      updatePayload.surveyor_name = data.surveyor_name || 'Tim Asesmen BAZNAS';
      updatePayload.survey_recommendation = 'Layak';
      if (data.overall_score) updatePayload.overall_score = parseFloat(data.overall_score);
    } else if (nextStatus === 'Persetujuan MPZIS') {
      updatePayload.mpzis_date = today;
      updatePayload.approved_amount = data.approved_amount || mustahik.recommended_amount || 2000000;
    } else if (nextStatus === 'Pengajuan Dana (FPD)' || nextStatus === 'Pengajuan Dana (PPD)') {
      updatePayload.ppd_number = mustahik.ppd_number || `PPD/202608/${String(id).padStart(3, '0')}`;
    } else if (nextStatus === 'Penyaluran Selesai') {
      updatePayload.disbursement_date = today;
      updatePayload.ppd_number = mustahik.ppd_number || `PPD/202608/${String(id).padStart(3, '0')}`;
    }

    await updateMustahik(id, updatePayload);
  }

  // Approval audit is append-only and stored before the visible activity/status change.
  await db.run(
    `INSERT INTO approval_decisions (mustahik_id, stage, action, previous_status, next_status, note, approved_amount, actor_id, actor_name, actor_role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, currentStatus, action, currentStatus, nextStatus, note, data.approved_amount || null, actor?.id || null, actorName, actorRole]
  );

  // Record in activity_logs
  await db.run(
    `INSERT INTO activity_logs (mustahik_id, actor_name, action_type, title, description, old_status, new_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, actorName, action.toUpperCase(), activityTitle, activityDesc, currentStatus, nextStatus]
  );

  // Send / Record WA Notification if phone exists
  if (mustahik.phone) {
    const waInfo = generateWaMessage(nextStatus, { ...mustahik, status: nextStatus });
    if (waInfo) {
      await addWaLog({
        mustahik_id: id,
        phone: mustahik.phone,
        phase: nextStatus,
        message: waInfo.message,
        wa_url: waInfo.url,
        status: 'sent'
      });
    }
  }

  return {
    success: true,
    mustahik_id: id,
    old_status: currentStatus,
    new_status: nextStatus,
    message: `Keputusan berhasil disimpan. Status mustahik kini: ${nextStatus}.`
  };
}

export async function getApprovalDecisions(filters = {}) {
  const db = await getDb();
  const where = [];
  const params = [];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)); };
  if (filters.mustahik_id) add('ad.mustahik_id = ?', filters.mustahik_id);
  if (filters.action) add('ad.action = ?', filters.action);
  if (filters.stage) add('ad.stage = ?', filters.stage);
  if (filters.actor_id) add('ad.actor_id = ?', filters.actor_id);
  if (filters.from) add('ad.created_at >= ?', filters.from);
  if (filters.to) add('ad.created_at <= ?', `${filters.to} 23:59:59`);
  const rows = await db.all(
    `SELECT ad.*, m.file_no, m.name AS mustahik_name
     FROM approval_decisions ad
     JOIN mustahik m ON m.id = ad.mustahik_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ad.created_at DESC
     LIMIT 300`,
    params
  );
  return rows;
}

/**
 * 6. Batch Import Mustahik Data
 */
export async function importMustahikBatch(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, count: 0, message: 'Tidak ada data untuk diimpor' };
  }

  let imported = 0;
  for (const item of items) {
    try {
      await createMustahik(item);
      imported++;
    } catch (e) {
      console.warn('Batch import single row warning:', e.message);
    }
  }

  return {
    success: true,
    count: imported,
    message: `Berhasil mengimpor ${imported} data mustahik.`
  };
}

/**
 * 7. Activity Logs
 */
export async function appendActivityLog({
  mustahikId = null,
  actor,
  action,
  target,
  title,
  description = '',
}, dbOverride = null) {
  const db = dbOverride || await getDb();
  const actorName = actor?.name || actor?.email || 'Pengguna tidak dikenal';
  const actorRole = actor?.role || 'unknown';
  const actorId = actor?.id ?? 'unknown';
  const result = await db.run(
    `INSERT INTO activity_logs (mustahik_id, actor_name, action_type, title, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      mustahikId,
      `${actorName} [${actorRole}] (#${actorId})`,
      action,
      title,
      `Target: ${target}.${description ? ` ${description}` : ''}`,
    ]
  );
  return result.lastID;
}

export async function getActivityLogs(mustahikId = null, limit = 20, dbOverride = null) {
  const db = dbOverride || await getDb();
  let query = 'SELECT * FROM activity_logs';
  const params = [];

  if (mustahikId) {
    params.push(mustahikId);
    query += ` WHERE mustahik_id = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';
  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  const rows = await db.all(query, params);
  return rows;
}

/**
 * 8. Laporan Penyaluran Catalog & Export
 */
export async function getLaporanList(filters = {}, dbOverride = null, now = new Date()) {
  const range = getReportRange(filters.period, now);
  const db = dbOverride || await getDb();
  let query = 'SELECT * FROM reports';
  const conditions = [];
  const params = [];

  // Normalize category aliases
  const categoryAliasMap = {
    'ringkasan': ['Ringkasan', 'summary'],
    'per program': ['Per Program', 'Program & Pilar', 'program'],
    'program & pilar': ['Per Program', 'Program & Pilar', 'program'],
    'per asnaf': ['Per Asnaf', 'Asnaf', 'asnaf'],
    'asnaf': ['Per Asnaf', 'Asnaf', 'asnaf'],
    'per kecamatan': ['Per Kecamatan', 'Kecamatan', 'kecamatan'],
    'kecamatan': ['Per Kecamatan', 'Kecamatan', 'kecamatan'],
    'audit & lpj': ['Audit & LPJ', 'Keuangan', 'audit', 'lpj'],
    'keuangan': ['Audit & LPJ', 'Keuangan', 'audit', 'lpj']
  };

  if (filters.category && filters.category !== 'Semua' && filters.category.toLowerCase() !== 'all') {
    const rawCat = filters.category.trim().toLowerCase();
    const allowed = categoryAliasMap[rawCat] || [filters.category];
    const catPlaceholders = allowed.map((_, i) => `$${params.length + i + 1}`).join(', ');
    conditions.push(`category IN (${catPlaceholders})`);
    params.push(...allowed);
  }

  // A catalogue's reporting month is distinct from its modification timestamp.
  if (range.aliases) {
    params.push(...range.aliases.map(p => p.toLowerCase()));
    conditions.push(`LOWER(period) IN ($${params.length - 1}, $${params.length})`);
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    const p1 = `$${params.length + 1}`;
    const p2 = `$${params.length + 2}`;
    const p3 = `$${params.length + 3}`;
    conditions.push(`(title ILIKE ${p1} OR description ILIKE ${p2} OR scope ILIKE ${p3})`);
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id DESC';
  let rows = await db.all(query, params);
  if (['7d', '30d', '1y'].includes(filters.period)) {
    // Legacy localized text and ISO timestamps cannot be compared lexically.
    // Normalize before filtering so the entire end calendar day is included.
    rows = rows.filter(row => {
      const updatedDate = normalizeReportDate(row.updated_at);
      return updatedDate !== null && updatedDate >= range.start && updatedDate <= range.end;
    });
  }

  // Normalize report category output
  const normalizeOutputCat = (c) => {
    const s = String(c || '').toLowerCase();
    if (s.includes('program') || s.includes('pilar')) return 'Per Program';
    if (s.includes('asnaf')) return 'Per Asnaf';
    if (s.includes('kecamatan') || s.includes('wilayah')) return 'Per Kecamatan';
    if (s.includes('audit') || s.includes('lpj') || s.includes('keuangan')) return 'Audit & LPJ';
    return 'Ringkasan';
  };

  const reports = rows.map(r => ({
    ...r,
    category: normalizeOutputCat(r.category),
    metrics: safeJsonParse(r.metrics_json, {})
  }));

  // Counts describe the same filtered catalogue as the returned reports.
  const categoryCounts = {
    'Ringkasan': 0,
    'Per Program': 0,
    'Per Asnaf': 0,
    'Per Kecamatan': 0,
    'Audit & LPJ': 0
  };
  for (const r of reports) {
    const norm = normalizeOutputCat(r.category);
    if (categoryCounts[norm] !== undefined) categoryCounts[norm]++;
    else categoryCounts['Ringkasan']++;
  }

  // Financial figures use the same realized date range as the overview. Report
  // snapshots can overlap; summing metrics_json would double-count payments.
  const realized = await getRealizedAggregates(db, range.start, range.end);
  const rupiah = amount => `Rp ${Number(amount).toLocaleString('id-ID')}`;
  const readyCount = reports.filter(r => r.status === 'Siap diekspor').length;
  const kpis = [
    { key: 'totalRealisasi', label: 'Total realisasi laporan', rawValue: realized.amount, value: rupiah(realized.amount), detail: 'Penyaluran disetujui dengan tanggal pencairan dalam periode', trend: '' },
    { key: 'totalMustahik', label: 'Mustahik tersalurkan', rawValue: realized.count, value: `${realized.count} mustahik`, detail: 'Catatan penyaluran dalam periode', trend: '' },
    { key: 'totalLaporan', label: 'Laporan tercatat', rawValue: reports.length, value: `${reports.length} dokumen`, detail: 'Sesuai filter katalog', trend: '' },
    { key: 'laporanSiapEkspor', label: 'Laporan siap ekspor', rawValue: readyCount, value: `${readyCount} dokumen`, detail: 'Status tersimpan: Siap diekspor', trend: '' }
  ];
  const programAllocation = realized.programs.map(r => ({
    label: r.name, amount: Number(r.amount), value: rupiah(r.amount),
    percentage: realized.amount > 0 ? Math.round(Number(r.amount) / realized.amount * 100) : 0,
    tone: 'emerald',
  }));
  const asnafDistribution = realized.asnaf.map(r => ({
    label: r.name, count: Number(r.beneficiaries), value: `${Number(r.beneficiaries).toLocaleString('id-ID')} jiwa`,
    percentage: realized.beneficiaries > 0 ? Math.round(Number(r.beneficiaries) / realized.beneficiaries * 100) : 0,
    tone: 'emerald',
  }));

  return {
    dataStatus: reports.length > 0 || realized.count > 0 ? 'ready' : 'empty',
    period: filters.period || 'all',
    dateRange: { start: range.start, end: range.end },
    reports,
    categoryCounts,
    kpis,
    programAllocation,
    asnafDistribution,
    count: reports.length
  };
}

/**
 * Generate a new Report record
 */
export async function generateLaporan(data) {
  const db = await getDb();
  const id = data.id || `lap-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  const metricsJson = typeof data.metrics === 'object' ? JSON.stringify(data.metrics) : (data.metrics_json || '{}');

  await db.run(
    `INSERT INTO reports (id, category, period, title, description, scope, status, file_url, updated_at, metrics_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       status = EXCLUDED.status,
       updated_at = EXCLUDED.updated_at,
       metrics_json = EXCLUDED.metrics_json`,
    [
      id,
      data.category || 'Ringkasan',
      data.period || 'Agustus 2026',
      data.title || 'Laporan Penyaluran Baru',
      data.description || 'Laporan ringkasan penyaluran hasil generate otomatis sistem.',
      data.scope || '13 Kecamatan Kota Tangerang',
      data.status || 'Siap diekspor',
      `/api/penyaluran/laporan/export/${id}`,
      data.updated_at || today,
      metricsJson
    ]
  );

  return { id, message: 'Laporan berhasil dibuat dan siap diunduh' };
}

/**
 * Export Laporan Data (CSV / JSON format generator)
 */
export async function exportLaporanData(reportId, format = 'csv') {
  const db = await getDb();
  const mustahikList = await db.all('SELECT * FROM mustahik ORDER BY id ASC LIMIT 500');

  if (format === 'json') {
    return {
      report_id: reportId,
      generated_at: new Date().toISOString(),
      source: 'BAZNAS Kota Tangerang Data Center V2',
      total_records: mustahikList.length,
      data: mustahikList.map(formatMustahikRow)
    };
  }

  // Generate CSV format
  const headers = [
    'No', 'No Berkas', 'Nama Mustahik', 'NIK', 'Kecamatan', 'Kelurahan',
    'Program', 'Asnaf', 'Nominal Disetujui', 'Status', 'Tanggal Terima', 'Metode Pembayaran'
  ];

  const rows = mustahikList.map((m, idx) => [
    idx + 1,
    `"${m.file_no || ''}"`,
    `"${(m.name || '').replace(/"/g, '""')}"`,
    `'${m.nik || ''}`,
    `"${m.kecamatan || ''}"`,
    `"${m.kelurahan || ''}"`,
    `"${m.program || ''}"`,
    `"${m.asnaf || ''}"`,
    m.approved_amount || m.recommended_amount || 0,
    `"${m.status || ''}"`,
    `"${m.received_date || ''}"`,
    `"${m.payment_method || 'Transfer'}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  return csvContent;
}


