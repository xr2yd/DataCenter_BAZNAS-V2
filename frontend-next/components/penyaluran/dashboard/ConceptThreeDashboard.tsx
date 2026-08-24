'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Compass, MapPin, Sparkles, Users } from 'lucide-react';
import { ActionRail } from './ActionRail';
import { ImpactMetrics } from './ImpactMetrics';
import { DASHBOARD_PERIODS, getDashboardSnapshot, type DashboardPeriod } from './dashboard-data';

const RealKecamatanMap = dynamic(() => import('../map/RealKecamatanMap'), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">Memuat Peta Geospasial Tangerang...</div>,
});

const formatRupiah = (amount: number) => amount >= 1_000_000_000
  ? `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`
  : `Rp ${Math.round(amount / 1_000_000).toLocaleString('id-ID')} Jt`;

export function ConceptThreeDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>('Karawaci');
  const snapshot = getDashboardSnapshot(period);
  const selectedData = snapshot.kecamatan.find((item) => item.name === selectedKecamatan);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700"><Sparkles className="size-3.5" /> Beranda penyaluran</div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Ruang keputusan yang berdampak</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Pantau penyaluran, dampak mustahik, dan prioritas kerja dalam satu alur yang mudah ditindaklanjuti.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1" aria-label="Pilih periode data">
            {DASHBOARD_PERIODS.map((option) => <button key={option.id} type="button" onClick={() => setPeriod(option.id)} aria-pressed={period === option.id} className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${period === option.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>{option.label}</button>)}
          </div>
          <Link href="/penyaluran/mustahik" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"><Users className="size-3.5" /> Data Mustahik <ArrowRight className="size-3.5" /></Link>
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800"><span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Data contoh untuk <strong>{snapshot.periodLabel}</strong>. Angka akan diganti otomatis saat endpoint agregasi tersedia.</div>
      <ImpactMetrics {...snapshot.metrics} periodLabel={snapshot.periodLabel} trend={snapshot.metrics.trend} />

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 xl:col-span-5">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-900">Komposisi per asnaf</p><p className="mt-1 text-xs text-zinc-500">Alokasi dan penerima menurut kategori asnaf</p></div><span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-600">{snapshot.periodLabel}</span></div>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {snapshot.asnaf.map((item) => <div key={item.name} className="space-y-1.5"><div className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 font-semibold text-zinc-800"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-mono text-zinc-500">{item.percentage}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} /></div><div className="flex justify-between text-[10px] text-zinc-500"><span>{formatRupiah(item.amount)}</span><span>{item.beneficiaries.toLocaleString('id-ID')} jiwa</span></div></div>)}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 xl:col-span-7">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-900">Alokasi & dampak 5 pilar</p><p className="mt-1 text-xs text-zinc-500">Program dengan dampak terbesar pada periode terpilih</p></div><Link href="/penyaluran/program" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">Kelola program <ArrowRight className="ml-1 inline size-3.5" /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{snapshot.programs.map((item) => <div key={item.name} className="rounded-xl border border-zinc-100 p-3 transition hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-sm"><span className="mb-3 block size-2.5 rounded-full" style={{ backgroundColor: item.color }} /><p className="text-xs font-bold text-zinc-900">{item.name.replace('Tangerang ', '')}</p><p className="mt-1 min-h-8 text-[10px] leading-4 text-zinc-500">{item.category}</p><p className="mt-3 text-sm font-bold tracking-tight text-zinc-900">{formatRupiah(item.amount)}</p><p className="mt-1 text-[10px] text-zinc-500">{item.beneficiaries.toLocaleString('id-ID')} penerima · {item.percentage}%</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} /></div></div>)}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-900">Peta sebaran penyaluran</p><p className="mt-1 text-xs text-zinc-500">Klik kecamatan untuk melihat jumlah penyaluran pada {snapshot.periodLabel}.</p></div><Link href="/penyaluran/peta" className="hidden text-xs font-bold text-emerald-700 sm:block"><Compass className="mr-1 inline size-3.5" /> Buka GIS</Link></div>
          <RealKecamatanMap selectedKecamatan={selectedKecamatan} onSelectKecamatan={setSelectedKecamatan} liveData={snapshot.kecamatan} />
          {selectedData && <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><MapPin className="size-3" /> Kecamatan terpilih</div><p className="mt-1 text-base font-bold text-zinc-950">{selectedData.name}</p><p className="mt-1 text-xs text-zinc-600">{formatRupiah(selectedData.totalDisalurkan)} disalurkan · {selectedData.totalMustahik.toLocaleString('id-ID')} mustahik · {selectedData.topProgram}</p></div><Link href={`/penyaluran/mustahik?kecamatan=${selectedData.name}`} className="text-xs font-bold text-emerald-700">Lihat mustahik <ArrowRight className="ml-1 inline size-3.5" /></Link></div>}
        </div>
        <aside className="space-y-5 xl:col-span-4"><ActionRail priorities={snapshot.priorities} /><div className="border-t border-zinc-200 pt-5"><div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-zinc-900">Aktivitas terbaru</p><span className="text-[10px] font-bold text-emerald-700">{snapshot.periodLabel}</span></div><div className="space-y-4">{snapshot.activities.map((item) => <div key={item.id} className="flex gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.tone === 'emerald' ? 'bg-emerald-500' : item.tone === 'violet' ? 'bg-violet-500' : 'bg-amber-500'}`} /><div><p className="text-xs font-bold text-zinc-900">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.detail}</p><p className="mt-1 text-[10px] text-zinc-400">{item.time}</p></div></div>)}</div></div></aside>
      </section>
    </div>
  );
}
