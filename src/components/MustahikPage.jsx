import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

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
  Phone,
  Home,
  CreditCard,
  ClipboardList,
  Upload,
  File,
  Image,
  Download,
} from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { api } from '../services/api';

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
  'Diajukan': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Verifikasi Administrasi': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'Survey': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Persetujuan MPZIS': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  'Pengajuan Dana (FPD)': 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  'Penyaluran Selesai': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Ditolak': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Aktif': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Selesai': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
};

const ASNAP_OPTIONS = ['Fakir', 'Miskin', 'Fisabilillah', 'Mualaf', 'Gharimin', 'Ibnu Sabil'];
const PROGRAM_OPTIONS = ['Pendidikan', 'Ekonomi', 'Kemanusiaan', 'Dakwah Advokasi', 'Kesehatan'];
const HOUSE_OPTIONS = ['Menumpang', 'Kontrak', 'Keluarga', 'Sendiri'];
const PAYMENT_OPTIONS = ['Tunai', 'Transfer'];
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
  kabupaten_kota: '',
  province: '',
  occupation: '',
  education_level: '',
  house_ownership: 'Sendiri',
  family_dependents: '',
  monthly_income: '',
  monthly_expense: '',
  asnaf: 'Miskin',
  program: 'Pendidikan',
  request_title: '',
  status: 'Diajukan',
  priority: '',
  recommended_amount: '',
  approved_amount: '',
  payment_method: 'Transfer',
  bank_account: '',
  bank_name: '',
  bank_account_name: '',
  documents: [],
};

export default function MustahikPage() {
  const [mustahikList, setMustahikList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsnaf, setFilterAsnaf] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

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

  const stats = useMemo(() => {
    const total = mustahikList.length;
    const fakirCount = mustahikList.filter(m => m.asnaf === 'Fakir').length;
    const miskinCount = mustahikList.filter(m => m.asnaf === 'Miskin').length;
    const totalAidRealized = mustahikList.reduce((sum, m) => sum + (m.approved_amount || m.totalAid || 0), 0);

    return { total, fakirCount, miskinCount, totalAidRealized };
  }, [mustahikList]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !detailData?.id) {
      showToast('Simpan data mustahik terlebih dahulu!', 'error');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', file.name.toLowerCase().includes('kk') ? 'KK' : file.name.toLowerCase().includes('ktp') ? 'KTP' : 'Lainnya');

    try {
      const res = await api.uploadDocument(formData);
      await api.addDocument(detailData.id, {
        doc_type: res.data.doc_type || 'Lainnya',
        filename: res.data.filename,
        original_name: file.name,
        file_url: res.data.url,
      });
      showToast('Dokumen berhasil diupload!');
      const updated = await api.getMustahik(detailData.id);
      setDetailData(updated.data);
    } catch (err) {
      showToast('Gagal upload: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.kecamatan || !form.program) {
      showToast('Harap lengkapi nama, kecamatan, dan program!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        file_no: form.file_no || `MST-${String(mustahikList.length + 1).padStart(3, '0')}`,
        family_dependents: form.family_dependents ? parseInt(form.family_dependents, 10) : null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        monthly_expense: form.monthly_expense ? parseFloat(form.monthly_expense) : null,
        recommended_amount: form.recommended_amount ? parseFloat(form.recommended_amount) : null,
        approved_amount: form.approved_amount ? parseFloat(form.approved_amount) : null,
      };

      const result = await api.createMustahik(payload);
      await loadData();
      setShowAddSheet(false);
      setForm(emptyForm);
      showToast(`Mustahik "${payload.name}" berhasil dicatat!`);
      
      setTimeout(() => {
        showToast('Upload dokumen KK/KTP sekarang');
      }, 1500);
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateMustahik(id, { status: newStatus });
      await loadData();
      showToast('Status pengajuan diperbarui.');
    } catch (err) {
      showToast('Gagal update status: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data mustahik ini?')) return;
    try {
      await api.deleteMustahik(id);
      await loadData();
      if (detailData?.id == id) setShowDetailSheet(false);
      showToast('Data mustahik dihapus.');
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error');
    }
  };

  const openDetail = async (item) => {
    try {
      const res = await api.getMustahik(item.id);
      setDetailData(res.data);
      setShowDetailSheet(true);
    } catch (err) {
      showToast('Gagal membuka detail: ' + err.message, 'error');
    }
  };

  const filteredMustahik = useMemo(() => {
    return mustahikList.filter(m => {
      const matchSearch =
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.kecamatan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.program || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.request_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.file_no || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchAsnaf = filterAsnaf === 'Semua' || m.asnaf === filterAsnaf;
      const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;
      return matchSearch && matchAsnaf && matchStatus;
    });
  }, [mustahikList, searchTerm, filterAsnaf, filterStatus]);

  const renderStatusBadge = (status) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[status] || STATUS_COLORS['Diajukan']}`}>
      {status || 'Diajukan'}
    </span>
  );

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-3 sm:space-y-4 md:space-y-5 relative">
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border border-border shadow-2xl rounded-xl p-4 animate-fade-in pr-10 min-w-[300px]">
          {toast.type === 'success' ? <CheckCircle2 className="size-5 shrink-0 text-emerald-500" /> : <AlertCircle className="size-5 shrink-0 text-rose-500" />}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">{toast.type === 'success' ? 'Berhasil' : 'Pemberitahuan'}</span>
            <span className="text-[11px] text-muted-foreground">{toast.message}</span>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Data Mustahik</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola data perorangan maupun lembaga penerima manfaat penyaluran zakat (asnaf delapan)
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={loadData} disabled={loading}>
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setShowAddSheet(true)}>
            <Plus className="size-3.5" /> Tambah Mustahik
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up fill-mode-both">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Total Mustahik</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Golongan Fakir</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.fakirCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Golongan Miskin</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.miskinCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Dana Tersalurkan</p>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5 truncate max-w-[160px]" title={formatRupiah(stats.totalAidRealized)}>
                {formatRupiah(stats.totalAidRealized, true)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card animate-fade-in-up fill-mode-both delay-100">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-sm font-semibold">Daftar Penerima Manfaat</CardTitle>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari Mustahik (Nama/Program/Wilayah)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>

            <select
              value={filterAsnaf}
              onChange={(e) => setFilterAsnaf(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Asnaf</option>
              {ASNAP_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-emerald-600" />
            </div>
          ) : filteredMustahik.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-page-enter">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-3">
                <Search className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Mustahik</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Kata kunci atau filter pencarian Anda tidak mencocokkan record Mustahik apa pun.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 h-8 text-xs font-semibold"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAsnaf('Semua');
                  setFilterStatus('Semua');
                }}
              >
                Reset Pencarian
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">ID / No Berkas</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Penerima</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Program</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Golongan Asnaf</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Kecamatan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Nominal</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Status Pengajuan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMustahik.map((m, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-muted-foreground">
                      {m.file_no || m.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground">{m.name}</td>
                    <td className="px-4 py-3.5 text-foreground font-medium">{m.program || m.aidType || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        m.asnaf === 'Fakir' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                        m.asnaf === 'Miskin' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        m.asnaf === 'Fisabilillah' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {m.asnaf}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground/60 shrink-0" /> {m.kecamatan || m.location}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">
                      {formatRupiah(m.approved_amount || m.totalAid || 0)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {renderStatusBadge(m.status)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon-xs" variant="ghost" className="h-7 w-7" onClick={() => openDetail(m)}>
                          <Eye className="size-3.5 text-muted-foreground" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="size-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="sm:max-w-lg bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Tambah Penerima Bantuan</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Catat profil penerima manfaat (Mustahik) baru serta jenis program penyalurannya
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. Berkas">
                <Input value={form.file_no} onChange={(e) => setForm({ ...form, file_no: e.target.value })} placeholder="MST-XXX" className="h-9 text-xs" />
              </Field>
              <Field label="Tanggal Terima">
                <Input type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} className="h-9 text-xs" />
              </Field>
            </div>

            <Field label="Nama Mustahik / Lembaga Penerima" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Ibu Minah" className="h-9 text-xs" required />
            </Field>

            <Field label="Nama Penerima Manfaat (jika beda)">
              <Input value={form.beneficiary_name} onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })} placeholder="Biarkan kosong jika sama" className="h-9 text-xs" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="NIK">
                <Input value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} placeholder="16 digit" className="h-9 text-xs" />
              </Field>
              <Field label="No. KK">
                <Input value={form.kk_number} onChange={(e) => setForm({ ...form, kk_number: e.target.value })} placeholder="No Kartu Keluarga" className="h-9 text-xs" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="No. HP">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="081234567890" className="h-9 text-xs" />
              </Field>
              <Field label="Status Perkawinan">
                <Select value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value })} options={MARITAL_OPTIONS} />
              </Field>
            </div>

            <Field label="Alamat Lengkap">
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl... RT/RW..." className="h-9 text-xs" />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Kelurahan">
                <Input value={form.kelurahan} onChange={(e) => setForm({ ...form, kelurahan: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Kecamatan" required>
                <Input value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} placeholder="Karawaci" className="h-9 text-xs" required />
              </Field>
              <Field label="Kab/Kota">
                <Input value={form.kabupaten_kota} onChange={(e) => setForm({ ...form, kabupaten_kota: e.target.value })} className="h-9 text-xs" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Program">
                <Select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} options={PROGRAM_OPTIONS} />
              </Field>
              <Field label="Asnaf">
                <Select value={form.asnaf} onChange={(e) => setForm({ ...form, asnaf: e.target.value })} options={ASNAP_OPTIONS} />
              </Field>
            </div>

            <Field label="Uraian Pengajuan">
              <Input value={form.request_title} onChange={(e) => setForm({ ...form, request_title: e.target.value })} placeholder="Contoh: Bantuan biaya pendidikan" className="h-9 text-xs" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Status Pengajuan">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
              </Field>
              <Field label="Kepemilikan Rumah">
                <Select value={form.house_ownership} onChange={(e) => setForm({ ...form, house_ownership: e.target.value })} options={HOUSE_OPTIONS} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Pendapatan/Bulan">
                <Input type="number" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Pengeluaran/Bulan">
                <Input type="number" value={form.monthly_expense} onChange={(e) => setForm({ ...form, monthly_expense: e.target.value })} className="h-9 text-xs" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jumlah Tanggungan">
                <Input type="number" value={form.family_dependents} onChange={(e) => setForm({ ...form, family_dependents: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Prioritas">
                <Input value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} placeholder="1/2/3/Tidak Layak" className="h-9 text-xs" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nominal Rekomendasi">
                <Input type="number" value={form.recommended_amount} onChange={(e) => setForm({ ...form, recommended_amount: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Nominal Disetujui">
                <Input type="number" value={form.approved_amount} onChange={(e) => setForm({ ...form, approved_amount: e.target.value })} className="h-9 text-xs" />
              </Field>
            </div>

            <Field label="Metode Pembayaran">
              <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} options={PAYMENT_OPTIONS} />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="No. Rekening">
                <Input value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Bank">
                <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="h-9 text-xs" />
              </Field>
              <Field label="Atas Nama">
                <Input value={form.bank_account_name} onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })} className="h-9 text-xs" />
              </Field>
            </div>

            <div className="space-y-2 border-t border-border pt-4 mt-2">
              <label className="text-xs font-semibold text-foreground">Upload Dokumen Pendukung</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isSubmitting || !form.name}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => document.getElementById('doc-upload').click()}
                  disabled={isSubmitting || !form.name}
                >
                  <Upload className="size-3.5" /> Pilih File
                </Button>
                {form.name && (
                  <span className="text-[10px] text-muted-foreground self-center">
                    Simpan dulu untuk upload dokumen
                  </span>
                )}
              </div>
              {form.documents?.length > 0 && (
                <div className="space-y-1">
                  {form.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                      <File className="size-3.5 text-emerald-600" />
                      <span className="flex-1 truncate">{doc.original_name}</span>
                      <Badge variant="outline" className="text-[10px]">{doc.doc_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2 border-t border-border mt-6">
              <Button type="button" variant="outline" disabled={isSubmitting} className="flex-1 text-xs h-9" onClick={() => setShowAddSheet(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Data Mustahik'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="sm:max-w-xl bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Detail Mustahik</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Informasi lengkap pengajuan dan riwayat status
            </SheetDescription>
          </SheetHeader>

          {detailData && (
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{detailData.file_no}</p>
                  <h3 className="text-base font-bold text-foreground">{detailData.name}</h3>
                </div>
                {renderStatusBadge(detailData.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Info icon={Calendar} label="Tanggal Terima" value={detailData.received_date} />
                <Info icon={Phone} label="No. HP" value={detailData.phone} />
                <Info icon={MapPin} label="Alamat" value={`${detailData.address || ''} ${detailData.kecamatan || ''}`} />
                <Info icon={Home} label="Kepemilikan Rumah" value={detailData.house_ownership} />
                <Info icon={FileText} label="Program" value={detailData.program} />
                <Info icon={ClipboardList} label="Asnaf" value={detailData.asnaf} />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Update Status Pengajuan</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detailData.status === s ? 'default' : 'outline'}
                      className={`h-7 text-[10px] ${detailData.status === s ? 'bg-emerald-600 text-white' : ''}`}
                      onClick={() => handleUpdateStatus(detailData.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {detailData.applications?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">Riwayat Pengajuan</h4>
                  {detailData.applications.map((app) => (
                    <Card key={app.id} className="shadow-sm">
                      <CardContent className="p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{app.application_number}</span>
                          {renderStatusBadge(app.status)}
                        </div>
                        <p className="text-muted-foreground">{app.request_title || app.program}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {detailData.assessments?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">Hasil Survey</h4>
                  {detailData.assessments.map((a) => (
                    <Card key={a.id} className="shadow-sm">
                      <CardContent className="p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Surveyor: {a.surveyor_name || '-'}</span>
                          <span className="text-muted-foreground">{a.survey_date}</span>
                        </div>
                        <p>Rekomendasi: {a.recommendation || '-'} | Prioritas: {a.priority || '-'}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {detailData.documents?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">Dokumen Pendukung</h4>
                  {detailData.documents.map((doc) => (
                    <Card key={doc.id} className="shadow-sm">
                      <CardContent className="p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {doc.doc_type === 'KK' || doc.doc_type === 'KTP' ? (
                              <File className="size-4 text-emerald-600" />
                            ) : (
                              <Image className="size-4 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium">{doc.original_name}</p>
                              <p className="text-muted-foreground text-[10px]">{doc.doc_type}</p>
                            </div>
                          </div>
                          <Button
                            size="icon-xs"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => window.open(`http://localhost:3001${doc.file_url}`, '_blank')}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Info icon={CreditCard} label="Nominal Rekomendasi" value={formatRupiah(detailData.recommended_amount || 0)} />
                <Info icon={CreditCard} label="Nominal Disetujui" value={formatRupiah(detailData.approved_amount || 0)} />
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="destructive" size="sm" className="h-8 text-xs gap-1" onClick={() => handleDelete(detailData.id)}>
                  <Trash2 className="size-3.5" /> Hapus Data
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">
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
      className="w-full h-9 text-xs rounded-md border border-border bg-background px-3 py-1 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
      <Icon className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value || '-'}</p>
      </div>
    </div>
  );
}
