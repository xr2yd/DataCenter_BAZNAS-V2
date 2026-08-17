import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
  MapPin,
  HeartHandshake,
  UserCheck,
  TrendingUp,
  Loader2,
  Calendar,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit,
  Phone,
  Home,
  CreditCard,
  ClipboardList,
  Upload,
  File,
  Image,
  Download,
  Printer,
  MessageCircle,
  ExternalLink,
  DollarSign,
  FileSpreadsheet,
  Check,
  Send,
  Building,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { api } from '../services/api';
import OfficialDocumentsModal from './OfficialDocumentsModal';

const TAB_FILTERS = [
  { id: 'all', label: 'Semua Data Mustahik (Master 60 Kolom)', statusMatch: null },
  { id: 'diajukan', label: 'Antrean Masuk (Diajukan)', statusMatch: 'Diajukan' },
  { id: 'administrasi', label: 'Verifikasi Administrasi', statusMatch: 'Verifikasi Administrasi' },
  { id: 'survey', label: 'Tahap Survey Lapangan', statusMatch: 'Survey' },
  { id: 'mpzis', label: 'Persetujuan MPZIS', statusMatch: 'Persetujuan MPZIS' },
  { id: 'ppd', label: 'Pengajuan Dana (PPD)', statusMatch: 'Pengajuan Dana (FPD)' },
  { id: 'selesai', label: 'Penyaluran Selesai', statusMatch: 'Penyaluran Selesai' },
];

const STATUS_OPTIONS = [
  'Diajukan',
  'Verifikasi Administrasi',
  'Survey',
  'Persetujuan MPZIS',
  'Pengajuan Dana (FPD)',
  'Penyaluran Selesai',
  'Ditolak',
];

const STATUS_COLORS = {
  'Diajukan': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  'Verifikasi Administrasi': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300',
  'Survey': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300',
  'Persetujuan MPZIS': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300',
  'Pengajuan Dana (FPD)': 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300',
  'Pengajuan Dana (PPD)': 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300',
  'Penyaluran Selesai': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300',
  'Ditolak': 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300',
};

const ASNAP_OPTIONS = ['Fakir', 'Miskin', 'Fisabilillah', 'Mualaf', 'Gharimin', 'Ibnu Sabil'];
const PROGRAM_OPTIONS = ['Pendidikan', 'Kesehatan', 'Kemanusiaan', 'Ekonomi', 'Dakwah Advokasi'];
const HOUSE_OPTIONS = ['Menumpang', 'Kontrak', 'Keluarga', 'Sendiri'];
const PAYMENT_OPTIONS = ['Transfer', 'Tunai'];
const MARITAL_OPTIONS = ['Menikah', 'Belum Menikah', 'Cerai Mati', 'Cerai Hidup', 'Lembaga'];

const emptyForm = {
  file_no: '',
  received_date: new Date().toISOString().split('T')[0],
  name: '',
  beneficiary_name: '',
  nik: '',
  kk_number: '',
  phone: '',
  marital_status: 'Menikah',
  dob: '',
  address: '',
  rt_rw: '',
  kelurahan: '',
  kecamatan: '',
  kabupaten_kota: 'Tangerang',
  province: 'Banten',
  occupation: '',
  education_level: '',
  house_ownership: 'Kontrak',
  family_dependents: '2',
  monthly_income: '',
  monthly_expense: '',
  asnaf: 'Miskin',
  program: 'Kemanusiaan',
  request_title: '',
  status: 'Diajukan',
  priority: 'Prioritas 2',
  recommended_amount: '',
  approved_amount: '',
  payment_method: 'Transfer',
  bank_account: '',
  bank_name: 'Bank Syariah Indonesia (BSI)',
  bank_account_name: '',
  documents: [],
};

export default function MustahikPage({ onNavigate }) {
  const [mustahikList, setMustahikList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab Filter
  const [activeTab, setActiveTab] = useState('all');

  // Search and Filter Dropdowns
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsnaf, setFilterAsnaf] = useState('Semua');
  const [filterProgram, setFilterProgram] = useState('Semua');

  // Sheets & Dialogs
  const [showAddEditSheet, setShowAddEditSheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Sheet
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Assessment Survey Modal (F-BPP/04)
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyTarget, setSurveyTarget] = useState(null);
  const [surveyForm, setSurveyForm] = useState({
    surveyor_name: 'Ahmad Verifikator',
    surveyor_phone: '08123456789',
    survey_date: new Date().toISOString().split('T')[0],
    survey_method: 'Kunjungan Langsung',
    house_index: 'Sangat Sederhana (Dinding semi permanen)',
    asset_index: 'Rendah (Hanya perabot dasar)',
    income_index: 'Di Bawah Had Kifayah (< Rp 1.500.000)',
    spiritual_score: '85',
    overall_score: '88',
    priority: 'Prioritas 1',
    recommendation: 'Layak Dibantu Penuh',
    narrative_conclusion: 'Kondisi ekonomi mustahik sangat memerlukan bantuan langsung tunai/program BAZNAS.',
    notes: 'Keluarga memiliki 3 anak sekolah.',
  });

  // MPZIS Approval Modal
  const [showMpzisModal, setShowMpzisModal] = useState(false);
  const [mpzisTarget, setMpzisTarget] = useState(null);
  const [mpzisForm, setMpzisForm] = useState({
    form_number: '',
    mpzis_date: new Date().toISOString().split('T')[0],
    program_classification: 'Kemanusiaan',
    purpose: 'Bantuan Biaya Hidup & Kebutuhan Pokok Mustahik',
    asnaf: 'Miskin',
    fund_source: 'Zakat Maal',
    recipient_name: '',
    recipient_type: 'Individu',
    beneficiary_count: 1,
    total_amount: '',
    proposed_by: 'Divisi Pendistribusian',
    examined_by: 'Kabid Penyaluran',
    ashnaf_verifier: 'Ust. H. Fauzan, Lc.',
    approved_by: 'Ketua BAZNAS RI',
  });

  // PPD Modal
  const [showPpdModal, setShowPpdModal] = useState(false);
  const [ppdTarget, setPpdTarget] = useState(null);
  const [ppdForm, setPpdForm] = useState({
    form_number: '',
    transaction_number: '',
    requester_name: 'Divisi Penyaluran BAZNAS',
    requester_role: 'Staf Penyaluran',
    requester_department: 'Pendistribusian & Pendayagunaan',
    amount: '',
    amount_in_words: '',
    purpose: 'Penyaluran Bantuan Zakat Program',
    bank_account_info: '',
    payment_type: 'Transfer Bank',
  });

  // WhatsApp Dialog
  const [showWaModal, setShowWaModal] = useState(false);
  const [waTarget, setWaTarget] = useState(null);
  const [waPhase, setWaPhase] = useState('diajukan');
  const [waCustomNotes, setWaCustomNotes] = useState('');
  const [waPreview, setWaPreview] = useState({ message: '', waUrl: '' });

  // Official Documents Print Modal
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [printDocType, setPrintDocType] = useState('FBPP04');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.listMustahik();
      setMustahikList(res.data || []);
    } catch (err) {
      console.error('Failed to load mustahik:', err);
      showToast('Gagal memuat data dari server: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Header Statistics
  const stats = useMemo(() => {
    const total = mustahikList.length;
    const antreanVerifikasi = mustahikList.filter((m) => m.status === 'Diajukan').length;
    const siapSurvey = mustahikList.filter((m) => m.status === 'Verifikasi Administrasi').length;
    const menungguMpzis = mustahikList.filter((m) => m.status === 'Survey').length;
    const siapPencairan = mustahikList.filter(
      (m) => m.status === 'Persetujuan MPZIS' || m.status === 'Pengajuan Dana (FPD)' || m.status === 'Pengajuan Dana (PPD)'
    ).length;
    const totalDana = mustahikList.reduce((sum, m) => sum + (Number(m.approved_amount) || Number(m.recommended_amount) || 0), 0);

    return { total, antreanVerifikasi, siapSurvey, menungguMpzis, siapPencairan, totalDana };
  }, [mustahikList]);

  // Tab Filtering & Search Filtering
  const filteredMustahik = useMemo(() => {
    const currentTab = TAB_FILTERS.find((t) => t.id === activeTab);
    return mustahikList.filter((m) => {
      // Tab filter
      if (currentTab && currentTab.statusMatch) {
        if (currentTab.id === 'ppd') {
          if (m.status !== 'Pengajuan Dana (FPD)' && m.status !== 'Pengajuan Dana (PPD)') return false;
        } else if (m.status !== currentTab.statusMatch) {
          return false;
        }
      }

      // Search filter
      const search = searchTerm.toLowerCase();
      const matchSearch =
        (m.name || '').toLowerCase().includes(search) ||
        (m.nik || '').toLowerCase().includes(search) ||
        (m.file_no || '').toLowerCase().includes(search) ||
        (m.kecamatan || '').toLowerCase().includes(search) ||
        (m.program || '').toLowerCase().includes(search) ||
        (m.request_title || '').toLowerCase().includes(search);

      // Dropdown filters
      const matchAsnaf = filterAsnaf === 'Semua' || m.asnaf === filterAsnaf;
      const matchProgram = filterProgram === 'Semua' || m.program === filterProgram;

      return matchSearch && matchAsnaf && matchProgram;
    });
  }, [mustahikList, activeTab, searchTerm, filterAsnaf, filterProgram]);

  // Handle WhatsApp preview update
  useEffect(() => {
    if (waTarget) {
      api.sendWhatsAppNotification(waTarget.id, waPhase, waCustomNotes).then((res) => {
        setWaPreview(res);
      });
    }
  }, [waTarget, waPhase, waCustomNotes]);

  // CRUD Operations
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
      file_no: `MST-${String(mustahikList.length + 1).padStart(3, '0')}`,
    });
    setShowAddEditSheet(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setForm({
      file_no: item.file_no || '',
      received_date: item.received_date || new Date().toISOString().split('T')[0],
      name: item.name || '',
      beneficiary_name: item.beneficiary_name || '',
      nik: item.nik || '',
      kk_number: item.kk_number || '',
      phone: item.phone || '',
      marital_status: item.marital_status || 'Menikah',
      dob: item.dob || '',
      address: item.address || '',
      rt_rw: item.rt_rw || '',
      kelurahan: item.kelurahan || '',
      kecamatan: item.kecamatan || '',
      kabupaten_kota: item.kabupaten_kota || 'Tangerang',
      province: item.province || 'Banten',
      occupation: item.occupation || '',
      education_level: item.education_level || '',
      house_ownership: item.house_ownership || 'Kontrak',
      family_dependents: String(item.family_dependents || 2),
      monthly_income: String(item.monthly_income || ''),
      monthly_expense: String(item.monthly_expense || ''),
      asnaf: item.asnaf || 'Miskin',
      program: item.program || 'Kemanusiaan',
      request_title: item.request_title || '',
      status: item.status || 'Diajukan',
      priority: item.priority || 'Prioritas 2',
      recommended_amount: String(item.recommended_amount || ''),
      approved_amount: String(item.approved_amount || ''),
      payment_method: item.payment_method || 'Transfer',
      bank_account: item.bank_account || '',
      bank_name: item.bank_name || 'Bank Syariah Indonesia (BSI)',
      bank_account_name: item.bank_account_name || '',
      documents: item.documents || [],
    });
    setShowAddEditSheet(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.kecamatan || !form.program) {
      showToast('Harap lengkapi nama, kecamatan, dan program!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        family_dependents: form.family_dependents ? parseInt(form.family_dependents, 10) : null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        monthly_expense: form.monthly_expense ? parseFloat(form.monthly_expense) : null,
        recommended_amount: form.recommended_amount ? parseFloat(form.recommended_amount) : null,
        approved_amount: form.approved_amount ? parseFloat(form.approved_amount) : null,
      };

      if (isEditing) {
        await api.updateMustahik(editingId, payload);
        showToast(`Data "${payload.name}" berhasil diperbarui!`);
      } else {
        await api.createMustahik(payload);
        showToast(`Mustahik baru "${payload.name}" berhasil ditambahkan!`);
      }

      await loadData();
      setShowAddEditSheet(false);
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data mustahik ini?')) return;
    try {
      await api.deleteMustahik(id);
      await loadData();
      if (detailData?.id === id) setShowDetailSheet(false);
      showToast('Data mustahik berhasil dihapus.');
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error');
    }
  };

  const openDetail = async (item) => {
    try {
      const res = await api.getMustahik(item.id);
      setDetailData(res.data || item);
      setShowDetailSheet(true);
    } catch (err) {
      setDetailData(item);
      setShowDetailSheet(true);
    }
  };

  // Open Survey Modal
  const openSurvey = (item) => {
    setSurveyTarget(item);
    setSurveyForm({
      surveyor_name: 'Ahmad Verifikator BAZNAS',
      surveyor_phone: '081234567890',
      survey_date: new Date().toISOString().split('T')[0],
      survey_method: 'Kunjungan Lapangan Faktual',
      house_index: item.house_ownership === 'Sendiri' ? 'Layak Sederhana' : 'Kontrak / Menumpang',
      asset_index: 'Aset Minimal',
      income_index: item.monthly_income ? `Rp ${Number(item.monthly_income).toLocaleString('id-ID')}` : 'Di Bawah Had Kifayah',
      spiritual_score: '85',
      overall_score: '88',
      priority: item.priority || 'Prioritas 1',
      recommendation: 'Layak Dibantu Penuh',
      narrative_conclusion: `Keluarga mustahik ${item.name} terverifikasi membutuhkan intervensi program ${item.program}.`,
      notes: `Alamat: ${item.address || '-'}, Kec. ${item.kecamatan || '-'}`,
    });
    setShowSurveyModal(true);
  };

  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    if (!surveyTarget) return;
    try {
      await api.addAssessment(surveyTarget.id, surveyForm);
      showToast(`Hasil survey F-BPP/04 untuk "${surveyTarget.name}" berhasil disimpan!`);
      setShowSurveyModal(false);
      await loadData();
    } catch (err) {
      showToast('Gagal menyimpan survey: ' + err.message, 'error');
    }
  };

  // Open MPZIS Modal
  const openMpzis = (item) => {
    setMpzisTarget(item);
    const defaultAmount = item.approved_amount || item.recommended_amount || (item.program === 'Pendidikan' ? 2500000 : 3000000);
    setMpzisForm({
      application_id: item.applications?.[0]?.id || item.id,
      form_number: `MPZIS/${item.file_no || item.id}/${new Date().getFullYear()}`,
      mpzis_date: new Date().toISOString().split('T')[0],
      program_classification: item.program || 'Kemanusiaan',
      purpose: item.request_title || `Bantuan Penyaluran Program ${item.program}`,
      asnaf: item.asnaf || 'Miskin',
      fund_source: 'Zakat Maal',
      recipient_name: item.name,
      recipient_type: 'Individu',
      beneficiary_count: item.family_dependents || 1,
      total_amount: defaultAmount,
      proposed_by: 'Divisi Penyaluran',
      examined_by: 'Kabid Pendistribusian',
      ashnaf_verifier: 'Ust. H. Fauzan, Lc.',
      responsible: 'Wakil Ketua II BAZNAS',
      approved_by: 'Ketua BAZNAS RI',
    });
    setShowMpzisModal(true);
  };

  const handleSaveMpzis = async (e) => {
    e.preventDefault();
    if (!mpzisTarget) return;
    try {
      await api.addMpzis(mpzisTarget.id, {
        ...mpzisForm,
        total_amount: Number(mpzisForm.total_amount),
      });
      showToast(`Persetujuan Sidang MPZIS untuk "${mpzisTarget.name}" berhasil dicatat!`);
      setShowMpzisModal(false);
      await loadData();
    } catch (err) {
      showToast('Gagal mencatat MPZIS: ' + err.message, 'error');
    }
  };

  // Open PPD Modal
  const openPpd = (item) => {
    setPpdTarget(item);
    const amount = item.approved_amount || item.recommended_amount || 2500000;
    setPpdForm({
      application_id: item.applications?.[0]?.id || item.id,
      form_number: `PPD/${item.file_no || item.id}/${new Date().getFullYear()}`,
      transaction_number: `TRX-${Date.now().toString().slice(-6)}`,
      requester_name: 'Divisi Penyaluran BAZNAS',
      requester_role: 'Staf Penyaluran',
      requester_department: 'Bidang Pendistribusian & Pendayagunaan',
      amount: amount,
      amount_in_words: `${formatRupiah(amount)}`,
      purpose: `Penyaluran Bantuan ${item.program} an. ${item.name}`,
      bank_account_info: `${item.bank_name || 'BSI'} - ${item.bank_account || '-'} a.n. ${item.bank_account_name || item.name}`,
      payment_type: item.payment_method || 'Transfer Bank',
    });
    setShowPpdModal(true);
  };

  const handleSavePpd = async (e) => {
    e.preventDefault();
    if (!ppdTarget) return;
    try {
      await api.addPpd(ppdTarget.id, {
        ...ppdForm,
        amount: Number(ppdForm.amount),
      });
      showToast(`Formulir PPD untuk "${ppdTarget.name}" berhasil diajukan ke Keuangan!`);
      setShowPpdModal(false);
      await loadData();
    } catch (err) {
      showToast('Gagal menyimpan PPD: ' + err.message, 'error');
    }
  };

  // Open WhatsApp Dialog
  const openWhatsApp = (item) => {
    setWaTarget(item);
    // Determine default phase based on current status
    let defaultPhase = 'diajukan';
    if (item.status === 'Verifikasi Administrasi') defaultPhase = 'administrasi';
    if (item.status === 'Survey') defaultPhase = 'survey';
    if (item.status === 'Persetujuan MPZIS') defaultPhase = 'mpzis';
    if (item.status === 'Penyaluran Selesai') defaultPhase = 'penyaluran';
    setWaPhase(defaultPhase);
    setWaCustomNotes('');
    setShowWaModal(true);
  };

  // Open Official Documents Print Modal
  const openPrintDocs = (item, type = 'FBPP04') => {
    setPrintTarget(item);
    setPrintDocType(type);
    setShowDocsModal(true);
  };

  // Export 60-Column Master Excel/CSV
  const handleExportExcel = () => {
    try {
      const res = api.exportMustahikData(mustahikList);
      showToast(`Berhasil mengekspor ${res.count} data Master Mustahik (60 Kolom BAZNAS)!`);
    } catch (err) {
      showToast('Gagal ekspor: ' + err.message, 'error');
    }
  };

  // Upload file in detail view
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !detailData?.id) {
      showToast('Pilih mustahik terlebih dahulu!', 'error');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadDocument(formData);
      await api.addDocument(detailData.id, {
        doc_type: file.name.toLowerCase().includes('kk')
          ? 'KK'
          : file.name.toLowerCase().includes('ktp')
          ? 'KTP'
          : 'SKTM / Dokumen Pendukung',
        filename: res.data.filename,
        original_name: file.name,
        file_url: res.data.url,
      });
      showToast('Dokumen berhasil diupload!');
      const updated = await api.getMustahik(detailData.id);
      setDetailData(updated.data);
      await loadData();
    } catch (err) {
      showToast('Gagal upload: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateMustahik(id, { status: newStatus });
      await loadData();
      if (detailData && detailData.id === id) {
        setDetailData((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status pengajuan berhasil diubah menjadi: ${newStatus}`);
    } catch (err) {
      showToast('Gagal update status: ' + err.message, 'error');
    }
  };

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-4 sm:space-y-5 relative">
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-card border border-border shadow-2xl rounded-xl p-4 animate-fade-in pr-10 min-w-[320px]">
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-rose-500" />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-foreground">
              {toast.type === 'success' ? 'Sukses' : 'Pemberitahuan'}
            </span>
            <span className="text-[11px] text-muted-foreground">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Data Mustahik & Penyaluran Zakat
            </h1>
            <Badge className="bg-emerald-600 text-white text-[10px]">Master 60 Kolom</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manajemen alur pelayanan terpadu: Pendaftaran → Verifikasi Administrasi → Survey F-BPP/04 → Sidang MPZIS → Pencairan PPD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigate && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              onClick={() => onNavigate('portal')}
            >
              <ExternalLink className="size-3.5" /> Buka Portal Publik
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" /> Export Excel 60-Kolom
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold shadow-xs"
            onClick={handleOpenAdd}
          >
            <Plus className="size-3.5" /> Tambah Mustahik Manual
          </Button>
        </div>
      </div>

      {/* Header Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="shadow-xs border-border">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Mustahik</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Antrean Masuk</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">{stats.antreanVerifikasi}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Siap Survey</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">{stats.siapSurvey}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Menunggu MPZIS</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">{stats.menungguMpzis}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Siap Pencairan</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">{stats.siapPencairan}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card with 7 Phase Tabs */}
      <Card className="shadow-xs border-border overflow-hidden">
        {/* TAB FILTERS HEADER (7 TABS) */}
        <div className="border-b border-border bg-muted/30 px-3 sm:px-4 flex gap-1 overflow-x-auto">
          {TAB_FILTERS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'all'
                ? mustahikList.length
                : tab.id === 'ppd'
                ? mustahikList.filter((m) => m.status === 'Pengajuan Dana (FPD)' || m.status === 'Pengajuan Dana (PPD)').length
                : mustahikList.filter((m) => m.status === tab.statusMatch).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-card/60'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 bg-card">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari Mustahik (Nama, NIK, No. Berkas, Wilayah)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500"
              />
            </div>

            <select
              value={filterAsnaf}
              onChange={(e) => setFilterAsnaf(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 text-foreground focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="Semua">Semua Asnaf</option>
              {ASNAP_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 text-foreground focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="Semua">Semua Program</option>
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-muted-foreground">
            Menampilkan <span className="font-bold text-foreground">{filteredMustahik.length}</span> data
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="size-7 animate-spin text-emerald-600" />
              <span className="text-xs text-muted-foreground">Memuat data mustahik...</span>
            </div>
          ) : filteredMustahik.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-2">
                <Search className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Tidak Ada Data Mustahik</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Tidak ada data yang cocok dengan kriteria filter/pencarian Anda pada tab ini.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 text-xs font-semibold"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAsnaf('Semua');
                  setFilterProgram('Semua');
                  setActiveTab('all');
                }}
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">No. Berkas</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">Tgl Terima</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">Nama Pemohon & NIK</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">Program & Asnaf</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">Survey Status</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground">Rekomendasi</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground text-right">Nominal Bantuan</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground text-center">Status Progress</th>
                  <th className="px-3.5 py-3 font-bold text-muted-foreground text-center min-w-[210px]">Aksi Terpadu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMustahik.map((m) => {
                  const hasSurvey = m.assessments && m.assessments.length > 0;
                  const assessment = hasSurvey ? m.assessments[0] : null;

                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      {/* No. Berkas */}
                      <td className="px-3.5 py-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {m.file_no || `MST-${m.id}`}
                      </td>

                      {/* Tgl Terima */}
                      <td className="px-3.5 py-3 text-muted-foreground text-[11px] whitespace-nowrap">
                        {m.received_date || '-'}
                      </td>

                      {/* Nama & NIK */}
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-foreground">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          NIK: {m.nik || '-'} {m.phone ? `• ${m.phone}` : ''}
                        </div>
                      </td>

                      {/* Program & Asnaf */}
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-foreground">{m.program || '-'}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Asnaf: <span className="font-medium text-foreground">{m.asnaf || 'Miskin'}</span>
                        </div>
                      </td>

                      {/* Survey Status */}
                      <td className="px-3.5 py-3">
                        {hasSurvey ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            <CheckCircle2 className="size-3" /> Faktual (F-BPP/04)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                            Belum Survey
                          </span>
                        )}
                      </td>

                      {/* Rekomendasi */}
                      <td className="px-3.5 py-3 text-[11px]">
                        {assessment?.recommendation || m.priority || 'Prioritas 2'}
                      </td>

                      {/* Nominal Bantuan */}
                      <td className="px-3.5 py-3 text-right font-extrabold text-foreground">
                        {formatRupiah(m.approved_amount || m.recommended_amount || 0)}
                      </td>

                      {/* Status Progress */}
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            STATUS_COLORS[m.status] || STATUS_COLORS['Diajukan']
                          }`}
                        >
                          {m.status || 'Diajukan'}
                        </span>
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-3.5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detail & Dokumen */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                            title="Detail & Dokumen"
                            onClick={() => openDetail(m)}
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          {/* Input Survey F-BPP/04 */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-amber-600 hover:bg-amber-50"
                            title="Input Survey F-BPP/04"
                            onClick={() => openSurvey(m)}
                          >
                            <FileText className="size-3.5" />
                          </Button>

                          {/* Sidang MPZIS */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-purple-600 hover:bg-purple-50"
                            title="Keputusan MPZIS"
                            onClick={() => openMpzis(m)}
                          >
                            <ShieldCheck className="size-3.5" />
                          </Button>

                          {/* Pencairan Dana (PPD) */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-orange-600 hover:bg-orange-50"
                            title="Formulir Pengajuan Dana (PPD)"
                            onClick={() => openPpd(m)}
                          >
                            <DollarSign className="size-3.5" />
                          </Button>

                          {/* Cetak Dokumen Resmi */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                            title="Cetak Dokumen Resmi (F-BPP/04, MPZIS, PPD)"
                            onClick={() => openPrintDocs(m, 'FBPP04')}
                          >
                            <Printer className="size-3.5" />
                          </Button>

                          {/* WhatsApp Notification */}
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7 text-green-600 hover:bg-green-50"
                            title="Kirim Notifikasi WhatsApp"
                            onClick={() => openWhatsApp(m)}
                          >
                            <MessageCircle className="size-3.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit Data"
                            onClick={() => handleOpenEdit(m)}
                          >
                            <Edit className="size-3.5" />
                          </Button>

                          {/* Hapus */}
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                            title="Hapus Data"
                            onClick={() => handleDelete(m.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT MUSTAHIK SHEET */}
      {/* ========================================================================= */}
      <Sheet open={showAddEditSheet} onOpenChange={setShowAddEditSheet}>
        <SheetContent side="right" className="sm:max-w-xl bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-3 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">
              {isEditing ? 'Edit Data Mustahik' : 'Tambah Mustahik Manual'}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Formulir Master Data Mustahik 60 Kolom Standar BAZNAS
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveSubmit} className="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. Berkas">
                <Input
                  value={form.file_no}
                  onChange={(e) => setForm({ ...form, file_no: e.target.value })}
                  placeholder="MST-XXX"
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Tanggal Terima">
                <Input
                  type="date"
                  value={form.received_date}
                  onChange={(e) => setForm({ ...form, received_date: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
            </div>

            <Field label="Nama Lengkap Mustahik / Pemohon" required>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Ahmad Sulaiman"
                className="h-8 text-xs"
              />
            </Field>

            <Field label="Nama Penerima Manfaat (jika berbeda)">
              <Input
                value={form.beneficiary_name}
                onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })}
                placeholder="Biarkan kosong jika sama dengan pemohon"
                className="h-8 text-xs"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="NIK (Nomor Induk Kependudukan)">
                <Input
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="16 Digit NIK"
                  className="h-8 text-xs font-mono"
                />
              </Field>
              <Field label="No. Kartu Keluarga (KK)">
                <Input
                  maxLength={16}
                  value={form.kk_number}
                  onChange={(e) => setForm({ ...form, kk_number: e.target.value })}
                  placeholder="16 Digit No KK"
                  className="h-8 text-xs font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="No. HP / WhatsApp">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="h-8 text-xs font-mono"
                />
              </Field>
              <Field label="Status Perkawinan">
                <Select
                  value={form.marital_status}
                  onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                  options={MARITAL_OPTIONS}
                />
              </Field>
            </div>

            <Field label="Alamat Lengkap">
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Nama jalan, RT/RW"
                className="h-8 text-xs"
              />
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Kelurahan">
                <Input
                  value={form.kelurahan}
                  onChange={(e) => setForm({ ...form, kelurahan: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Kecamatan" required>
                <Input
                  required
                  value={form.kecamatan}
                  onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                  placeholder="Kecamatan"
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Kab/Kota">
                <Input
                  value={form.kabupaten_kota}
                  onChange={(e) => setForm({ ...form, kabupaten_kota: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Program Bantuan">
                <Select
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  options={PROGRAM_OPTIONS}
                />
              </Field>
              <Field label="Golongan Asnaf">
                <Select
                  value={form.asnaf}
                  onChange={(e) => setForm({ ...form, asnaf: e.target.value })}
                  options={ASNAP_OPTIONS}
                />
              </Field>
            </div>

            <Field label="Uraian / Permohonan Bantuan">
              <Input
                value={form.request_title}
                onChange={(e) => setForm({ ...form, request_title: e.target.value })}
                placeholder="Contoh: Bantuan tunggakan SPP sekolah / Modal usaha gerobak"
                className="h-8 text-xs"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Status Pengajuan">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
              </Field>
              <Field label="Kepemilikan Rumah">
                <Select
                  value={form.house_ownership}
                  onChange={(e) => setForm({ ...form, house_ownership: e.target.value })}
                  options={HOUSE_OPTIONS}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Pendapatan Bulanan (Rp)">
                <Input
                  type="number"
                  value={form.monthly_income}
                  onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Jumlah Tanggungan (Jiwa)">
                <Input
                  type="number"
                  value={form.family_dependents}
                  onChange={(e) => setForm({ ...form, family_dependents: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nominal Rekomendasi (Rp)">
                <Input
                  type="number"
                  value={form.recommended_amount}
                  onChange={(e) => setForm({ ...form, recommended_amount: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Nominal Disetujui (Rp)">
                <Input
                  type="number"
                  value={form.approved_amount}
                  onChange={(e) => setForm({ ...form, approved_amount: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Metode Bayar">
                <Select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  options={PAYMENT_OPTIONS}
                />
              </Field>
              <Field label="Nama Bank">
                <Input
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="No. Rekening">
                <Input
                  value={form.bank_account}
                  onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </Field>
            </div>

            <div className="pt-4 flex gap-2 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs h-9"
                onClick={() => setShowAddEditSheet(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
              >
                {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {isEditing ? 'Simpan Perubahan' : 'Simpan Data Mustahik'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 2. DETAIL MUSTAHIK SHEET & DOCUMENT PREVIEW */}
      {/* ========================================================================= */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="sm:max-w-xl bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-3 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Detail Lengkap Mustahik</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Profil pemohon, riwayat verifikasi, hasil survey, dan dokumen upload
            </SheetDescription>
          </SheetHeader>

          {detailData && (
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground">{detailData.file_no || `MST-${detailData.id}`}</p>
                  <h3 className="text-base font-bold text-foreground">{detailData.name}</h3>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                    STATUS_COLORS[detailData.status] || STATUS_COLORS['Diajukan']
                  }`}
                >
                  {detailData.status || 'Diajukan'}
                </span>
              </div>

              {/* Status Update Fast Switch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Ubah Tahap Progress:</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detailData.status === s ? 'default' : 'outline'}
                      className={`h-7 text-[10px] ${
                        detailData.status === s ? 'bg-emerald-600 text-white' : ''
                      }`}
                      onClick={() => handleUpdateStatus(detailData.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Info icon={Calendar} label="Tanggal Terima" value={detailData.received_date} />
                <Info icon={Phone} label="No. HP / WA" value={detailData.phone} />
                <Info icon={UserCheck} label="NIK" value={detailData.nik} />
                <Info icon={Home} label="No. KK" value={detailData.kk_number} />
                <Info icon={MapPin} label="Kecamatan / Wilayah" value={detailData.kecamatan} />
                <Info icon={HeartHandshake} label="Golongan Asnaf" value={detailData.asnaf} />
                <Info icon={ClipboardList} label="Program Penyaluran" value={detailData.program} />
                <Info icon={CreditCard} label="Metode Bayar" value={detailData.payment_method} />
              </div>

              {/* Bank Info */}
              <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs space-y-1">
                <p className="font-bold text-foreground text-xs">Informasi Rekening Bank:</p>
                <p className="text-muted-foreground font-mono">
                  {detailData.bank_name || 'BSI'} - {detailData.bank_account || '(Belum ada rekening)'} a.n. {detailData.bank_account_name || detailData.name}
                </p>
              </div>

              {/* Hasil Survey F-BPP/04 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-amber-600" /> Hasil Survey Faktual (F-BPP/04)
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] gap-1 text-amber-700"
                    onClick={() => openSurvey(detailData)}
                  >
                    + Form Survey
                  </Button>
                </div>

                {detailData.assessments?.length > 0 ? (
                  detailData.assessments.map((a, idx) => (
                    <Card key={idx} className="shadow-xs border-border bg-amber-50/20 dark:bg-amber-950/10">
                      <CardContent className="p-3 text-xs space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span>Surveyor: {a.surveyor_name || 'Tim Verifikator'}</span>
                          <span className="text-muted-foreground text-[10px]">{a.survey_date}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          <strong>Rekomendasi:</strong> {a.recommendation} | <strong>Prioritas:</strong> {a.priority}
                        </p>
                        <p className="text-[11px] italic bg-background/80 p-2 rounded border border-border/40">
                          "{a.narrative_conclusion || a.notes || '-'}"
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Belum ada data assessment survey lapangan.</p>
                )}
              </div>

              {/* Upload & Dokumen Pendukung */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Upload className="size-4 text-emerald-600" /> Dokumen Pendukung (KTP, KK, SKTM)
                  </h4>
                  <div>
                    <input
                      type="file"
                      id="detail-file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => document.getElementById('detail-file-upload').click()}
                    >
                      <Upload className="size-3" /> Upload File
                    </Button>
                  </div>
                </div>

                {detailData.documents?.length > 0 ? (
                  <div className="space-y-1.5">
                    {detailData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-xs"
                      >
                        <div className="flex items-center gap-2 truncate max-w-[320px]">
                          <File className="size-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold truncate">{doc.original_name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.doc_type || 'Dokumen'}</p>
                          </div>
                        </div>
                        {doc.file_url && (
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="h-7 w-7 text-blue-600"
                            onClick={() => window.open(`http://localhost:3001${doc.file_url}`, '_blank')}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Belum ada dokumen yang diunggah.</p>
                )}
              </div>

              {/* Fast Action Footer */}
              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8 gap-1.5 text-emerald-700"
                  onClick={() => openPrintDocs(detailData, 'FBPP04')}
                >
                  <Printer className="size-3.5" /> Cetak Dokumen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8 gap-1.5 text-green-700"
                  onClick={() => openWhatsApp(detailData)}
                >
                  <MessageCircle className="size-3.5" /> Kirim WA
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 3. MODAL INPUT SURVEY FAKTUAL (F-BPP/04) */}
      {/* ========================================================================= */}
      {showSurveyModal && surveyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto animate-fade-in">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-amber-600" /> Form Assessment & Survey Faktual (F-BPP/04)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Pemohon: <span className="font-semibold text-foreground">{surveyTarget.name}</span> ({surveyTarget.file_no || surveyTarget.id})
                </p>
              </div>
              <Button size="icon-xs" variant="ghost" onClick={() => setShowSurveyModal(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveSurvey} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nama Surveyor / Verifikator" required>
                  <Input
                    required
                    value={surveyForm.surveyor_name}
                    onChange={(e) => setSurveyForm({ ...surveyForm, surveyor_name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Tanggal Survey">
                  <Input
                    type="date"
                    value={surveyForm.survey_date}
                    onChange={(e) => setSurveyForm({ ...surveyForm, survey_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Indeks Kondisi Rumah">
                  <Input
                    value={surveyForm.house_index}
                    onChange={(e) => setSurveyForm({ ...surveyForm, house_index: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Indeks Kepemilikan Aset">
                  <Input
                    value={surveyForm.asset_index}
                    onChange={(e) => setSurveyForm({ ...surveyForm, asset_index: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Indeks Pendapatan Keluarga">
                  <Input
                    value={surveyForm.income_index}
                    onChange={(e) => setSurveyForm({ ...surveyForm, income_index: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Tingkat Prioritas">
                  <select
                    value={surveyForm.priority}
                    onChange={(e) => setSurveyForm({ ...surveyForm, priority: e.target.value })}
                    className="w-full h-8 text-xs rounded-md border border-border bg-background px-2"
                  >
                    <option value="Prioritas 1">Prioritas 1 (Mendesak / Sangat Butuh)</option>
                    <option value="Prioritas 2">Prioritas 2 (Standar / Layak Bantu)</option>
                    <option value="Prioritas 3">Prioritas 3 (Dapat Ditunda)</option>
                    <option value="Tidak Layak">Tidak Layak Bantu</option>
                  </select>
                </Field>
              </div>

              <Field label="Rekomendasi Tim Survey">
                <select
                  value={surveyForm.recommendation}
                  onChange={(e) => setSurveyForm({ ...surveyForm, recommendation: e.target.value })}
                  className="w-full h-8 text-xs rounded-md border border-border bg-background px-2"
                >
                  <option value="Layak Dibantu Penuh">Layak Dibantu Penuh</option>
                  <option value="Layak Dibantu Sebagian">Layak Dibantu Sebagian</option>
                  <option value="Dialihkan ke Program Lain">Dialihkan ke Program Lain</option>
                  <option value="Ditolak / Tidak Memenuhi Syarat">Ditolak / Tidak Memenuhi Syarat</option>
                </select>
              </Field>

              <Field label="Narasi Kesimpulan Surveyor F-BPP/04" required>
                <textarea
                  rows={3}
                  required
                  value={surveyForm.narrative_conclusion}
                  onChange={(e) => setSurveyForm({ ...surveyForm, narrative_conclusion: e.target.value })}
                  className="w-full p-2.5 rounded-md border border-border bg-background text-xs"
                />
              </Field>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowSurveyModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Simpan Assessment F-BPP/04
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL PERSETUJUAN MPZIS */}
      {/* ========================================================================= */}
      {showMpzisModal && mpzisTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto animate-fade-in">
          <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-purple-600" /> Sidang Keputusan MPZIS BAZNAS
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Persetujuan nominal dan klasifikasi penyaluran zakat untuk <span className="font-semibold text-foreground">{mpzisTarget.name}</span>
                </p>
              </div>
              <Button size="icon-xs" variant="ghost" onClick={() => setShowMpzisModal(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveMpzis} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Field label="No. Formulir MPZIS">
                  <Input
                    value={mpzisForm.form_number}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, form_number: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Tanggal Sidang">
                  <Input
                    type="date"
                    value={mpzisForm.mpzis_date}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, mpzis_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Klasifikasi Program">
                  <Select
                    value={mpzisForm.program_classification}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, program_classification: e.target.value })}
                    options={PROGRAM_OPTIONS}
                  />
                </Field>
                <Field label="Sumber Dana Penyaluran">
                  <select
                    value={mpzisForm.fund_source}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, fund_source: e.target.value })}
                    className="w-full h-8 text-xs rounded-md border border-border bg-background px-2"
                  >
                    <option value="Zakat Maal">Dana Zakat Maal</option>
                    <option value="Zakat Fitrah">Dana Zakat Fitrah</option>
                    <option value="Infak / Sedekah Terikat">Infak / Sedekah Terikat</option>
                    <option value="Infak Tidak Terikat">Infak Tidak Terikat</option>
                  </select>
                </Field>
              </div>

              <Field label="Nominal Bantuan Disetujui (Rp)" required>
                <Input
                  required
                  type="number"
                  value={mpzisForm.total_amount}
                  onChange={(e) => setMpzisForm({ ...mpzisForm, total_amount: e.target.value })}
                  placeholder="Contoh: 3000000"
                  className="h-9 text-xs font-bold font-mono"
                />
              </Field>

              <Field label="Peruntukan Bantuan">
                <Input
                  value={mpzisForm.purpose}
                  onChange={(e) => setMpzisForm({ ...mpzisForm, purpose: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Verifikator Asnaf">
                  <Input
                    value={mpzisForm.ashnaf_verifier}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, ashnaf_verifier: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Disetujui Oleh (Ketua)">
                  <Input
                    value={mpzisForm.approved_by}
                    onChange={(e) => setMpzisForm({ ...mpzisForm, approved_by: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowMpzisModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Simpan Keputusan MPZIS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL FORMULIR PENGAJUAN PENCAIRAN DANA (PPD) */}
      {/* ========================================================================= */}
      {showPpdModal && ppdTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto animate-fade-in">
          <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="size-4 text-orange-600" /> Formulir Pengajuan Pencairan Dana (PPD)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Pencairan kas & transfer bantuan untuk <span className="font-semibold text-foreground">{ppdTarget.name}</span>
                </p>
              </div>
              <Button size="icon-xs" variant="ghost" onClick={() => setShowPpdModal(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSavePpd} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Field label="No. Formulir PPD">
                  <Input
                    value={ppdForm.form_number}
                    onChange={(e) => setPpdForm({ ...ppdForm, form_number: e.target.value })}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="No. Transaksi Kas">
                  <Input
                    value={ppdForm.transaction_number}
                    onChange={(e) => setPpdForm({ ...ppdForm, transaction_number: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Nominal Pencairan (Rp)" required>
                  <Input
                    required
                    type="number"
                    value={ppdForm.amount}
                    onChange={(e) => setPpdForm({ ...ppdForm, amount: e.target.value })}
                    className="h-9 text-xs font-bold font-mono"
                  />
                </Field>
                <Field label="Metode Pembayaran">
                  <select
                    value={ppdForm.payment_type}
                    onChange={(e) => setPpdForm({ ...ppdForm, payment_type: e.target.value })}
                    className="w-full h-9 text-xs rounded-md border border-border bg-background px-2"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Tunai / Kas Langsung">Tunai / Kas Langsung</option>
                  </select>
                </Field>
              </div>

              <Field label="Informasi Rekening Tujuan">
                <Input
                  value={ppdForm.bank_account_info}
                  onChange={(e) => setPpdForm({ ...ppdForm, bank_account_info: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>

              <Field label="Tujuan / Keperluan Pencairan">
                <Input
                  value={ppdForm.purpose}
                  onChange={(e) => setPpdForm({ ...ppdForm, purpose: e.target.value })}
                  className="h-8 text-xs"
                />
              </Field>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowPpdModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold">
                  Terbitkan PPD ke Keuangan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL NOTIFIKASI WHATSAPP 5 FASE OTOMATIS */}
      {/* ========================================================================= */}
      {showWaModal && waTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto animate-fade-in">
          <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <MessageCircle className="size-4 text-green-600" /> Kirim Notifikasi WhatsApp Mustahik
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Penerima: <span className="font-semibold text-foreground">{waTarget.name}</span> ({waTarget.phone || 'No Telp Belum Diisi'})
                </p>
              </div>
              <Button size="icon-xs" variant="ghost" onClick={() => setShowWaModal(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Pilih Template Fase Penyaluran:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'diajukan', label: '1. Pengajuan Masuk' },
                    { id: 'administrasi', label: '2. Verifikasi Berkas' },
                    { id: 'survey', label: '3. Survey Lapangan' },
                    { id: 'mpzis', label: '4. Persetujuan MPZIS' },
                    { id: 'penyaluran', label: '5. Penyaluran Selesai' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setWaPhase(p.id)}
                      className={`p-2 rounded-md border text-left text-xs font-semibold transition-all ${
                        waPhase === p.id
                          ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                          : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Catatan Tambahan Khusus (Opsional)">
                <Input
                  value={waCustomNotes}
                  onChange={(e) => setWaCustomNotes(e.target.value)}
                  placeholder="Contoh: Tim kami akan datang hari Rabu pk. 10.00 WIB"
                  className="h-8 text-xs"
                />
              </Field>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Preview Pesan WhatsApp:</label>
                <div className="p-3 bg-muted/40 rounded-lg border border-border font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-foreground max-h-48 overflow-y-auto">
                  {waPreview.message || 'Membuat template pesan...'}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">
                  Nomor Terformat: {waPreview.phone || '-'}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowWaModal(false)}>
                    Tutup
                  </Button>
                  {waPreview.waUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-bold gap-1.5 shadow-xs"
                      onClick={() => window.open(waPreview.waUrl, '_blank')}
                    >
                      <Send className="size-3.5" /> Buka WhatsApp Web / App
                    </Button>
                  ) : (
                    <Button disabled size="sm" className="h-8 text-xs">
                      No HP Tidak Valid
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. OFFICIAL DOCUMENTS PRINT MODAL */}
      {/* ========================================================================= */}
      <OfficialDocumentsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        mustahik={printTarget}
        defaultDocType={printDocType}
      />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full h-8 text-xs rounded-md border border-border bg-background px-2.5 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30 border border-border/40">
      <Icon className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground truncate">{value || '-'}</p>
      </div>
    </div>
  );
}
