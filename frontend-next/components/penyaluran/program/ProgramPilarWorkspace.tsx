'use client';

import React, { useState } from 'react';
import { Layers, TrendingUp, Users, Wallet, ArrowRight, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const PILAR_LIST = [
  {
    id: 'sosial',
    name: 'Tangerang Peduli (Kemanusiaan)',
    color: '#e11d48',
    budget: 6800000000,
    realized: 5400000000,
    targetMustahik: 5200,
    currentMustahik: 4890,
    desc: 'Bantuan santunan dhuafa, tanggap darurat bencana, fidyah, dan bedah rumah tidak layak huni.',
    subprograms: ['Santunan Dhuafa & Lansia', 'Bedah Rumah Layak Huni', 'Tanggap Darurat Kebakaran/Banjir', 'Bantuan Pengurusan Jenazah'],
  },
  {
    id: 'pendidikan',
    name: 'Tangerang Cerdas (Pendidikan)',
    color: '#2563eb',
    budget: 4200000000,
    realized: 3650000000,
    targetMustahik: 3100,
    currentMustahik: 2940,
    desc: 'Beasiswa SD/SMP/SMA, bantuan tunggakan SPP ijazah, dan beasiswa SKSS perguruan tinggi.',
    subprograms: ['Beasiswa Satu Keluarga Satu Sarjana', 'Tebus Ijazah & Tunggakan SPP', 'Bantuan Perlengkapan Sekolah', 'Insentif Guru Ngaji'],
  },
  {
    id: 'kesehatan',
    name: 'Tangerang Sehat (Kesehatan)',
    color: '#059669',
    budget: 2900000000,
    realized: 2420000000,
    targetMustahik: 2000,
    currentMustahik: 1880,
    desc: 'Layanan berobat dhuafa, bantuan alat kesehatan (kursi roda/alat bantu dengar), dan BPJS Kesehatan PBI.',
    subprograms: ['Bantuan Pelunasan RS Dhuafa', 'Ambulans Gratis 24 Jam', 'Alat Bantu Medis & Kursi Roda', 'Gizi Balita & Stunting'],
  },
  {
    id: 'ekonomi',
    name: 'Tangerang Makmur (Ekonomi)',
    color: '#d97706',
    budget: 1600000000,
    realized: 1280000000,
    targetMustahik: 950,
    currentMustahik: 860,
    desc: 'Permodalan modal usaha Z-Mart, Z-Chicken, dan gerobak berkah kemandirian mustahik menjadi muzakki.',
    subprograms: ['Modal Usaha Z-Mart', 'Bantuan Gerobak Berkah', 'Pelatihan Wirausaha Amil', 'Pendampingan Usaha Mikro'],
  },
  {
    id: 'dakwah',
    name: 'Tangerang Takwa (Dakwah & Advokasi)',
    color: '#7c3aed',
    budget: 650000000,
    realized: 510000000,
    targetMustahik: 600,
    currentMustahik: 520,
    desc: 'Insentif marbot masjid, pembinaan mualaf Kota Tangerang, dan syiar dakwah keislaman.',
    subprograms: ['Bantuan Operasional Marbot', 'Pembinaan & Advokasi Mualaf', 'Bantuan Sarana Ibadah Musholla', 'Peringatan Hari Besar Islam'],
  },
];

export function ProgramPilarWorkspace() {
  const [selectedPilar, setSelectedPilar] = useState(PILAR_LIST[0]);

  const formatMiliar = (val: number) => `Rp ${(val / 1000000000).toFixed(2)} M`;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Portofolio Program 5 Pilar BAZNAS
          </h1>
          <p className="text-xs text-zinc-500">
            Realisasi anggaran RKAT 2026, serapan per pilar, target mustahik, dan portofolio subprogram
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Tambah Subprogram</span>
        </button>
      </div>

      {/* 2. Pilar Selection Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PILAR_LIST.map((pilar) => {
          const isSelected = selectedPilar?.id === pilar.id;
          const percentage = ((pilar.realized / pilar.budget) * 100).toFixed(0);

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilar(pilar)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="size-2 rounded-xs" style={{ backgroundColor: pilar.color }} />
                <span className="text-[10px] font-bold font-mono text-zinc-500">{percentage}% Serapan</span>
              </div>
              <p className="text-xs font-bold text-zinc-900 truncate">{pilar.name.split(' ')[0]} {pilar.name.split(' ')[1]}</p>
              <p className="text-xs font-mono font-bold text-emerald-700 mt-1">{formatMiliar(pilar.realized)}</p>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Pilar Deep Dive */}
      {selectedPilar && (
        <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Detail Portofolio Pilar
              </span>
              <h2 className="text-base font-bold text-zinc-900">{selectedPilar.name}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{selectedPilar.desc}</p>
            </div>

            <Link
              href={`/penyaluran/mustahik?program=${encodeURIComponent(selectedPilar.name.split(' ')[0]! + ' ' + selectedPilar.name.split(' ')[1]!)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              <span>Hubungkan Mustahik</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[11px] text-zinc-500">Plafon Anggaran RKAT</p>
              <p className="text-sm font-bold font-mono text-zinc-900">{formatMiliar(selectedPilar.budget)}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[11px] text-zinc-500">Realisasi Tersalurkan</p>
              <p className="text-sm font-bold font-mono text-emerald-700">{formatMiliar(selectedPilar.realized)}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[11px] text-zinc-500">Penerima Manfaat (Mustahik)</p>
              <p className="text-sm font-bold font-mono text-zinc-900">{selectedPilar.currentMustahik.toLocaleString('id-ID')} Jiwa</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Daftar Subprogram Aktif
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPilar.subprograms.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-800"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
