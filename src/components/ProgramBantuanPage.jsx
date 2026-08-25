import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  HeartPulse,
  HeartHandshake,
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
  FileSpreadsheet,
  X,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Percent,
  Check,
  SlidersHorizontal,
  MapPin,
  Activity,
  ArrowRight,
  Printer,
  Compass,
  Award,
} from 'lucide-react';
import { formatRupiah } from '../utils/format';

// 5 Pilar BAZNAS Master Data with rich real-scale parameters
const PILAR_MASTER = [
  {
    id: 'PRG-CERDAS',
    pilarNum: '1',
    name: 'Tangerang Cerdas',
    category: 'Pendidikan & Beasiswa',
    pct: 73,
    sparkline: [20, 35, 40, 45, 55, 60, 68, 73],
    beneficiaries: 9842,
    brandColor: '#2563eb',
    icon: GraduationCap,
    bgBadge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    budget: 12_500_000_000,
    realized: 9_125_000_000,
    activities: 48_200,
    programsCount: 14,
    mainServices: '5 Layanan Utama',
    impactStatement: 'Akses pendidikan merata, angka putus sekolah turun drastis, dan generasi mustahik bertransformasi menjadi sarjana mandiri.',
    metrics: {
      primaryLabel: 'Siswa / Mahasiswa Terbantu',
      primaryValue: '9.842',
      primaryGrowth: '+14,2%',
      successRate: '88%',
      successCount: '8.660 Jiwa',
      avgAid: 'Rp 927 rb',
      activeProg: '14 Program',
      servicesCount: '5 Layanan Utama',
      districtsCovered: '13 / 13',
      newMustahik: '2.410 Jiwa',
    },
    monthlyData: [
      { month: 'Jan', realisasi: 650, target: 800 },
      { month: 'Feb', realisasi: 850, target: 900 },
      { month: 'Mar', realisasi: 1100, target: 1000 },
      { month: 'Apr', realisasi: 1250, target: 1100 },
      { month: 'Mei', realisasi: 1400, target: 1200 },
      { month: 'Jun', realisasi: 1350, target: 1200 },
      { month: 'Jul', realisasi: 1250, target: 1100 },
      { month: 'Agu', realisasi: 1275, target: 1100 },
      { month: 'Sep', realisasi: 0, target: 1100 },
      { month: 'Okt', realisasi: 0, target: 1100 },
      { month: 'Nov', realisasi: 0, target: 1100 },
      { month: 'Des', realisasi: 0, target: 1100 },
    ],
    funnel: [
      { stage: 'Proposal Masuk', count: 52 },
      { stage: 'Verifikasi Berkas', count: 44 },
      { stage: 'Disetujui MPZIS', count: 36 },
      { stage: 'Pencairan PPD', count: 28 },
      { stage: 'Bantuan Tersalurkan', count: 24 },
    ],
    asnafPie: [
      { name: 'Miskin', value: 4250, pct: '43%', color: '#d97706' },
      { name: 'Fakir', value: 3120, pct: '32%', color: '#e11d48' },
      { name: 'Fisabilillah', value: 1450, pct: '15%', color: '#059669' },
      { name: 'Ibnu Sabil', value: 680, pct: '7%', color: '#2563eb' },
      { name: 'Mualaf', value: 342, pct: '3%', color: '#0d9488' },
    ],
    topKecamatan: [
      { name: 'Karawaci', count: 1980, pct: '20%' },
      { name: 'Ciledug', count: 1720, pct: '17%' },
      { name: 'Cipondoh', count: 1540, pct: '16%' },
      { name: 'Batuceper', count: 1380, pct: '14%' },
      { name: 'Periuk', count: 1150, pct: '12%' },
    ],
    milestones: [
      { date: 'Jan 2026', title: 'Kick-off Beasiswa SKSS Tahap 1' },
      { date: 'Mar 2026', title: 'Penebusan Ijazah 420 Siswa SMK' },
      { date: 'Mei 2026', title: 'Pelatihan Digital Santri Pesantren' },
      { date: 'Jul 2026', title: 'Pemberian Insentif 1.200 Guru Ngaji' },
      { date: 'Agu 2026', title: 'Monev Semester 1 & Penyerapan RKAT' },
    ],
    subPrograms: [
      { code: 'TC-01', name: 'Beasiswa Satu Keluarga Satu Sarjana (SKSS)', desc: 'Beasiswa penuh kuliah S1/D3 bagi putra-putri keluarga prasejahtera.', budget: 3_500_000_000, realized: 2_950_000_000, mustahik: 1200, status: 'Aktif' },
      { code: 'TC-02', name: 'Penebusan Ijazah & Tunggakan SPP Sekolah', desc: 'Pelunasan tunggakan SPP agar siswa menerima ijazah kelulusan.', budget: 3_200_000_000, realized: 2_650_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TC-03', name: 'Insentif Guru Ngaji Tradisional & Honorer', desc: 'Tunjangan kehormatan bulanan bagi para pendidik Al-Qur’an di kelurahan.', budget: 3_000_000_000, realized: 2_150_000_000, mustahik: 3100, status: 'Aktif' },
      { code: 'TC-04', name: 'Digitalisasi Lab Komputer Santri Pesantren', desc: 'Pengadaan PC dan sarana internet cepat bagi santri pondok pesantren.', budget: 2_800_000_000, realized: 1_375_000_000, mustahik: 1342, status: 'Aktif' },
    ],
  },
  {
    id: 'PRG-MAKMUR',
    pilarNum: '2',
    name: 'Tangerang Makmur',
    category: 'Pemberdayaan Ekonomi & UMKM',
    pct: 66,
    sparkline: [15, 25, 38, 42, 50, 56, 62, 66],
    beneficiaries: 8306,
    brandColor: '#d97706',
    icon: Coins,
    bgBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    budget: 9_800_000_000,
    realized: 6_468_000_000,
    activities: 36_400,
    programsCount: 12,
    mainServices: '4 Layanan Utama',
    impactStatement: 'Mustahik mandiri menjadi muzakki, usaha mikro naik kelas, dan pendapatan keluarga duafa meningkat berkelanjutan.',
    metrics: {
      primaryLabel: 'Pelaku Usaha Mikro Binaan',
      primaryValue: '8.306',
      primaryGrowth: '+21,4%',
      successRate: '79%',
      successCount: '6.561 Jiwa',
      avgAid: 'Rp 778 rb',
      activeProg: '12 Program',
      servicesCount: '4 Layanan Utama',
      districtsCovered: '13 / 13',
      newMustahik: '1.980 Jiwa',
    },
    monthlyData: [
      { month: 'Jan', realisasi: 420, target: 700 },
      { month: 'Feb', realisasi: 610, target: 750 },
      { month: 'Mar', realisasi: 850, target: 800 },
      { month: 'Apr', realisasi: 980, target: 850 },
      { month: 'Mei', realisasi: 1050, target: 900 },
      { month: 'Jun', realisasi: 990, target: 900 },
      { month: 'Jul', realisasi: 820, target: 850 },
      { month: 'Agu', realisasi: 748, target: 850 },
      { month: 'Sep', realisasi: 0, target: 850 },
      { month: 'Okt', realisasi: 0, target: 850 },
      { month: 'Nov', realisasi: 0, target: 850 },
      { month: 'Des', realisasi: 0, target: 850 },
    ],
    funnel: [
      { stage: 'Proposal Masuk', count: 48 },
      { stage: 'Verifikasi Berkas', count: 39 },
      { stage: 'Disetujui MPZIS', count: 30 },
      { stage: 'Pencairan PPD', count: 24 },
      { stage: 'Bantuan Tersalurkan', count: 20 },
    ],
    asnafPie: [
      { name: 'Miskin', value: 4980, pct: '60%', color: '#d97706' },
      { name: 'Fakir', value: 2150, pct: '26%', color: '#e11d48' },
      { name: 'Mualaf', value: 650, pct: '8%', color: '#0d9488' },
      { name: 'Gharimin', value: 526, pct: '6%', color: '#7c3aed' },
    ],
    topKecamatan: [
      { name: 'Tangerang', count: 1840, pct: '22%' },
      { name: 'Jatiuwung', count: 1650, pct: '20%' },
      { name: 'Cipondoh', count: 1420, pct: '17%' },
      { name: 'Ciledug', count: 1280, pct: '15%' },
      { name: 'Larangan', count: 1120, pct: '13%' },
    ],
    milestones: [
      { date: 'Jan 2026', title: 'Peluncuran Modal Usaha Z-Auto' },
      { date: 'Mar 2026', title: 'Penyerahan 150 Gerobak Berkah' },
      { date: 'Mei 2026', title: 'Pelatihan Sertifikasi Halal 300 UMKM' },
      { date: 'Jul 2026', title: 'Bazar Pemberdayaan Mustahik Kota' },
      { date: 'Agu 2026', title: 'Graduasi 45 Mustahik Mandiri' },
    ],
    subPrograms: [
      { code: 'TM-01', name: 'Bantuan Modal Usaha Bergulir Z-Mart', desc: 'Suntikan modal tanpa bunga bagi warung kelontong mustahik.', budget: 3_200_000_000, realized: 2_450_000_000, mustahik: 3400, status: 'Aktif' },
      { code: 'TM-02', name: 'Gerobak Kuliner Berkah & Booth Usaha', desc: 'Bantuan etalase booth modern, kompor, dan alat masak.', budget: 2_600_000_000, realized: 1_850_000_000, mustahik: 2100, status: 'Aktif' },
      { code: 'TM-03', name: 'Pelatihan Vokasi & Bengkel Z-Auto', desc: 'Pelatihan montir bersertifikasi & modal alat bengkel.', budget: 2_200_000_000, realized: 1_350_000_000, mustahik: 1600, status: 'Aktif' },
      { code: 'TM-04', name: 'Binaan Pertanian & Perikanan Perkotaan', desc: 'Inkubasi budidaya lele dan hidroponik kelompok tani.', budget: 1_800_000_000, realized: 818_000_000, mustahik: 1206, status: 'Aktif' },
    ],
  },
  {
    id: 'PRG-SEHAT',
    pilarNum: '3',
    name: 'Tangerang Sehat',
    category: 'Kesehatan & Layanan Medis',
    pct: 82,
    sparkline: [22, 34, 48, 55, 62, 70, 78, 82],
    beneficiaries: 12374,
    brandColor: '#059669',
    icon: HeartPulse,
    bgBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    budget: 11_000_000_000,
    realized: 9_210_000_000,
    activities: 63842,
    programsCount: 18,
    mainServices: '6 Layanan Utama',
    impactStatement: 'Derajat kesehatan kaum duafa meningkat, beban biaya operasi & rawat inap tuntas teratasi, kualitas hidup lebih sejahtera.',
    metrics: {
      primaryLabel: 'Pasien / Mustahik Dilayani',
      primaryValue: '12.374',
      primaryGrowth: '+18,6%',
      successRate: '72%',
      successCount: '8.921 Pasien',
      avgAid: 'Rp 744 rb',
      activeProg: '18 Program',
      servicesCount: '6 Layanan Utama',
      districtsCovered: '13 / 13',
      newMustahik: '3.214 Jiwa',
    },
    monthlyData: [
      { month: 'Jan', realisasi: 520, target: 750 },
      { month: 'Feb', realisasi: 780, target: 800 },
      { month: 'Mar', realisasi: 1050, target: 850 },
      { month: 'Apr', realisasi: 1220, target: 900 },
      { month: 'Mei', realisasi: 1480, target: 950 },
      { month: 'Jun', realisasi: 1510, target: 950 },
      { month: 'Jul', realisasi: 1390, target: 900 },
      { month: 'Agu', realisasi: 1260, target: 900 },
      { month: 'Sep', realisasi: 0, target: 900 },
      { month: 'Okt', realisasi: 0, target: 900 },
      { month: 'Nov', realisasi: 0, target: 900 },
      { month: 'Des', realisasi: 0, target: 900 },
    ],
    funnel: [
      { stage: 'Proposal Masuk', count: 42 },
      { stage: 'Verifikasi Medis', count: 36 },
      { stage: 'Disetujui MPZIS', count: 28 },
      { stage: 'Pencairan PPD', count: 22 },
      { stage: 'Bantuan Tersalurkan', count: 18 },
    ],
    asnafPie: [
      { name: 'Fakir', value: 4128, pct: '33%', color: '#e11d48' },
      { name: 'Miskin', value: 4346, pct: '35%', color: '#d97706' },
      { name: 'Amil', value: 1611, pct: '13%', color: '#2563eb' },
      { name: 'Mualaf', value: 1187, pct: '10%', color: '#0d9488' },
      { name: 'Gharimin', value: 769, pct: '6%', color: '#7c3aed' },
      { name: 'Lainnya', value: 755, pct: '6%', color: '#64748b' },
    ],
    topKecamatan: [
      { name: 'Karawaci', count: 2186, pct: '18%' },
      { name: 'Ciledug', count: 1846, pct: '15%' },
      { name: 'Cipondoh', count: 1673, pct: '14%' },
      { name: 'Batuceper', count: 1435, pct: '12%' },
      { name: 'Periuk', count: 1221, pct: '10%' },
    ],
    milestones: [
      { date: 'Jan 2026', title: 'Kick-off program kesehatan' },
      { date: 'Mar 2026', title: 'Peluncuran layanan mobile klinik' },
      { date: 'Mei 2026', title: 'Penambahan mitra fasilitas kesehatan' },
      { date: 'Jul 2026', title: 'Program gizi ibu & anak diperluas' },
      { date: 'Agu 2026', title: 'Review capaian & optimasi program' },
    ],
    subPrograms: [
      { code: 'TS-01', name: 'Bantuan Rawat Inap & Operasi Kritis RSU', desc: 'Bantuan biaya tindakan medis, ICU, dan farmasi di RSUD & RS Mitra.', budget: 4_200_000_000, realized: 3_850_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TS-02', name: 'Pengadaan Alat Bantu Disabilitas & Lansia', desc: 'Penyaluran kursi roda standar/cerebral palsy, tongkat, dan kaki palsu.', budget: 2_600_000_000, realized: 2_150_000_000, mustahik: 1450, status: 'Aktif' },
      { code: 'TS-03', name: 'Layanan Ambulans Gratis 24 Jam Antar-Jemput', desc: 'Operasional armada ambulans gratis pasien dhuafa dan jenazah.', budget: 2_400_000_000, realized: 1_980_000_000, mustahik: 4800, status: 'Aktif' },
      { code: 'TS-04', name: 'Sanitasi Jamban Sehat & Intervensi Stunting', desc: 'Pembangunan MCK layak keluarga padat dan paket suplemen gizi anak.', budget: 1_800_000_000, realized: 1_230_000_000, mustahik: 1924, status: 'Aktif' },
    ],
  },
  {
    id: 'PRG-PEDULI',
    pilarNum: '4',
    name: 'Tangerang Peduli',
    category: 'Sosial & Tanggap Bencana',
    pct: 61,
    sparkline: [18, 28, 36, 44, 49, 53, 58, 61],
    beneficiaries: 6501,
    brandColor: '#e11d48',
    icon: HeartHandshake,
    bgBadge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    budget: 8_500_000_000,
    realized: 5_185_000_000,
    activities: 29_800,
    programsCount: 10,
    mainServices: '4 Layanan Utama',
    impactStatement: 'Respon cepat bencana banjir/kebakaran, hunian duafa tuntas dibedah layak huni, dan santunan yatim terjamin rutin.',
    metrics: {
      primaryLabel: 'Keluarga Mustahik Tertolong',
      primaryValue: '6.501',
      primaryGrowth: '+9,8%',
      successRate: '91%',
      successCount: '5.915 KK',
      avgAid: 'Rp 798 rb',
      activeProg: '10 Program',
      servicesCount: '4 Layanan Utama',
      districtsCovered: '13 / 13',
      newMustahik: '1.420 Jiwa',
    },
    monthlyData: [
      { month: 'Jan', realisasi: 410, target: 600 },
      { month: 'Feb', realisasi: 550, target: 650 },
      { month: 'Mar', realisasi: 720, target: 700 },
      { month: 'Apr', realisasi: 890, target: 750 },
      { month: 'Mei', realisasi: 950, target: 750 },
      { month: 'Jun', realisasi: 840, target: 750 },
      { month: 'Jul', realisasi: 790, target: 700 },
      { month: 'Agu', realisasi: 635, target: 700 },
      { month: 'Sep', realisasi: 0, target: 700 },
      { month: 'Okt', realisasi: 0, target: 700 },
      { month: 'Nov', realisasi: 0, target: 700 },
      { month: 'Des', realisasi: 0, target: 700 },
    ],
    funnel: [
      { stage: 'Proposal Masuk', count: 38 },
      { stage: 'Verifikasi Berkas', count: 32 },
      { stage: 'Disetujui MPZIS', count: 26 },
      { stage: 'Pencairan PPD', count: 20 },
      { stage: 'Bantuan Tersalurkan', count: 16 },
    ],
    asnafPie: [
      { name: 'Fakir', value: 3250, pct: '50%', color: '#e11d48' },
      { name: 'Miskin', value: 2450, pct: '38%', color: '#d97706' },
      { name: 'Gharimin', value: 520, pct: '8%', color: '#7c3aed' },
      { name: 'Ibnu Sabil', value: 281, pct: '4%', color: '#2563eb' },
    ],
    topKecamatan: [
      { name: 'Periuk', count: 1450, pct: '22%' },
      { name: 'Jatiuwung', count: 1320, pct: '20%' },
      { name: 'Karawaci', count: 1210, pct: '19%' },
      { name: 'Ciledug', count: 1100, pct: '17%' },
      { name: 'Neglasari', count: 921, pct: '14%' },
    ],
    milestones: [
      { date: 'Jan 2026', title: 'Posko Tanggap Bencana Banjir' },
      { date: 'Mar 2026', title: 'Serah Terima 45 Unit Bedah Rumah RTLH' },
      { date: 'Mei 2026', title: 'Penyaluran Paket Sembako Ramadan' },
      { date: 'Jul 2026', title: 'Santunan Akbar 1.000 Anak Yatim' },
      { date: 'Agu 2026', title: 'Distribusi Air Bersih Kemarau' },
    ],
    subPrograms: [
      { code: 'TP-01', name: 'Bedah Rumah Tidak Layak Huni (RTLH)', desc: 'Renovasi total atap, lantai, dinding dan sanitasi hunian duafa.', budget: 3_500_000_000, realized: 2_450_000_000, mustahik: 185, status: 'Aktif' },
      { code: 'TP-02', name: 'Paket Pangan Sembako Duafa & Lansia', desc: 'Bantuan bahan pokok rutin bagi lansia sebatang kara dan prasejahtera.', budget: 2_600_000_000, realized: 1_650_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TP-03', name: 'Santunan Rutin Yatim Piatu Dhuafa', desc: 'Uang saku bulanan dan beasiswa pembinaan anak yatim dhuafa.', budget: 1_400_000_000, realized: 750_000_000, mustahik: 1500, status: 'Aktif' },
      { code: 'TP-04', name: 'Dapur Umum & Tanggap Darurat Bencana (BTB)', desc: 'Logistik kedaruratan, evakuasi, dan relawan bencana alam.', budget: 1_000_000_000, realized: 335_000_000, mustahik: 616, status: 'Aktif' },
    ],
  },
  {
    id: 'PRG-TAKWA',
    pilarNum: '5',
    name: 'Tangerang Takwa',
    category: 'Dakwah & Advokasi Keumatan',
    pct: 78,
    sparkline: [20, 30, 42, 50, 60, 68, 74, 78],
    beneficiaries: 5423,
    brandColor: '#7c3aed',
    icon: BookOpen,
    bgBadge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    budget: 6_200_000_000,
    realized: 4_836_000_000,
    activities: 22_500,
    programsCount: 8,
    mainServices: '3 Layanan Utama',
    impactStatement: 'Syiar Islam semakin semarak, sarana ibadah bersih & makmur, bimbingan aqidah mualaf terpantau berkala.',
    metrics: {
      primaryLabel: 'Penerima Manfaat Dakwah',
      primaryValue: '5.423',
      primaryGrowth: '+12,5%',
      successRate: '94%',
      successCount: '5.097 Jiwa',
      avgAid: 'Rp 891 rb',
      activeProg: '8 Program',
      servicesCount: '3 Layanan Utama',
      districtsCovered: '13 / 13',
      newMustahik: '950 Jiwa',
    },
    monthlyData: [
      { month: 'Jan', realisasi: 380, target: 450 },
      { month: 'Feb', realisasi: 490, target: 500 },
      { month: 'Mar', realisasi: 780, target: 600 },
      { month: 'Apr', realisasi: 850, target: 650 },
      { month: 'Mei', realisasi: 820, target: 600 },
      { month: 'Jun', realisasi: 640, target: 550 },
      { month: 'Jul', realisasi: 510, target: 500 },
      { month: 'Agu', realisasi: 466, target: 500 },
      { month: 'Sep', realisasi: 0, target: 500 },
      { month: 'Okt', realisasi: 0, target: 500 },
      { month: 'Nov', realisasi: 0, target: 500 },
      { month: 'Des', realisasi: 0, target: 500 },
    ],
    funnel: [
      { stage: 'Proposal Masuk', count: 32 },
      { stage: 'Verifikasi Berkas', count: 28 },
      { stage: 'Disetujui MPZIS', count: 24 },
      { stage: 'Pencairan PPD', count: 18 },
      { stage: 'Bantuan Tersalurkan', count: 15 },
    ],
    asnafPie: [
      { name: 'Fisabilillah', value: 3150, pct: '58%', color: '#059669' },
      { name: 'Mualaf', value: 1250, pct: '23%', color: '#0d9488' },
      { name: 'Fakir', value: 680, pct: '13%', color: '#e11d48' },
      { name: 'Ibnu Sabil', value: 343, pct: '6%', color: '#2563eb' },
    ],
    topKecamatan: [
      { name: 'Pinang', count: 1240, pct: '23%' },
      { name: 'Cipondoh', count: 1180, pct: '22%' },
      { name: 'Tangerang', count: 1090, pct: '20%' },
      { name: 'Karawaci', count: 980, pct: '18%' },
      { name: 'Benda', count: 933, pct: '17%' },
    ],
    milestones: [
      { date: 'Jan 2026', title: 'Renovasi 24 Musholla Pelosok' },
      { date: 'Mar 2026', title: 'Safari Ramadan & Da’i Perkotaan' },
      { date: 'Mei 2026', title: 'Pembinaan Mualaf Center BAZNAS' },
      { date: 'Jul 2026', title: 'Pelatihan Imam & Marbot Masjid' },
      { date: 'Agu 2026', title: 'Wisuda Santri Tahfidz Dhuafa' },
    ],
    subPrograms: [
      { code: 'TT-01', name: 'Renovasi Tempat Wudhu & Toilet Musholla', desc: 'Perbaikan sarana sanitasi air bersih tempat ibadah perkampungan.', budget: 2_400_000_000, realized: 2_150_000_000, mustahik: 1200, status: 'Aktif' },
      { code: 'TT-02', name: 'Bimbingan Aqidah & Muamalah Mualaf Center', desc: 'Kelas rutin aqidah, fiqih ibadah, dan bantuan biaya hidup mualaf.', budget: 1_600_000_000, realized: 1_280_000_000, mustahik: 1450, status: 'Aktif' },
      { code: 'TT-03', name: 'Kafalah Guru Ngaji & Marbot Masjid Dhuafa', desc: 'Insentif bulanan bagi para penjaga dan pemakmur masjid dhuafa.', budget: 1_400_000_000, realized: 980_000_000, mustahik: 1800, status: 'Aktif' },
      { code: 'TT-04', name: 'Beasiswa Santri Kader Ulama & Tahfidz', desc: 'Kafalah beasiswa khusus calon huffadz dan kader ulama muda.', budget: 800_000_000, realized: 426_000_000, mustahik: 973, status: 'Aktif' },
    ],
  },
];

export default function ProgramBantuanPage({ onNavigate }) {
  const [selectedPilarId, setSelectedPilarId] = useState('PRG-SEHAT');
  const activePilar = useMemo(
    () => PILAR_MASTER.find((p) => p.id === selectedPilarId) || PILAR_MASTER[2],
    [selectedPilarId]
  );

  // Search in sub-programs
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation & Allocation Modals
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateTargetSub, setAllocateTargetSub] = useState(null);
  const [allocateForm, setAllocateForm] = useState({ mustahikName: '', nik: '', amount: '3500000', asnaf: 'Miskin' });

  // Custom Toast
  const [toast, setToast] = useState({ show: false, message: '' });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleOpenAllocate = (sub) => {
    setAllocateTargetSub(sub);
    setAllocateForm({
      mustahikName: '',
      nik: '',
      amount: '3500000',
      asnaf: 'Miskin',
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

  // Filtered sub-programs
  const filteredSubPrograms = useMemo(() => {
    if (!searchTerm.trim()) return activePilar.subPrograms;
    const q = searchTerm.toLowerCase();
    return activePilar.subPrograms.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.code.toLowerCase().includes(q) ||
        sub.desc.toLowerCase().includes(q)
    );
  }, [activePilar, searchTerm]);

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-card border border-border shadow-2xl rounded-2xl p-4 sm:p-5 animate-fade-in pr-12 min-w-[340px] max-w-md">
          <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-foreground">Alokasi Berhasil Disimpan</p>
            <p className="text-xs text-muted-foreground">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ show: false, message: '' })}
            className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 1. TOP PILAR SELECTOR HUD CARDS (5 Cards with Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
        {PILAR_MASTER.map((pilar) => {
          const isSelected = selectedPilarId === pilar.id;
          const sparkData = pilar.sparkline.map((val, i) => ({ i, val }));
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilarId(pilar.id)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-card border-emerald-600 shadow-lg ring-2 ring-emerald-500/20'
                  : 'bg-card/75 border-border/80 hover:bg-card hover:border-border hover:shadow-md'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: pilar.brandColor }} />}

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg lg:text-xl font-black text-emerald-600 font-mono">
                    {pilar.pct}%
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">capaian</span>
                </div>
                <div
                  className="size-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: pilar.brandColor }}
                >
                  <Icon className="size-4" />
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">
                {pilar.beneficiaries.toLocaleString('id-ID')} penerima manfaat
              </p>

              {/* Sparkline Graphic */}
              <div className="h-12 sm:h-14 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={pilar.brandColor}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-1 pt-2.5 border-t border-border/70 flex items-center justify-between">
                <span className="text-sm sm:text-base font-extrabold text-foreground truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {pilar.name}
                </span>
                <Badge variant="outline" className={`text-[11px] font-bold py-0.5 px-2 ${pilar.bgBadge}`}>
                  Pilar {pilar.pilarNum}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. VALUE CHAIN SECTION: "Dari anggaran ke dampak — [Nama Pilar]" */}
      <Card className="shadow-xs border-border rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg lg:text-xl font-black text-foreground flex items-center gap-2">
              <span>Dari Anggaran ke Dampak Sosial — <span style={{ color: activePilar.brandColor }}>{activePilar.name}</span></span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Rantai transformasi dana zakat menjadi kemaslahatan nyata bagi kaum mustahik Kota Tangerang
            </CardDescription>
          </div>
          <Badge className={`text-xs sm:text-sm font-bold px-3 py-1 self-start sm:self-auto ${activePilar.bgBadge}`}>
            Target: {activePilar.category}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 lg:p-7">
          {/* 5-Step Value Chain Responsive Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
            {/* Step 1: Anggaran */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex flex-col justify-between text-center space-y-2 hover:bg-muted/60 transition-colors">
              <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">1. Anggaran RKAT</p>
                <p className="text-base sm:text-lg lg:text-xl font-black font-mono text-foreground mt-1">{formatRupiah(activePilar.realized, true)}</p>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">{activePilar.pct}% dari target tahunan</p>
              </div>
            </div>

            {/* Step 2: Program & Intervensi */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex flex-col justify-between text-center space-y-2 hover:bg-muted/60 transition-colors">
              <div className="size-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">2. Program & Intervensi</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-foreground mt-1">{activePilar.programsCount} Sub-Program</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activePilar.mainServices}</p>
              </div>
            </div>

            {/* Step 3: Aktivitas */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex flex-col justify-between text-center space-y-2 hover:bg-muted/60 transition-colors">
              <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center mx-auto">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">3. Aktivitas Layanan</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-foreground mt-1">{activePilar.activities.toLocaleString('id-ID')} Kegiatan</p>
                <p className="text-xs text-muted-foreground mt-0.5">Periode Jan–Agu 2026</p>
              </div>
            </div>

            {/* Step 4: Output */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex flex-col justify-between text-center space-y-2 hover:bg-muted/60 transition-colors">
              <div className="size-10 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">4. Output Penerima</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-foreground mt-1">{activePilar.beneficiaries.toLocaleString('id-ID')} Jiwa</p>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">{activePilar.pct}% dari kuota target</p>
              </div>
            </div>

            {/* Step 5: Dampak */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between text-center space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <HeartHandshake className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">5. Dampak Sosial</p>
                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed mt-1">{activePilar.impactStatement}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. CHARTS ROW: TREN BULANAN (Left 7-8 cols) & DAMPAK UTAMA (Right 4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Monthly Trend & Projection */}
        <Card className="lg:col-span-7 xl:col-span-8 shadow-xs border-border rounded-2xl flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                Tren Penyaluran Bulanan — {activePilar.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Perbandingan nominal realisasi penyaluran vs target per bulan (dalam Rp Juta)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-xs bg-emerald-600" /> Realisasi Salur</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-xs bg-blue-500/50" /> Target RKAT</span>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="h-72 sm:h-80 lg:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activePilar.monthlyData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.7} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 600 }} />
                  <Tooltip
                    formatter={(v) => [`Rp ${v} Juta`, '']}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.75rem', fontSize: '13px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="realisasi" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#3b82f6" opacity={0.35} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Proyeksi 2026 Strip */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Proyeksi Penyerapan 2026:</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-foreground">
                    {formatRupiah(activePilar.budget, true)}
                  </span>
                  <Badge variant="outline" className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20">
                    102% dari target RKAT
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-5 text-xs sm:text-sm text-muted-foreground">
                <span>Target Pagu: <strong className="text-foreground">{formatRupiah(activePilar.budget, true)}</strong></span>
                <span>Sisa Kuota: <strong className="text-amber-600 font-mono">{formatRupiah(activePilar.budget - activePilar.realized, true)}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dampak Utama Matrix */}
        <Card className="lg:col-span-5 xl:col-span-4 shadow-xs border-border rounded-2xl flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/70">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              Dampak Utama — {activePilar.name}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Capaian performa intervensi program bagi mustahik
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">{activePilar.metrics.primaryLabel}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.primaryValue}</p>
                <p className="text-xs text-emerald-600 font-bold">{activePilar.metrics.primaryGrowth} vs semester lalu</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Intervensi Berhasil</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.successCount}</p>
                <p className="text-xs text-emerald-600 font-bold">Tingkat sukses {activePilar.metrics.successRate}</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Rata-rata Bantuan</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.avgAid}</p>
                <p className="text-xs text-muted-foreground">Per penerima manfaat</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Program Aktif</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.activeProg}</p>
                <p className="text-xs text-muted-foreground">{activePilar.metrics.servicesCount}</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Kecamatan Terjangkau</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.districtsCovered}</p>
                <p className="text-xs text-emerald-600 font-bold">100% wilayah tercakup</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Mustahik Baru</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground font-mono">{activePilar.metrics.newMustahik}</p>
                <p className="text-xs text-muted-foreground">Jan–Agu 2026</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex-1 gap-2 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
                onClick={() => setShowSimModal(true)}
              >
                <Calculator className="size-4 text-emerald-600" /> Buka Kalkulator Simulasi RKAT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. DEEP ANALYTICS MATRIX GRID (3 Columns for perfect readability) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Funnel Outcome Program */}
        <Card className="shadow-xs border-border rounded-2xl">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-emerald-600" /> Funnel Outcome Program
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Alur konversi proposal ke penyaluran tuntas</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            {activePilar.funnel.map((item) => (
              <div key={item.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-muted-foreground">{item.stage}</span>
                  <span className="font-black text-foreground font-mono">{item.count} Proposal</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(20, (item.count / 52) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Komposisi Asnaf */}
        <Card className="shadow-xs border-border rounded-2xl">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Award className="size-4 text-emerald-600" /> Komposisi Asnaf Penerima Manfaat
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Distribusi 8 golongan asnaf syar'i</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="h-40 sm:h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activePilar.asnafPie} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value">
                    {activePilar.asnafPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm">
              {activePilar.asnafPie.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} /> Asnaf {item.name}
                  </span>
                  <span className="font-black font-mono text-foreground">{item.value.toLocaleString('id-ID')} ({item.pct})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Top Kecamatan */}
        <Card className="shadow-xs border-border rounded-2xl">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="size-4 text-emerald-600" /> Top Kecamatan Penerima Manfaat
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Peringkat 5 wilayah sebaran tertinggi</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2">
            {activePilar.topKecamatan.map((kec, i) => (
              <div key={kec.name} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm">
                <span className="text-foreground font-semibold">{i + 1}. Kec. {kec.name}</span>
                <span className="font-black font-mono text-foreground">{kec.count.toLocaleString('id-ID')} Jiwa ({kec.pct})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 4: Target vs Realisasi */}
        <Card className="shadow-xs border-border rounded-2xl">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Target className="size-4 text-emerald-600" /> Target vs Realisasi Kuota
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Evaluasi pencapaian kuota RKAT 2026</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-muted-foreground">Serapan Penyaluran</span>
                <span className="font-black text-emerald-600 font-mono">{activePilar.pct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${activePilar.pct}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-muted-foreground">Penerima Manfaat</span>
                <span className="font-black text-blue-600 font-mono">82%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-muted-foreground">Program Aktif</span>
                <span className="font-black text-purple-600 font-mono">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Efisiensi Anggaran */}
        <Card className="shadow-xs border-border rounded-2xl flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" /> Rasio Efisiensi Anggaran
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Kepatuhan alokasi hak amil vs mustahik</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 font-mono">92,4%</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Dana murni langsung diterima mustahik</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              Biaya Operasional Amil: 7,6% (Maksimal Syar'i: 12,5%)
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Timeline Tonggak Penting */}
        <Card className="shadow-xs border-border rounded-2xl">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-emerald-600" /> Timeline Tonggak Penting
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Milestone program tahun berjalan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            {activePilar.milestones.slice(0, 4).map((m) => (
              <div key={m.title} className="flex items-start gap-2.5">
                <span className="size-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-black text-foreground block font-mono">{m.date}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm block">{m.title}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. SUB-PROGRAM PORTFOLIO ACCORDION / TABLE */}
      <Card className="shadow-xs border-border rounded-2xl overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div>
            <CardTitle className="text-base sm:text-lg lg:text-xl font-black text-foreground">
              Portofolio Sub-Program — {activePilar.name} ({activePilar.subPrograms.length})
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Rincian alokasi anggaran, serapan kuota, dan tombol tambah alokasi penerima manfaat
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari sub-program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 text-xs sm:text-sm rounded-xl"
              />
            </div>
            <Button
              size="sm"
              className="h-9 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer px-4 gap-2"
              onClick={() => onNavigate && onNavigate('mustahik')}
            >
              <Users className="size-4" /> Buka Master Data Mustahik
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-5 py-4">Kode & Nama Sub-Program</th>
                  <th className="px-5 py-4">Pagu RKAT</th>
                  <th className="px-5 py-4">Realisasi Salur</th>
                  <th className="px-5 py-4">Mustahik Terbantu</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Aksi Alokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filteredSubPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      Tidak ada sub-program yang cocok dengan kata kunci "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredSubPrograms.map((sub) => {
                    const subPct = Math.round((sub.realized / sub.budget) * 100);
                    return (
                      <tr key={sub.code} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {sub.code}
                            </span>
                            <div>
                              <span className="font-extrabold text-foreground block text-sm">{sub.name}</span>
                              <span className="text-xs text-muted-foreground block mt-0.5">{sub.desc}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono font-medium text-muted-foreground text-sm">{formatRupiah(sub.budget, true)}</td>
                        <td className="px-5 py-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {formatRupiah(sub.realized, true)} ({subPct}%)
                        </td>
                        <td className="px-5 py-4 text-foreground font-semibold text-sm">{sub.mustahik.toLocaleString('id-ID')} Jiwa</td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant="outline" className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20 font-bold px-2.5 py-0.5">
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            className="h-8.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl cursor-pointer px-3 gap-1.5"
                            onClick={() => handleOpenAllocate(sub)}
                          >
                            <Plus className="size-3.5" /> Alokasikan
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 6. MODAL: SIMULASI ANGGARAN RKAT */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <Calculator className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">Kalkulator Simulasi Serapan RKAT</h3>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-muted-foreground">
                Proyeksi sisa anggaran program <strong className="text-foreground">{activePilar.name}</strong> hingga akhir tahun anggaran 2026.
              </p>
              <div className="space-y-3 p-4 rounded-2xl bg-muted/40 border border-border/70">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagu Tahunan:</span>
                  <span className="font-mono font-black text-foreground">{formatRupiah(activePilar.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tersalurkan s.d Agustus:</span>
                  <span className="font-mono font-black text-emerald-600">{formatRupiah(activePilar.realized)}</span>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-3 font-bold">
                  <span className="text-foreground">Sisa Anggaran Siap Salur:</span>
                  <span className="font-mono text-amber-600 font-black">{formatRupiah(activePilar.budget - activePilar.realized)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-9 text-xs sm:text-sm rounded-xl" onClick={() => setShowSimModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: ALOKASIKAN MUSTAHIK BARU */}
      {showAllocateModal && allocateTargetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <Plus className="size-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Alokasikan Mustahik</h3>
                  <p className="text-xs text-muted-foreground font-mono">{allocateTargetSub.code} • {allocateTargetSub.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAllocateModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocate} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Nama Penerima Manfaat *</label>
                <Input
                  required
                  placeholder="Contoh: Bpk. Sulaeman"
                  value={allocateForm.mustahikName}
                  onChange={(e) => setAllocateForm({ ...allocateForm, mustahikName: e.target.value })}
                  className="h-9 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Nomor Induk Kependudukan (NIK) *</label>
                <Input
                  required
                  maxLength={16}
                  placeholder="367101..."
                  value={allocateForm.nik}
                  onChange={(e) => setAllocateForm({ ...allocateForm, nik: e.target.value })}
                  className="h-9 text-xs sm:text-sm font-mono rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Golongan Asnaf</label>
                  <select
                    value={allocateForm.asnaf}
                    onChange={(e) => setAllocateForm({ ...allocateForm, asnaf: e.target.value })}
                    className="w-full h-9 text-xs sm:text-sm rounded-xl border border-border bg-background px-3 text-foreground"
                  >
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Mualaf">Mualaf</option>
                    <option value="Gharimin">Gharimin</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Nominal Bantuan (Rp)</label>
                  <Input
                    type="number"
                    value={allocateForm.amount}
                    onChange={(e) => setAllocateForm({ ...allocateForm, amount: e.target.value })}
                    className="h-9 text-xs sm:text-sm font-mono font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs sm:text-sm rounded-xl" onClick={() => setShowAllocateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4">
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
