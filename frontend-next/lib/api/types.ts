export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface CurrentUser {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'penyaluran' | 'surveyor' | 'penerimaan' | 'keuangan' | 'sdm';
  division?: string;
  avatar?: string;
}

export interface AssessmentRecord {
  id?: number | string;
  surveyor_name?: string;
  surveyor_phone?: string;
  survey_date?: string;
  survey_method?: string;
  house_index?: string;
  asset_index?: string;
  income_index?: string;
  spiritual_score?: number | string;
  overall_score?: number | string;
  priority?: string;
  recommendation?: string;
  narrative_conclusion?: string;
  notes?: string;
}

export interface Mustahik {
  id: number | string;
  file_no?: string;
  name: string;
  beneficiary_name?: string;
  nik: string;
  kk_number?: string;
  phone?: string;
  address?: string;
  subdistrict?: string;
  village?: string;
  rt_rw?: string;
  housing_status?: string;
  marital_status?: string;
  gender?: string;
  dob?: string;
  pob?: string;
  job?: string;
  family_dependents?: number;
  monthly_income?: number;
  monthly_expense?: number;
  asnaf?: string;
  program?: string;
  sub_program?: string;
  assistance_type?: string;
  recommended_amount?: number;
  approved_amount?: number;
  received_date?: string;
  status:
    | 'Diajukan'
    | 'Verifikasi Administrasi'
    | 'Survey'
    | 'Persetujuan MPZIS'
    | 'Pengajuan Dana (FPD)'
    | 'Pengajuan Dana (PPD)'
    | 'Penyaluran Selesai'
    | 'Ditolak'
    | string;
  priority?: string;
  bank_name?: string;
  bank_account?: string;
  bank_account_name?: string;
  assessments?: AssessmentRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface PenyaluranByKecamatan {
  id: string;
  name: string;
  totalMustahik: number;
  totalDisalurkan: number;
  desil1Count: number;
  topProgram?: string;
  urgencyLevel?: 'Tinggi' | 'Sedang' | 'Rendah';
  pilarBreakdown?: {
    pendidikan: number;
    kesehatan: number;
    kemanusiaan: number;
    ekonomi: number;
    dakwah: number;
  };
  kelurahanList?: string[];
  demo?: boolean;
}

export interface PenyaluranOverviewMetrics {
  totalPenyaluran: number;
  penyaluranBulanIni: number;
  totalMustahik: number;
  efektivitasPenyaluran: number;
  balance: number;
}
