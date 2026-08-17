import { getDb, MUSTAHIK_COLUMNS } from './db.js';
export { getDb } from './db.js';

// Format: MST-YYYYMM-XXXX (e.g. MST-202608-0001)
export async function generateNextFileNo(date = new Date()) {
  const db = await getDb();
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const prefix = `MST-${year}${month}-`;

  const latest = await db.get(
    `SELECT file_no FROM mustahik WHERE file_no LIKE ? ORDER BY file_no DESC LIMIT 1`,
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

export async function listMustahik(filters = {}) {
  const db = await getDb();
  let query = 'SELECT * FROM mustahik';
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.program) {
    conditions.push('program = ?');
    params.push(filters.program);
  }

  if (filters.search) {
    conditions.push('(name LIKE ? OR file_no LIKE ? OR nik LIKE ? OR phone LIKE ? OR kecamatan LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term, term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';
  return db.all(query, params);
}

export async function getMustahikById(id) {
  const db = await getDb();
  const mustahik = await db.get('SELECT * FROM mustahik WHERE id = ?', id);
  if (!mustahik) return null;

  const applications = await db.all('SELECT * FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC', id);
  const assessments = await db.all('SELECT * FROM assessments WHERE mustahik_id = ? ORDER BY created_at DESC', id);
  const mpzis = await db.all('SELECT * FROM mpzis WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?) ORDER BY created_at DESC', id, id);
  const ppd = await db.all('SELECT * FROM ppd WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?) ORDER BY created_at DESC', id, id);
  const documents = await db.all('SELECT * FROM documents WHERE mustahik_id = ? ORDER BY uploaded_at DESC', id);
  const waLogs = await db.all('SELECT * FROM wa_logs WHERE mustahik_id = ? ORDER BY sent_at DESC', id);

  return {
    ...mustahik,
    applications,
    assessments,
    mpzis,
    ppd,
    documents,
    wa_logs: waLogs
  };
}

export async function getMustahikByFileNo(fileNo) {
  const db = await getDb();
  return db.get('SELECT * FROM mustahik WHERE file_no = ?', fileNo);
}

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
      placeholders.push('?');
      values.push(payload[col]);
    }
  }

  const result = await db.run(
    `INSERT INTO mustahik (${cols.join(',')}) VALUES (${placeholders.join(',')})`,
    values
  );

  const mustahikId = result.lastID;

  // Create initial application
  await db.run(
    `INSERT INTO applications (mustahik_id, application_number, program, request_title, status) VALUES (?, ?, ?, ?, ?)`,
    [mustahikId, fileNo, payload.program || '', payload.request_title || '', payload.status]
  );

  return mustahikId;
}

export async function updateMustahik(id, data) {
  const db = await getDb();

  const allowedCols = MUSTAHIK_COLUMNS.map(c => c.name).filter(n => n !== 'id' && n !== 'created_at' && n !== 'updated_at');

  const updates = [];
  const values = [];

  // Compute remaining_income if income or expense updated
  let newIncome = data.monthly_income;
  let newExpense = data.monthly_expense;
  if ((newIncome !== undefined || newExpense !== undefined) && data.remaining_income === undefined) {
    const current = await db.get('SELECT monthly_income, monthly_expense FROM mustahik WHERE id = ?', id);
    if (current) {
      const inc = newIncome !== undefined ? parseFloat(newIncome) : (current.monthly_income || 0);
      const exp = newExpense !== undefined ? parseFloat(newExpense) : (current.monthly_expense || 0);
      data.remaining_income = inc - exp;
    }
  }

  for (const col of allowedCols) {
    if (data[col] !== undefined) {
      updates.push(`${col} = ?`);
      values.push(data[col]);
    }
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await db.run(`UPDATE mustahik SET ${updates.join(', ')} WHERE id = ?`, values);

  // Sync status to latest application
  if (data.status) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', id);
    if (latestApp) {
      await db.run('UPDATE applications SET status = ? WHERE id = ?', [data.status, latestApp.id]);
    }
  }

  return true;
}

export async function deleteMustahik(id) {
  const db = await getDb();
  await db.run('DELETE FROM wa_logs WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM documents WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM ppd WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?)', id, id);
  await db.run('DELETE FROM mpzis WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?)', id, id);
  await db.run('DELETE FROM assessments WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM applications WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM mustahik WHERE id = ?', id);
  return true;
}

export async function createPublicApplication(data, files = []) {
  const db = await getDb();
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
        else if (docType === 'sktm') docType = 'SKTM';
        else if (docType === 'proposal') docType = 'Proposal';

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

export async function trackApplication(query) {
  const db = await getDb();
  if (!query) return null;

  const q = String(query).trim();
  const mustahik = await db.get(
    `SELECT * FROM mustahik WHERE file_no = ? OR nik = ? OR phone = ? OR kk_number = ? ORDER BY id DESC LIMIT 1`,
    [q, q, q, q]
  );

  if (!mustahik) {
    // Try partial file_no match
    const partial = await db.get(
      `SELECT * FROM mustahik WHERE file_no LIKE ? OR nik LIKE ? ORDER BY id DESC LIMIT 1`,
      [`%${q}%`, `%${q}%`]
    );
    if (!partial) return null;
    return trackApplication(partial.file_no);
  }

  const applications = await db.all('SELECT * FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC', mustahik.id);
  const assessments = await db.all('SELECT * FROM assessments WHERE mustahik_id = ? ORDER BY created_at DESC', mustahik.id);
  const mpzis = await db.all('SELECT * FROM mpzis WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?) ORDER BY created_at DESC', mustahik.id, mustahik.id);
  const ppd = await db.all('SELECT * FROM ppd WHERE mustahik_id = ? OR application_id IN (SELECT id FROM applications WHERE mustahik_id = ?) ORDER BY created_at DESC', mustahik.id, mustahik.id);
  const documents = await db.all('SELECT * FROM documents WHERE mustahik_id = ? ORDER BY uploaded_at DESC', mustahik.id);
  const waLogs = await db.all('SELECT * FROM wa_logs WHERE mustahik_id = ? ORDER BY sent_at DESC', mustahik.id);

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
      description: assessments[0]
        ? `Survey lapangan oleh ${assessments[0].surveyor_name || 'Petugas'} (${assessments[0].recommendation || 'Diproses'})`
        : 'Survey faktual ke kediaman mustahik (Form F-BPP/04).',
      date: mustahik.survey_date || assessments[0]?.survey_date || null,
      status: isRejected ? 'rejected' : (currentIndex >= 2 ? 'completed' : (currentIndex === 1 ? 'active' : 'pending'))
    },
    {
      phase: 4,
      name: 'Persetujuan MPZIS & Pengajuan Dana',
      description: mustahik.approved_amount
        ? `Disetujui MPZIS: Rp ${mustahik.approved_amount.toLocaleString('id-ID')} (Form F-BPP/06 & F-PKP/03)`
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
      date: mustahik.disbursement_date || ppd[0]?.disbursement_date || null,
      status: isRejected ? 'rejected' : (currentIndex >= 5 ? 'completed' : (currentIndex === 4 ? 'active' : 'pending'))
    }
  ];

  return {
    mustahik,
    status: currentStatus,
    is_rejected: isRejected,
    rejection_reason: mustahik.rejection_reason || '',
    timeline,
    applications,
    assessments,
    mpzis,
    ppd,
    documents,
    wa_logs: waLogs
  };
}

export async function addAssessment(mustahikId, data) {
  const db = await getDb();

  const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahikId);
  const applicationId = latestApp?.id || data.application_id || null;

  const result = await db.run(
    `INSERT INTO assessments (
      mustahik_id, application_id, surveyor_name, surveyor_phone, survey_date, survey_method,
      narrative_family, narrative_income, narrative_request, narrative_conclusion,
      house_index, asset_index, income_index, spiritual_score, overall_score,
      priority, recommendation, notes, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      data.house_index !== undefined ? parseInt(data.house_index, 10) : null,
      data.asset_index !== undefined ? parseInt(data.asset_index, 10) : null,
      data.income_index !== undefined ? parseInt(data.income_index, 10) : null,
      data.spiritual_score !== undefined ? parseInt(data.spiritual_score, 10) : null,
      data.overall_score !== undefined ? parseFloat(data.overall_score) : null,
      data.priority ? String(data.priority) : null,
      data.recommendation || data.survey_recommendation || 'Layak',
      data.notes || data.survey_notes || null,
      data.photos ? JSON.stringify(data.photos) : null
    ]
  );

  // Update mustahik with survey details and status = 'Survey'
  const monthlyInc = data.monthly_income !== undefined ? parseFloat(data.monthly_income) : undefined;
  const monthlyExp = data.monthly_expense !== undefined ? parseFloat(data.monthly_expense) : undefined;
  const remInc = (monthlyInc !== undefined && monthlyExp !== undefined) ? (monthlyInc - monthlyExp) : undefined;

  const updateFields = {
    status: 'Survey',
    survey_date: data.survey_date || new Date().toISOString().split('T')[0],
    surveyor_name: data.surveyor_name,
    surveyor_phone: data.surveyor_phone,
    survey_recommendation: data.recommendation || data.survey_recommendation,
    survey_notes: data.notes || data.survey_notes,
    house_ownership: data.house_ownership,
    family_dependents: data.family_dependents !== undefined ? parseInt(data.family_dependents, 10) : undefined,
    monthly_income: monthlyInc,
    monthly_expense: monthlyExp,
    remaining_income: remInc,
    house_index: data.house_index !== undefined ? parseInt(data.house_index, 10) : undefined,
    asset_index: data.asset_index !== undefined ? parseInt(data.asset_index, 10) : undefined,
    income_index: data.income_index !== undefined ? parseInt(data.income_index, 10) : undefined,
    spiritual_score: data.spiritual_score !== undefined ? parseInt(data.spiritual_score, 10) : undefined,
    overall_score: data.overall_score !== undefined ? parseFloat(data.overall_score) : undefined,
    priority: data.priority ? String(data.priority) : undefined,
    recommended_amount: data.recommended_amount !== undefined ? parseFloat(data.recommended_amount) : undefined,
    desil_score: data.desil_score !== undefined ? parseInt(data.desil_score, 10) : undefined
  };

  await updateMustahik(mustahikId, updateFields);

  return result.lastID;
}

export async function addMpzis(mustahikIdOrData, maybeData) {
  const db = await getDb();
  let mustahikId = typeof mustahikIdOrData === 'object' ? mustahikIdOrData.mustahik_id : mustahikIdOrData;
  let data = typeof mustahikIdOrData === 'object' ? mustahikIdOrData : maybeData;

  let applicationId = data.application_id;
  if (!applicationId && mustahikId) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahikId);
    applicationId = latestApp?.id || null;
  }

  if (!mustahikId && applicationId) {
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = ?', applicationId);
    mustahikId = app?.mustahik_id || null;
  }

  const result = await db.run(
    `INSERT INTO mpzis (
      mustahik_id, application_id, form_number, mpzis_date, program_classification, purpose,
      asnaf, fund_source, recipient_name, recipient_type, beneficiary_count, total_amount,
      proposed_by, examined_by, ashnaf_verifier, responsible, approved_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

export async function addPpd(mustahikIdOrData, maybeData) {
  const db = await getDb();
  let mustahikId = typeof mustahikIdOrData === 'object' ? mustahikIdOrData.mustahik_id : mustahikIdOrData;
  let data = typeof mustahikIdOrData === 'object' ? mustahikIdOrData : maybeData;

  let applicationId = data.application_id;
  if (!applicationId && mustahikId) {
    const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahikId);
    applicationId = latestApp?.id || null;
  }

  if (!mustahikId && applicationId) {
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = ?', applicationId);
    mustahikId = app?.mustahik_id || null;
  }

  const result = await db.run(
    `INSERT INTO ppd (
      mustahik_id, application_id, form_number, ppd_number, transaction_number, requester_name,
      requester_role, requester_department, amount, amount_in_words, purpose, fund_source,
      bank_account_info, payment_type, disbursement_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      data.fund_source ? (Array.isArray(data.fund_source) ? JSON.stringify(data.fund_source) : String(data.fund_source)) : 'Zakat',
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

export async function addDocument(mustahikId, docData) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO documents (mustahik_id, doc_type, filename, original_name, file_url, uploaded_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [mustahikId, docData.doc_type, docData.filename, docData.original_name, docData.file_url]
  );
  return result.lastID;
}

export async function getDocuments(mustahikId) {
  const db = await getDb();
  return db.all('SELECT * FROM documents WHERE mustahik_id = ? ORDER BY uploaded_at DESC', mustahikId);
}

export async function addWaLog(logData) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO wa_logs (mustahik_id, phone, phase, message, wa_url, status, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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

export async function getWaLogs(mustahikId) {
  const db = await getDb();
  return db.all('SELECT * FROM wa_logs WHERE mustahik_id = ? ORDER BY sent_at DESC', mustahikId);
}

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

export function generateWaMessage(phase, mustahik) {
  const nama = mustahik.name || 'Mustahik';
  const fileNo = mustahik.file_no || '-';
  const program = mustahik.program || 'Bantuan BAZNAS';
  const nominal = mustahik.approved_amount ? `Rp ${mustahik.approved_amount.toLocaleString('id-ID')}` : 'Rp -';
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

export async function exportMustahikData() {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM mustahik ORDER BY id ASC');

  // Format all 60 master columns explicitly
  return rows.map(r => ({
    id: r.id,
    file_no: r.file_no,
    received_date: r.received_date,
    name: r.name,
    applicant_status: r.applicant_status,
    beneficiary_name: r.beneficiary_name,
    nik: r.nik,
    kk_number: r.kk_number,
    phone: r.phone,
    marital_status: r.marital_status,
    pob: r.pob,
    dob: r.dob,
    occupation: r.occupation,
    work_place: r.work_place,
    education_level: r.education_level,
    address: r.address,
    rt_rw: r.rt_rw,
    kelurahan: r.kelurahan,
    kecamatan: r.kecamatan,
    kabupaten_kota: r.kabupaten_kota,
    province: r.province,
    survey_date: r.survey_date,
    surveyor_name: r.surveyor_name,
    surveyor_phone: r.surveyor_phone,
    house_ownership: r.house_ownership,
    family_dependents: r.family_dependents,
    monthly_income: r.monthly_income,
    monthly_expense: r.monthly_expense,
    remaining_income: r.remaining_income,
    survey_recommendation: r.survey_recommendation,
    survey_notes: r.survey_notes,
    application_count: r.application_count,
    beneficiary_count: r.beneficiary_count,
    priority: r.priority,
    recommended_amount: r.recommended_amount,
    approved_amount: r.approved_amount,
    mpzis_date: r.mpzis_date,
    ppd_number: r.ppd_number,
    disbursement_date: r.disbursement_date,
    payment_method: r.payment_method,
    bank_account: r.bank_account,
    bank_name: r.bank_name,
    bank_account_name: r.bank_account_name,
    asnaf: r.asnaf,
    fund_source: r.fund_source,
    distribution_purpose: r.distribution_purpose,
    parent_occupation: r.parent_occupation,
    desil_score: r.desil_score,
    program: r.program,
    request_title: r.request_title,
    status: r.status,
    rejection_reason: r.rejection_reason,
    house_index: r.house_index,
    asset_index: r.asset_index,
    income_index: r.income_index,
    spiritual_score: r.spiritual_score,
    overall_score: r.overall_score,
    notes: r.notes,
    created_at: r.created_at,
    updated_at: r.updated_at
  }));
}

export async function getStatusByFileNo(fileNo) {
  return trackApplication(fileNo);
}

