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
  house_index?: string | number;
  asset_index?: string | number;
  income_index?: string | number;
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
  kecamatan?: string;
  kelurahan?: string;
  rt_rw?: string;
  housing_status?: string;
  marital_status?: string;
  gender?: string;
  dob?: string;
  pob?: string;
  job?: string;
  occupation?: string;
  family_dependents?: number;
  monthly_income?: number;
  monthly_expense?: number;
  remaining_income?: number;
  asnaf?: string;
  program?: string;
  sub_program?: string;
  assistance_type?: string;
  recommended_amount?: number;
  approved_amount?: number;
  received_date?: string;
  survey_date?: string;
  surveyor_name?: string;
  survey_recommendation?: string;
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
  rejection_reason?: string;
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
  dominantAsnaf?: string;
  urgencyLevel?: 'Tinggi' | 'Sedang' | 'Rendah';
  coordinates?: { lat: number; lng: number };
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
  totalJiwa?: number;
  efektivitasPenyaluran: number;
  targetRkat: number;
  balance: number;
  growthRate?: number;
  slaComplianceRate?: number;
}

export interface AsnafBreakdownItem {
  name: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface ProgramImpactItem {
  id: string;
  name: string;
  category: string;
  target: number;
  realizedAmount: number;
  beneficiariesCount: number;
  percentage: number;
  color: string;
  desc: string;
}

export interface MonthlyTrendItem {
  month: string;
  realisasi: number;
  target: number;
  mustahik: number;
}

export interface PenyaluranOverviewResponse {
  period: string;
  metrics: PenyaluranOverviewMetrics;
  monthlyTrend: MonthlyTrendItem[];
  asnafBreakdown: AsnafBreakdownItem[];
  programImpact: ProgramImpactItem[];
  actionRail: {
    slaCounts: {
      perluTindakan: number;
      lewatSla: number;
      dokumenKurang: number;
    };
    queueItems: Mustahik[];
    recentActivities: ActivityLogItem[];
  };
}

export interface PilarInitiative {
  id?: number | string;
  code: string;
  name: string;
  pic: string;
  status: string;
  nextMilestone?: string;
  next_milestone?: string;
  mustahik?: string;
  realized?: string;
  pct?: number;
  pilar_id?: string;
  pilarId?: string;
  mustahik_target?: number;
  mustahikTarget?: number;
  mustahik_count?: number;
  budget_amount?: number;
  budgetAmount?: number;
  realized_amount?: number;
  realizedAmount?: number;
}

export interface PilarProgramData {
  id: string;
  pilarNum: string;
  name: string;
  category: string;
  amount: string;
  rawAmount: number;
  rawBudget: number;
  percentage: number;
  beneficiaries: string;
  color: string;
  impactDesc: string;
  metrics: {
    primaryLabel: string;
    primaryValue: string;
    primaryGrowth: string;
    successLabel: string;
    successValue: string;
    successRate: string;
    avgLabel: string;
    avgValue: string;
    progLabel: string;
    progValue: string;
    districtLabel: string;
    districtValue: string;
    newLabel: string;
    newValue: string;
  };
  monthlyBars: Array<{ m: string; realisasi: number; target: number; active: boolean }>;
  asnafBreakdown: Array<{ name: string; count: string; pct: string; color: string }>;
  topKecamatan: Array<{ rank: number; name: string; count: string; pct: string }>;
  subPrograms: PilarInitiative[];
}

export interface MustahikStageCounts {
  all: number;
  diajukan: number;
  verifikasi: number;
  survey: number;
  mpzis: number;
  ppd: number;
  selesai: number;
  ditolak: number;
}

export interface MustahikDecisionPayload {
  action: 'approve' | 'reject';
  target_status?: string;
  notes?: string;
  reason?: string;
  surveyor_name?: string;
  approved_amount?: number;
  overall_score?: number;
  actor_name?: string;
}

export interface PublicApplicationResult {
  id: number | string;
  file_no: string;
  received_date?: string;
  name?: string;
  program?: string;
  status?: Mustahik['status'];
}

export interface PublicTrackingTimelineItem {
  phase: number;
  name: string;
  description?: string;
  date?: string | null;
  status: 'completed' | 'active' | 'pending' | 'rejected';
}

export interface PublicTrackingResult {
  mustahik: Pick<Mustahik, 'file_no' | 'name' | 'kecamatan' | 'program' | 'asnaf' | 'status' | 'received_date'>;
  timeline?: PublicTrackingTimelineItem[];
  status?: Mustahik['status'];
  is_rejected?: boolean;
  rejection_reason?: string;
}

export interface PenyaluranTransaction {
  id: number | string;
  mustahik_id: number | string;
  transaction_number?: string;
  ppd_number?: string;
  form_number?: string;
  amount: number;
  purpose?: string;
  payment_type?: string;
  disbursement_date?: string;
  created_at?: string;
  file_no?: string;
  recipient_name: string;
  program?: string;
  asnaf?: string;
  kecamatan?: string;
  status: Mustahik['status'];
}

export interface MasterDataRecord {
  id: number | string;
  category: string;
  record_key: string;
  label: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface ActivityLogItem {
  id: number;
  mustahik_id: number;
  actor_name: string;
  action_type: string;
  title: string;
  description: string;
  old_status?: string;
  new_status?: string;
  created_at: string;
}

export interface ApprovalDecision {
  id: number | string;
  mustahik_id: number | string;
  stage: string;
  action: 'approve' | 'reject' | 'return' | 'hold';
  previous_status: string;
  next_status: string;
  note: string;
  approved_amount?: number | null;
  actor_id?: number | string | null;
  actor_name: string;
  actor_role: string;
  file_no?: string;
  mustahik_name?: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  category: string;
  period: string;
  title: string;
  description: string;
  scope: string;
  status: 'Siap diekspor' | 'Perlu pembaruan' | 'Arsip';
  file_url: string;
  updated_at: string;
  metrics?: Record<string, unknown>;
}

export interface ReportKpi {
  label: string;
  value: string;
  detail: string;
  trend: string;
}

export interface ReportDistributionItem {
  label: string;
  value: string;
  percentage: number;
  tone: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';
}

export interface ReportListResponse {
  success: boolean;
  reports: ReportItem[];
  kpis: ReportKpi[];
  programAllocation: ReportDistributionItem[];
  asnafDistribution: ReportDistributionItem[];
  count: number;
}
