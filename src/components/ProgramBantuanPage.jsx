import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  HeartPulse,
  AlertTriangle,
  Coins,
  BookOpen,
  Search,
  Download,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Calculator,
  ShieldCheck,
  Building,
  HeartHandshake,
  FileSpreadsheet,
  X,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Percent
} from 'lucide-react';
import { formatRupiah } from '../utils/format';

// 5 Pilar BAZNAS Comprehensive Programs Data (Kota Tangerang Scale)
const PROGRAMS_DATA = [
  {
    id: 'PRG-CERDAS',
    pilarNum: '1',
    name: 'Tangerang Cerdas',
    category: 'Pendidikan',
    slogan: 'Memutus Rantai Kemiskinan Melalui Akses Pendidikan Berkualitas',
    icon: GraduationCap,
    brandColor: '#2563eb',
    bgBadge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    budget: 661_500_000_000,
    realized: 570_000_000_000,
    targetMustahik: 12_500,
    realizedMustahik: 10_200,
    asnafTarget: 'Fakir, Miskin, Fisabilillah',
    description: 'Program strategis peningkatan SDM mustahik melalui beasiswa berkelanjutan, pembebasan tunggakan ijazah, sarana prasarana sekolah madrasah/pesantren, serta insentif guru ngaji se-Kota Tangerang.',
    kpiMetrics: [
      { label: 'Indeks Kelulusan Siswa', value: '99.4%' },
      { label: 'Rata-rata IPK Mahasiswa S1', value: '3.62' },
      { label: 'Pesantren Terbantu', value: '48 Lembaga' },
    ],
    subPrograms: [
      {
        code: 'TC-01',
        name: 'Beasiswa Satu Keluarga Satu Sarjana (SKSS)',
        desc: 'Beasiswa penuh perkuliahan jenjang D3/S1 bagi anak keluarga prasejahtera hingga wisuda.',
        budget: 220_000_000_000,
        realized: 195_000_000_000,
        targetMustahik: 1_200,
        realizedMustahik: 1_050,
        status: 'Aktif',
      },
      {
        code: 'TC-02',
        name: 'Penebusan Ijazah & Tunggakan SPP Sekolah',
        desc: 'Bantuan pelunasan biaya pendidikan agar siswa dapat menerima ijazah kelulusan.',
        budget: 160_000_000_000,
        realized: 145_000_000_000,
        targetMustahik: 4_500,
        realizedMustahik: 4_100,
        status: 'Aktif',
      },
      {
        code: 'TC-03',
        name: 'Insentif Guru Ngaji Tradisional & Guru Honorer',
        desc: 'Tunjangan kehormatan bulanan bagi para pendidik Al-Qur’an di pelosok kelurahan.',
        budget: 150_000_000_000,
        realized: 130_000_000_000,
        targetMustahik: 3_800,
        realizedMustahik: 3_250,
        status: 'Aktif',
      },
      {
        code: 'TC-04',
        name: 'Digitalisasi Laboratorium Komputer Santri Pesantren',
        desc: 'Bantuan perangkat PC dan internet cepat untuk santri pondok pesantren tradisional.',
        budget: 131_500_000_000,
        realized: 100_000_000_000,
        targetMustahik: 3_000,
        realizedMustahik: 1_800,
        status: 'Aktif',
      },
    ],
    recentDistributions: [
      { date: '2026-07-04', mustahik: 'Muhammad Rizky Pratama', subProg: 'Beasiswa SKSS S1', amount: 8_500_000, wilayah: 'Kec. Ciledug', status: 'Disalurkan' },
      { date: '2026-07-03', mustahik: 'Siti Aisyah Rahmawati', subProg: 'Penebusan Ijazah SMK', amount: 3_200_000, wilayah: 'Kec. Cipondoh', status: 'Disalurkan' },
      { date: '2026-07-02', mustahik: 'Ust. Abdullah Faqih', subProg: 'Insentif Guru Ngaji', amount: 1_500_000, wilayah: 'Kec. Karawaci', status: 'Disalurkan' },
    ],
  },
  {
    id: 'PRG-SEHAT',
    pilarNum: '2',
    name: 'Tangerang Sehat',
    category: 'Kesehatan',
    slogan: 'Layanan Kesehatan Holistik & Bebas Biaya untuk Kaum Duafa',
    icon: HeartPulse,
    brandColor: '#059669',
    bgBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    budget: 472_500_000_000,
    realized: 410_000_000_000,
    targetMustahik: 8_000,
    realizedMustahik: 7_120,
    asnafTarget: 'Fakir, Miskin, Ibnu Sabil',
    description: 'Pelayanan gawat darurat medis kuratif dan preventif: bantuan tunggakan biaya rumah sakit, alat bantu disabilitas (kaki palsu/kursi roda), ambulans 24 jam gratis, serta penanganan gizi stunting.',
    kpiMetrics: [
      { label: 'Response Time Ambulans', value: '< 18 Menit' },
      { label: 'Tingkat Kesembuhan Pasien', value: '96.2%' },
      { label: 'Balita Lolos Stunting', value: '340 Anak' },
    ],
    subPrograms: [
      {
        code: 'TS-01',
        name: 'Bantuan Biaya Rawat Inap & Obat Kritis RSU',
        desc: 'Cover biaya operasi, ICU, dan farmasi pasien kurang mampu di RSUD & RS Mitra.',
        budget: 230_000_000_000,
        realized: 205_000_000_000,
        targetMustahik: 3_500,
        realizedMustahik: 3_200,
        status: 'Aktif',
      },
      {
        code: 'TS-02',
        name: 'Pengadaan Alat Bantu Disabilitas & Lansia',
        desc: 'Penyaluran kursi roda standar/cerebral palsy, tongkat ketiak, hearing aid, & kaki palsu.',
        budget: 92_500_000_000,
        realized: 80_000_000_000,
        targetMustahik: 1_200,
        realizedMustahik: 1_020,
        status: 'Aktif',
      },
      {
        code: 'TS-03',
        name: 'Layanan Ambulans Jenazah & Medis 24 Jam',
        desc: 'Operasional armada ambulans gratis antar-jemput pasien kritis dan pemakaman duka.',
        budget: 100_000_000_000,
        realized: 85_000_000_000,
        targetMustahik: 2_500,
        realizedMustahik: 2_300,
        status: 'Aktif',
      },
      {
        code: 'TS-04',
        name: 'Sanitasi Jamban Sehat & Intervensi Stunting',
        desc: 'Pembangunan MCK layak di pemukiman padat dan suplemen protein tinggi ibu hamil.',
        budget: 50_000_000_000,
        realized: 40_000_000_000,
        targetMustahik: 800,
        realizedMustahik: 600,
        status: 'Aktif',
      },
    ],
    recentDistributions: [
      { date: '2026-07-04', mustahik: 'Pak Subarjo (Pasien Jantung)', subProg: 'Biaya Medis RSU', amount: 15_000_000, wilayah: 'Kec. Neglasari', status: 'Disalurkan' },
      { date: '2026-07-03', mustahik: 'Adinda Zahra (Difabel)', subProg: 'Kursi Roda Medis', amount: 3_500_000, wilayah: 'Kec. Periuk', status: 'Disalurkan' },
      { date: '2026-07-01', mustahik: 'Ibu Nurbaiti (Operasi Mata)', subProg: 'Biaya Medis RSU', amount: 7_000_000, wilayah: 'Kec. Batuceper', status: 'Disalurkan' },
    ],
  },
  {
    id: 'PRG-PEDULI',
    pilarNum: '3',
    name: 'Tangerang Peduli',
    category: 'Sosial Kemanusiaan',
    slogan: 'Respon Cepat Kedaruratan Sosial, Kebencanaan & Perlindungan Duafa',
    icon: AlertTriangle,
    brandColor: '#e11d48',
    bgBadge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    budget: 378_000_000_000,
    realized: 330_000_000_000,
    targetMustahik: 25_000,
    realizedMustahik: 23_400,
    asnafTarget: 'Fakir, Miskin, Gharimin',
    description: 'Garda terdepan penyelamatan kedaruratan sosial: bantuan paket sembako bulanan, program Bedah Rumah Tidak Layak Huni (RTLH), santunan berkala anak yatim, serta Posko Tanggap Bencana BAZNAS (BTB).',
    kpiMetrics: [
      { label: 'RTLH Tuntas Dibedah', value: '185 Unit' },
      { label: 'Paket Pangan Tersalur', value: '18.400 Paket' },
      { label: 'Waktu Respon Bencana', value: '< 2 Jam' },
    ],
    subPrograms: [
      {
        code: 'TP-01',
        name: 'Bedah Rumah Tidak Layak Huni (RTLH)',
        desc: 'Renovasi total atap, lantai, dinding, dan sanitasi rumah keluarga miskin ekstrem.',
        budget: 140_000_000_000,
        realized: 125_000_000_000,
        targetMustahik: 250,
        realizedMustahik: 215,
        status: 'Aktif',
      },
      {
        code: 'TP-02',
        name: 'Paket Sembako Berkah Duafa & Lansia Sebatang Kara',
        desc: 'Distribusi bahan makanan pokok bulanan untuk pemenuhan gizi keluarga prasejahtera.',
        budget: 130_000_000_000,
        realized: 115_000_000_000,
        targetMustahik: 18_000,
        realizedMustahik: 16_800,
        status: 'Aktif',
      },
      {
        code: 'TP-03',
        name: 'Santunan Rutin & Uang Saku Anak Yatim Piatu',
        desc: 'Bantuan santunan berkala pembinaan karakter dan kebutuhan hidup yatim piatu.',
        budget: 68_000_000_000,
        realized: 60_000_000_000,
        targetMustahik: 5_000,
        realizedMustahik: 4_800,
        status: 'Aktif',
      },
      {
        code: 'TP-04',
        name: 'Dapur Umum & Tanggap Bencana Banjir/Kebakaran (BTB)',
        desc: 'Operasional relawan, evakuasi, dan logistik kedaruratan saat musibah bencana melanda.',
        budget: 40_000_000_000,
        realized: 30_000_000_000,
        targetMustahik: 1_750,
        realizedMustahik: 1_585,
        status: 'Aktif',
      },
    ],
    recentDistributions: [
      { date: '2026-07-04', mustahik: 'Pak Saprudin (RTLH)', subProg: 'Bedah Rumah RTLH', amount: 25_000_000, wilayah: 'Kec. Jatiuwung', status: 'Disalurkan' },
      { date: '2026-07-03', mustahik: 'Nenek Marwiyah (Lansia)', subProg: 'Paket Pangan Sembako', amount: 650_000, wilayah: 'Kec. Karang Tengah', status: 'Disalurkan' },
      { date: '2026-07-02', mustahik: 'Ananda Bagas (Yatim)', subProg: 'Santunan Yatim Piatu', amount: 1_000_000, wilayah: 'Kec. Pinang', status: 'Disalurkan' },
    ],
  },
  {
    id: 'PRG-MAKMUR',
    pilarNum: '4',
    name: 'Tangerang Makmur',
    category: 'Pemberdayaan Ekonomi',
    slogan: 'Mentransformasikan Mustahik Menjadi Muzakki Mandiri',
    icon: Coins,
    brandColor: '#d97706',
    bgBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    budget: 226_800_000_000,
    realized: 180_000_000_000,
    targetMustahik: 3_500,
    realizedMustahik: 2_950,
    asnafTarget: 'Miskin, Gharimin, Fisabilillah',
    description: 'Inkubasi bisnis mikro dan modal usaha produktif tanpa bunga/riba: program franchise Z-Chicken, warung Z-Mart, modal gerobak kuliner, serta pendampingan sertifikasi Halal UMKM.',
    kpiMetrics: [
      { label: 'Kenaikan Omzet Usaha', value: '+68.5%' },
      { label: 'Kelulusan Jadi Muzakki', value: '182 UMKM' },
      { label: 'Gerai Z-Mart Aktif', value: '95 Unit' },
    ],
    subPrograms: [
      {
        code: 'TM-01',
        name: 'Inkubasi Waralaba Z-Chicken & Gerobak Berkah',
        desc: 'Bantuan paket booth, bahan baku awal, dan resep bumbu fried chicken syariah.',
        budget: 90_000_000_000,
        realized: 75_000_000_000,
        targetMustahik: 1_200,
        realizedMustahik: 1_050,
        status: 'Aktif',
      },
      {
        code: 'TM-02',
        name: 'Pemberdayaan Warung Kelontong Z-Mart BAZNAS',
        desc: 'Renovasi visual etalase warung, digital POS kasir, dan pasokan grosir murah.',
        budget: 60_000_000_000,
        realized: 48_000_000_000,
        targetMustahik: 800,
        realizedMustahik: 680,
        status: 'Aktif',
      },
      {
        code: 'TM-03',
        name: 'Modal Kerja Usaha Bergulir & Sertifikasi Halal',
        desc: 'Injeksi modal tanpa agunan dan fasilitasi izin edar BPOM/Sertifikat Halal MUI.',
        budget: 46_800_000_000,
        realized: 37_000_000_000,
        targetMustahik: 1_000,
        realizedMustahik: 820,
        status: 'Aktif',
      },
      {
        code: 'TM-04',
        name: 'Pelatihan Vokasi, Barista & Bengkel Motor Z-Auto',
        desc: 'Kursus keterampilan kerja siap pakai bagi pemuda pengangguran dari keluarga duafa.',
        budget: 30_000_000_000,
        realized: 20_000_000_000,
        targetMustahik: 500,
        realizedMustahik: 400,
        status: 'Aktif',
      },
    ],
    recentDistributions: [
      { date: '2026-07-04', mustahik: 'Pak Hendra Gunawan', subProg: 'Booth & Modal Z-Chicken', amount: 9_500_000, wilayah: 'Kec. Cibodas', status: 'Disalurkan' },
      { date: '2026-07-02', mustahik: 'Ibu Ratna Dewi (Warung)', subProg: 'Revitalisasi Z-Mart', amount: 5_000_000, wilayah: 'Kec. Tangerang', status: 'Disalurkan' },
      { date: '2026-06-30', mustahik: 'Sdr. Fajar Hidayat', subProg: 'Toolkit Bengkel Z-Auto', amount: 6_200_000, wilayah: 'Kec. Benda', status: 'Disalurkan' },
    ],
  },
  {
    id: 'PRG-TAKWA',
    pilarNum: '5',
    name: 'Tangerang Takwa',
    category: 'Dakwah & Advokasi Syiar',
    slogan: 'Memperkokoh Akidah, Pembinaan Mualaf & Kemakmuran Rumah Ibadah',
    icon: BookOpen,
    brandColor: '#7c3aed',
    bgBadge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    budget: 151_200_000_000,
    realized: 120_000_000_000,
    targetMustahik: 1_200,
    realizedMustahik: 1_040,
    asnafTarget: 'Mualaf, Fisabilillah, Amil',
    description: 'Penguatan spiritual dan syiar Islam: pembinaan muallaf center, renovasi mushola/masjid di pemukiman prasejahtera, penyediaan mushaf Al-Qur’an, serta advokasi perlindungan mustahik.',
    kpiMetrics: [
      { label: 'Mualaf Dibina Intensif', value: '260 Orang' },
      { label: 'Masjid/Mushola Direnovasi', value: '42 Unit' },
      { label: 'Da’i Syiar Terfasilitasi', value: '110 Ustadz' },
    ],
    subPrograms: [
      {
        code: 'TT-01',
        name: 'Mualaf Center & Bantuan Kemandirian Akidah',
        desc: 'Bimbingan syariat fardhu ain, bantuan tempat tinggal, dan paket modal usaha mualaf.',
        budget: 50_000_000_000,
        realized: 40_000_000_000,
        targetMustahik: 300,
        realizedMustahik: 260,
        status: 'Aktif',
      },
      {
        code: 'TT-02',
        name: 'Renovasi Sarpras Mushola/Masjid Kampung Duafa',
        desc: 'Bantuan sound system, karpet, tempat wudhu, dan perbaikan atap bocor tempat ibadah.',
        budget: 51_200_000_000,
        realized: 42_000_000_000,
        targetMustahik: 50,
        realizedMustahik: 42,
        status: 'Aktif',
      },
      {
        code: 'TT-03',
        name: 'Kafalah Da’i Perbatasan & Guru Mengaji Lansia',
        desc: 'Honorarium bulanan para pejuang dakwah di kawasan marginal dan binaan khusus.',
        budget: 30_000_000_000,
        realized: 23_000_000_000,
        targetMustahik: 400,
        realizedMustahik: 350,
        status: 'Aktif',
      },
      {
        code: 'TT-04',
        name: 'Penyediaan Al-Qur’an & Layanan Advokasi Kaum Rentan',
        desc: 'Distribusi ribuan mushaf Al-Qur’an standar, Al-Qur’an Braille, dan bantuan hukum.',
        budget: 20_000_000_000,
        realized: 15_000_000_000,
        targetMustahik: 450,
        realizedMustahik: 388,
        status: 'Aktif',
      },
    ],
    recentDistributions: [
      { date: '2026-07-03', mustahik: 'Masjid Jami Al-Muhajirin', subProg: 'Renovasi Tempat Wudhu', amount: 15_000_000, wilayah: 'Kec. Larangan', status: 'Disalurkan' },
      { date: '2026-07-02', mustahik: 'Saudara Yohanes (Mualaf)', subProg: 'Bina Mualaf Center', amount: 4_500_000, wilayah: 'Kec. Karawaci', status: 'Disalurkan' },
      { date: '2026-06-29', mustahik: 'Mushola Nurul Huda', subProg: 'Sound System & Karpet', amount: 8_000_000, wilayah: 'Kec. Benda', status: 'Disalurkan' },
    ],
  },
];

export default function ProgramBantuanPage({ onNavigate }) {
  const [selectedPilarId, setSelectedPilarId] = useState('PRG-CERDAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateTargetSub, setAllocateTargetSub] = useState(null);

  // Form allocation state
  const [allocateForm, setAllocateForm] = useState({
    mustahikName: '',
    nik: '',
    phone: '',
    amount: '',
    kecamatan: 'Ciledug',
    notes: '',
  });

  const [toast, setToast] = useState({ show: false, message: '' });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  // Selected Pilar
  const activePilar = useMemo(() => {
    return PROGRAMS_DATA.find((p) => p.id === selectedPilarId) || PROGRAMS_DATA[0];
  }, [selectedPilarId]);

  // Overall National / Regional RKAT Stats
  const rkatTotals = useMemo(() => {
    const totalBudget = PROGRAMS_DATA.reduce((sum, p) => sum + p.budget, 0);
    const totalRealized = PROGRAMS_DATA.reduce((sum, p) => sum + p.realized, 0);
    const remainingBudget = totalBudget - totalRealized;
    const overallPercentage = Math.round((totalRealized / totalBudget) * 100);
    const totalBeneficiaries = PROGRAMS_DATA.reduce((sum, p) => sum + p.realizedMustahik, 0);
    const targetBeneficiaries = PROGRAMS_DATA.reduce((sum, p) => sum + p.targetMustahik, 0);

    return {
      totalBudget,
      totalRealized,
      remainingBudget,
      overallPercentage,
      totalBeneficiaries,
      targetBeneficiaries,
    };
  }, []);

  // Filtered sub-programs
  const filteredSubPrograms = useMemo(() => {
    if (!searchTerm.trim()) return activePilar.subPrograms;
    const search = searchTerm.toLowerCase();
    return activePilar.subPrograms.filter(
      (sub) =>
        sub.name.toLowerCase().includes(search) ||
        sub.desc.toLowerCase().includes(search) ||
        sub.code.toLowerCase().includes(search)
    );
  }, [activePilar, searchTerm]);

  const handleOpenAllocate = (sub) => {
    setAllocateTargetSub(sub);
    setAllocateForm({
      mustahikName: '',
      nik: '',
      phone: '',
      amount: String(Math.round(sub.realized / (sub.realizedMustahik || 1))),
      kecamatan: 'Ciledug',
      notes: `Alokasi untuk ${sub.name}`,
    });
    setShowAllocateModal(true);
  };

  const handleSaveAllocate = (e) => {
    e.preventDefault();
    if (!allocateForm.mustahikName || !allocateForm.nik) {
      alert('Nama dan NIK wajib diisi!');
      return;
    }
    showToast(`Mustahik "${allocateForm.mustahikName}" berhasil dialokasikan ke sub-program ${allocateTargetSub.name}!`);
    setShowAllocateModal(false);
  };

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-5 sm:space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-card border border-border shadow-2xl rounded-2xl p-4 animate-fade-in pr-12 min-w-[340px]">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5 shrink-0" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-foreground">Alokasi Berhasil</span>
            <span className="text-[11px] text-muted-foreground">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast({ show: false, message: '' })}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Layers className="size-6 text-emerald-600 shrink-0" />
              Program Bantuan 5 Pilar & Realisasi RKAT
            </h1>
            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[11px] font-bold">
              Standar BAZNAS Nasional
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Pusat tata kelola dan evaluasi 5 pilar program penyaluran zakat se-Kota Tangerang: memonitor serapan anggaran RKAT, realisasi kuota penerima manfaat, dan efektivitas dampak program (SROI).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8.5 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            onClick={() => setShowSimModal(true)}
          >
            <Calculator className="size-3.5 text-emerald-600" /> Simulasi Anggaran RKAT
          </Button>

          <Button
            size="sm"
            className="h-8.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer px-3.5 gap-1.5"
            onClick={() => onNavigate && onNavigate('mustahik')}
          >
            <Users className="size-3.5" /> Buka Data Mustahik
          </Button>
        </div>
      </div>

      {/* Top 4 Executive RKAT Progress HUD Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Target className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target RKAT 5 Pilar</p>
              <h3 className="text-lg sm:text-xl font-black text-foreground">{formatRupiah(rkatTotals.totalBudget, true)}</h3>
              <p className="text-[10px] text-muted-foreground">Tahun Berjalan 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Realisasi Tersalurkan</p>
              <h3 className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">{formatRupiah(rkatTotals.totalRealized, true)}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">{rkatTotals.overallPercentage}% Serapan Anggaran</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mustahik Terbantu</p>
              <h3 className="text-lg sm:text-xl font-black text-foreground">{rkatTotals.totalBeneficiaries.toLocaleString('id-ID')} Jiwa</h3>
              <p className="text-[10px] text-muted-foreground">Target: {rkatTotals.targetBeneficiaries.toLocaleString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sisa Kuota Anggaran</p>
              <h3 className="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400">{formatRupiah(rkatTotals.remainingBudget, true)}</h3>
              <p className="text-[10px] text-muted-foreground">Tersedia untuk Penyaluran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5-Pilar Interactive Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {PROGRAMS_DATA.map((pilar) => {
          const isSelected = selectedPilarId === pilar.id;
          const percentage = Math.round((pilar.realized / pilar.budget) * 100);
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilarId(pilar.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-card border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-card/70 border-border/70 hover:bg-card hover:border-border hover:shadow-xs'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: pilar.brandColor }} />}

              <div className="flex items-center justify-between gap-1 mb-2">
                <div
                  className="size-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: pilar.brandColor }}
                >
                  <Icon className="size-5" />
                </div>
                <Badge className={`text-[10px] font-bold border ${pilar.bgBadge}`}>
                  Pilar {pilar.pilarNum}
                </Badge>
              </div>

              <h3 className="text-xs sm:text-sm font-extrabold text-foreground truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {pilar.name}
              </h3>
              <p className="text-[10px] text-muted-foreground truncate">{pilar.category}</p>

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground font-medium">Serapan:</span>
                  <span className="font-bold text-foreground">{percentage}% ({formatRupiah(pilar.realized, true)})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: pilar.brandColor }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Pilar Comprehensive Command Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (8 Cols): Pilar Overview & Sub-Program Portfolio */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Active Pilar Header Banner */}
          <Card className="shadow-xs border-border rounded-2xl overflow-hidden">
            <CardHeader className="p-5 sm:p-6 bg-gradient-to-br from-card to-muted/30 border-b border-border/70 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="size-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{ backgroundColor: activePilar.brandColor }}
                  >
                    <activePilar.icon className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-foreground">
                        {activePilar.name}
                      </h2>
                      <span className="text-xs font-bold text-muted-foreground">
                        ({activePilar.category})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {activePilar.slogan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-muted text-foreground text-xs px-2.5 py-1 font-bold">
                    Target Asnaf: {activePilar.asnafTarget}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activePilar.description}
              </p>

              {/* 3 KPI Highlights for this Pilar */}
              <div className="grid grid-cols-3 gap-2.5">
                {activePilar.kpiMetrics.map((kpi, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border/70 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-sm sm:text-base font-black text-foreground mt-0.5" style={{ color: activePilar.brandColor }}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sub-Programs Matrix */}
          <Card className="shadow-xs border-border rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Building className="size-4 text-emerald-600" />
                  Portofolio Sub-Program ({activePilar.subPrograms.length} Program Kerja Aktif)
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Daftar paket intervensi bantuan khusus di bawah pilar {activePilar.name}
                </p>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari Sub-Program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-xl"
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSubPrograms.map((sub) => {
                  const subPercentage = Math.round((sub.realized / sub.budget) * 100);

                  return (
                    <div
                      key={sub.code}
                      className="p-4 rounded-xl border border-border/80 bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <Badge variant="outline" className="text-[10px] font-mono font-bold">
                            {sub.code}
                          </Badge>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 text-[10px]">
                            {sub.status}
                          </Badge>
                        </div>
                        <h4 className="font-extrabold text-foreground text-xs leading-snug">
                          {sub.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {sub.desc}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Realisasi:</span>
                          <span className="font-bold text-foreground">
                            {formatRupiah(sub.realized, true)} / {formatRupiah(sub.budget, true)}
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${subPercentage}%`, backgroundColor: activePilar.brandColor }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>{sub.realizedMustahik.toLocaleString('id-ID')} dari {sub.targetMustahik.toLocaleString('id-ID')} Mustahik</span>
                          <span className="font-bold text-foreground">{subPercentage}%</span>
                        </div>

                        <Button
                          size="sm"
                          className="w-full h-7.5 text-xs font-bold gap-1 rounded-lg mt-1 bg-muted hover:bg-emerald-600 hover:text-white text-foreground transition-colors cursor-pointer"
                          onClick={() => handleOpenAllocate(sub)}
                        >
                          <Plus className="size-3" />
                          <span>Ajukan Mustahik ke Sub-Program Ini</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 Cols): Live Distribution Feed & Budget Health */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* Budget Health Summary */}
          <Card className="shadow-xs border-border rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border bg-emerald-950 text-white relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <CardTitle className="text-sm font-black text-white flex items-center justify-between">
                <span>Kesehatan Anggaran Pilar</span>
                <span className="text-xs font-mono text-emerald-300">RKAT 2026</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plafon Anggaran:</span>
                  <span className="font-bold text-foreground">{formatRupiah(activePilar.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dana Tersalurkan:</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(activePilar.realized)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa Alokasi:</span>
                  <span className="font-bold text-amber-600">{formatRupiah(activePilar.budget - activePilar.realized)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">Status Serapan Pilar</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    {Math.round((activePilar.realized / activePilar.budget) * 100)}%
                  </span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Optimal</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Telah menyalurkan bantuan kepada {activePilar.realizedMustahik.toLocaleString('id-ID')} mustahik di Kota Tangerang.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Distribution Feed for Selected Pilar */}
          <Card className="shadow-xs border-border rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <CardTitle className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-600" />
                Penyaluran Terkini ({activePilar.name})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[380px] text-xs">
              {activePilar.recentDistributions.map((trx, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-foreground text-xs truncate">{trx.mustahik}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs shrink-0">
                      {formatRupiah(trx.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">{trx.subProg} • {trx.wilayah}</span>
                    <span className="text-emerald-600 font-semibold shrink-0">{trx.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SIMULASI SKENARIO ANGGARAN MODAL */}
      {/* ========================================================================= */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Calculator className="size-5 text-amber-400" />
                  Kalkulator Simulasi Alokasi RKAT 5 Pilar
                </h3>
                <p className="text-xs text-emerald-200">Perhitungan Serapan Anggaran & Kuota Mustahik Semester II</p>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-2">
                <p className="font-bold text-foreground">Rincian Plafon Anggaran per Pilar:</p>
                <div className="space-y-2">
                  {PROGRAMS_DATA.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.brandColor }} />
                        <span className="font-bold text-foreground">{p.name}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-foreground">
                        {formatRupiah(p.budget, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Total Akumulasi Plafon RKAT</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{formatRupiah(rkatTotals.totalBudget)}</p>
                <p className="text-[11px] text-muted-foreground">Kapasitas Maksimal: 55.820 Mustahik Terlayani</p>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button size="sm" className="h-8.5 text-xs font-bold rounded-xl cursor-pointer" onClick={() => setShowSimModal(false)}>
                  Tutup Simulasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ALOKASI PENYALURAN SUB-PROGRAM MODAL */}
      {/* ========================================================================= */}
      {showAllocateModal && allocateTargetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Plus className="size-5 text-emerald-600" />
                  Alokasi Mustahik ke Sub-Program
                </h3>
                <p className="text-xs text-muted-foreground">Sub-Program: <span className="font-bold text-foreground">{allocateTargetSub.name}</span></p>
              </div>
              <button onClick={() => setShowAllocateModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocate} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Nama Lengkap Mustahik / Pemohon *</label>
                <Input
                  required
                  placeholder="Contoh: Ahmad Sulaiman"
                  value={allocateForm.mustahikName}
                  onChange={(e) => setAllocateForm({ ...allocateForm, mustahikName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">NIK KTP *</label>
                  <Input
                    required
                    maxLength={16}
                    placeholder="16 Digit NIK"
                    value={allocateForm.nik}
                    onChange={(e) => setAllocateForm({ ...allocateForm, nik: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">No. Handphone / WA</label>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={allocateForm.phone}
                    onChange={(e) => setAllocateForm({ ...allocateForm, phone: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Nominal Alokasi (Rp) *</label>
                  <Input
                    required
                    type="number"
                    value={allocateForm.amount}
                    onChange={(e) => setAllocateForm({ ...allocateForm, amount: e.target.value })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Kecamatan Domisili</label>
                  <select
                    value={allocateForm.kecamatan}
                    onChange={(e) => setAllocateForm({ ...allocateForm, kecamatan: e.target.value })}
                    className="w-full h-8 text-xs rounded-xl border border-border bg-background px-2.5 text-foreground cursor-pointer"
                  >
                    {['Ciledug', 'Cipondoh', 'Tangerang', 'Karawaci', 'Batuceper', 'Benda', 'Cibodas', 'Jatiuwung', 'Larangan', 'Neglasari', 'Periuk', 'Pinang', 'Karang Tengah'].map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Catatan / Uraian Bantuan</label>
                <Input
                  placeholder="Keterangan keperluan permohonan bantuan..."
                  value={allocateForm.notes}
                  onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8.5 text-xs rounded-xl cursor-pointer" onClick={() => setShowAllocateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer px-4">
                  Simpan & Alokasikan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
