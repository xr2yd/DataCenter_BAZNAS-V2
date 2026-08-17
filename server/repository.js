import { getDb } from './db.js';
export { getDb } from './db.js';

export async function listMustahik() {
  const db = await getDb();
  return db.all('SELECT * FROM mustahik ORDER BY created_at DESC');
}

export async function getMustahikById(id) {
  const db = await getDb();
  const mustahik = await db.get('SELECT * FROM mustahik WHERE id = ?', id);
  if (!mustahik) return null;

  const applications = await db.all('SELECT * FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC', id);
  const assessments = await db.all('SELECT * FROM assessments WHERE mustahik_id = ? ORDER BY created_at DESC', id);

  // fetch mpzis/ppd per application
  const fullApplications = await Promise.all(
    applications.map(async (app) => {
      const mpzis = await db.all('SELECT * FROM mpzis WHERE application_id = ?', app.id);
      const ppd = await db.all('SELECT * FROM ppd WHERE application_id = ?', app.id);
      return { ...app, mpzis, ppd };
    })
  );

  return { ...mustahik, applications: fullApplications, assessments };
}

export async function getMustahikByFileNo(fileNo) {
  const db = await getDb();
  return db.get('SELECT * FROM mustahik WHERE file_no = ?', fileNo);
}

export async function createMustahik(data) {
  const db = await getDb();

  const fields = [
    'file_no', 'received_date', 'name', 'beneficiary_name', 'nik', 'kk_number', 'phone',
    'marital_status', 'dob', 'address', 'rt_rw', 'kelurahan', 'kecamatan', 'kabupaten_kota', 'province',
    'occupation', 'education_level', 'house_ownership', 'family_dependents', 'monthly_income', 'monthly_expense',
    'asnaf', 'program', 'request_title', 'status', 'priority', 'recommended_amount', 'approved_amount',
    'payment_method', 'bank_account', 'bank_name', 'bank_account_name'
  ];

  const placeholders = fields.map(() => '?').join(',');
  const values = fields.map(f => data[f] ?? null);

  const result = await db.run(
    `INSERT INTO mustahik (${fields.join(',')}) VALUES (${placeholders})`,
    values
  );

  const mustahikId = result.lastID;

  // create initial application
  await db.run(
    `INSERT INTO applications (mustahik_id, application_number, program, request_title, status) VALUES (?, ?, ?, ?, ?)`,
    [mustahikId, data.application_number || data.file_no, data.program, data.request_title, data.status || 'Diajukan']
  );

  return mustahikId;
}

export async function updateMustahik(id, data) {
  const db = await getDb();

  const allowed = [
    'file_no', 'received_date', 'name', 'beneficiary_name', 'nik', 'kk_number', 'phone',
    'marital_status', 'dob', 'address', 'rt_rw', 'kelurahan', 'kecamatan', 'kabupaten_kota', 'province',
    'occupation', 'education_level', 'house_ownership', 'family_dependents', 'monthly_income', 'monthly_expense',
    'asnaf', 'program', 'request_title', 'status', 'priority', 'recommended_amount', 'approved_amount',
    'payment_method', 'bank_account', 'bank_name', 'bank_account_name'
  ];

  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await db.run(`UPDATE mustahik SET ${updates.join(', ')} WHERE id = ?`, values);

  // sync status ke applications terbaru
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
  await db.run('DELETE FROM assessments WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM applications WHERE mustahik_id = ?', id);
  await db.run('DELETE FROM mustahik WHERE id = ?', id);
  return true;
}

export async function addAssessment(mustahikId, data) {
  const db = await getDb();

  const latestApp = await db.get('SELECT id FROM applications WHERE mustahik_id = ? ORDER BY applied_at DESC LIMIT 1', mustahikId);
  const applicationId = latestApp?.id || data.application_id || null;

  const result = await db.run(
    `INSERT INTO assessments (mustahik_id, application_id, surveyor_name, surveyor_phone, survey_date, survey_method,
    narrative_family, narrative_income, narrative_request, narrative_conclusion,
    house_index, asset_index, income_index, spiritual_score, overall_score, priority, recommendation, notes, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mustahikId, applicationId, data.surveyor_name, data.surveyor_phone, data.survey_date, data.survey_method,
      data.narrative_family, data.narrative_income, data.narrative_request, data.narrative_conclusion,
      data.house_index, data.asset_index, data.income_index, data.spiritual_score, data.overall_score,
      data.priority, data.recommendation, data.notes, data.photos ? JSON.stringify(data.photos) : null
    ]
  );

  // update status mustahik ke Survey
  await db.run("UPDATE mustahik SET status = 'Survey', updated_at = CURRENT_TIMESTAMP WHERE id = ?", mustahikId);
  if (applicationId) {
    await db.run("UPDATE applications SET status = 'Survey' WHERE id = ?", applicationId);
  }

  return result.lastID;
}

export async function addMpzis(data) {
  const db = await getDb();

  const result = await db.run(
    `INSERT INTO mpzis (application_id, form_number, mpzis_date, program_classification, purpose, asnaf, fund_source,
    recipient_name, recipient_type, beneficiary_count, total_amount, proposed_by, examined_by, ashnaf_verifier,
    responsible, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.application_id, data.form_number, data.mpzis_date, data.program_classification, data.purpose,
      data.asnaf, data.fund_source, data.recipient_name, data.recipient_type, data.beneficiary_count,
      data.total_amount, data.proposed_by, data.examined_by, data.ashnaf_verifier, data.responsible, data.approved_by
    ]
  );

  // update status ke Persetujuan MPZIS
  if (data.application_id) {
    await db.run("UPDATE applications SET status = 'Persetujuan MPZIS' WHERE id = ?", data.application_id);
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = ?', data.application_id);
    if (app) {
      await db.run("UPDATE mustahik SET status = 'Persetujuan MPZIS', approved_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [data.total_amount || null, app.mustahik_id]);
    }
  }

  return result.lastID;
}

export async function addPpd(data) {
  const db = await getDb();

  const result = await db.run(
    `INSERT INTO ppd (application_id, form_number, transaction_number, requester_name, requester_role, requester_department,
    amount, amount_in_words, purpose, fund_source, bank_account_info, payment_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.application_id, data.form_number, data.transaction_number, data.requester_name, data.requester_role,
      data.requester_department, data.amount, data.amount_in_words, data.purpose,
      data.fund_source ? JSON.stringify(data.fund_source) : null, data.bank_account_info, data.payment_type
    ]
  );

  // update status ke Pengajuan Dana (FPD)
  if (data.application_id) {
    await db.run("UPDATE applications SET status = 'Pengajuan Dana (FPD)' WHERE id = ?", data.application_id);
    const app = await db.get('SELECT mustahik_id FROM applications WHERE id = ?', data.application_id);
    if (app) {
      await db.run("UPDATE mustahik SET status = 'Pengajuan Dana (FPD)', updated_at = CURRENT_TIMESTAMP WHERE id = ?", app.mustahik_id);
    }
  }

  return result.lastID;
}

export async function getStatusByFileNo(fileNo) {
  const db = await getDb();
  return db.get('SELECT id, file_no, name, status, program, request_title FROM mustahik WHERE file_no = ?', fileNo);
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
