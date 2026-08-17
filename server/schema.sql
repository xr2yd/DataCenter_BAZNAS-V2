-- ====================================================================
-- BAZNAS Data Center V2 - PostgreSQL DDL Schema
-- ====================================================================

-- 1. Table: mustahik (Master Data 60 Columns)
CREATE TABLE IF NOT EXISTS mustahik (
    id SERIAL PRIMARY KEY,
    file_no VARCHAR(50) UNIQUE,
    received_date VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    applicant_status VARCHAR(50) DEFAULT 'Perorangan',
    beneficiary_name VARCHAR(255),
    nik VARCHAR(50),
    kk_number VARCHAR(50),
    phone VARCHAR(50),
    marital_status VARCHAR(50),
    pob VARCHAR(100),
    dob VARCHAR(50),
    occupation VARCHAR(100),
    work_place VARCHAR(150),
    education_level VARCHAR(50),
    address TEXT,
    rt_rw VARCHAR(50),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten_kota VARCHAR(100) DEFAULT 'Kota Tangerang',
    province VARCHAR(100) DEFAULT 'Banten',
    survey_date VARCHAR(50),
    surveyor_name VARCHAR(150),
    surveyor_phone VARCHAR(50),
    house_ownership VARCHAR(50),
    family_dependents INTEGER DEFAULT 0,
    monthly_income NUMERIC(15, 2) DEFAULT 0,
    monthly_expense NUMERIC(15, 2) DEFAULT 0,
    remaining_income NUMERIC(15, 2) DEFAULT 0,
    survey_recommendation TEXT,
    survey_notes TEXT,
    application_count INTEGER DEFAULT 1,
    beneficiary_count INTEGER DEFAULT 1,
    priority VARCHAR(50),
    recommended_amount NUMERIC(15, 2) DEFAULT 0,
    approved_amount NUMERIC(15, 2) DEFAULT 0,
    mpzis_date VARCHAR(50),
    ppd_number VARCHAR(100),
    disbursement_date VARCHAR(50),
    payment_method VARCHAR(50),
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    bank_account_name VARCHAR(150),
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
    overall_score NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: applications
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    application_number VARCHAR(100),
    program VARCHAR(100),
    request_title TEXT,
    status VARCHAR(100) DEFAULT 'Diajukan',
    notes TEXT,
    rejection_reason TEXT,
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: assessments (F-BPP/04)
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    surveyor_name VARCHAR(150),
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
    overall_score NUMERIC(5, 2),
    priority VARCHAR(50),
    recommendation TEXT,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: mpzis (F-BPP/06)
CREATE TABLE IF NOT EXISTS mpzis (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    form_number VARCHAR(100),
    mpzis_date VARCHAR(50),
    program_classification VARCHAR(150),
    purpose TEXT,
    asnaf VARCHAR(100),
    fund_source VARCHAR(100),
    recipient_name VARCHAR(255),
    recipient_type VARCHAR(100),
    beneficiary_count INTEGER DEFAULT 1,
    approved_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    proposed_by VARCHAR(150),
    examined_by VARCHAR(150),
    ashnaf_verifier VARCHAR(150),
    responsible VARCHAR(150),
    approved_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: ppd (F-PKP/03)
CREATE TABLE IF NOT EXISTS ppd (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    form_number VARCHAR(100),
    ppd_number VARCHAR(100),
    transaction_number VARCHAR(100),
    requester_name VARCHAR(150),
    requester_role VARCHAR(100),
    requester_department VARCHAR(100),
    amount NUMERIC(15, 2) DEFAULT 0,
    amount_in_words TEXT,
    purpose TEXT,
    fund_source VARCHAR(100),
    bank_account_info TEXT,
    payment_type VARCHAR(50),
    disbursement_date VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    doc_type VARCHAR(100),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: wa_logs
CREATE TABLE IF NOT EXISTS wa_logs (
    id SERIAL PRIMARY KEY,
    mustahik_id INTEGER NOT NULL REFERENCES mustahik(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    phase VARCHAR(100),
    message TEXT,
    wa_url TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: bot_sessions
CREATE TABLE IF NOT EXISTS bot_sessions (
    chat_id BIGINT PRIMARY KEY,
    state VARCHAR(50) DEFAULT 'idle',
    temp_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_mustahik_file_no ON mustahik(file_no);
CREATE INDEX IF NOT EXISTS idx_mustahik_nik ON mustahik(nik);
CREATE INDEX IF NOT EXISTS idx_mustahik_phone ON mustahik(phone);
CREATE INDEX IF NOT EXISTS idx_mustahik_status ON mustahik(status);
CREATE INDEX IF NOT EXISTS idx_mustahik_kecamatan ON mustahik(kecamatan);
CREATE INDEX IF NOT EXISTS idx_mustahik_created_at ON mustahik(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_mustahik_id ON applications(mustahik_id);
CREATE INDEX IF NOT EXISTS idx_assessments_mustahik_id ON assessments(mustahik_id);
CREATE INDEX IF NOT EXISTS idx_mpzis_mustahik_id ON mpzis(mustahik_id);
CREATE INDEX IF NOT EXISTS idx_ppd_mustahik_id ON ppd(mustahik_id);
CREATE INDEX IF NOT EXISTS idx_documents_mustahik_id ON documents(mustahik_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_mustahik_id ON wa_logs(mustahik_id);
