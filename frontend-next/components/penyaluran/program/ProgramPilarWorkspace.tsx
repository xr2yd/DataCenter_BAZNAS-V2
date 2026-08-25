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
  Sparkles,
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
} from 'lucide-react';

// ==========================================
// 1. DATA DEFINITIONS & STATIC MOCKUP VALUES
// ==========================================

interface PilarCardData {
  id: string;
  name: string;
  amount: string;
  percentage: number;
  beneficiaries: string;
  color: string;
  areaGradient: string;
  iconBg: string;
  icon: typeof Users;
  sparklinePoints: string;
  areaPoints: string;
}

const PILAR_CARDS: PilarCardData[] = [
  {
    id: 'cerdas',
    name: 'Tangerang Cerdas',
    amount: 'Rp 8,62 M',
    percentage: 73,
    beneficiaries: '9.842 penerima manfaat',
    color: '#059669',
    areaGradient: 'rgba(5, 150, 105, 0.12)',
    iconBg: 'bg-emerald-700',
    icon: Users,
    sparklinePoints: '0,22 15,20 30,16 45,18 60,12 75,14 90,8 100,6',
    areaPoints: '0,22 15,20 30,16 45,18 60,12 75,14 90,8 100,6 100,30 0,30',
  },
  {
    id: 'makmur',
    name: 'Tangerang Makmur',
    amount: 'Rp 7,48 M',
    percentage: 66,
    beneficiaries: '8.306 penerima manfaat',
    color: '#d97706',
    areaGradient: 'rgba(217, 119, 6, 0.12)',
    iconBg: 'bg-amber-600',
    icon: Store,
    sparklinePoints: '0,24 15,22 30,19 45,21 60,15 75,16 90,11 100,9',
    areaPoints: '0,24 15,22 30,19 45,21 60,15 75,16 90,11 100,9 100,30 0,30',
  },
  {
    id: 'sehat',
    name: 'Tangerang Sehat',
    amount: 'Rp 9,21 M',
    percentage: 82,
    beneficiaries: '12.374 penerima manfaat',
    color: '#008B5A',
    areaGradient: 'rgba(0, 139, 90, 0.15)',
    iconBg: 'bg-emerald-700',
    icon: Heart,
    sparklinePoints: '0,20 15,17 30,13 45,15 60,9 75,11 90,6 100,4',
    areaPoints: '0,20 15,17 30,13 45,15 60,9 75,11 90,6 100,4 100,30 0,30',
  },
  {
    id: 'beriman',
    name: 'Tangerang Beriman',
    amount: 'Rp 6,17 M',
    percentage: 61,
    beneficiaries: '6.501 penerima manfaat',
    color: '#7c3aed',
    areaGradient: 'rgba(124, 58, 237, 0.12)',
    iconBg: 'bg-purple-700',
    icon: Landmark,
    sparklinePoints: '0,26 15,24 30,22 45,20 60,17 75,18 90,14 100,12',
    areaPoints: '0,26 15,24 30,22 45,20 60,17 75,18 90,14 100,12 100,30 0,30',
  },
  {
    id: 'peduli',
    name: 'Tangerang Peduli',
    amount: 'Rp 5,86 M',
    percentage: 78,
    beneficiaries: '5.423 penerima manfaat',
    color: '#2563eb',
    areaGradient: 'rgba(37, 99, 235, 0.12)',
    iconBg: 'bg-blue-600',
    icon: Shield,
    sparklinePoints: '0,22 15,19 30,16 45,17 60,12 75,13 90,9 100,7',
    areaPoints: '0,22 15,19 30,16 45,17 60,12 75,13 90,9 100,7 100,30 0,30',
  },
];

export function ProgramPilarWorkspace() {
  const [selectedPilar, setSelectedPilar] = useState('sehat');
  const activePilarData = PILAR_CARDS.find((p) => p.id === selectedPilar) || PILAR_CARDS[2]!;

  return (
    <div className="mx-auto max-w-[1560px] space-y-5 pb-16 text-slate-800 antialiased">
      {/* ========================================================================= */}
      {/* 1. HEADER TITLE & STATUS TOOLBAR                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-1 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
            Lima pilar, satu dampak untuk Kota Tangerang.
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Dari anggaran menjadi perubahan nyata bagi mustahik.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="size-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-zinc-700">Data terkini</span>
            <span className="text-zinc-400">25 Agustus 2026 - 10:15 WIB</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00704A] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#005a3b] transition-colors cursor-pointer"
          >
            <Briefcase className="size-4" />
            <span>Kelola Portofolio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 PILAR CARDS SELECTOR (GRID 5 COLS)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {PILAR_CARDS.map((pilar) => {
          const isSelected = selectedPilar === pilar.id;
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilar(pilar.id)}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#008B5A] ring-1 ring-[#008B5A] shadow-sm'
                  : 'border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Icon + Title + Selected Checkmark */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-white ${pilar.iconBg}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">{pilar.name}</h3>
                    <p className="text-base font-black text-zinc-950 mt-0.5">{pilar.amount}</p>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#008B5A] text-white">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Middle Row: Sub-stats */}
              <div className="mt-2 pl-12">
                <p className="text-[11px] font-bold text-emerald-700">
                  {pilar.percentage}% <span className="font-normal text-zinc-500">dari target</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{pilar.beneficiaries}</p>
              </div>

              {/* Bottom Row: Smooth Sparkline with gradient area */}
              <div className="mt-3 h-8 w-full overflow-hidden">
                <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
                  <polygon fill={pilar.areaGradient} points={pilar.areaPoints} />
                  <polyline
                    fill="none"
                    stroke={pilar.color}
                    strokeWidth="1.8"
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
      {/* 3. ROW 1: DARI ANGGARAN KE DAMPAK (LEFT) & DAMPAK UTAMA (RIGHT)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* ----------------- LEFT LARGE CARD (7 COLS) ----------------- */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs lg:col-span-7">
          <div>
            <h2 className="text-xs font-bold text-zinc-900">
              Dari anggaran ke dampak — {activePilarData.name}
            </h2>

            {/* Value Chain Pipeline (5 Steps) */}
            <div className="mt-4 grid grid-cols-5 items-center gap-1.5 pb-4 border-b border-zinc-100">
              {/* Step 1: Anggaran */}
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Wallet className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-medium">Anggaran</p>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">Rp 9,21 M</p>
                  <p className="text-[9px] font-bold text-emerald-700">82% dari target</p>
                </div>
              </div>

              {/* Step 2: Program & Intervensi */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 text-xs">→</span>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <ClipboardList className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-medium">Program & Intervensi</p>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">18 Program</p>
                  <p className="text-[9px] text-zinc-400">6 Layanan Utama</p>
                </div>
              </div>

              {/* Step 3: Aktivitas */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 text-xs">→</span>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Users className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-medium">Aktivitas</p>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">63.842 Kegiatan</p>
                  <p className="text-[9px] text-zinc-400">Jan–Agu 2026</p>
                </div>
              </div>

              {/* Step 4: Output */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 text-xs">→</span>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-medium">Output</p>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">12.374 Penerima</p>
                  <p className="text-[9px] font-bold text-emerald-700">82% dari target</p>
                </div>
              </div>

              {/* Step 5: Dampak */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-300 text-xs">→</span>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Heart className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-emerald-800">Dampak</p>
                  <p className="text-[9px] text-zinc-600 leading-tight">
                    Kesehatan meningkat, beban biaya berkurang, kualitas hidup lebih baik.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-row: Tren Penyaluran Bulanan (Left) + Proyeksi & Target 2026 (Right) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* Monthly Bar & Line Chart (8 cols) */}
            <div className="sm:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900">Tren penyaluran bulanan</h3>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-xs bg-[#008B5A]" /> Realisasi (Rp)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 border-t-2 border-dashed border-zinc-400" /> Target (Rp)
                  </span>
                </div>
              </div>

              {/* SVG Chart */}
              <div className="relative pt-2">
                <div className="flex h-36 items-end justify-between gap-1 border-b border-zinc-200 pb-1 text-[9px] text-zinc-400">
                  {/* Y-axis indicator */}
                  <div className="absolute left-0 top-0 flex h-32 flex-col justify-between text-[8px] text-zinc-300 pointer-events-none">
                    <span>1,5 M</span>
                    <span>1 M</span>
                    <span>500 jt</span>
                    <span>0</span>
                  </div>

                  {/* Bars Jan - Des */}
                  {[
                    { m: 'Jan', val: 50, tgt: 55, active: true },
                    { m: 'Feb', val: 62, tgt: 65, active: true },
                    { m: 'Mar', val: 75, tgt: 72, active: true },
                    { m: 'Apr', val: 80, tgt: 80, active: true },
                    { m: 'Mei', val: 92, tgt: 88, active: true },
                    { m: 'Jun', val: 100, tgt: 95, active: true },
                    { m: 'Jul', val: 88, tgt: 102, active: true },
                    { m: 'Agu', val: 110, tgt: 110, active: true },
                    { m: 'Sep', val: 0, tgt: 120, active: false },
                    { m: 'Okt', val: 0, tgt: 130, active: false },
                    { m: 'Nov', val: 0, tgt: 140, active: false },
                    { m: 'Des', val: 0, tgt: 150, active: false },
                  ].map((bar) => (
                    <div key={bar.m} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                      {bar.active ? (
                        <div
                          className="w-full max-w-[14px] rounded-t-xs bg-[#008B5A] transition-all hover:bg-[#00704A]"
                          style={{ height: `${(bar.val / 150) * 100}%` }}
                        />
                      ) : (
                        <div className="w-full max-w-[14px] h-12 rounded-t-xs bg-zinc-100/90 border-t border-dashed border-zinc-300" />
                      )}
                      <span className="text-[9px] text-zinc-500 font-medium">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proyeksi & Target 2026 Card (4 cols) */}
            <div className="sm:col-span-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 space-y-2.5">
              <div>
                <h4 className="text-[11px] font-bold text-zinc-900">Proyeksi & target 2026</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Proyeksi realisasi</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-black text-zinc-950 font-mono">Rp 11,23 M</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                    102% dari target
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60">
                <div>
                  <p className="text-[9px] text-zinc-400">Target tahun 2026</p>
                  <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">Rp 11,00 M</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400">Sisa anggaran</p>
                  <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">Rp 1,79 M</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- RIGHT LARGE CARD: DAMPAK UTAMA (5 COLS) ----------------- */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-zinc-900">
            Dampak utama — {activePilarData.name}
          </h2>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {/* 1. Pasien dilayani */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Stethoscope className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Pasien dilayani</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">12.374</p>
              <p className="text-[9px] font-bold text-emerald-700 mt-0.5">
                ▲ 18,6% <span className="font-normal text-zinc-400">dari periode sebelumnya</span>
              </p>
            </div>

            {/* 2. Intervensi berhasil */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <CheckCircle2 className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Intervensi berhasil</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">8.921</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Tingkat keberhasilan 72%</p>
            </div>

            {/* 3. Rata-rata bantuan */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Wallet className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Rata-rata bantuan</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">Rp 744 rb</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Per penerima manfaat</p>
            </div>

            {/* 4. Program aktif */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <FileText className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Program aktif</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">18</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">6 layanan utama</p>
            </div>

            {/* 5. Kecamatan terjangkau */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <MapPin className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Kecamatan terjangkau</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">13 / 13</p>
              <p className="text-[9px] font-bold text-emerald-700 mt-0.5">100% wilayah tercakup</p>
            </div>

            {/* 6. Mustahik baru */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <UserPlus className="size-3.5 text-[#008B5A]" />
                <span className="text-[10px] text-zinc-600 font-medium">Mustahik baru</span>
              </div>
              <p className="text-base font-black text-zinc-950 font-mono mt-1">3.214</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Jan–Agu 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 2: ANALYTICS 4-CARDS ROW                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Funnel outcome program */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Funnel outcome program</h3>
            <div className="mt-3.5 space-y-2">
              {[
                { label: 'Proposal diterima', count: 42, color: 'bg-emerald-600', w: '100%' },
                { label: 'Verifikasi kelayakan', count: 36, color: 'bg-emerald-400', w: '85%' },
                { label: 'Disetujui', count: 28, color: 'bg-sky-400', w: '66%' },
                { label: 'Dalam pelaksanaan', count: 22, color: 'bg-amber-400', w: '52%' },
                { label: 'Bantuan tersalurkan', count: 18, color: 'bg-purple-400', w: '42%' },
              ].map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-600">{f.label}</span>
                    <span className="font-bold text-zinc-900 font-mono">{f.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${f.color}`} style={{ width: f.w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Komposisi asnaf penerima manfaat */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Komposisi asnaf penerima manfaat</h3>
            <div className="mt-3 flex items-center gap-3">
              {/* Donut chart SVG */}
              <div className="size-20 shrink-0 relative">
                <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#047857" strokeWidth="5.5" strokeDasharray="33 100" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#10b981" strokeWidth="5.5" strokeDasharray="33 100" strokeDashoffset="-33" />
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#a7f3d0" strokeWidth="5.5" strokeDasharray="12 100" strokeDashoffset="-66" />
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#38bdf8" strokeWidth="5.5" strokeDasharray="10 100" strokeDashoffset="-78" />
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#fbbf24" strokeWidth="5.5" strokeDasharray="6 100" strokeDashoffset="-88" />
                  <circle cx="18" cy="18" r="13" fill="transparent" stroke="#c084fc" strokeWidth="5.5" strokeDasharray="6 100" strokeDashoffset="-94" />
                </svg>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1 text-[10px]">
                {[
                  { name: 'Fakir', count: '4.128', pct: '33%', bg: 'bg-[#047857]' },
                  { name: 'Miskin', count: '4.046', pct: '33%', bg: 'bg-[#10b981]' },
                  { name: 'Amil', count: '1.511', pct: '12%', bg: 'bg-[#a7f3d0]' },
                  { name: 'Mualaf', count: '1.187', pct: '10%', bg: 'bg-[#38bdf8]' },
                  { name: 'Gharimin', count: '769', pct: '6%', bg: 'bg-[#fbbf24]' },
                  { name: 'Lainnya', count: '733', pct: '6%', bg: 'bg-[#c084fc]' },
                ].map((as) => (
                  <div key={as.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${as.bg}`} />
                      <span className="text-zinc-600">{as.name}</span>
                    </div>
                    <span className="font-mono text-zinc-900 font-bold">{as.count} <span className="text-zinc-400 font-normal">({as.pct})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Top kecamatan penerima manfaat */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Top kecamatan penerima manfaat</h3>
            <div className="mt-2.5 space-y-1.5 text-xs">
              {[
                { rank: 1, name: 'Karawaci', count: '2.186', pct: '18%' },
                { rank: 2, name: 'Ciledug', count: '1.846', pct: '15%' },
                { rank: 3, name: 'Cipondoh', count: '1.672', pct: '14%' },
                { rank: 4, name: 'Batuceper', count: '1.435', pct: '12%' },
                { rank: 5, name: 'Periuk', count: '1.221', pct: '10%' },
              ].map((kec) => (
                <div key={kec.name} className="flex items-center justify-between py-0.5 border-b border-zinc-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-zinc-400 w-2.5">{kec.rank}</span>
                    <span className="text-[11px] font-medium text-zinc-900">{kec.name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-zinc-900">
                    {kec.count} <span className="text-zinc-400 font-normal">({kec.pct})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/penyaluran/peta"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Lihat semua (13 kecamatan)</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Target vs Realisasi + Efisiensi + Timeline */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs space-y-3">
          {/* Target vs Realisasi */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-zinc-900">Target vs realisasi <span className="text-[10px] font-normal text-zinc-400">(Jan–Agu 2026)</span></h3>
            <div className="space-y-1.5 pt-1">
              <div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-600">Penyaluran</span>
                  <span className="font-mono font-bold text-zinc-900">82%</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
                  <span>Rp 9,21 M / Rp 11,00 M</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-600">Penerima manfaat</span>
                  <span className="font-mono font-bold text-zinc-900">82%</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
                  <span>12.374 / 15.000</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-600">Program aktif</span>
                  <span className="font-mono font-bold text-zinc-900">82%</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
                  <span>18 / 22</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Efisiensi Anggaran Badge */}
          <div className="pt-2 border-t border-zinc-100">
            <h4 className="text-[10px] font-bold text-zinc-700">Efisiensi anggaran</h4>
            <div className="mt-1 flex items-center justify-between text-[10px]">
              <div>
                <span className="font-mono font-bold text-zinc-900">92,4%</span>
                <p className="text-[9px] text-zinc-400">Dana tersalurkan</p>
              </div>
              <div>
                <span className="font-mono font-bold text-zinc-900">7,6%</span>
                <p className="text-[9px] text-zinc-400">Biaya operasional</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                <Check className="size-2.5" /> Efisien
              </span>
            </div>
            <p className="text-[8px] text-zinc-400 mt-1">Di bawah batas maksimal 12%</p>
          </div>

          {/* Timeline Tonggak Penting */}
          <div className="pt-2 border-t border-zinc-100">
            <h4 className="text-[10px] font-bold text-zinc-700 mb-1.5">Timeline tonggak penting</h4>
            <div className="space-y-1 text-[9px]">
              {[
                { date: 'Jan 2026', text: 'Kick-off program kesehatan', active: false },
                { date: 'Mar 2026', text: 'Peluncuran layanan mobile klinik', active: false },
                { date: 'Mei 2026', text: 'Penambahan mitra fasilitas kesehatan', active: false },
                { date: 'Jul 2026', text: 'Program gizi ibu & anak diperluas', active: false },
                { date: 'Agu 2026', text: 'Review capaian & optimasi program', active: true },
              ].map((t) => (
                <div key={t.date} className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full shrink-0 ${t.active ? 'bg-emerald-600' : 'border border-zinc-400'}`} />
                  <span className="font-mono text-zinc-400 w-11">{t.date}</span>
                  <span className={`truncate ${t.active ? 'font-bold text-zinc-900' : 'text-zinc-600'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ROW 3: INISIATIF AKTIF TABLE (LEFT) & REKOMENDASI PRIORITAS (RIGHT)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left: Inisiatif Aktif Table (8 cols) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs lg:col-span-8 space-y-3">
          <h2 className="text-xs font-bold text-zinc-900">
            Inisiatif aktif — {activePilarData.name}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200/80 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="pb-2 font-medium">Program / Layanan</th>
                  <th className="pb-2 font-medium">Penanggung Jawab Operasional</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Tonggak berikutnya</th>
                  <th className="pb-2 font-medium text-right">Penerima manfaat</th>
                  <th className="pb-2 font-medium text-right">Penyerapan dana</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-[11px]">
                {/* Row 1 */}
                <tr className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                        <Activity className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Klinik Mustahik</p>
                        <p className="text-[10px] text-zinc-400">(Layanan Kesehatan Primer)</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-zinc-600 text-[10px]">UPZ Kesehatan & Klinik Mitra</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      Berjalan
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <p className="font-mono text-[10px] font-bold text-zinc-800">30 Agu 2026</p>
                    <p className="text-[9px] text-zinc-400">Evaluasi kunjungan Q3</p>
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-zinc-900">4.982</td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">Rp 3,42 M</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700">82%</span>
                    </div>
                    <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden ml-auto mt-0.5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-1 text-right">
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-600" />
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                        <Stethoscope className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Bantuan Pengobatan Mustahik</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-zinc-600 text-[10px]">UPZ Kesehatan</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      Berjalan
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <p className="font-mono text-[10px] font-bold text-zinc-800">5 Sep 2026</p>
                    <p className="text-[9px] text-zinc-400">Penyaluran batch berikutnya</p>
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-zinc-900">3.765</td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">Rp 2,68 M</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700">84%</span>
                    </div>
                    <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden ml-auto mt-0.5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-1 text-right">
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-600" />
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                        <Apple className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Gizi Ibu & Anak</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-zinc-600 text-[10px]">UPZ Kesehatan & PKK Kota</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      Berjalan
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <p className="font-mono text-[10px] font-bold text-zinc-800">12 Sep 2026</p>
                    <p className="text-[9px] text-zinc-400">Monitoring pertumbuhan</p>
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-zinc-900">2.143</td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">Rp 1,56 M</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700">79%</span>
                    </div>
                    <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden ml-auto mt-0.5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '79%' }} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-1 text-right">
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-600" />
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                        <Ambulance className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Ambulans Gratis Mustahik</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-zinc-600 text-[10px]">UPZ Kesehatan & Lazismu</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      Berjalan
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <p className="font-mono text-[10px] font-bold text-zinc-800">1 Sep 2026</p>
                    <p className="text-[9px] text-zinc-400">Rapat evaluasi layanan</p>
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-zinc-900">1.484</td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">Rp 0,89 M</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700">91%</span>
                    </div>
                    <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden ml-auto mt-0.5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '91%' }} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-1 text-right">
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-600" />
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-amber-50 text-amber-700">
                        <ShieldAlert className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Edukasi & Deteksi Dini Kesehatan</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-zinc-600 text-[10px]">UPZ Kesehatan & Puskesmas</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                      Perlu perhatian
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <p className="font-mono text-[10px] font-bold text-zinc-800">28 Agu 2026</p>
                    <p className="text-[9px] text-zinc-400">Perluas jangkauan kegiatan</p>
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-zinc-900">1.021</td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">Rp 0,66 M</span>
                      <span className="font-mono text-[10px] font-bold text-amber-700">61%</span>
                    </div>
                    <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden ml-auto mt-0.5">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '61%' }} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-1 text-right">
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-600" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Rekomendasi Prioritas (4 cols) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-3">
          <div>
            <h2 className="text-xs font-bold text-zinc-900">Rekomendasi prioritas</h2>
            <div className="mt-3 space-y-2.5">
              {/* Item 1 */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#008B5A] text-[10px] font-bold text-white">
                    1
                  </span>
                  <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                    Perluas intervensi gizi ibu & anak ke 3 kecamatan prioritas untuk percepat capaian target penerima.
                  </p>
                </div>
                <div className="text-right">
                  <button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer">
                    <span>Lihat detail</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    2
                  </span>
                  <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                    Tingkatkan verifikasi & follow-up bantuan pengobatan agar rasio keberhasilan intervensi naik &gt;75%.
                  </p>
                </div>
                <div className="text-right">
                  <button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer">
                    <span>Lihat detail</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>

              {/* Item 3 */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                    Optimalkan kolaborasi fasilitas kesehatan agar layanan klinik lebih merata di wilayah timur kota.
                  </p>
                </div>
                <div className="text-right">
                  <button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-800 cursor-pointer">
                    <span>Lihat detail</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <Link
              href="/penyaluran/laporan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Lihat semua rekomendasi</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
