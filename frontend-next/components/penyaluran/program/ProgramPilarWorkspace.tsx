'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Heart,
  Landmark,
  Shield,
  Check,
  Briefcase,
  Wallet,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  FileText,
  MapPin,
  UserPlus,
  ChevronRight,
  Ambulance,
  Activity,
  Apple,
  ShieldAlert,
  Target,
  Award,
  Clock,
  Layers,
  ChevronLeft,
  Sparkles,
  Plus,
} from 'lucide-react';

interface PilarCardData {
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
  areaGradient: string;
  iconBg: string;
  icon: typeof Users;
  sparklinePoints: string;
  areaPoints: string;
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
  monthlyBars: { m: string; realisasi: number; target: number; active: boolean }[];
  asnafBreakdown: { name: string; count: string; pct: string; color: string }[];
  topKecamatan: { rank: number; name: string; count: string; pct: string }[];
  subPrograms: {
    code: string;
    name: string;
    pic: string;
    status: string;
    nextMilestone: string;
    mustahik: string;
    realized: string;
    pct: number;
  }[];
}

const PILAR_CARDS: PilarCardData[] = [
  {
    id: 'cerdas',
    pilarNum: '1',
    name: 'Tangerang Cerdas',
    category: 'Pendidikan & Beasiswa',
    amount: 'Rp 8,62 M',
    rawAmount: 8_620_000_000,
    rawBudget: 11_800_000_000,
    percentage: 73,
    beneficiaries: '9.842 penerima manfaat',
    color: '#2563eb',
    areaGradient: 'rgba(37, 99, 235, 0.12)',
    iconBg: 'bg-blue-600',
    icon: Users,
    sparklinePoints: '0,18 15,16 30,13 45,15 60,10 75,12 90,6 100,4',
    areaPoints: '0,18 15,16 30,13 45,15 60,10 75,12 90,6 100,4 100,26 0,26',
    impactDesc: 'Pendidikan merata, angka putus sekolah tertekan drastis, dan lahir sarjana mandiri.',
    metrics: {
      primaryLabel: 'Siswa / Mahasiswa Terbantu',
      primaryValue: '9.842',
      primaryGrowth: '+14,2%',
      successLabel: 'Lulusan Terfasilitasi',
      successValue: '8.660',
      successRate: '88%',
      avgLabel: 'Rata-rata Beasiswa',
      avgValue: 'Rp 875 rb',
      progLabel: 'Sub-Program Aktif',
      progValue: '14 Program',
      districtLabel: 'Kecamatan Terjangkau',
      districtValue: '13 / 13',
      newLabel: 'Penerima Beasiswa Baru',
      newValue: '2.410 Jiwa',
    },
    monthlyBars: [
      { m: 'Jan', realisasi: 45, target: 60, active: true },
      { m: 'Feb', realisasi: 58, target: 65, active: true },
      { m: 'Mar', realisasi: 72, target: 70, active: true },
      { m: 'Apr', realisasi: 85, target: 75, active: true },
      { m: 'Mei', realisasi: 94, target: 80, active: true },
      { m: 'Jun', realisasi: 90, target: 80, active: true },
      { m: 'Jul', realisasi: 82, target: 75, active: true },
      { m: 'Agu', realisasi: 88, target: 75, active: true },
      { m: 'Sep', realisasi: 0, target: 75, active: false },
      { m: 'Okt', realisasi: 0, target: 75, active: false },
      { m: 'Nov', realisasi: 0, target: 75, active: false },
      { m: 'Des', realisasi: 0, target: 75, active: false },
    ],
    asnafBreakdown: [
      { name: 'Miskin', count: '4.250', pct: '43%', color: '#d97706' },
      { name: 'Fakir', count: '3.120', pct: '32%', color: '#e11d48' },
      { name: 'Fisabilillah', count: '1.450', pct: '15%', color: '#059669' },
      { name: 'Ibnu Sabil', count: '680', pct: '7%', color: '#2563eb' },
      { name: 'Mualaf', count: '342', pct: '3%', color: '#0d9488' },
    ],
    topKecamatan: [
      { rank: 1, name: 'Karawaci', count: '1.980', pct: '20%' },
      { rank: 2, name: 'Ciledug', count: '1.720', pct: '17%' },
      { rank: 3, name: 'Cipondoh', count: '1.540', pct: '16%' },
      { rank: 4, name: 'Batuceper', count: '1.380', pct: '14%' },
      { rank: 5, name: 'Periuk', count: '1.150', pct: '12%' },
    ],
    subPrograms: [
      { code: 'TC-01', name: 'Beasiswa Satu Keluarga Satu Sarjana (SKSS)', pic: 'Divisi Pendidikan & UPZ', status: 'Berjalan', nextMilestone: '10 Sep 2026', mustahik: '1.200', realized: 'Rp 2,95 M', pct: 84 },
      { code: 'TC-02', name: 'Penebusan Ijazah & Tunggakan SPP Siswa Dhuafa', pic: 'Divisi Pendidikan', status: 'Berjalan', nextMilestone: '15 Sep 2026', mustahik: '4.200', realized: 'Rp 2,65 M', pct: 83 },
      { code: 'TC-03', name: 'Insentif Guru Ngaji & Marbot Al-Qur’an', pic: 'Bidang Penyaluran', status: 'Berjalan', nextMilestone: '25 Agu 2026', mustahik: '3.100', realized: 'Rp 2,15 M', pct: 72 },
      { code: 'TC-04', name: 'Digitalisasi Lab Komputer Santri Pesantren', pic: 'Divisi Pendidikan & IT', status: 'Berjalan', nextMilestone: '30 Sep 2026', mustahik: '1.342', realized: 'Rp 0,87 M', pct: 64 },
    ],
  },
  {
    id: 'makmur',
    pilarNum: '2',
    name: 'Tangerang Makmur',
    category: 'Pemberdayaan Ekonomi & UMKM',
    amount: 'Rp 7,48 M',
    rawAmount: 7_480_000_000,
    rawBudget: 11_300_000_000,
    percentage: 66,
    beneficiaries: '8.306 penerima manfaat',
    color: '#d97706',
    areaGradient: 'rgba(217, 119, 6, 0.12)',
    iconBg: 'bg-amber-600',
    icon: Store,
    sparklinePoints: '0,20 15,18 30,15 45,17 60,12 75,13 90,8 100,6',
    areaPoints: '0,20 15,18 30,15 45,17 60,12 75,13 90,8 100,6 100,26 0,26',
    impactDesc: 'Mustahik mandiri menjadi muzakki, usaha mikro naik kelas, daya beli meningkat.',
    metrics: {
      primaryLabel: 'Pelaku Usaha Mikro Binaan',
      primaryValue: '8.306',
      primaryGrowth: '+21,4%',
      successLabel: 'Graduasi Mandiri',
      successValue: '6.561',
      successRate: '79%',
      avgLabel: 'Rata-rata Modal',
      avgValue: 'Rp 900 rb',
      progLabel: 'Sub-Program Aktif',
      progValue: '12 Program',
      districtLabel: 'Kecamatan Terjangkau',
      districtValue: '13 / 13',
      newLabel: 'Wirausaha Binaan Baru',
      newValue: '1.980 Jiwa',
    },
    monthlyBars: [
      { m: 'Jan', realisasi: 35, target: 55, active: true },
      { m: 'Feb', realisasi: 46, target: 60, active: true },
      { m: 'Mar', realisasi: 60, target: 65, active: true },
      { m: 'Apr', realisasi: 72, target: 70, active: true },
      { m: 'Mei', realisasi: 80, target: 75, active: true },
      { m: 'Jun', realisasi: 85, target: 75, active: true },
      { m: 'Jul', realisasi: 78, target: 70, active: true },
      { m: 'Agu', realisasi: 82, target: 70, active: true },
      { m: 'Sep', realisasi: 0, target: 70, active: false },
      { m: 'Okt', realisasi: 0, target: 70, active: false },
      { m: 'Nov', realisasi: 0, target: 70, active: false },
      { m: 'Des', realisasi: 0, target: 70, active: false },
    ],
    asnafBreakdown: [
      { name: 'Miskin', count: '4.980', pct: '60%', color: '#d97706' },
      { name: 'Fakir', count: '2.150', pct: '26%', color: '#e11d48' },
      { name: 'Mualaf', count: '650', pct: '8%', color: '#0d9488' },
      { name: 'Gharimin', count: '526', pct: '6%', color: '#7c3aed' },
    ],
    topKecamatan: [
      { rank: 1, name: 'Tangerang', count: '1.840', pct: '22%' },
      { rank: 2, name: 'Jatiuwung', count: '1.650', pct: '20%' },
      { rank: 3, name: 'Cipondoh', count: '1.420', pct: '17%' },
      { rank: 4, name: 'Ciledug', count: '1.280', pct: '15%' },
      { rank: 5, name: 'Larangan', count: '1.120', pct: '13%' },
    ],
    subPrograms: [
      { code: 'TM-01', name: 'Bantuan Modal Usaha Bergulir Z-Mart', pic: 'Divisi Pemberdayaan', status: 'Berjalan', nextMilestone: '12 Sep 2026', mustahik: '3.400', realized: 'Rp 2,45 M', pct: 77 },
      { code: 'TM-02', name: 'Gerobak Kuliner Berkah & Booth Usaha', pic: 'Divisi Pemberdayaan', status: 'Berjalan', nextMilestone: '18 Sep 2026', mustahik: '2.100', realized: 'Rp 1,85 M', pct: 71 },
      { code: 'TM-03', name: 'Pelatihan Vokasi & Bengkel Z-Auto', pic: 'Divisi Pelatihan', status: 'Berjalan', nextMilestone: '22 Sep 2026', mustahik: '1.600', realized: 'Rp 1,35 M', pct: 61 },
      { code: 'TM-04', name: 'Binaan Pertanian & Perikanan Perkotaan', pic: 'Divisi Pemberdayaan', status: 'Berjalan', nextMilestone: '30 Sep 2026', mustahik: '1.206', realized: 'Rp 0,82 M', pct: 45 },
    ],
  },
  {
    id: 'sehat',
    pilarNum: '3',
    name: 'Tangerang Sehat',
    category: 'Kesehatan & Layanan Medis',
    amount: 'Rp 9,21 M',
    rawAmount: 9_210_000_000,
    rawBudget: 11_000_000_000,
    percentage: 82,
    beneficiaries: '12.374 penerima manfaat',
    color: '#008B5A',
    areaGradient: 'rgba(0, 139, 90, 0.15)',
    iconBg: 'bg-[#008B5A]',
    icon: Heart,
    sparklinePoints: '0,17 15,14 30,11 45,13 60,7 75,9 90,4 100,2',
    areaPoints: '0,17 15,14 30,11 45,13 60,7 75,9 90,4 100,2 100,26 0,26',
    impactDesc: 'Kesehatan mustahik meningkat, beban biaya operasi/rawat inap teratasi tuntas.',
    metrics: {
      primaryLabel: 'Pasien Mustahik Dilayani',
      primaryValue: '12.374',
      primaryGrowth: '+18,6%',
      successLabel: 'Intervensi Sukses',
      successValue: '8.921',
      successRate: '72%',
      avgLabel: 'Rata-rata Bantuan',
      avgValue: 'Rp 744 rb',
      progLabel: 'Sub-Program Aktif',
      progValue: '18 Program',
      districtLabel: 'Kecamatan Terjangkau',
      districtValue: '13 / 13',
      newLabel: 'Pasien Mustahik Baru',
      newValue: '3.214 Jiwa',
    },
    monthlyBars: [
      { m: 'Jan', realisasi: 52, target: 75, active: true },
      { m: 'Feb', realisasi: 68, target: 80, active: true },
      { m: 'Mar', realisasi: 85, target: 85, active: true },
      { m: 'Apr', realisasi: 98, target: 90, active: true },
      { m: 'Mei', realisasi: 108, target: 95, active: true },
      { m: 'Jun', realisasi: 112, target: 95, active: true },
      { m: 'Jul', realisasi: 104, target: 90, active: true },
      { m: 'Agu', realisasi: 115, target: 90, active: true },
      { m: 'Sep', realisasi: 0, target: 90, active: false },
      { m: 'Okt', realisasi: 0, target: 90, active: false },
      { m: 'Nov', realisasi: 0, target: 90, active: false },
      { m: 'Des', realisasi: 0, target: 90, active: false },
    ],
    asnafBreakdown: [
      { name: 'Fakir', count: '4.128', pct: '33%', color: '#e11d48' },
      { name: 'Miskin', count: '4.046', pct: '33%', color: '#d97706' },
      { name: 'Amil', count: '1.511', pct: '12%', color: '#2563eb' },
      { name: 'Mualaf', count: '1.187', pct: '10%', color: '#0d9488' },
      { name: 'Gharimin', count: '769', pct: '6%', color: '#7c3aed' },
      { name: 'Lainnya', count: '733', pct: '6%', color: '#64748b' },
    ],
    topKecamatan: [
      { rank: 1, name: 'Karawaci', count: '2.186', pct: '18%' },
      { rank: 2, name: 'Ciledug', count: '1.846', pct: '15%' },
      { rank: 3, name: 'Cipondoh', count: '1.672', pct: '14%' },
      { rank: 4, name: 'Batuceper', count: '1.435', pct: '12%' },
      { rank: 5, name: 'Periuk', count: '1.221', pct: '10%' },
    ],
    subPrograms: [
      { code: 'TS-01', name: 'Klinik Mustahik (Layanan Primer & Obat)', pic: 'UPZ Kesehatan & Klinik', status: 'Berjalan', nextMilestone: '30 Agu 2026', mustahik: '4.982', realized: 'Rp 3,42 M', pct: 82 },
      { code: 'TS-02', name: 'Bantuan Pengobatan & Operasi di RSU Mitra', pic: 'UPZ Kesehatan', status: 'Berjalan', nextMilestone: '05 Sep 2026', mustahik: '3.765', realized: 'Rp 2,68 M', pct: 84 },
      { code: 'TS-03', name: 'Intervensi Gizi Ibu Hamil & Balita Stunting', pic: 'PKK & UPZ Kesehatan', status: 'Berjalan', nextMilestone: '12 Sep 2026', mustahik: '2.143', realized: 'Rp 1,56 M', pct: 79 },
      { code: 'TS-04', name: 'Layanan Ambulans Medis Gratis 24 Jam', pic: 'Divisi Relawan & BTB', status: 'Berjalan', nextMilestone: '01 Sep 2026', mustahik: '1.484', realized: 'Rp 0,89 M', pct: 91 },
    ],
  },
  {
    id: 'beriman',
    pilarNum: '4',
    name: 'Tangerang Takwa',
    category: 'Dakwah & Advokasi Keumatan',
    amount: 'Rp 6,17 M',
    rawAmount: 6_170_000_000,
    rawBudget: 10_100_000_000,
    percentage: 61,
    beneficiaries: '6.501 penerima manfaat',
    color: '#7c3aed',
    areaGradient: 'rgba(124, 58, 237, 0.12)',
    iconBg: 'bg-purple-700',
    icon: Landmark,
    sparklinePoints: '0,22 15,20 30,18 45,16 60,14 75,15 90,11 100,9',
    areaPoints: '0,22 15,20 30,18 45,16 60,14 75,15 90,11 100,9 100,26 0,26',
    impactDesc: 'Syiar Islam semarak, sarana ibadah layak, pembinaan aqidah mualaf rutin terpantau.',
    metrics: {
      primaryLabel: 'Penerima Manfaat Dakwah',
      primaryValue: '6.501',
      primaryGrowth: '+12,5%',
      successLabel: 'Jamaah Terbina',
      successValue: '5.915',
      successRate: '91%',
      avgLabel: 'Rata-rata Kafalah',
      avgValue: 'Rp 950 rb',
      progLabel: 'Sub-Program Aktif',
      progValue: '10 Program',
      districtLabel: 'Kecamatan Terjangkau',
      districtValue: '13 / 13',
      newLabel: 'Mualaf & Santri Baru',
      newValue: '1.420 Jiwa',
    },
    monthlyBars: [
      { m: 'Jan', realisasi: 30, target: 50, active: true },
      { m: 'Feb', realisasi: 42, target: 55, active: true },
      { m: 'Mar', realisasi: 55, target: 60, active: true },
      { m: 'Apr', realisasi: 68, target: 65, active: true },
      { m: 'Mei', realisasi: 74, target: 65, active: true },
      { m: 'Jun', realisasi: 70, target: 65, active: true },
      { m: 'Jul', realisasi: 64, target: 60, active: true },
      { m: 'Agu', realisasi: 68, target: 60, active: true },
      { m: 'Sep', realisasi: 0, target: 60, active: false },
      { m: 'Okt', realisasi: 0, target: 60, active: false },
      { m: 'Nov', realisasi: 0, target: 60, active: false },
      { m: 'Des', realisasi: 0, target: 60, active: false },
    ],
    asnafBreakdown: [
      { name: 'Fisabilillah', count: '3.650', pct: '56%', color: '#059669' },
      { name: 'Mualaf', count: '1.450', pct: '22%', color: '#0d9488' },
      { name: 'Fakir', count: '880', pct: '14%', color: '#e11d48' },
      { name: 'Ibnu Sabil', count: '521', pct: '8%', color: '#2563eb' },
    ],
    topKecamatan: [
      { rank: 1, name: 'Pinang', count: '1.480', pct: '23%' },
      { rank: 2, name: 'Cipondoh', count: '1.380', pct: '21%' },
      { rank: 3, name: 'Tangerang', count: '1.250', pct: '19%' },
      { rank: 4, name: 'Karawaci', count: '1.180', pct: '18%' },
      { rank: 5, name: 'Benda', count: '1.011', pct: '16%' },
    ],
    subPrograms: [
      { code: 'TT-01', name: 'Renovasi Sanitasi & Wudhu Musholla', pic: 'Divisi Sarpras & Dakwah', status: 'Berjalan', nextMilestone: '14 Sep 2026', mustahik: '1.850', realized: 'Rp 2,25 M', pct: 75 },
      { code: 'TT-02', name: 'Bimbingan Aqidah Mualaf Center', pic: 'Mualaf Center BAZNAS', status: 'Berjalan', nextMilestone: '20 Sep 2026', mustahik: '1.450', realized: 'Rp 1,48 M', pct: 68 },
      { code: 'TT-03', name: 'Kafalah Guru Ngaji & Da’i Perkotaan', pic: 'Bidang Penyaluran', status: 'Berjalan', nextMilestone: '28 Agu 2026', mustahik: '2.100', realized: 'Rp 1,35 M', pct: 64 },
      { code: 'TT-04', name: 'Beasiswa Santri Kader Ulama & Tahfidz', pic: 'Divisi Pendidikan', status: 'Berjalan', nextMilestone: '05 Okt 2026', mustahik: '1.101', realized: 'Rp 0,69 M', pct: 52 },
    ],
  },
  {
    id: 'peduli',
    pilarNum: '5',
    name: 'Tangerang Peduli',
    category: 'Sosial & Tanggap Bencana',
    amount: 'Rp 5,86 M',
    rawAmount: 5_860_000_000,
    rawBudget: 7_500_000_000,
    percentage: 78,
    beneficiaries: '5.423 penerima manfaat',
    color: '#2563eb',
    areaGradient: 'rgba(37, 99, 235, 0.12)',
    iconBg: 'bg-blue-600',
    icon: Shield,
    sparklinePoints: '0,19 15,16 30,13 45,14 60,9 75,10 90,6 100,4',
    areaPoints: '0,19 15,16 30,13 45,14 60,9 75,10 90,6 100,4 100,26 0,26',
    impactDesc: 'Respon cepat bencana banjir, bedah rumah duafa tuntas, santunan yatim terjamin.',
    metrics: {
      primaryLabel: 'Keluarga Tertolong',
      primaryValue: '5.423',
      primaryGrowth: '+9,8%',
      successLabel: 'Bedah Rumah & RTLH',
      successValue: '4.850',
      successRate: '89%',
      avgLabel: 'Rata-rata Bantuan',
      avgValue: 'Rp 1,08 jt',
      progLabel: 'Sub-Program Aktif',
      progValue: '10 Program',
      districtLabel: 'Kecamatan Terjangkau',
      districtValue: '13 / 13',
      newLabel: 'Keluarga Mustahik Baru',
      newValue: '1.240 Jiwa',
    },
    monthlyBars: [
      { m: 'Jan', realisasi: 38, target: 45, active: true },
      { m: 'Feb', realisasi: 48, target: 50, active: true },
      { m: 'Mar', realisasi: 60, target: 55, active: true },
      { m: 'Apr', realisasi: 72, target: 60, active: true },
      { m: 'Mei', realisasi: 78, target: 60, active: true },
      { m: 'Jun', realisasi: 75, target: 60, active: true },
      { m: 'Jul', realisasi: 68, target: 55, active: true },
      { m: 'Agu', realisasi: 74, target: 55, active: true },
      { m: 'Sep', realisasi: 0, target: 55, active: false },
      { m: 'Okt', realisasi: 0, target: 55, active: false },
      { m: 'Nov', realisasi: 0, target: 55, active: false },
      { m: 'Des', realisasi: 0, target: 55, active: false },
    ],
    asnafBreakdown: [
      { name: 'Fakir', count: '2.850', pct: '53%', color: '#e11d48' },
      { name: 'Miskin', count: '1.920', pct: '35%', color: '#d97706' },
      { name: 'Gharimin', count: '420', pct: '8%', color: '#7c3aed' },
      { name: 'Ibnu Sabil', count: '233', pct: '4%', color: '#2563eb' },
    ],
    topKecamatan: [
      { rank: 1, name: 'Periuk', count: '1.450', pct: '27%' },
      { rank: 2, name: 'Jatiuwung', count: '1.280', pct: '24%' },
      { rank: 3, name: 'Karawaci', count: '1.050', pct: '19%' },
      { rank: 4, name: 'Ciledug', count: '920', pct: '17%' },
      { rank: 5, name: 'Neglasari', count: '723', pct: '13%' },
    ],
    subPrograms: [
      { code: 'TP-01', name: 'Bedah Rumah Tidak Layak Huni (RTLH)', pic: 'Divisi Tanggap Bencana', status: 'Berjalan', nextMilestone: '15 Sep 2026', mustahik: '185', realized: 'Rp 2,45 M', pct: 81 },
      { code: 'TP-02', name: 'Paket Sembako Lansia & Dhuafa', pic: 'Bidang Penyaluran', status: 'Berjalan', nextMilestone: '25 Sep 2026', mustahik: '3.400', realized: 'Rp 1,75 M', pct: 78 },
      { code: 'TP-03', name: 'Santunan Rutin Yatim Piatu Dhuafa', pic: 'Divisi Sosial', status: 'Berjalan', nextMilestone: '02 Sep 2026', mustahik: '1.200', realized: 'Rp 0,98 M', pct: 75 },
      { code: 'TP-04', name: 'Dapur Umum & Tanggap Darurat Bencana', pic: 'BAZNAS Tanggap Bencana', status: 'Berjalan', nextMilestone: '30 Sep 2026', mustahik: '638', realized: 'Rp 0,68 M', pct: 68 },
    ],
  },
];

export function ProgramPilarWorkspace() {
  const [selectedPilar, setSelectedPilar] = useState('sehat');
  const activePilarData = PILAR_CARDS.find((p) => p.id === selectedPilar) || PILAR_CARDS[2]!;

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-5 sm:space-y-6 pb-12 text-slate-800 antialiased">
      {/* ========================================================================= */}
      {/* 1. HEADER TITLE & STATUS TOOLBAR                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
              Lima Pilar, Satu Dampak untuk Kota Tangerang
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              RKAT 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Transformasi akuntabel dana zakat, infak, dan sedekah menjadi kemaslahatan nyata bagi mustahik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200/70">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-zinc-800">Sinkronisasi:</span>
            <span className="text-zinc-600">25 Agustus 2026 - 10:15 WIB</span>
          </div>

          <Link
            href="/penyaluran/mustahik"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00704A] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#005a3b] transition-colors cursor-pointer"
          >
            <Users className="size-4" />
            <span>Master Data Mustahik</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 PILAR CARDS SELECTOR (GRID 5 COLS)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {PILAR_CARDS.map((pilar) => {
          const isSelected = selectedPilar === pilar.id;
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilar(pilar.id)}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#008B5A] ring-2 ring-[#008B5A]/25 shadow-md bg-emerald-50/20'
                  : 'border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-[#008B5A]" />
              )}

              {/* Top Row: Icon + Title + Selected Checkmark */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${pilar.iconBg}`}>
                    <Icon className="size-4.5 sm:size-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight">{pilar.name}</h3>
                    <p className="text-base sm:text-lg font-black text-zinc-950 font-mono mt-0.5">{pilar.amount}</p>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#008B5A] text-white">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Middle Row: Sub-stats */}
              <div className="mt-2.5">
                <p className="text-xs font-bold text-emerald-700">
                  {pilar.percentage}% <span className="font-normal text-zinc-500">dari target RKAT</span>
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">{pilar.beneficiaries}</p>
              </div>

              {/* Bottom Row: Smooth Sparkline */}
              <div className="mt-3 h-10 w-full overflow-hidden">
                <svg viewBox="0 0 100 26" className="h-full w-full" preserveAspectRatio="none">
                  <polygon fill={pilar.areaGradient} points={pilar.areaPoints} />
                  <polyline
                    fill="none"
                    stroke={pilar.color}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pilar.sparklinePoints}
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. VALUE CHAIN: FULL WIDTH HARMONIOUS 5-STEP SECTION                     */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-950 flex items-center gap-2">
              <span>Dari Anggaran ke Dampak Sosial — <span className="text-[#008B5A]">{activePilarData.name}</span></span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              Rantai nilai terintegrasi dari pagu RKAT, intervensi program, aktivitas lapangan, hingga hasil akhir bagi mustahik
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Fokus: {activePilarData.category}
          </span>
        </div>

        {/* 5 Sequence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Step 1: Anggaran */}
          <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 flex flex-col justify-between space-y-2 hover:bg-zinc-100/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">1. Anggaran RKAT</span>
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="size-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono">{activePilarData.amount}</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{activePilarData.percentage}% dari pagu tahunan</p>
            </div>
          </div>

          {/* Step 2: Intervensi */}
          <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 flex flex-col justify-between space-y-2 hover:bg-zinc-100/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">2. Intervensi</span>
              <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ClipboardList className="size-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono">{activePilarData.subPrograms.length} Sub-Program</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Fasilitas & layanan aktif</p>
            </div>
          </div>

          {/* Step 3: Aktivitas */}
          <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 flex flex-col justify-between space-y-2 hover:bg-zinc-100/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">3. Aktivitas Layanan</span>
              <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="size-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono">63.842 Kegiatan</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Jan–Agu 2026 berjalan</p>
            </div>
          </div>

          {/* Step 4: Output */}
          <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 flex flex-col justify-between space-y-2 hover:bg-zinc-100/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">4. Output Penerima</span>
              <div className="size-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono">{activePilarData.metrics.primaryValue} Jiwa</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{activePilarData.percentage}% dari target</p>
            </div>
          </div>

          {/* Step 5: Dampak */}
          <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 flex flex-col justify-between space-y-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">5. Dampak Nyata</span>
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Heart className="size-4" />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-800 font-semibold leading-snug">{activePilarData.impactDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BALANCED SPLIT ROW: CHARTS (LEFT 7 COLS) & 6 KPIS (RIGHT 5 COLS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        {/* Left: Monthly Trend & Proyeksi Card (7 cols) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Tren Penyaluran Bulanan</h3>
                <p className="text-xs text-zinc-500">Nominal realisasi penyaluran vs target bulanan (Rp Juta)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-xs bg-[#008B5A]" /> Realisasi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-cyan-500" /> Target RKAT
                </span>
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-2 border-b border-zinc-200 pb-2 mt-4">
              {activePilarData.monthlyBars.map((bar) => (
                <div key={bar.m} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                  {bar.active ? (
                    <div
                      className="w-full max-w-[16px] rounded-t-sm bg-gradient-to-t from-[#008B5A] to-emerald-500 transition-all duration-300"
                      style={{ height: `${bar.realisasi}%` }}
                    />
                  ) : (
                    <div
                      className="w-full max-w-[16px] rounded-t-sm bg-zinc-200"
                      style={{ height: `${bar.target * 0.7}%` }}
                    />
                  )}
                  <span className="text-xs text-zinc-500 font-semibold">{bar.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proyeksi & Target 2026 Strip */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Proyeksi Serapan 2026:</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black text-zinc-950 font-mono">Rp 11,23 M</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  102% target
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <p className="text-zinc-500">Pagu Tahunan:</p>
                <p className="font-bold text-zinc-900 font-mono">Rp 11,00 M</p>
              </div>
              <div className="border-l border-zinc-200 pl-4">
                <p className="text-zinc-500">Sisa Kuota:</p>
                <p className="font-bold text-amber-700 font-mono">Rp 1,79 M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dampak Utama 6 KPI Matrix (5 cols, 2x3 Grid that perfectly fills height) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-950">
              Dampak Utama — <span className="text-[#008B5A]">{activePilarData.name}</span>
            </h3>
            <p className="text-xs text-zinc-500">Indikator kinerja kunci dan efektivitas bantuan mustahik</p>
          </div>

          {/* 6 KPI Cards arranged in 2 columns x 3 rows with NO vertical empty space */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* KPI 1 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.primaryLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.primaryValue}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{activePilarData.metrics.primaryGrowth} vs periode lalu</p>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.successLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.successValue}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">Tingkat sukses {activePilarData.metrics.successRate}</p>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Wallet className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.avgLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.avgValue}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Per mustahik</p>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.progLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.progValue}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Layanan operasional</p>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.districtLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.districtValue}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">100% wilayah kota</p>
              </div>
            </div>

            {/* KPI 6 */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserPlus className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 truncate">{activePilarData.metrics.newLabel}</span>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-950 font-mono mt-1">{activePilarData.metrics.newValue}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Jan–Agu 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. 3-CARD ANALYTICS ROW (FUNNEL, ASNAF DONUT, TOP KECAMATAN)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Card 1: Funnel outcome program */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2">
              <Layers className="size-4 text-emerald-600" /> Funnel Outcome Program
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Alur konversi proposal ke penyaluran tuntas</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Proposal Masuk', count: 42, color: 'bg-[#008B5A]', w: '100%' },
              { label: 'Verifikasi Kelayakan', count: 36, color: 'bg-emerald-400', w: '85%' },
              { label: 'Disetujui MPZIS', count: 28, color: 'bg-amber-400', w: '66%' },
              { label: 'Pencairan PPD', count: 22, color: 'bg-sky-400', w: '52%' },
              { label: 'Bantuan Tersalurkan', count: 18, color: 'bg-purple-400', w: '42%' },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-600">{f.label}</span>
                  <span className="font-mono text-zinc-950 font-bold">{f.count} Berkas</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${f.color}`} style={{ width: f.w }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Komposisi Asnaf */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2">
              <Award className="size-4 text-emerald-600" /> Komposisi Asnaf Penerima
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Distribusi pembagian hak syar'i 8 asnaf</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut chart */}
            <div className="size-24 shrink-0 relative">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#00704A" strokeWidth="4.5" strokeDasharray="33 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray="33 100" strokeDashoffset="-33" />
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#6ee7b7" strokeWidth="4.5" strokeDasharray="12 100" strokeDashoffset="-66" />
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="10 100" strokeDashoffset="-78" />
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#a855f7" strokeWidth="4.5" strokeDasharray="6 100" strokeDashoffset="-88" />
                <circle cx="18" cy="18" r="13" fill="transparent" stroke="#cbd5e1" strokeWidth="4.5" strokeDasharray="6 100" strokeDashoffset="-94" />
              </svg>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-1.5 text-xs">
              {activePilarData.asnafBreakdown.map((as) => (
                <div key={as.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: as.color }} />
                    <span className="text-zinc-600 font-medium">{as.name}</span>
                  </div>
                  <span className="font-mono text-zinc-950 font-bold">{as.count} ({as.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Top Kecamatan */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2">
              <MapPin className="size-4 text-emerald-600" /> Top Kecamatan Penerima
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Peringkat 5 wilayah sebaran terbanyak</p>
          </div>

          <div className="space-y-2">
            {activePilarData.topKecamatan.map((kec) => (
              <div key={kec.name} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-400 w-3">{kec.rank}</span>
                  <span className="text-zinc-900">Kec. {kec.name}</span>
                </div>
                <span className="font-mono text-zinc-950 font-bold">{kec.count} Jiwa ({kec.pct})</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <Link
              href="/penyaluran/peta"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Buka Peta Sebaran 13 Kecamatan</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SUB-PROGRAM PORTFOLIO TABLE (FULL WIDTH)                               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-950">
              Portofolio Inisiatif & Sub-Program — {activePilarData.name} ({activePilarData.subPrograms.length})
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Rincian serapan pagu, progres kuota mustahik, dan jadwal tonggak monev
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
              <tr>
                <th className="py-3 px-4">Kode & Nama Program</th>
                <th className="py-3 px-4">PIC Operasional</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tonggak Monev</th>
                <th className="py-3 px-4 text-right">Mustahik</th>
                <th className="py-3 px-4 text-right">Realisasi Pagu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activePilarData.subPrograms.map((sub) => (
                <tr key={sub.code} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {sub.code}
                      </span>
                      <span className="font-bold text-zinc-900">{sub.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">{sub.pic}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-xs font-bold text-zinc-900">{sub.nextMilestone}</p>
                    <p className="text-[11px] text-zinc-400">Evaluasi lapangan</p>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900">{sub.mustahik} Jiwa</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-bold text-zinc-950">{sub.realized}</span>
                      <span className="font-mono text-xs font-semibold text-emerald-700">({sub.pct}%)</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
