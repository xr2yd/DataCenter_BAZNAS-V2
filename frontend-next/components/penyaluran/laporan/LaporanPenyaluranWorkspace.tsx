'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, Clock3, FileDown, FileSpreadsheet, FileText, FolderArchive, Plus, Search, Sparkles, X } from 'lucide-react';
import { ASNAF_DISTRIBUTION, PROGRAM_ALLOCATION, REPORT_CATEGORIES, REPORT_KPIS, REPORT_READINESS, REPORT_RECORDS, type ReportCategory, type ReportDistribution, type ReportRecord } from './laporan-data';

const TONE_CLASSES: Record<ReportDistribution['tone'], string> = {
  emerald: 'bg-emerald-500', sky: 'bg-sky-500', amber: 'bg-amber-500', violet: 'bg-violet-500', rose: 'bg-rose-500',
};

const STATUS_CLASSES: Record<ReportRecord['status'], string> = {
  'Siap diekspor': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Perlu pembaruan': 'bg-amber-50 text-amber-800 ring-amber-200',
  Arsip: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const READINESS_CLASSES = {
  Selesai: 'bg-emerald-100 text-emerald-700',
  'Perlu ditinjau': 'bg-amber-100 text-amber-700',
  'Menunggu data': 'bg-slate-100 text-slate-500',
} as const;

function DistributionList({ items }: { items: ReportDistribution[] }) {
  return <div className="space-y-4">{items.map((item) => <div key={item.label}>
    <div className="flex items-baseline justify-between gap-3 text-sm"><span className="font-bold text-zinc-900">{item.label}</span><span className="whitespace-nowrap text-xs font-semibold text-zinc-500">{item.value}</span></div>
    <div className="mt-2 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none ${TONE_CLASSES[item.tone]}`} style={{ width: `${item.percentage}%` }} /></div><span className="w-9 text-right text-xs font-black tabular-nums text-zinc-800">{item.percentage}%</span></div>
  </div>)}</div>;
}

export function LaporanPenyaluranWorkspace() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('Ringkasan');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('2026-08');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback('');
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    return REPORT_RECORDS.filter((report) => (Boolean(query) || report.category === activeCategory) && (!query || [report.title, report.description, report.scope, report.period, report.category].join(' ').toLocaleLowerCase('id-ID').includes(query)));
  }, [activeCategory, search]);
  const selectCategory = (category: ReportCategory) => { setActiveCategory(category); setFeedback(`Menampilkan laporan ${category}.`); };
  const prepareExport = (format: 'PDF' | 'Excel', report: ReportRecord) => setFeedback(`${format} untuk ${report.title} siap diproses saat layanan export terhubung.`);

  return <main className="mx-auto w-full max-w-[1440px] space-y-5 pb-8 sm:space-y-6">
    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/35 shadow-[0_18px_45px_-36px_rgba(5,150,105,0.55)]">
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-7">
        <div className="max-w-2xl"><div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700"><span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white"><FolderArchive className="size-3.5" /></span>Report library</div><h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Laporan Penyaluran</h1><p className="mt-2 text-sm font-medium leading-6 text-zinc-600 sm:text-base">Temukan rekap periode aktif, tinjau kesiapan dokumen, lalu siapkan ekspor saat layanan terhubung.</p></div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"><label className="relative flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm"><CalendarDays className="size-4 shrink-0 text-emerald-700" /><span className="sr-only">Periode laporan</span><input aria-label="Periode laporan" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} className="min-w-0 bg-transparent outline-none" /></label><button type="button" onClick={() => setFeedback('Draft laporan baru siap disusun saat layanan pembuat laporan terhubung.')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 motion-reduce:transform-none"><Plus className="size-4" />Buat laporan</button></div>
      </div>
      <div className="border-t border-emerald-100 bg-white/75 px-5 py-3 sm:px-7 lg:px-8"><p className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.13)]" />Data demo · struktur siap disambungkan ke API ekspor</p></div>
    </section>

    <section aria-label="Ringkasan periode laporan" className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-sm sm:grid-cols-2 xl:grid-cols-4">{REPORT_KPIS.map((kpi, index) => <article key={kpi.label} className="bg-white p-5 transition-colors hover:bg-emerald-50/40 sm:p-6"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-zinc-500">{kpi.label}</p><span className={`flex size-8 items-center justify-center rounded-lg ${index === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{index === 0 ? <BarChart3 className="size-4" /> : index === 1 ? <Sparkles className="size-4" /> : index === 2 ? <FileText className="size-4" /> : <CheckCircle2 className="size-4" />}</span></div><p className="mt-4 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{kpi.value}</p><p className="mt-1 text-xs font-medium text-zinc-500">{kpi.detail}</p><p className="mt-3 text-xs font-bold text-emerald-700">{kpi.trend}</p></article>)}</section>

    <section aria-labelledby="library-heading" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Arsip & dokumen</p><h2 id="library-heading" className="mt-1 text-xl font-black tracking-tight text-zinc-950">Library laporan</h2><p className="mt-1 text-sm text-zinc-500">Pilih jenis laporan, cari arsip, lalu siapkan format yang diperlukan.</p></div><label className="flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-500 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 lg:max-w-xs"><Search className="size-4 shrink-0" /><input type="search" aria-label="Cari arsip laporan" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau cakupan" className="min-w-0 flex-1 bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400" /></label></div>
      <div className="grid min-w-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Kategori laporan" className="border-b border-zinc-100 bg-zinc-50/80 p-3 lg:border-b-0 lg:border-r lg:p-4"><div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">{REPORT_CATEGORIES.map((category) => { const active = activeCategory === category.name; return <button key={category.name} type="button" aria-pressed={active} onClick={() => selectCategory(category.name)} className={`min-w-[180px] rounded-xl p-3 text-left transition lg:min-w-0 ${active ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/15' : 'bg-transparent text-zinc-700 hover:bg-white hover:shadow-sm'}`}><span className="flex items-center justify-between gap-2 text-sm font-bold"><span>{category.name}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? 'bg-white/15 text-white' : 'bg-zinc-200/70 text-zinc-500'}`}>{category.reportCount}</span></span><span className={`mt-1 block text-xs leading-5 ${active ? 'text-emerald-100' : 'text-zinc-500'}`}>{category.description}</span></button>; })}</div></nav>
        <div className="min-w-0 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-base font-black text-zinc-950">{activeCategory}</h3><p className="mt-1 text-xs font-medium text-zinc-500">{filteredReports.length} laporan sesuai pencarian</p></div><span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex"><Clock3 className="size-3.5" />Diperbarui hari ini</span></div>
          {filteredReports.length ? <div className="space-y-3" role="list" aria-label="Daftar laporan">{filteredReports.map((report) => <article key={report.id} role="listitem" className="group rounded-2xl border border-zinc-200 bg-white p-4 transition duration-200 hover:border-emerald-200 hover:shadow-md sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">{report.period}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_CLASSES[report.status]}`}>{report.status}</span></div><h3 className="mt-3 text-base font-black leading-6 text-zinc-950">{report.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-600">{report.description}</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-zinc-500"><span>{report.scope}</span><span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" /><span>{report.updatedAt}</span></div></div><div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch"><button type="button" aria-label={`Siapkan PDF: ${report.title}`} onClick={() => prepareExport('PDF', report)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 sm:flex-none"><FileDown className="size-3.5" />PDF</button><button type="button" aria-label={`Siapkan Excel: ${report.title}`} onClick={() => prepareExport('Excel', report)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 sm:flex-none"><FileSpreadsheet className="size-3.5" />Excel</button></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-12 text-center"><Search className="mx-auto size-6 text-zinc-400" /><h3 className="mt-3 font-bold text-zinc-900">Laporan tidak ditemukan</h3><p className="mt-1 text-sm text-zinc-500">Coba kata kunci lain atau hapus pencarian.</p><button type="button" onClick={() => setSearch('')} className="mt-4 text-sm font-bold text-emerald-700 hover:text-emerald-800">Hapus pencarian</button></div>}
        </div>
      </div>
    </section>

    <section aria-label="Insight laporan" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Period insights</p><h2 className="mt-1 text-lg font-black tracking-tight text-zinc-950">Alokasi 5 pilar</h2></div><BarChart3 className="size-5 text-emerald-700" /></div><p className="mt-2 text-sm leading-6 text-zinc-500">Realisasi penyaluran pada periode yang dipilih.</p><div className="mt-6"><DistributionList items={PROGRAM_ALLOCATION} /></div><button type="button" onClick={() => setFeedback('Rincian alokasi program akan tersedia bersama layanan laporan.')} className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition hover:gap-2.5 motion-reduce:hover:gap-1.5">Lihat rincian program <ChevronRight className="size-4" /></button></section>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black tracking-tight text-zinc-950">Komposisi asnaf</h2><p className="mt-1 text-sm text-zinc-500">Distribusi amanah berdasarkan kelompok penerima.</p></div><Sparkles className="size-5 text-violet-600" /></div><div className="mt-6"><DistributionList items={ASNAF_DISTRIBUTION} /></div></section>
      <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6"><div className="flex items-center gap-2"><CircleAlert className="size-5 text-amber-700" /><h2 className="text-lg font-black tracking-tight text-zinc-950">Kesiapan laporan</h2></div><div className="mt-5 space-y-4">{REPORT_READINESS.map((item) => <div key={item.title} className="flex gap-3"><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${READINESS_CLASSES[item.status]}`}>{item.status === 'Selesai' ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}</span><div><p className="text-sm font-bold text-zinc-900">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-zinc-600">{item.detail}</p></div></div>)}</div></section>
    </section>
    <div aria-live="polite" role="status" className={`fixed bottom-5 right-5 z-50 flex max-w-[min(24rem,calc(100vw-2.5rem))] items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-950 px-3.5 py-3 text-sm font-semibold text-white shadow-xl transition duration-200 motion-reduce:transition-none ${feedback ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>{feedback ? <><p className="min-w-0 flex-1 leading-5">{feedback}</p><button type="button" aria-label="Tutup notifikasi" onClick={() => setFeedback('')} className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none"><X className="size-4" /></button></> : null}</div>
  </main>;
}
