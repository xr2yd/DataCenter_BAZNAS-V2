import { getDb, MUSTAHIK_COLUMNS } from './db.js';
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
export async function trackApplication(query) {
  const db = await getDb();
  if (!query) return null;

  const q = String(query).trim();
  const mustahik = await db.get(
    `SELECT * FROM mustahik WHERE file_no ILIKE $1 OR nik ILIKE $2 OR phone ILIKE $3 OR kk_number ILIKE $4 ORDER BY id DESC LIMIT 1`,
    [q, q, q, q]
  );

  if (!mustahik) {
    // Try partial search
    const partial = await db.get(
      `SELECT * FROM mustahik WHERE file_no ILIKE $1 OR nik ILIKE $2 ORDER BY id DESC LIMIT 1`,
      [`%${q}%`, `%${q}%`]
    );
    if (!partial) return null;
    return trackApplication(partial.file_no);
  }

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

