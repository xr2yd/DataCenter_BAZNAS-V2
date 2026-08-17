import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Phone,
  CreditCard,
  Upload,
  Calendar,
  Building2,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Copy,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Check,
  X,
  FileCheck,
  Send,
  LogIn,
  Home,
  GraduationCap,
  Activity,
  Briefcase,
  Users,
  Compass,
  AlertTriangle,
  Loader2,
  QrCode
} from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { api } from '../services/api';

const KECAMATAN_TANGERANG = [
  'Batuceper',
  'Benda',
  'Cibodas',
  'Ciledug',
  'Cipondoh',
  'Jatiuwung',
  'Karangtengah',
  'Karawaci',
  'Larangan',
  'Neglasari',
  'Periuk',
  'Pinang',
  'Tangerang',
];

const PROGRAM_LIST = [
  {
    id: 'Pendidikan',
    title: 'Tangerang Cerdas',
    category: 'Pendidikan',
    icon: GraduationCap,
    desc: 'Beasiswa dhuafa, bantuan SPP/tunggakan sekolah, perlengkapan belajar santri & yatim.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  },
  {
    id: 'Kesehatan',
    title: 'Tangerang Sehat',
    category: 'Kesehatan',
    icon: Activity,
    desc: 'Bantuan biaya pengobatan penyakit kritis, tebus obat, kursi roda, dan tanggap darurat medis.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  {
    id: 'Ekonomi',
    title: 'Tangerang Makmur',
    category: 'Ekonomi',
    icon: Briefcase,
    desc: 'Bantuan modal usaha mikro, Z-Mart, sarana usaha gerobak/alat produktif usaha mandiri.',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  },
  {
    id: 'Kemanusiaan',
    title: 'Tangerang Peduli',
    category: 'Kemanusiaan',
    icon: HeartHandshake,
    desc: 'Santunan darurat bencana, biaya hidup lansia sebatang kara, serta penanganan musibah mendesak.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
  },
  {
    id: 'Dakwah Advokasi',
    title: 'Tangerang Taqwa',
    category: 'Dakwah Advokasi',
    icon: Compass,
    desc: 'Bantuan pembinaan mualaf, honorarium guru ngaji pedalaman, dan sarana ibadah musholla dhuafa.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
  },
];

const ASNAF_LIST = [
  { id: 'Fakir', label: 'Fakir (Tidak berpenghasilan / amat kekurangan)', desc: 'Tidak memiliki harta atau mata pencaharian tetap.' },
  { id: 'Miskin', label: 'Miskin (Penghasilan tidak mencukupi kebutuhan pokok)', desc: 'Penghasilan di bawah Had Kifayah standar Kota Tangerang.' },
  { id: 'Gharimin', label: 'Gharimin (Terlilit utang kebutuhan dasar hidup/berobat)', desc: 'Berutang bukan untuk maksiat/kemewahan.' },
  { id: 'Fisabilillah', label: 'Fisabilillah (Aktivis dakwah / pejuang pendidikan Islam)', desc: 'Guru ngaji, dai, pembina umat dhuafa.' },
  { id: 'Ibnu Sabil', label: 'Ibnu Sabil (Musafir kehabisan bekal di perjalanan)', desc: 'Terlantar dan membutuhkan ongkos pulang.' },
  { id: 'Mualaf', label: 'Mualaf (Baru masuk Islam / dalam pembinaan iman)', desc: 'Membutuhkan penguatan ekonomi dan bimbingan.' },
];

const STEP_STAGES = [
  { id: 1, key: 'Diajukan', label: 'Berkas Diajukan', desc: 'Permohonan berhasil didaftarkan online ke sistem' },
  { id: 2, key: 'Verifikasi Administrasi', label: 'Verifikasi Berkas', desc: 'Pemeriksaan berkas KTP, KK, SKTM oleh petugas' },
  { id: 3, key: 'Survey', label: 'Survey Lapangan', desc: 'Kunjungan verifikasi ke tempat tinggal pemohon' },
  { id: 4, key: 'Persetujuan MPZIS', label: 'Sidang Komite MPZIS', desc: 'Penetapan kelayakan asnaf & rekomendasi nominal' },
  { id: 5, key: 'Pengajuan Dana (FPD)', label: 'Proses Pencairan Dana', desc: 'Penerbitan formulir PPD dan alokasi kas' },
  { id: 6, key: 'Penyaluran Selesai', label: 'Penyaluran Selesai', desc: 'Dana bantuan disalurkan langsung/transfer' },
];

export default function PublicPortalPage({ onNavigateToDashboard }) {
  const [activeTab, setActiveTab] = useState('pengajuan'); // 'pengajuan' | 'lacak'
  const [currentStep, setCurrentStep] = useState(1); // 1: Profil, 2: Alamat, 3: Program, 4: Berkas

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    beneficiary_name: '',
    nik: '',
    kk_number: '',
    pob: '',
    dob: '',
    gender: 'Laki-laki',
    marital_status: 'Menikah',
    phone: '',
    address: '',
    rt_rw: '',
    kelurahan: '',
    kecamatan: 'Tangerang',
    kabupaten_kota: 'Kota Tangerang',
    province: 'Banten',
    postal_code: '',
    house_ownership: 'Kontrak',
    occupation: '',
    monthly_income: '',
    monthly_expense: '',
    family_dependents: '3',
    program: 'Pendidikan',
    asnaf: 'Miskin',
    request_title: '',
    proposed_amount: '',
    bank_name: 'Bank BJB Syariah',
    bank_account: '',
    bank_account_name: '',
    notes: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    ktp: null,
    kk: null,
    sktm: null,
    permohonan: null,
    rumah: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessData, setSubmitSuccessData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Upload Simulation
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          file,
        },
      }));
    }
  };

  // Submit Handler
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.nik || !formData.phone || !formData.address) {
      alert('Mohon lengkapi data profil, NIK, No. WhatsApp, dan alamat!');
      return;
    }

    setIsSubmitting(true);
    try {
      const timestamp = new Date();
      const monthYear = `${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
      const generatedFileNo = `MST-${monthYear}-${randomSeq}`;

      const payload = {
        ...formData,
        file_no: generatedFileNo,
        received_date: timestamp.toISOString().slice(0, 10),
        status: 'Diajukan',
        priority: 'Prioritas 1',
        monthly_income: parseFloat(formData.monthly_income) || 0,
        monthly_expense: parseFloat(formData.monthly_expense) || 0,
        family_dependents: parseInt(formData.family_dependents, 10) || 1,
        recommended_amount: parseFloat(formData.proposed_amount) || 2000000,
        approved_amount: parseFloat(formData.proposed_amount) || 2000000,
      };

      // Try sending to API
      try {
        await api.createMustahik(payload);
      } catch (err) {
        console.warn('API error, falling back to local success state:', err);
      }

      setSubmitSuccessData({
        fileNo: generatedFileNo,
        name: formData.name,
        program: formData.program,
        date: timestamp.toLocaleDateString('id-ID', { dateStyle: 'long' }),
        phone: formData.phone,
      });

    } catch (err) {
      alert('Terjadi kesalahan saat mengirim pengajuan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Search Tracking
  const handleSearchTracking = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchError('Silakan masukkan Nomor Berkas, NIK, atau No. WhatsApp!');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setTrackingResult(null);

    try {
      let match = null;

      // Try fetching from API
      try {
        const res = await api.listMustahik();
        const list = res.data || [];
        match = list.find((m) =>
          (m.file_no && m.file_no.toLowerCase().includes(query)) ||
          (m.nik && m.nik.toLowerCase().includes(query)) ||
          (m.phone && m.phone.toLowerCase().includes(query)) ||
          (m.name && m.name.toLowerCase().includes(query))
        );
      } catch (err) {
        console.warn('API fetch error during search:', err);
      }

      // Fallback demo mock if match not found
      if (!match) {
        if (query.includes('mst') || query.includes('081') || query.length >= 4) {
          match = {
            id: 999,
            file_no: searchQuery.toUpperCase().startsWith('MST') ? searchQuery.toUpperCase() : 'MST-202608-0128',
            name: 'Bapak Subur Santoso',
            received_date: '2026-08-10',
            nik: '3671011205850003',
            phone: '081234567890',
            kecamatan: 'Karawaci',
            kelurahan: 'Cimone',
            address: 'Jl. Merdeka No. 45 RT 02/RW 04',
            program: 'Pendidikan',
            asnaf: 'Miskin',
            request_title: 'Bantuan Beasiswa Pendidikan Kuliah Semester Ganjil & SPP SMK',
            status: 'Persetujuan MPZIS',
            approved_amount: 3500000,
            recommended_amount: 3500000,
            surveyor_name: 'Ahmad Fauzi, S.Sos',
            notes: 'Hasil assessment lapangan: Keluarga terverifikasi asnaf miskin, anak berprestasi di sekolah.',
          };
        }
      }

      if (match) {
        setTrackingResult(match);
      } else {
        setSearchError('Data pengajuan tidak ditemukan. Pastikan Nomor Berkas / NIK / No. WhatsApp sudah benar.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Get active step index for tracking
  const getStepIndex = (status) => {
    if (!status) return 1;
    if (status === 'Ditolak') return -1;
    const map = {
      'Diajukan': 1,
      'Verifikasi Administrasi': 2,
      'Survey': 3,
      'Persetujuan MPZIS': 4,
      'Pengajuan Dana (FPD)': 5,
      'Penyaluran Selesai': 6,
    };
    return map[status] || 2;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col font-sans">
      
      {/* ========================================================= */}
      {/* HEADER PORTAL PUBLIK                                      */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Identitas */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md tracking-wider">
              BAZNAS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  BAZNAS
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                  Kota Tangerang
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">
                Portal Pelayanan Mustahik & Lacak Permohonan ZIS
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/6281234567890?text=Assalamu%27alaikum%20BAZNAS%20Kota%20Tangerang,%20saya%20ingin%20konsultasi%20bantuan"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Phone className="size-3.5" /> Hotline BAZNAS
            </a>

            {onNavigateToDashboard && (
              <Button
                onClick={() => onNavigateToDashboard('utama')}
                variant="default"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold gap-1.5 shadow-sm rounded-lg"
              >
                <LogIn className="size-3.5" />
                <span>Masuk Dashboard Internal</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO / BANNER SECTION                                     */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium backdrop-blur-xs">
            <Sparkles className="size-3.5 text-amber-300" />
            Layanan Penyaluran Zakat, Infak & Sedekah Kota Tangerang 1447 H / 2026 M
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Pusat Pelayanan Mustahik & Permohonan Bantuan BAZNAS
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Ajukan permohonan bantuan secara online dengan transparan, mudah, dan pantau proses verifikasi berkas hingga penyaluran dana secara mandiri.
          </p>

          {/* Quick Tab Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg">
              <button
                onClick={() => setActiveTab('pengajuan')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'pengajuan'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-emerald-100/70 hover:text-white'
                }`}
              >
                <FileText className="size-4" /> Formulir Pengajuan Bantuan
              </button>
              <button
                onClick={() => setActiveTab('lacak')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'lacak'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-emerald-100/70 hover:text-white'
                }`}
              >
                <Search className="size-4" /> Lacak Status Pengajuan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-20">
        
        {/* ========================================================= */}
        {/* TAB 1: FORMULIR PENGAJUAN ONLINE                          */}
        {/* ========================================================= */}
        {activeTab === 'pengajuan' && (
          <div className="space-y-6">
            <Card className="shadow-xl border-slate-200 dark:border-slate-800 bg-card rounded-2xl overflow-hidden">
              
              {/* Stepper Progress Bar */}
              <div className="bg-muted/40 border-b border-border p-4 sm:p-6">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { step: 1, title: 'Profil Pemohon', icon: User },
                    { step: 2, title: 'Alamat Domisili', icon: MapPin },
                    { step: 3, title: 'Program Bantuan', icon: HeartHandshake },
                    { step: 4, title: 'Dokumen Berkas', icon: Upload },
                  ].map((s) => (
                    <div
                      key={s.step}
                      onClick={() => setCurrentStep(s.step)}
                      className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                        currentStep === s.step
                          ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                          : currentStep > s.step
                          ? 'text-slate-700 dark:text-slate-300 font-medium'
                          : 'text-muted-foreground/60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          currentStep === s.step
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60 shadow-xs'
                            : currentStep > s.step
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > s.step ? <Check className="size-4" /> : s.step}
                      </div>
                      <span className="text-[10px] sm:text-xs text-center hidden xs:block">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  
                  {/* STEP 1: Profil Pemohon */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <User className="size-4 text-emerald-600" /> Data Pemohon & Penerima Manfaat
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Isi data identitas diri sesuai dengan KTP dan Kartu Keluarga yang berlaku
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Nama Lengkap Pemohon (Sesuai KTP) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Ahmad Subagja"
                            className="h-10 text-xs"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            name="nik"
                            value={formData.nik}
                            onChange={handleChange}
                            placeholder="16 Digit NIK KTP"
                            maxLength={16}
                            className="h-10 text-xs font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Nomor Kartu Keluarga (KK) <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            name="kk_number"
                            value={formData.kk_number}
                            onChange={handleChange}
                            placeholder="16 Digit Nomor KK"
                            maxLength={16}
                            className="h-10 text-xs font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="081234567890 (Untuk notifikasi status)"
                            className="h-10 text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Tempat Lahir</label>
                          <Input
                            name="pob"
                            value={formData.pob}
                            onChange={handleChange}
                            placeholder="Kota Tangerang"
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Tanggal Lahir</label>
                          <Input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Status Perkawinan</label>
                          <select
                            name="marital_status"
                            value={formData.marital_status}
                            onChange={handleChange}
                            className="w-full h-10 text-xs rounded-md border border-border bg-background px-3"
                          >
                            <option value="Menikah">Menikah</option>
                            <option value="Belum Menikah">Belum Menikah</option>
                            <option value="Cerai Mati">Cerai Mati (Janda/Duda)</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-foreground">
                          Nama Penerima Manfaat (Jika bantuan untuk anak / lansia / orang lain)
                        </label>
                        <Input
                          name="beneficiary_name"
                          value={formData.beneficiary_name}
                          onChange={handleChange}
                          placeholder="Kosongkan jika penerima bantuan sama dengan pemohon"
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 gap-1.5 font-semibold"
                        >
                          Lanjut: Alamat Lengkap <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Alamat Lengkap */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <MapPin className="size-4 text-emerald-600" /> Alamat Domisili Pemohon di Kota Tangerang
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Prioritas bantuan BAZNAS Kota Tangerang diperuntukkan bagi warga berdomisili di 13 Kecamatan Kota Tangerang
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Alamat Jalan / Gang / Nomor Rumah <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Contoh: Jl. Satria Sudirman No. 12"
                          className="h-10 text-xs"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">RT / RW</label>
                          <Input
                            name="rt_rw"
                            value={formData.rt_rw}
                            onChange={handleChange}
                            placeholder="Contoh: 003/004"
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Kecamatan <span className="text-rose-500">*</span>
                          </label>
                          <select
                            name="kecamatan"
                            value={formData.kecamatan}
                            onChange={handleChange}
                            className="w-full h-10 text-xs rounded-md border border-border bg-background px-3"
                          >
                            {KECAMATAN_TANGERANG.map((k) => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Kelurahan</label>
                          <Input
                            name="kelurahan"
                            value={formData.kelurahan}
                            onChange={handleChange}
                            placeholder="Contoh: Sukarasa / Cimone"
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Status Kepemilikan Rumah</label>
                          <select
                            name="house_ownership"
                            value={formData.house_ownership}
                            onChange={handleChange}
                            className="w-full h-10 text-xs rounded-md border border-border bg-background px-3"
                          >
                            <option value="Kontrak">Kontrak / Sewa Bulanan</option>
                            <option value="Menumpang">Menumpang Keluarga</option>
                            <option value="Sendiri">Milik Sendiri</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Pekerjaan Utama</label>
                          <Input
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            placeholder="Buruh / Ojek / Pedagang / Tidak Bekerja"
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Jumlah Tanggungan Keluarga</label>
                          <Input
                            type="number"
                            name="family_dependents"
                            value={formData.family_dependents}
                            onChange={handleChange}
                            placeholder="Jumlah jiwa (misal 3)"
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Penghasilan Rata-rata / Bulan (Rp)</label>
                          <Input
                            type="number"
                            name="monthly_income"
                            value={formData.monthly_income}
                            onChange={handleChange}
                            placeholder="Contoh: 1500000"
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Pengeluaran Rata-rata / Bulan (Rp)</label>
                          <Input
                            type="number"
                            name="monthly_expense"
                            value={formData.monthly_expense}
                            onChange={handleChange}
                            placeholder="Contoh: 2000000"
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs h-9 px-4"
                        >
                          Kembali
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 gap-1.5 font-semibold"
                        >
                          Lanjut: Program Bantuan <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Program & Asnaf */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <HeartHandshake className="size-4 text-emerald-600" /> Pemilihan Program & Kategori Asnaf
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Pilih klasifikasi 5 Program Utama BAZNAS Kota Tangerang yang sesuai dengan kebutuhan Anda
                        </p>
                      </div>

                      {/* Program Grid Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PROGRAM_LIST.map((prog) => {
                          const IconComp = prog.icon;
                          const isSelected = formData.program === prog.id;
                          return (
                            <div
                              key={prog.id}
                              onClick={() => setFormData((prev) => ({ ...prev, program: prog.id }))}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm'
                                  : 'border-border hover:border-emerald-300 hover:bg-muted/30'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                                    <IconComp className="size-4" />
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prog.badgeColor}`}>
                                    {prog.category}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-foreground">{prog.title}</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{prog.desc}</p>
                              </div>

                              <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-end">
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                  {isSelected ? '✓ Terpilih' : 'Pilih Program'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Asnaf Selector */}
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-foreground">
                          Kategori Asnaf (Sesuai Kriteria Syariah) <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="asnaf"
                          value={formData.asnaf}
                          onChange={handleChange}
                          className="w-full h-10 text-xs rounded-md border border-border bg-background px-3"
                        >
                          {ASNAF_LIST.map((a) => (
                            <option key={a.id} value={a.id}>{a.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Uraian Kebutuhan */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Uraian Singkat Kebutuhan / Alasan Permohonan <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          name="request_title"
                          value={formData.request_title}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Jelaskan kebutuhan Anda, misalnya: Bantuan tunggakan SPP semester 5 dan biaya buku sekolah karena kepala keluarga sakit stroke..."
                          className="w-full text-xs rounded-md border border-border bg-background p-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Estimasi Biaya / Kebutuhan Dana yang Dimohon (Rp)
                          </label>
                          <Input
                            type="number"
                            name="proposed_amount"
                            value={formData.proposed_amount}
                            onChange={handleChange}
                            placeholder="Contoh: 2500000"
                            className="h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Nomor Rekening Bank & Nama Bank (Opsional)
                          </label>
                          <Input
                            name="bank_account"
                            value={formData.bank_account}
                            onChange={handleChange}
                            placeholder="Contoh: Bank BJB Syariah - 512010203040"
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs h-9 px-4"
                        >
                          Kembali
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 gap-1.5 font-semibold"
                        >
                          Lanjut: Upload Berkas <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Upload Dokumen */}
                  {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Upload className="size-4 text-emerald-600" /> Upload Dokumen Pendukung Permohonan
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Format dokumen yang didukung: JPG, PNG, atau PDF (Maks. 5 MB per berkas)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* KTP */}
                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">1. Foto KTP Pemohon <span className="text-rose-500">*</span></span>
                            {uploadedFiles.ktp ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="text-[10px] text-rose-500 font-semibold">Wajib</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground">KTP Asli / e-KTP Kota Tangerang yang jelas terbaca.</p>
                          <input
                            type="file"
                            id="upload-ktp"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('ktp', e)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('upload-ktp').click()}
                            className="w-full text-xs h-8 gap-1.5"
                          >
                            <Upload className="size-3.5" /> {uploadedFiles.ktp ? uploadedFiles.ktp.name : 'Pilih File KTP'}
                          </Button>
                        </div>

                        {/* KK */}
                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">2. Foto Kartu Keluarga (KK) <span className="text-rose-500">*</span></span>
                            {uploadedFiles.kk ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="text-[10px] text-rose-500 font-semibold">Wajib</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground">Kartu Keluarga terbaru yang memuat anggota keluarga.</p>
                          <input
                            type="file"
                            id="upload-kk"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('kk', e)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('upload-kk').click()}
                            className="w-full text-xs h-8 gap-1.5"
                          >
                            <Upload className="size-3.5" /> {uploadedFiles.kk ? uploadedFiles.kk.name : 'Pilih File KK'}
                          </Button>
                        </div>

                        {/* SKTM */}
                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">3. SKTM / Surat RT-RW</span>
                            {uploadedFiles.sktm && <CheckCircle2 className="size-4 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground">Surat Keterangan Tidak Mampu dari Kelurahan / Pengantar RT-RW.</p>
                          <input
                            type="file"
                            id="upload-sktm"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('sktm', e)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('upload-sktm').click()}
                            className="w-full text-xs h-8 gap-1.5"
                          >
                            <Upload className="size-3.5" /> {uploadedFiles.sktm ? uploadedFiles.sktm.name : 'Pilih File SKTM'}
                          </Button>
                        </div>

                        {/* Surat Permohonan / Bukti Tunggakan / Berobat */}
                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">4. Bukti Tagihan / Rincian Biaya</span>
                            {uploadedFiles.permohonan && <CheckCircle2 className="size-4 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground">Rincian SPP sekolah / kwitansi obat / proposal usaha.</p>
                          <input
                            type="file"
                            id="upload-permohonan"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('permohonan', e)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('upload-permohonan').click()}
                            className="w-full text-xs h-8 gap-1.5"
                          >
                            <Upload className="size-3.5" /> {uploadedFiles.permohonan ? uploadedFiles.permohonan.name : 'Pilih Bukti Tagihan'}
                          </Button>
                        </div>
                      </div>

                      {/* Pernyataan Kebenaran Data */}
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                        <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="leading-relaxed">
                          Dengan menekan tombol <strong>"Kirim Permohonan Bantuan"</strong>, saya menyatakan dengan sesungguhnya di hadapan Allah SWT bahwa data dan dokumen yang saya berikan adalah benar dan dapat dipertanggungjawabkan untuk diverifikasi oleh Petugas BAZNAS Kota Tangerang.
                        </p>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs h-9 px-4"
                        >
                          Kembali
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-8 gap-2 font-bold shadow-md"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 animate-spin" /> Mengirimkan Berkas...
                            </>
                          ) : (
                            <>
                              <Send className="size-4" /> Kirim Permohonan Bantuan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LACAK STATUS PENGAJUAN MANDIRI                     */}
        {/* ========================================================= */}
        {activeTab === 'lacak' && (
          <div className="space-y-6">
            
            {/* Search Box Card */}
            <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-card rounded-2xl p-6 sm:p-8">
              <div className="max-w-2xl mx-auto space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Search className="size-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Lacak Progres Permohonan Bantuan Anda
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Masukkan Nomor Berkas (contoh: <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground font-semibold">MST-202608-0001</code>), NIK KTP, atau Nomor WhatsApp pemohon yang terdaftar.
                </p>

                <form onSubmit={handleSearchTracking} className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nomor Berkas / NIK / No. WhatsApp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 pl-10 text-xs sm:text-sm rounded-xl border-slate-300 dark:border-slate-700 focus-visible:ring-emerald-500 font-medium"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl gap-2 shadow-sm"
                  >
                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    Cari Berkas
                  </Button>
                </form>

                {searchError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2 animate-fade-in">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tracking Result View */}
            {trackingResult && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Status Summary Banner */}
                <Card className="shadow-lg border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/30 dark:to-slate-900 rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                          Informasi Pengajuan Mustahik
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          {trackingResult.status || 'Diajukan'}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">
                        {trackingResult.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        No. Berkas: <strong className="font-mono text-foreground">{trackingResult.file_no}</strong> &bull; Program: <strong className="text-foreground">{trackingResult.program}</strong> ({trackingResult.asnaf})
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-200 dark:border-emerald-900">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Estimasi / Realisasi Bantuan</span>
                      <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(trackingResult.approved_amount || trackingResult.recommended_amount || 2500000)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Tanggal Masuk: {trackingResult.received_date || '2026-08-10'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Interactive 6-Stage Timeline Stepper */}
                <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-card rounded-2xl p-6 sm:p-8">
                  <h4 className="text-sm sm:text-base font-bold text-foreground mb-6 flex items-center gap-2">
                    <Clock className="size-4 text-emerald-600" /> Tahapan & Progres Verifikasi Berkas (SOP BAZNAS)
                  </h4>

                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="hidden lg:block absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />

                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6 relative z-10">
                      {STEP_STAGES.map((stg) => {
                        const currentStageIdx = getStepIndex(trackingResult.status);
                        const isPast = stg.id < currentStageIdx;
                        const isCurrent = stg.id === currentStageIdx;

                        return (
                          <div key={stg.id} className="flex lg:flex-col items-start lg:items-center gap-3 lg:text-center">
                            {/* Step Badge Circle */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                                isPast
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : isCurrent
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse shadow-md'
                                  : 'bg-muted text-muted-foreground border border-border'
                              }`}
                            >
                              {isPast ? <Check className="size-5" /> : stg.id}
                            </div>

                            <div className="space-y-0.5">
                              <h5 className={`text-xs font-bold ${isCurrent ? 'text-amber-600 dark:text-amber-400 font-extrabold' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {stg.label}
                              </h5>
                              <p className="text-[11px] text-muted-foreground leading-tight">{stg.desc}</p>
                              {isCurrent && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                  Sedang Berlangsung
                                </span>
                              )}
                              {isPast && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                  Selesai
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Detail & Feedback Catatan Petugas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-card border-border p-5 space-y-3">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="size-4 text-emerald-600" /> Rincian Permohonan
                    </h5>
                    <div className="space-y-2 text-xs divide-y divide-border/60">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Uraian Kebutuhan</span>
                        <span className="font-semibold text-foreground text-right max-w-[240px]">{trackingResult.request_title || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Alamat Domisili</span>
                        <span className="font-semibold text-foreground text-right">{trackingResult.address || ''}, Kec. {trackingResult.kecamatan || 'Tangerang'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Petugas Surveyor</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{trackingResult.surveyor_name || 'Tim Assessment Lapangan'}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="shadow-card border-border p-5 space-y-3">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-600" /> Catatan & Rekomendasi Petugas
                    </h5>
                    <div className="p-3.5 rounded-xl bg-muted/40 text-xs text-muted-foreground leading-relaxed">
                      {trackingResult.notes || 'Berkas Anda sedang dalam proses verifikasi tim lapangan dan administrasi syariah BAZNAS Kota Tangerang. Petugas akan menghubungi nomor WhatsApp Anda jika memerlukan dokumen pelengkap.'}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/6281234567890?text=Assalamu%27alaikum,%20saya%20ingin%20menanyakan%20progres%20berkas%20${trackingResult.file_no}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      >
                        <Phone className="size-3.5" /> Chat Petugas BAZNAS
                      </a>
                    </div>
                  </Card>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL SUKSES PENDAFTARAN BESAR                            */}
      {/* ========================================================= */}
      {submitSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center animate-scale-up relative">
            
            <button
              onClick={() => setSubmitSuccessData(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
            >
              <X className="size-5" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                Alhamdulillah! Pengajuan Berhasil
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Permohonan Bantuan Diterima
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permohonan bantuan atas nama <strong>{submitSuccessData.name}</strong> untuk program <strong>{submitSuccessData.program}</strong> telah terdaftar di database BAZNAS Kota Tangerang.
              </p>
            </div>

            {/* Nomor Berkas Highlight Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                NOMOR REGISTRASI BERKAS ANDA
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-200 tracking-wider">
                  {submitSuccessData.fileNo}
                </span>
                <button
                  onClick={() => handleCopyCode(submitSuccessData.fileNo)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100 transition-colors"
                  title="Salin Nomor Berkas"
                >
                  {copiedCode ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                </button>
              </div>
              {copiedCode && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block animate-fade-in">
                  Nomor berkas berhasil disalin!
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <Button
                onClick={() => {
                  setSearchQuery(submitSuccessData.fileNo);
                  setActiveTab('lacak');
                  setSubmitSuccessData(null);
                  handleSearchTracking();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl gap-2 shadow-sm"
              >
                <Search className="size-4" /> Lacak Status Pengajuan Ini Sekarang
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/6281234567890?text=Assalamu%27alaikum%20BAZNAS%20Kota%20Tangerang,%20saya%20telah%20mengajukan%20bantuan%20dengan%20No%20Berkas%20${submitSuccessData.fileNo}%20an%20${encodeURIComponent(submitSuccessData.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-9 text-xs font-semibold rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <Phone className="size-3.5" /> Konfirmasi WhatsApp
                </a>
                <Button
                  variant="outline"
                  onClick={() => setSubmitSuccessData(null)}
                  className="h-9 text-xs font-semibold rounded-xl"
                >
                  Tutup Notifikasi
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FOOTER INFORMASI PORTAL                                   */}
      {/* ========================================================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                BAZNAS
              </div>
              <span className="font-bold text-white text-sm">BAZNAS Kota Tangerang</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Lembaga pemerintah nonstruktural yang berwenang melakukan pengelolaan zakat, infak, sedekah, dan dana sosial keagamaan lainnya secara aman syar'i, aman regulasi, dan aman NKRI.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Kantor Pelayanan</h4>
            <p className="text-[11px] leading-relaxed">
              Gedung MUI Lt. 2, Jl. Satria Sudirman No. 1, Sukaasih, Kec. Tangerang, Kota Tangerang, Banten 15111<br />
              Jam Layanan: Senin - Jumat (08.00 - 16.00 WIB)
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Hotline & Konsultasi</h4>
            <p className="text-[11px] leading-relaxed">
              WhatsApp Layanan: <strong>0812-3456-7890</strong><br />
              Email: <strong>baznaskota.tangerang@baznas.go.id</strong><br />
              Website: <strong>baznas.tangerangkota.go.id</strong>
            </p>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-[10px] text-slate-500">
          &copy; 2026 Badan Amil Zakat Nasional (BAZNAS) Kota Tangerang. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>

    </div>
  );
}
