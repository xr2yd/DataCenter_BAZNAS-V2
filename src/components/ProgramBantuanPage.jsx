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
} from 'lucide-react';
import { formatRupiah } from '../utils/format';

// 5 Pilar BAZNAS Comprehensive Programs Data (Kota Tangerang Scale)
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
    impactStatement: 'Akses pendidikan merata, angka putus sekolah turun, generasi mustahik mandiri dan berdaya.',
    metrics: {
      primaryLabel: 'Siswa / Mahasiswa Terbantu',
      primaryValue: '9.842',
      primaryGrowth: '+14,2%',
      successRate: '88%',
      successCount: '8.660',
      avgAid: 'Rp 927 rb',
      activeProg: '14',
      servicesCount: '5 layanan utama',
      districtsCovered: '13 / 13',
      newMustahik: '2.410',
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
      { stage: 'Proposal diterima', count: 52 },
      { stage: 'Verifikasi kelayakan', count: 44 },
      { stage: 'Disetujui', count: 36 },
      { stage: 'Dalam pelaksanaan', count: 28 },
      { stage: 'Bantuan tersalurkan', count: 24 },
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
      { code: 'TC-01', name: 'Beasiswa Satu Keluarga Satu Sarjana (SKSS)', budget: 3_500_000_000, realized: 2_950_000_000, mustahik: 1200, status: 'Aktif' },
      { code: 'TC-02', name: 'Penebusan Ijazah & Tunggakan SPP Sekolah', budget: 3_200_000_000, realized: 2_650_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TC-03', name: 'Insentif Guru Ngaji Tradisional & Guru Honorer', budget: 3_000_000_000, realized: 2_150_000_000, mustahik: 3100, status: 'Aktif' },
      { code: 'TC-04', name: 'Digitalisasi Lab Komputer Santri Pesantren', budget: 2_800_000_000, realized: 1_375_000_000, mustahik: 1342, status: 'Aktif' },
    ],
  },
  {
    id: 'PRG-MAKMUR',
    pilarNum: '2',
    name: 'Tangerang Makmur',
    category: 'Pemberdayaan Ekonomi',
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
    impactStatement: 'Mustahik mandiri menjadi muzakki, UMKM mikro naik kelas, daya beli keluarga dhuafa terangkat.',
    metrics: {
      primaryLabel: 'Pelaku Usaha Mikro Binaan',
      primaryValue: '8.306',
      primaryGrowth: '+21,4%',
      successRate: '79%',
      successCount: '6.561',
      avgAid: 'Rp 778 rb',
      activeProg: '12',
      servicesCount: '4 layanan utama',
      districtsCovered: '13 / 13',
      newMustahik: '1.980',
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
      { stage: 'Proposal diterima', count: 48 },
      { stage: 'Verifikasi kelayakan', count: 39 },
      { stage: 'Disetujui', count: 30 },
      { stage: 'Dalam pelaksanaan', count: 24 },
      { stage: 'Bantuan tersalurkan', count: 20 },
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
      { code: 'TM-01', name: 'Bantuan Modal Usaha Bergulir Z-Mart', budget: 3_200_000_000, realized: 2_450_000_000, mustahik: 3400, status: 'Aktif' },
      { code: 'TM-02', name: 'Gerobak Kuliner Berkah & Perlengkapan Usaha', budget: 2_600_000_000, realized: 1_850_000_000, mustahik: 2100, status: 'Aktif' },
      { code: 'TM-03', name: 'Pelatihan Vokasi Kerja & Bengkel Z-Auto', budget: 2_200_000_000, realized: 1_350_000_000, mustahik: 1600, status: 'Aktif' },
      { code: 'TM-04', name: 'Binaan Pertanian & Budidaya Lele Perkotaan', budget: 1_800_000_000, realized: 818_000_000, mustahik: 1206, status: 'Aktif' },
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
    impactStatement: 'Kesehatan meningkat, beban biaya berkurang, kualitas hidup lebih baik.',
    metrics: {
      primaryLabel: 'Pasien / Mustahik Dilayani',
      primaryValue: '12.374',
      primaryGrowth: '+18,6%',
      successRate: '72%',
      successCount: '8.921',
      avgAid: 'Rp 744 rb',
      activeProg: '18',
      servicesCount: '6 layanan utama',
      districtsCovered: '13 / 13',
      newMustahik: '3.214',
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
      { stage: 'Proposal diterima', count: 42 },
      { stage: 'Verifikasi kelayakan', count: 36 },
      { stage: 'Disetujui', count: 28 },
      { stage: 'Dalam pelaksanaan', count: 22 },
      { stage: 'Bantuan tersalurkan', count: 18 },
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
      { code: 'TS-01', name: 'Bantuan Biaya Rawat Inap & Operasi RSU', budget: 4_200_000_000, realized: 3_850_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TS-02', name: 'Pengadaan Alat Bantu Disabilitas (Kursi Roda/Kaki Palsu)', budget: 2_600_000_000, realized: 2_150_000_000, mustahik: 1450, status: 'Aktif' },
      { code: 'TS-03', name: 'Layanan Ambulans Gratis 24 Jam Antar-Jemput', budget: 2_400_000_000, realized: 1_980_000_000, mustahik: 4800, status: 'Aktif' },
      { code: 'TS-04', name: 'Sanitasi Jamban Sehat & Intervensi Stunting', budget: 1_800_000_000, realized: 1_230_000_000, mustahik: 1924, status: 'Aktif' },
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
    impactStatement: 'Penanganan kedaruratan sosial cepat tanggap, hunian mustahik layak, anak yatim terlindungi.',
    metrics: {
      primaryLabel: 'Keluarga Mustahik Tertolong',
      primaryValue: '6.501',
      primaryGrowth: '+9,8%',
      successRate: '91%',
      successCount: '5.915',
      avgAid: 'Rp 798 rb',
      activeProg: '10',
      servicesCount: '4 layanan utama',
      districtsCovered: '13 / 13',
      newMustahik: '1.420',
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
      { stage: 'Proposal diterima', count: 38 },
      { stage: 'Verifikasi kelayakan', count: 32 },
      { stage: 'Disetujui', count: 26 },
      { stage: 'Dalam pelaksanaan', count: 20 },
      { stage: 'Bantuan tersalurkan', count: 16 },
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
      { code: 'TP-01', name: 'Bedah Rumah Tidak Layak Huni (RTLH)', budget: 3_500_000_000, realized: 2_450_000_000, mustahik: 185, status: 'Aktif' },
      { code: 'TP-02', name: 'Paket Pangan Sembako Duafa & Lansia', budget: 2_600_000_000, realized: 1_650_000_000, mustahik: 4200, status: 'Aktif' },
      { code: 'TP-03', name: 'Santunan Rutin Yatim Piatu Dhuafa', budget: 1_400_000_000, realized: 750_000_000, mustahik: 1500, status: 'Aktif' },
      { code: 'TP-04', name: 'Dapur Umum & Tanggap Darurat Bencana (BTB)', budget: 1_000_000_000, realized: 335_000_000, mustahik: 616, status: 'Aktif' },
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
    impactStatement: 'Syiar Islam semakin kokoh, sarana ibadah makmur, pembinaan mualaf intensif dan terarah.',
    metrics: {
      primaryLabel: 'Penerima Manfaat Dakwah',
      primaryValue: '5.423',
      primaryGrowth: '+12,5%',
      successRate: '94%',
      successCount: '5.097',
      avgAid: 'Rp 891 rb',
      activeProg: '8',
      servicesCount: '3 layanan utama',
      districtsCovered: '13 / 13',
      newMustahik: '950',
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
      { stage: 'Proposal diterima', count: 32 },
      { stage: 'Verifikasi kelayakan', count: 28 },
      { stage: 'Disetujui', count: 24 },
      { stage: 'Dalam pelaksanaan', count: 18 },
      { stage: 'Bantuan tersalurkan', count: 15 },
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
      { code: 'TT-01', name: 'Renovasi Sarana Ibadah Musholla / Masjid Dhuafa', budget: 2_400_000_000, realized: 2_150_000_000, mustahik: 1200, status: 'Aktif' },
      { code: 'TT-02', name: 'Pembinaan Mualaf Center & Bantuan Kesejahteraan', budget: 1_600_000_000, realized: 1_280_000_000, mustahik: 1450, status: 'Aktif' },
      { code: 'TT-03', name: 'Insentif Marbot & Guru Mengaji Al-Qur’an', budget: 1_400_000_000, realized: 980_000_000, mustahik: 1800, status: 'Aktif' },
      { code: 'TT-04', name: 'Beasiswa Santri Kader Ulama & Tahfidz', budget: 800_000_000, realized: 426_000_000, mustahik: 973, status: 'Aktif' },
    ],
  },
];

export default function ProgramBantuanPage({ onNavigate }) {
  const [selectedPilarId, setSelectedPilarId] = useState('PRG-SEHAT');
  const activePilar = useMemo(
    () => PILAR_MASTER.find((p) => p.id === selectedPilarId) || PILAR_MASTER[2],
    [selectedPilarId]
  );

  // Simulation & Allocation Modals
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateTargetSub, setAllocateTargetSub] = useState(null);
  const [allocateForm, setAllocateForm] = useState({ mustahikName: '', nik: '', amount: '2500000', asnaf: 'Miskin' });

  // Custom Toast State
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

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 bg-card border border-border shadow-2xl rounded-xl p-3.5 sm:p-4 animate-fade-in pr-10 min-w-[300px] max-w-md">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <p className="font-bold text-foreground">Alokasi Berhasil</p>
            <p className="text-muted-foreground">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ show: false, message: '' })}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. TOP PILAR SELECTOR HUD CARDS (5 Cards with Sparklines) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {PILAR_MASTER.map((pilar) => {
          const isSelected = selectedPilarId === pilar.id;
          const sparkData = pilar.sparkline.map((val, i) => ({ i, val }));
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilarId(pilar.id)}
              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-card border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-card/70 border-border/80 hover:bg-card hover:border-border hover:shadow-2xs'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: pilar.brandColor }} />}

              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] sm:text-xs font-bold text-emerald-600 font-mono">
                  {pilar.pct}% <span className="text-muted-foreground font-normal">dari target</span>
                </span>
                <Icon className="size-3.5 sm:size-4 text-muted-foreground group-hover:text-foreground" />
              </div>

              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                {pilar.beneficiaries.toLocaleString('id-ID')} penerima manfaat
              </p>

              {/* Sparkline */}
              <div className="h-8 sm:h-9 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={pilar.brandColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-1 pt-1.5 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground truncate">{pilar.name}</span>
                <Badge variant="outline" className={`text-[9px] font-bold py-0 px-1.5 ${pilar.bgBadge}`}>
                  Pilar {pilar.pilarNum}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. VALUE CHAIN SECTION: "Dari anggaran ke dampak — [Nama Pilar]" */}
      <Card className="shadow-2xs border-border rounded-xl overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-2">
            <span>Dari anggaran ke dampak — <span style={{ color: activePilar.brandColor }}>{activePilar.name}</span></span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-5">
          {/* 5-Step Value Chain (Horizontal on Tablet/Desktop/2XL, Grid on Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 items-center relative">
            {/* Step 1: Anggaran */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-center">
              <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="size-4" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Anggaran</p>
              <p className="text-xs sm:text-sm font-extrabold font-mono text-foreground">{formatRupiah(activePilar.realized, true)}</p>
              <p className="text-[10px] text-emerald-600 font-bold">{activePilar.pct}% dari target</p>
            </div>

            {/* Step 2: Program & Intervensi */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-center">
              <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="size-4" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Program & Intervensi</p>
              <p className="text-xs sm:text-sm font-extrabold text-foreground">{activePilar.programsCount} Program</p>
              <p className="text-[10px] text-muted-foreground">{activePilar.mainServices}</p>
            </div>

            {/* Step 3: Aktivitas */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-center">
              <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                <Users className="size-4" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Aktivitas</p>
              <p className="text-xs sm:text-sm font-extrabold text-foreground">{activePilar.activities.toLocaleString('id-ID')} Kegiatan</p>
              <p className="text-[10px] text-muted-foreground">Jan–Agu 2026</p>
            </div>

            {/* Step 4: Output */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-center">
              <div className="size-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-4" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Output</p>
              <p className="text-xs sm:text-sm font-extrabold text-foreground">{activePilar.beneficiaries.toLocaleString('id-ID')} Penerima</p>
              <p className="text-[10px] text-emerald-600 font-bold">{activePilar.pct}% dari target</p>
            </div>

            {/* Step 5: Dampak */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center col-span-2 sm:col-span-1">
              <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <HeartHandshake className="size-4" />
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Dampak</p>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{activePilar.impactStatement}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. CHARTS ROW: TREN BULANAN (Left 7-8 cols) & DAMPAK UTAMA (Right 4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Monthly Trend & Projection */}
        <Card className="lg:col-span-7 xl:col-span-8 shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-foreground">Tren Penyaluran Bulanan</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Perbandingan nominal realisasi vs target bulanan (Rp Juta)
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-2 rounded-xs bg-emerald-600" /> Realisasi (Rp)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-xs bg-blue-500" /> Target (Rp)</span>
            </div>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-4 space-y-4">
            <div className="h-56 sm:h-64 lg:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activePilar.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    formatter={(v) => [`Rp ${v} Juta`, '']}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="realisasi" fill="#059669" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="target" fill="#3b82f6" opacity={0.35} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Proyeksi 2026 Strip */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Proyeksi & Target 2026:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-base sm:text-lg font-black font-mono text-foreground">
                    {formatRupiah(activePilar.budget, true)}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    102% dari target RKAT
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span>Target: <strong className="text-foreground">{formatRupiah(activePilar.budget, true)}</strong></span>
                <span>Sisa Anggaran: <strong className="text-amber-600 font-mono">{formatRupiah(activePilar.budget - activePilar.realized, true)}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dampak Utama Matrix */}
        <Card className="lg:col-span-5 xl:col-span-4 shadow-2xs border-border rounded-xl flex flex-col justify-between">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60">
            <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
              Dampak Utama — {activePilar.name}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Capaian performa intervensi program bagi mustahik
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">{activePilar.metrics.primaryLabel}</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.primaryValue}</p>
                <p className="text-[10px] text-emerald-600 font-bold">{activePilar.metrics.primaryGrowth} vs periode lalu</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">Intervensi Berhasil</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.successCount}</p>
                <p className="text-[10px] text-emerald-600 font-bold">Tingkat keberhasilan {activePilar.metrics.successRate}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">Rata-rata Bantuan</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.avgAid}</p>
                <p className="text-[10px] text-muted-foreground">Per penerima manfaat</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">Program Aktif</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.activeProg}</p>
                <p className="text-[10px] text-muted-foreground">{activePilar.metrics.servicesCount}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">Kecamatan Terjangkau</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.districtsCovered}</p>
                <p className="text-[10px] text-emerald-600 font-bold">100% wilayah tercakup</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">Mustahik Baru</p>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">{activePilar.metrics.newMustahik}</p>
                <p className="text-[10px] text-muted-foreground">Jan–Agu 2026</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold rounded-lg cursor-pointer flex-1"
                onClick={() => setShowSimModal(true)}
              >
                <Calculator className="size-3.5 mr-1.5 text-emerald-600" /> Simulasi Anggaran
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. BOTTOM 6-CARD ANALYTICS MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Funnel Outcome Program */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Funnel Outcome Program</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            {activePilar.funnel.map((item, idx) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate">{item.stage}</span>
                  <span className="font-bold text-foreground font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${Math.max(20, (item.count / 52) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Komposisi Asnaf */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Komposisi Asnaf</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            <div className="h-28 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activePilar.asnafPie} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value">
                    {activePilar.asnafPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 text-[10px]">
              {activePilar.asnafPie.slice(0, 3).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <span className="size-2 rounded-xs" style={{ backgroundColor: item.color }} /> {item.name}
                  </span>
                  <span className="font-bold font-mono text-foreground">{item.value} ({item.pct})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Top Kecamatan */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Top Kecamatan Mustahik</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1.5 text-xs">
            {activePilar.topKecamatan.map((kec, i) => (
              <div key={kec.name} className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 text-[11px]">
                <span className="text-muted-foreground font-medium">{i + 1}. Kec. {kec.name}</span>
                <span className="font-bold font-mono text-foreground">{kec.count.toLocaleString('id-ID')} ({kec.pct})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 4: Target vs Realisasi */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Target vs Realisasi</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Penyaluran</span>
                <span className="font-bold text-emerald-600 font-mono">{activePilar.pct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${activePilar.pct}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Penerima Manfaat</span>
                <span className="font-bold text-blue-600 font-mono">82%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Program Aktif</span>
                <span className="font-bold text-purple-600 font-mono">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Efisiensi Anggaran */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Efisiensi Anggaran</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-black text-emerald-600 font-mono">92,4%</p>
              <p className="text-[11px] text-muted-foreground">Dana murni tersalurkan ke mustahik</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3 shrink-0" /> Rasio Amil 7,6% (Standar &lt;12,5%)
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Timeline Tonggak Penting */}
        <Card className="shadow-2xs border-border rounded-xl">
          <CardHeader className="p-3 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground">Timeline Tonggak Penting</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-[11px]">
            {activePilar.milestones.slice(0, 3).map((m) => (
              <div key={m.title} className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">{m.date}</span>
                  <span className="text-muted-foreground text-[10px] leading-tight block">{m.title}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. SUB-PROGRAM PORTFOLIO ACCORDION / TABLE */}
      <Card className="shadow-2xs border-border rounded-xl overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Portofolio Sub-Program — {activePilar.name}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
              Rincian alokasi anggaran, serapan kuota, dan tombol tambah alokasi penerima manfaat
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
            onClick={() => onNavigate && onNavigate('mustahik')}
          >
            <Users className="size-3.5 mr-1.5" /> Buka Master Data Mustahik
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-4 py-3">Kode & Nama Sub-Program</th>
                  <th className="px-4 py-3">Pagu RKAT</th>
                  <th className="px-4 py-3">Realisasi Salur</th>
                  <th className="px-4 py-3">Mustahik Terbantu</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi Alokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activePilar.subPrograms.map((sub) => (
                  <tr key={sub.code} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">{sub.code}</span>
                      <span className="font-bold text-foreground">{sub.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-muted-foreground">{formatRupiah(sub.budget, true)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-foreground">{formatRupiah(sub.realized, true)}</td>
                    <td className="px-4 py-3 text-foreground font-semibold">{sub.mustahik.toLocaleString('id-ID')} Jiwa</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-bold">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                        onClick={() => handleOpenAllocate(sub)}
                      >
                        <Plus className="size-3 mr-1" /> Alokasikan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 6. MODAL: SIMULASI ANGGARAN RKAT */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">Simulasi Penyerapan Anggaran RKAT</h3>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-4.5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-muted-foreground">
                Kalkulator simulasi proyeksi sisa anggaran program <strong className="text-foreground">{activePilar.name}</strong> hingga akhir tahun anggaran 2026.
              </p>
              <div className="space-y-2 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagu Tahunan:</span>
                  <span className="font-mono font-bold text-foreground">{formatRupiah(activePilar.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tersalurkan s.d Agustus:</span>
                  <span className="font-mono font-bold text-emerald-600">{formatRupiah(activePilar.realized)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 font-bold">
                  <span>Sisa Anggaran Siap Salur:</span>
                  <span className="font-mono text-amber-600">{formatRupiah(activePilar.budget - activePilar.realized)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/80 bg-muted/20 flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowSimModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: ALOKASIKAN MUSTAHIK BARU */}
      {showAllocateModal && allocateTargetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Plus className="size-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Alokasikan Mustahik</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{allocateTargetSub.code} • {allocateTargetSub.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAllocateModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocate} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Penerima Manfaat *</label>
                <Input
                  required
                  placeholder="Contoh: Bpk. Sulaeman"
                  value={allocateForm.mustahikName}
                  onChange={(e) => setAllocateForm({ ...allocateForm, mustahikName: e.target.value })}
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Induk Kependudukan (NIK) *</label>
                <Input
                  required
                  maxLength={16}
                  placeholder="367101..."
                  value={allocateForm.nik}
                  onChange={(e) => setAllocateForm({ ...allocateForm, nik: e.target.value })}
                  className="h-8.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Golongan Asnaf</label>
                  <select
                    value={allocateForm.asnaf}
                    onChange={(e) => setAllocateForm({ ...allocateForm, asnaf: e.target.value })}
                    className="w-full h-8.5 text-xs rounded-lg border border-border bg-background px-2 text-foreground"
                  >
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Mualaf">Mualaf</option>
                    <option value="Gharimin">Gharimin</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Nominal Bantuan (Rp)</label>
                  <Input
                    type="number"
                    value={allocateForm.amount}
                    onChange={(e) => setAllocateForm({ ...allocateForm, amount: e.target.value })}
                    className="h-8.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAllocateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
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
