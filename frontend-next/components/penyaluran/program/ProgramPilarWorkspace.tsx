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
} from 'lucide-react';

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
    iconBg: 'bg-[#008B5A]',
    icon: Users,
    sparklinePoints: '0,18 15,16 30,13 45,15 60,10 75,12 90,6 100,4',
    areaPoints: '0,18 15,16 30,13 45,15 60,10 75,12 90,6 100,4 100,26 0,26',
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
    sparklinePoints: '0,20 15,18 30,15 45,17 60,12 75,13 90,8 100,6',
    areaPoints: '0,20 15,18 30,15 45,17 60,12 75,13 90,8 100,6 100,26 0,26',
  },
  {
    id: 'sehat',
    name: 'Tangerang Sehat',
    amount: 'Rp 9,21 M',
    percentage: 82,
    beneficiaries: '12.374 penerima manfaat',
    color: '#008B5A',
    areaGradient: 'rgba(0, 139, 90, 0.15)',
    iconBg: 'bg-[#008B5A]',
    icon: Heart,
    sparklinePoints: '0,17 15,14 30,11 45,13 60,7 75,9 90,4 100,2',
    areaPoints: '0,17 15,14 30,11 45,13 60,7 75,9 90,4 100,2 100,26 0,26',
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
    sparklinePoints: '0,22 15,20 30,18 45,16 60,14 75,15 90,11 100,9',
    areaPoints: '0,22 15,20 30,18 45,16 60,14 75,15 90,11 100,9 100,26 0,26',
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
    sparklinePoints: '0,19 15,16 30,13 45,14 60,9 75,10 90,6 100,4',
    areaPoints: '0,19 15,16 30,13 45,14 60,9 75,10 90,6 100,4 100,26 0,26',
  },
];

export function ProgramPilarWorkspace() {
  const [selectedPilar, setSelectedPilar] = useState('sehat');
  const activePilarData = PILAR_CARDS.find((p) => p.id === selectedPilar) || PILAR_CARDS[2]!;

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-6 sm:space-y-8 pb-12 text-slate-800 antialiased">
      {/* ========================================================================= */}
      {/* 1. HEADER TITLE & STATUS TOOLBAR                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-zinc-950 leading-tight">
            Lima pilar, satu dampak untuk Kota Tangerang.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Dari anggaran menjadi perubahan nyata bagi kaum mustahik se-Kota Tangerang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200/70">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-zinc-800">Data terkini:</span>
            <span className="text-zinc-600">25 Agustus 2026 - 10:15 WIB</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00704A] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#005a3b] transition-colors cursor-pointer"
          >
            <Briefcase className="size-4" />
            <span>Kelola Portofolio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 PILAR CARDS SELECTOR (GRID 5 COLS)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {PILAR_CARDS.map((pilar) => {
          const isSelected = selectedPilar === pilar.id;
          const Icon = pilar.icon;

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilar(pilar.id)}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#008B5A] ring-2 ring-[#008B5A]/30 shadow-md'
                  : 'border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Icon + Title + Selected Checkmark */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${pilar.iconBg}`}>
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight">{pilar.name}</h3>
                    <p className="text-base sm:text-lg lg:text-xl font-black text-zinc-950 font-mono mt-0.5">{pilar.amount}</p>
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
                <p className="text-xs sm:text-sm font-bold text-emerald-700">
                  {pilar.percentage}% <span className="font-normal text-zinc-500">dari target</span>
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">{pilar.beneficiaries}</p>
              </div>

              {/* Bottom Row: Smooth Sparkline with gradient area */}
              <div className="mt-3 h-10 sm:h-12 w-full overflow-hidden">
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
      {/* 3. ROW 1: DARI ANGGARAN KE DAMPAK (LEFT) & DAMPAK UTAMA (RIGHT)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        {/* ----------------- LEFT LARGE CARD (7 COLS) ----------------- */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-7 space-y-5">
          {/* Top Half: Value Chain (5 Steps with Centered Icon Circles) */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Dari anggaran ke dampak — <span className="text-emerald-700">{activePilarData.name}</span>
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 items-start gap-3 pb-4 border-b border-zinc-100 text-center">
              {/* Step 1: Anggaran */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                  <Wallet className="size-4.5" />
                </div>
                <p className="text-xs font-bold text-zinc-800">1. Anggaran</p>
                <p className="text-sm sm:text-base font-black text-zinc-900 font-mono mt-1">Rp 9,21 M</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">82% dari target</p>
              </div>

              {/* Step 2: Program & Intervensi */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                  <ClipboardList className="size-4.5" />
                </div>
                <p className="text-xs font-bold text-zinc-800 leading-tight">2. Intervensi</p>
                <p className="text-sm sm:text-base font-black text-zinc-900 font-mono mt-1">18 Program</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">6 Layanan Utama</p>
              </div>

              {/* Step 3: Aktivitas */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-2">
                  <Users className="size-4.5" />
                </div>
                <p className="text-xs font-bold text-zinc-800">3. Aktivitas</p>
                <p className="text-sm sm:text-base font-black text-zinc-900 font-mono mt-1">63.842</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Jan–Agu 2026</p>
              </div>

              {/* Step 4: Output */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-2">
                  <CheckCircle2 className="size-4.5" />
                </div>
                <p className="text-xs font-bold text-zinc-800">4. Output</p>
                <p className="text-sm sm:text-base font-black text-zinc-900 font-mono mt-1">12.374</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">82% dari target</p>
              </div>

              {/* Step 5: Dampak */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 col-span-2 sm:col-span-1">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white mb-2 shadow-xs">
                  <Heart className="size-4.5" />
                </div>
                <p className="text-xs font-bold text-emerald-800">5. Dampak</p>
                <p className="text-xs text-zinc-700 leading-snug font-medium mt-1">
                  Kesehatan meningkat, biaya teratasi.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Half: Tren Penyaluran Bulanan (Left) + Proyeksi & Target 2026 (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2">
            {/* Monthly Bar Chart (8 cols) */}
            <div className="sm:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900">Tren Penyaluran Bulanan (Rp Juta)</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-xs bg-[#008B5A]" /> Realisasi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-cyan-500" /> Target
                  </span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-48 sm:h-52 w-full flex items-end justify-between gap-1.5 border-b border-zinc-200 pb-1">
                {[
                  { m: 'Jan', val: 38, active: true },
                  { m: 'Feb', val: 48, active: true },
                  { m: 'Mar', val: 62, active: true },
                  { m: 'Apr', val: 75, active: true },
                  { m: 'Mei', val: 86, active: true },
                  { m: 'Jun', val: 92, active: true },
                  { m: 'Jul', val: 84, active: true },
                  { m: 'Agu', val: 98, active: true },
                  { m: 'Sep', val: 88, active: false },
                  { m: 'Okt', val: 96, active: false },
                  { m: 'Nov', val: 104, active: false },
                  { m: 'Des', val: 110, active: false },
                ].map((bar) => (
                  <div key={bar.m} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                    {bar.active ? (
                      <div
                        className="w-full max-w-[14px] rounded-t-sm bg-gradient-to-t from-[#008B5A] to-emerald-500"
                        style={{ height: `${bar.val}%` }}
                      />
                    ) : (
                      <div
                        className="w-full max-w-[14px] rounded-t-sm bg-zinc-200"
                        style={{ height: `${bar.val * 0.7}%` }}
                      />
                    )}
                    <span className="text-[11px] text-zinc-500 font-semibold">{bar.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proyeksi & Target 2026 Card (4 cols) */}
            <div className="sm:col-span-4 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Proyeksi & Target 2026</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Proyeksi realisasi:</p>
                <div className="flex items-baseline justify-between gap-1 mt-1">
                  <span className="text-lg sm:text-xl font-black text-zinc-950 font-mono">Rp 11,23 M</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md whitespace-nowrap">
                    102%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/70 text-xs">
                <div>
                  <p className="text-zinc-500">Target RKAT</p>
                  <p className="font-bold text-zinc-900 font-mono mt-0.5">Rp 11,00 M</p>
                </div>
                <div>
                  <p className="text-zinc-500">Sisa Kuota</p>
                  <p className="font-bold text-amber-700 font-mono mt-0.5">Rp 1,79 M</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- RIGHT LARGE CARD: DAMPAK UTAMA (5 COLS) ----------------- */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-5 flex flex-col justify-between">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">
            Dampak Utama — <span className="text-emerald-700">{activePilarData.name}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 content-start">
            {/* 1. Pasien dilayani */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Stethoscope className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Pasien dilayani</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">12.374</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">
                ↑ 18,6% <span className="font-normal text-zinc-400">vs lalu</span>
              </p>
            </div>

            {/* 2. Intervensi berhasil */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Intervensi sukses</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">8.921</p>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">Tingkat sukses 72%</p>
            </div>

            {/* 3. Rata-rata bantuan */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Wallet className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Rata-rata bantuan</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">Rp 744 rb</p>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Per mustahik</p>
            </div>

            {/* 4. Program aktif */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <FileText className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Program aktif</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">18</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">6 layanan utama</p>
            </div>

            {/* 5. Kecamatan terjangkau */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <MapPin className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Kecamatan</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">13 / 13</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">100% tercakup</p>
            </div>

            {/* 6. Mustahik baru */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <UserPlus className="size-3.5" />
                </div>
                <span className="text-xs text-zinc-600 font-medium">Mustahik baru</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-zinc-950 font-mono mt-1">3.214</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Jan–Agu 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 2: ANALYTICS 6 CARDS (3 BALANCED RESPONSIVE COLUMNS)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* Card 1: Funnel outcome program */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Layers className="size-4 text-emerald-600" /> Funnel Outcome Program
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Proposal diterima', count: 42, color: 'bg-[#008B5A]', w: '100%' },
                { label: 'Verifikasi kelayakan', count: 36, color: 'bg-emerald-400', w: '85%' },
                { label: 'Disetujui MPZIS', count: 28, color: 'bg-amber-400', w: '66%' },
                { label: 'Pencairan PPD', count: 22, color: 'bg-sky-400', w: '52%' },
                { label: 'Bantuan tersalurkan', count: 18, color: 'bg-purple-400', w: '42%' },
              ].map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-600 font-medium">{f.label}</span>
                    <span className="font-black text-zinc-900 font-mono">{f.count} Proposal</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${f.color}`} style={{ width: f.w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Komposisi asnaf penerima manfaat */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Award className="size-4 text-emerald-600" /> Komposisi Asnaf Penerima Manfaat
            </h3>
            
            <div className="flex items-center gap-4">
              {/* Donut chart SVG */}
              <div className="size-24 sm:size-28 shrink-0 relative">
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
              <div className="flex-1 space-y-1 text-xs sm:text-sm">
                {[
                  { name: 'Fakir', count: '4.128', pct: '33%', bg: 'bg-[#00704A]' },
                  { name: 'Miskin', count: '4.046', pct: '33%', bg: 'bg-[#10b981]' },
                  { name: 'Amil', count: '1.511', pct: '12%', bg: 'bg-[#6ee7b7]' },
                  { name: 'Mualaf', count: '1.187', pct: '10%', bg: 'bg-[#f59e0b]' },
                  { name: 'Gharimin', count: '769', pct: '6%', bg: 'bg-[#a855f7]' },
                  { name: 'Lainnya', count: '733', pct: '6%', bg: 'bg-[#cbd5e1]' },
                ].map((as) => (
                  <div key={as.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${as.bg}`} />
                      <span className="text-zinc-600 font-medium">{as.name}</span>
                    </div>
                    <span className="font-mono text-zinc-900 font-bold">{as.count} <span className="text-zinc-400 font-normal">({as.pct})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Top kecamatan penerima manfaat */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-emerald-600" /> Top Kecamatan Penerima Manfaat
            </h3>
            
            <div className="space-y-1.5">
              {[
                { rank: 1, name: 'Karawaci', count: '2.186', pct: '18%' },
                { rank: 2, name: 'Ciledug', count: '1.846', pct: '15%' },
                { rank: 3, name: 'Cipondoh', count: '1.672', pct: '14%' },
                { rank: 4, name: 'Batuceper', count: '1.435', pct: '12%' },
                { rank: 5, name: 'Periuk', count: '1.221', pct: '10%' },
              ].map((kec) => (
                <div key={kec.name} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 w-3">{kec.rank}</span>
                    <span className="font-semibold text-zinc-900">Kec. {kec.name}</span>
                  </div>
                  <span className="font-mono text-zinc-900 font-bold">
                    {kec.count} <span className="text-zinc-400 font-normal">({kec.pct})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <Link
              href="/penyaluran/peta"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Lihat semua sebaran (13 kecamatan)</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Target vs realisasi */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Target className="size-4 text-emerald-600" /> Target vs Realisasi Kuota
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-zinc-600 font-medium">Penyaluran Anggaran</span>
                  <span className="font-mono font-bold text-zinc-900">82% (Rp 9,21 M / Rp 11,00 M)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-zinc-600 font-medium">Penerima Manfaat</span>
                  <span className="font-mono font-bold text-zinc-900">82% (12.374 / 15.000)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-zinc-600 font-medium">Program Aktif</span>
                  <span className="font-mono font-bold text-zinc-900">82% (18 / 22 Layanan)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Efisiensi anggaran */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" /> Rasio Efisiensi Anggaran
            </h3>
            
            <div className="space-y-2">
              <div>
                <p className="font-mono font-black text-emerald-800 text-3xl sm:text-4xl">92,4%</p>
                <p className="text-xs text-zinc-500 font-medium">Dana murni langsung diterima mustahik</p>
              </div>
              
              <div className="pt-2">
                <p className="font-mono font-bold text-zinc-800 text-sm">7,6% Biaya Operasional Amil</p>
                <p className="text-xs text-zinc-500">Maksimal standar syariah BAZNAS: 12,5%</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Check className="size-3.5" /> Sangat Efisien & Memenuhi Syariat
            </span>
          </div>
        </div>

        {/* Card 6: Timeline tonggak penting */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Clock className="size-4 text-emerald-600" /> Timeline Tonggak Penting
            </h3>
            
            <div className="space-y-2 text-xs sm:text-sm">
              {[
                { date: 'Jan 2026', text: 'Kick-off program kesehatan', active: false },
                { date: 'Mar 2026', text: 'Peluncuran layanan mobile klinik', active: false },
                { date: 'Mei 2026', text: 'Penambahan mitra fasilitas kesehatan', active: false },
                { date: 'Jul 2026', text: 'Program gizi ibu & anak diperluas', active: false },
                { date: 'Agu 2026', text: 'Review capaian & optimasi program', active: true },
              ].map((t) => (
                <div key={t.date} className="flex items-center gap-2">
                  <span className={`size-2 rounded-full shrink-0 ${t.active ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'border border-zinc-300 bg-white'}`} />
                  <span className="font-mono text-zinc-500 font-bold w-16 shrink-0">{t.date}</span>
                  <span className={`truncate ${t.active ? 'font-black text-zinc-900' : 'text-zinc-600'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ROW 3: INISIATIF AKTIF TABLE (LEFT) & REKOMENDASI PRIORITAS (RIGHT)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        {/* Left: Inisiatif Aktif Table (8 cols) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">
              Inisiatif Aktif — {activePilarData.name}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-zinc-200 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-bold">Program / Layanan</th>
                    <th className="pb-3 font-bold">Penanggung Jawab</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold">Tonggak Berikutnya</th>
                    <th className="pb-3 font-bold text-right">Penerima</th>
                    <th className="pb-3 font-bold text-right pr-2">Penyerapan</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {/* Row 1 */}
                  <tr className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-zinc-900">Klinik Mustahik (Layanan Primer)</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-zinc-600">UPZ Kesehatan & Klinik Mitra</td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Berjalan
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-mono text-xs font-bold text-zinc-900">30 Agu 2026</p>
                      <p className="text-xs text-zinc-400">Evaluasi Q3</p>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-zinc-900">4.982</td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-zinc-900">Rp 3,42 M</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600">(82%)</span>
                      </div>
                    </td>
                    <td className="py-3 pl-1 text-right">
                      <ChevronRight className="size-4 text-zinc-300 group-hover:text-zinc-600" />
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-zinc-900">Bantuan Pengobatan Mustahik</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-zinc-600">UPZ Kesehatan</td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Berjalan
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-mono text-xs font-bold text-zinc-900">5 Sep 2026</p>
                      <p className="text-xs text-zinc-400">Penyaluran batch 3</p>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-zinc-900">3.765</td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-zinc-900">Rp 2,68 M</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600">(84%)</span>
                      </div>
                    </td>
                    <td className="py-3 pl-1 text-right">
                      <ChevronRight className="size-4 text-zinc-300 group-hover:text-zinc-600" />
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Apple className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-zinc-900">Gizi Ibu Hamil & Balita Stunting</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-zinc-600">UPZ Kesehatan & PKK Kota</td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Berjalan
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-mono text-xs font-bold text-zinc-900">12 Sep 2026</p>
                      <p className="text-xs text-zinc-400">Monitoring gizi</p>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-zinc-900">2.143</td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-zinc-900">Rp 1,56 M</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600">(79%)</span>
                      </div>
                    </td>
                    <td className="py-3 pl-1 text-right">
                      <ChevronRight className="size-4 text-zinc-300 group-hover:text-zinc-600" />
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Ambulance className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-zinc-900">Layanan Ambulans Medis 24 Jam</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-zinc-600">UPZ Kesehatan & BTB</td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Berjalan
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-mono text-xs font-bold text-zinc-900">1 Sep 2026</p>
                      <p className="text-xs text-zinc-400">Rapat armada</p>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-zinc-900">1.484</td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-zinc-900">Rp 0,89 M</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600">(91%)</span>
                      </div>
                    </td>
                    <td className="py-3 pl-1 text-right">
                      <ChevronRight className="size-4 text-zinc-300 group-hover:text-zinc-600" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Rekomendasi Prioritas (4 cols) */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">Rekomendasi Prioritas</h2>
            <div className="space-y-3">
              {/* Item 1 */}
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#008B5A] text-xs font-black text-white">
                    1
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-snug font-medium">
                    Perluas intervensi gizi ibu & anak ke 3 kecamatan prioritas.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <span>Detail</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* Item 2 */}
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                    2
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-snug font-medium">
                    Tingkatkan follow-up pengobatan agar rasio sukses &gt;75%.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <span>Detail</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* Item 3 */}
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-black text-white">
                    3
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-snug font-medium">
                    Optimalkan kemitraan fasilitas kesehatan di wilayah timur.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <span>Detail</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/penyaluran/laporan"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950"
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
