'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { Mustahik } from '@/lib/api/types';
import {
  AlertTriangle, ArrowLeft, BadgeCheck, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, FileCheck2, Filter, HeartHandshake, History, MapPin,
  Maximize2, Minimize2, Phone, Plus, Search, ShieldCheck, Upload, UserRound, X,
} from 'lucide-react';

const MustahikLocationMap = dynamic(() => import('./MustahikLocationMap'), { ssr: false });

type StageId = 'all' | 'diajukan' | 'verifikasi' | 'survey' | 'mpzis' | 'ppd' | 'selesai';
type ProfileTab = 'summary' | 'documents' | 'history';
type MobileView = 'queue' | 'profile';
type MustahikView = Mustahik & { completeness: number; score: number; sla: 'Aman' | 'Mendekati' | 'Lewat'; missingDocument?: string; updatedLabel: string };

const STAGES: Array<{ id: StageId; label: string; count: number; statuses?: string[] }> = [
  { id: 'all', label: 'Semua', count: 213 },
  { id: 'diajukan', label: 'Diajukan', count: 18, statuses: ['Diajukan'] },
  { id: 'verifikasi', label: 'Verifikasi', count: 24, statuses: ['Verifikasi Administrasi'] },
  { id: 'survey', label: 'Survey', count: 8, statuses: ['Survey'] },
  { id: 'mpzis', label: 'MPZIS', count: 12, statuses: ['Persetujuan MPZIS'] },
  { id: 'ppd', label: 'PPD', count: 5, statuses: ['Pengajuan Dana (FPD)', 'Pengajuan Dana (PPD)'] },
  { id: 'selesai', label: 'Selesai', count: 146, statuses: ['Penyaluran Selesai'] },
];

const DEMO_MUSTAHIK: MustahikView[] = [
  { id: 1, file_no: 'M/VER/250826/00024', name: 'Siti Maryam', nik: '3175054809820002', phone: '0812-3456-7890', address: 'Jl. Melati No. 23 RT 003/RW 005, Poris Plawad Indah', subdistrict: 'Karawaci', village: 'Bojong Jaya', asnaf: 'Miskin', program: 'Tangerang Sehat', status: 'Survey', recommended_amount: 1500000, received_date: '2026-08-20', completeness: 82, score: 86, sla: 'Mendekati', missingDocument: 'Kartu Keluarga (KK)', updatedLabel: '25 Agu 2026' },
  { id: 2, file_no: 'M/VER/250826/00025', name: 'Ahmad Fauzi', nik: '3671011508821123', phone: '0812-9876-5432', address: 'Jl. KH Hasyim Ashari No. 12, Buaran Indah', subdistrict: 'Ciledug', village: 'Buaran Indah', asnaf: 'Fakir', program: 'Tangerang Peduli', status: 'Verifikasi Administrasi', recommended_amount: 3500000, received_date: '2026-08-21', completeness: 94, score: 91, sla: 'Aman', updatedLabel: '25 Agu 2026' },
  { id: 3, file_no: 'M/VER/240826/00019', name: 'Yuniarti Rahayu', nik: '3276084407903344', phone: '0813-2210-9876', address: 'Kp. Gondrong RT 04/RW 03', subdistrict: 'Cipondoh', village: 'Gondrong', asnaf: 'Miskin', program: 'Tangerang Cerdas', status: 'Verifikasi Administrasi', recommended_amount: 2000000, completeness: 76, score: 79, sla: 'Mendekati', missingDocument: 'Surat Keterangan Tidak Mampu', updatedLabel: '24 Agu 2026' },
  { id: 4, file_no: 'M/VER/230826/00014', name: 'Dedi Supriadi', nik: '3175051907805566', phone: '0857-1102-3321', address: 'Jl. Maulana Hasanudin, Poris Gaga', subdistrict: 'Batuceper', village: 'Poris Gaga', asnaf: 'Gharim', program: 'Tangerang Makmur', status: 'Diajukan', recommended_amount: 5000000, completeness: 61, score: 72, sla: 'Lewat', missingDocument: 'KTP dan foto tempat usaha', updatedLabel: '23 Agu 2026' },
  { id: 5, file_no: 'M/VER/220826/00009', name: 'Mimin Nurhayati', nik: '3276045308757788', phone: '0819-4488-7711', address: 'Kp. Sawah Dalam, Larangan Utara', subdistrict: 'Larangan', village: 'Larangan Utara', asnaf: 'Fakir', program: 'Tangerang Sehat', status: 'Persetujuan MPZIS', recommended_amount: 2750000, completeness: 100, score: 89, sla: 'Aman', updatedLabel: '22 Agu 2026' },
  { id: 6, file_no: 'M/VER/210826/00005', name: 'Rizky Firmansyah', nik: '3671042108948899', phone: '0821-4455-6677', address: 'Jl. HOS Cokroaminoto, Sudimara', subdistrict: 'Ciledug', village: 'Sudimara Barat', asnaf: 'Ibnu Sabil', program: 'Tangerang Cerdas', status: 'Pengajuan Dana (PPD)', recommended_amount: 1200000, completeness: 100, score: 84, sla: 'Aman', updatedLabel: '21 Agu 2026' },
];

const DOCUMENTS = ['KTP', 'Kartu Keluarga (KK)', 'SKTM', 'Foto rumah', 'Slip gaji / usaha', 'Dokumen pendukung'];
const money = (value?: number) => `Rp ${(value ?? 0).toLocaleString('id-ID')}`;
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const maskNik = (nik: string) => `${nik.slice(0, 4)} •••• •••• ${nik.slice(-4)}`;

function adaptApiData(items: Mustahik[]): MustahikView[] {
  return items.map((item, index) => ({ ...item, completeness: item.status === 'Diajukan' ? 68 : 88 + (index % 3) * 4, score: 78 + (index % 4) * 4, sla: index % 5 === 3 ? 'Lewat' : index % 4 === 2 ? 'Mendekati' : 'Aman', missingDocument: index % 3 === 0 ? 'Kartu Keluarga (KK)' : undefined, updatedLabel: '25 Agu 2026' }));
}

function Card({ title, icon: Icon, children, className = '' }: { title: string; icon: typeof UserRound; children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.035)] ${className}`}><div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500"><Icon className="size-4 text-emerald-600" />{title}</div>{children}</section>;
}

function StageRail({ value, onChange }: { value: StageId; onChange: (id: StageId) => void }) {
  return <section aria-label="Tahapan pengajuan Mustahik" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.045)]"><div className="mustahik-stage-scroll flex snap-x overflow-x-auto lg:grid lg:grid-cols-7 lg:overflow-visible">{STAGES.map((stage, index) => {
    const active = value === stage.id;
    return <button type="button" key={stage.id} aria-label={`${stage.label} ${stage.count}`} aria-pressed={active} onClick={() => onChange(stage.id)} className={`group relative flex min-h-16 min-w-[126px] snap-start items-center justify-between px-4 text-left transition duration-300 lg:min-w-0 ${index ? 'border-l border-slate-100' : ''} ${active ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}><span><span className={`block text-xs font-bold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{stage.label}</span><span className="mt-0.5 block text-xl font-extrabold">{stage.count}</span></span>{stage.id !== 'all' && <ChevronRight className={`size-4 ${active ? 'text-emerald-600' : 'text-slate-300'}`} />}<span className={`absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600 transition-transform ${active ? 'scale-x-100' : 'scale-x-0'}`} /></button>;
  })}</div></section>;
}

function Queue({ items, selected, query, onQuery, onSelect }: { items: MustahikView[]; selected: MustahikView; query: string; onQuery: (value: string) => void; onSelect: (item: MustahikView) => void }) {
  return <aside className="flex min-h-0 flex-col bg-white md:border-r md:border-slate-200"><div className="border-b border-slate-200 p-4"><div className="flex items-center justify-between"><div><p className="text-base font-extrabold">Antrean verifikasi</p><p className="mt-0.5 text-xs text-slate-500">{items.length} ditampilkan · 213 total data</p></div><button type="button" aria-label="Filter antrean" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><Filter className="size-4" /></button></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Cari nama, NIK, atau no. pengajuan…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" />{query && <button type="button" aria-label="Kosongkan kata kunci" onClick={() => onQuery('')} className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400"><X className="size-4" /></button>}</div><div className="mt-3 grid grid-cols-3 gap-1.5">{[['Perlu tindakan', 12], ['Lewat SLA', 4], ['Dokumen kurang', 7]].map(([label, count]) => <button type="button" key={String(label)} className="min-h-14 rounded-xl border border-slate-200 px-1 py-2 text-xs font-bold leading-tight text-slate-600 hover:border-emerald-300">{label}<span className="mt-1 block text-sm text-slate-950">{count}</span></button>)}</div></div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 md:max-h-[720px] xl:max-h-[690px]">{items.length === 0 ? <div className="grid min-h-64 place-items-center text-center"><div><Search className="mx-auto size-5 text-slate-400" /><p className="mt-3 text-sm font-extrabold">Data tidak ditemukan</p><p className="mt-1 text-xs text-slate-500">Coba kata kunci lain atau hapus pencarian.</p><button type="button" onClick={() => onQuery('')} className="mt-3 min-h-10 px-3 text-xs font-bold text-emerald-700">Hapus pencarian</button></div></div> : items.map((item, index) => {
      const active = item.id === selected.id;
      return <button type="button" key={item.id} aria-label={`Pilih ${item.name}`} onClick={() => onSelect(item)} style={{ animationDelay: `${index * 45}ms` }} className={`mustahik-row relative w-full rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${active ? 'border-emerald-300 bg-emerald-50/75 shadow-sm' : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md'}`}><span className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{initials(item.name)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{item.name}</strong><i className={`size-2.5 rounded-full ${item.sla === 'Lewat' ? 'bg-rose-500' : item.sla === 'Mendekati' ? 'bg-amber-400' : 'bg-emerald-500'}`} /></span><span className="mt-1 block truncate text-xs text-slate-500">NIK {maskNik(item.nik)}</span><span className="mt-2 flex items-center justify-between gap-2 text-xs"><span className="truncate font-semibold text-slate-600">Kec. {item.subdistrict}</span><span className="max-w-28 truncate rounded-full bg-white px-2 py-1 font-bold text-emerald-700 shadow-sm">{item.status === 'Verifikasi Administrasi' ? 'Verifikasi' : item.status}</span></span></span></span></button>;
    })}</div></aside>;
}

function Tabs({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  const tabs: Array<[ProfileTab, string, typeof UserRound]> = [['summary', 'Ringkasan', UserRound], ['documents', 'Dokumen', FileCheck2], ['history', 'Riwayat', History]];
  return <div role="tablist" aria-label="Informasi Mustahik" className="grid grid-cols-3 border-b border-slate-200 bg-white px-2 md:px-5">{tabs.map(([id, label, Icon]) => <button type="button" role="tab" id={`mustahik-tab-${id}`} aria-controls={`mustahik-panel-${id}`} aria-selected={value === id} tabIndex={value === id ? 0 : -1} key={id} onClick={() => onChange(id)} className={`relative inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 px-1 text-[13px] font-extrabold sm:gap-2 sm:px-3 sm:text-sm ${value === id ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}><Icon className="size-4 shrink-0 max-[340px]:hidden" />{label}<span className={`absolute inset-x-2 bottom-0 h-0.5 bg-emerald-600 transition-transform ${value === id ? 'scale-x-100' : 'scale-x-0'}`} /></button>)}</div>;
}

function Summary({ selected, expanded, onExpand }: { selected: MustahikView; expanded: boolean; onExpand: () => void }) {
  return <div id="mustahik-panel-summary" role="region" aria-label="Ringkasan Mustahik" aria-labelledby="mustahik-tab-summary" className="mustahik-profile-enter grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
    <Card title="Profil utama" icon={UserRound}><dl className="grid gap-4 text-center text-sm xl:grid-cols-2">{[['NIK', maskNik(selected.nik)], ['No. HP', selected.phone], ['Keluarga', 'Menikah · 2 tanggungan'], ['Diperbarui', selected.updatedLabel]].map(([label, value]) => <div key={label} className="grid justify-items-center gap-1"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="flex items-center justify-center gap-1.5 font-bold tracking-[0.02em]">{label === 'No. HP' && <Phone className="size-4 shrink-0 text-emerald-600" />}{value}</dd></div>)}</dl></Card>
    <Card title="Kelayakan & bantuan" icon={HeartHandshake}><div className="grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-3 text-center"><p className="text-xs font-bold text-emerald-700">Asnaf utama</p><p className="mt-1 text-base font-extrabold">{selected.asnaf}</p></div><div className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-xs font-bold text-slate-500">Usulan bantuan</p><p className="mt-1 text-base font-extrabold text-emerald-700">{money(selected.recommended_amount)}</p></div></div><div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center"><ShieldCheck className="size-5 shrink-0 text-emerald-600" /><div><p className="text-sm font-extrabold">{selected.program}</p><p className="mt-1 text-xs leading-5 text-slate-500">Penghasilan, tanggungan, dan kondisi tempat tinggal sudah diverifikasi.</p></div></div></Card>
    <Card title="Alamat domisili" icon={MapPin} className="lg:col-span-2"><div className="flex items-start justify-between gap-3"><p className="max-w-2xl text-sm font-semibold leading-6 text-slate-700">{selected.address}</p><button type="button" onClick={onExpand} aria-label={expanded ? 'Perkecil peta' : 'Perbesar peta'} className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700">{expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button></div><div role="region" aria-label={`Peta lokasi ${selected.name}`} className={`relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition-[height] duration-500 ${expanded ? 'h-72 sm:h-80' : 'h-48 sm:h-56'}`}><MustahikLocationMap address={selected.address ?? ''} village={selected.village ?? ''} subdistrict={selected.subdistrict ?? ''} /><span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">Perkiraan lokasi · Kec. {selected.subdistrict}</span></div></Card>
    <Card title="Status proses" icon={ClipboardCheck} className="lg:col-span-2"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['Diajukan', 'Verifikasi', 'Survey', 'MPZIS'].map((label, index) => <div key={label} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2.5 text-center ${index < 2 ? 'border-emerald-100 bg-emerald-50/65' : 'border-slate-200 bg-white'}`}><div className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index < 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index < 2 ? <Check className="size-4" /> : index + 1}</div><span className="text-xs font-bold text-slate-700">{label}</span></div>)}</div><p className="mt-3 rounded-xl bg-slate-50 p-3 text-center text-xs leading-5 text-slate-600">Tahap aktif: <strong className="text-slate-900">{selected.status}</strong>. Pastikan bukti lapangan lengkap sebelum dilanjutkan.</p></Card>
  </div>;
}

function Documents({ selected }: { selected: MustahikView }) {
  return <div id="mustahik-panel-documents" role="region" aria-label="Dokumen Mustahik" className="mustahik-profile-enter p-3 sm:p-4"><div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-base font-extrabold">Dokumen persyaratan</h3><p className="mt-1 text-xs text-slate-500">Buka dokumen untuk memeriksa kualitas dan kecocokan data.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">{DOCUMENTS.length - (selected.missingDocument ? 1 : 0)} / {DOCUMENTS.length} lengkap</span></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{DOCUMENTS.map((document) => { const missing = document === selected.missingDocument; return <button type="button" key={document} aria-label={`${document} ${missing ? 'belum ada' : 'lengkap'}`} className={`flex min-h-24 items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${missing ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200'}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${missing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{missing ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}</span><span><strong className="block text-sm">{document}</strong><small className="mt-1 block text-xs font-semibold opacity-70">{missing ? 'Belum diunggah' : 'Lengkap · diperiksa'}</small></span></button>; })}</div></div>;
}

function HistoryPanel({ selected }: { selected: MustahikView }) {
  const activity = [['25 Agu · 09:58', 'Identitas berhasil diverifikasi'], ['25 Agu · 09:32', `Alamat ${selected.subdistrict} dikonfirmasi`], ['25 Agu · 09:12', 'Pengajuan masuk ke antrean']];
  return <div id="mustahik-panel-history" role="region" aria-label="Riwayat Mustahik" aria-labelledby="mustahik-tab-history" className="mustahik-profile-enter p-3 sm:p-4"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-base font-extrabold">Riwayat proses</h3><p className="mt-1 text-xs text-slate-500">Jejak aktivitas terbaru pada pengajuan ini.</p><div className="mt-5 space-y-5">{activity.map(([time, title], index) => <div key={time} className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-4" /></span><div><p className="text-xs font-bold text-slate-400">{time}</p><p className="mt-1 text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">Aktivitas tercatat otomatis dan dapat ditelusuri kembali.</p></div>{index < activity.length - 1 && <span />}</div>)}</div></section></div>;
}

function Decision({ selected, note, onNote, onNotice, prefix }: { selected: MustahikView; note: string; onNote: (value: string) => void; onNotice: (message: string) => void; prefix: string }) {
  return <div className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"><section className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-4"><div className="flex items-center gap-4"><div aria-label={`Skor kelayakan ${selected.score} dari 100`} className="grid size-[82px] shrink-0 place-items-center rounded-full bg-emerald-600 p-2"><div className="flex size-full items-baseline justify-center gap-0.5 rounded-full bg-white pt-[22px]"><strong className="text-[29px] font-extrabold leading-none">{selected.score}</strong><span className="text-[10px] font-bold text-slate-400">/100</span></div></div><div><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700">LAYAK</span><p className="mt-2 text-base font-extrabold">Layak dilanjutkan</p><p className="mt-1 text-xs leading-5 text-slate-500">Skor memenuhi ambang verifikasi program.</p></div></div></section><section className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-sm font-extrabold">Hasil verifikasi</p><span className="text-xs font-bold text-emerald-700">3 / 3 sesuai</span></div><div className="mt-3 space-y-3">{['Identitas sesuai Dukcapil', 'Alamat terkonfirmasi', 'Kondisi ekonomi sesuai'].map((label) => <div key={label} className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 font-semibold text-slate-600"><CheckCircle2 className="size-4 text-emerald-600" />{label}</span><strong className="text-emerald-700">Sesuai</strong></div>)}</div></section>{selected.missingDocument && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5"><div className="flex gap-2"><AlertTriangle className="size-4 shrink-0 text-amber-600" /><div><p className="text-sm font-extrabold text-amber-900">Dokumen perlu dilengkapi</p><p className="mt-1 text-xs leading-5 text-amber-800">{selected.missingDocument} belum diunggah sebelum keputusan final.</p></div></div></section>}<section className="rounded-2xl border border-slate-200 p-4"><label htmlFor={`${prefix}-note`} className="text-sm font-extrabold">Catatan asesor</label><textarea id={`${prefix}-note`} value={note} maxLength={500} onChange={(event) => onNote(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /><p className="mt-1 text-right text-xs text-slate-400">{note.length}/500</p></section></div><div className="grid grid-cols-[44px_1fr] gap-2 border-t border-slate-200 bg-white p-4"><button type="button" onClick={() => onNotice('Berkas dikembalikan ke antrean')} aria-label="Kembalikan berkas" className="grid size-11 place-items-center rounded-xl border border-slate-200"><ArrowLeft className="size-4" /></button><button type="button" onClick={() => onNotice('Keputusan disimpan dan diteruskan')} className="h-11 rounded-xl bg-emerald-700 px-4 text-sm font-extrabold text-white hover:bg-emerald-800">Setujui & lanjutkan</button></div></div>;
}

function Profile({ selected, tab, onTab, expanded, onExpand, onBack, onDecision }: { selected: MustahikView; tab: ProfileTab; onTab: (tab: ProfileTab) => void; expanded: boolean; onExpand: () => void; onBack: () => void; onDecision: () => void }) {
  const documentLabel = selected.missingDocument ? `Perlu ${selected.missingDocument}` : 'Dokumen lengkap';

  return <main className="min-w-0 bg-slate-50/60">
    <div className="flex min-h-12 items-center border-b border-slate-200 bg-white px-4 md:px-5">
      <div className="flex items-center gap-2"><button type="button" onClick={onBack} aria-label="Kembali ke antrean" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"><ArrowLeft className="size-4" /></button><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">Profil &amp; kelayakan</p></div>
    </div>
    <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-sm font-extrabold text-emerald-800">{initials(selected.name)}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-extrabold">{selected.name}</h2><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"><BadgeCheck className="size-3.5" />Terverifikasi</span></div><p className="mt-0.5 truncate text-xs text-slate-500">No. pengajuan {selected.file_no}</p></div></div>
        <div className="min-w-full sm:min-w-44"><div className="mb-1.5 flex justify-between text-xs font-bold text-slate-500"><span>Kelengkapan data</span><span>{selected.completeness}%</span></div><div className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600 transition-[width] duration-700" style={{ width: `${selected.completeness}%` }} /></div></div>
      </div>
      <section aria-label="Ringkasan keputusan" className="mt-4 rounded-2xl border border-emerald-100 bg-[linear-gradient(110deg,#f0fdf7_0%,#ffffff_62%)] p-3 shadow-[0_10px_28px_rgba(5,150,105,0.055)] sm:p-4">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center"><div className="flex min-w-0 items-center gap-3"><div aria-label={`Skor kelayakan ${selected.score} dari 100`} className="flex h-14 shrink-0 items-baseline justify-center gap-1 rounded-2xl border border-emerald-200 bg-white px-3 text-emerald-800 shadow-sm"><strong className="text-2xl font-extrabold leading-none">{selected.score}</strong><span className="text-xs font-bold text-slate-400">/100</span></div><div className="min-w-0"><div className="flex flex-wrap items-center justify-center gap-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-extrabold tracking-wide text-emerald-700">LAYAK</span><p className="font-extrabold text-slate-950">Keputusan siap ditinjau</p></div><p className="mt-1 text-xs leading-5 text-slate-500">{selected.missingDocument ? documentLabel : 'Hasil verifikasi lengkap dan siap diproses.'}</p></div></div><button type="button" onClick={onDecision} aria-label="Buka panel keputusan" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 sm:px-4 sm:text-sm"><ClipboardCheck className="size-4" />Tinjau keputusan</button></div>
      </section>
    </div>
    <Tabs value={tab} onChange={onTab} />
    {tab === 'summary' && <Summary selected={selected} expanded={expanded} onExpand={onExpand} />}
    {tab === 'documents' && <Documents selected={selected} />}
    {tab === 'history' && <HistoryPanel selected={selected} />}
  </main>;
}

export function MustahikWorkspace() {
  const [items, setItems] = useState<MustahikView[]>(DEMO_MUSTAHIK);
  const [stage, setStage] = useState<StageId>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<MustahikView['id']>(DEMO_MUSTAHIK[0]!.id);
  const [tab, setTab] = useState<ProfileTab>('summary');
  const [mobileView, setMobileView] = useState<MobileView>('queue');
  const [expanded, setExpanded] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [note, setNote] = useState('Hasil verifikasi menunjukkan kondisi ekonomi keluarga sesuai kriteria mustahik.');
  const [notice, setNotice] = useState<string | null>(null);
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => { api.getMustahikList().then((response) => { if (response.data?.length) { const adapted = adaptApiData(response.data); setItems(adapted); setSelectedId(adapted[0]!.id); } }).catch(() => undefined); }, []);
  useEffect(() => {
    if (!decisionOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Tutup panel keputusan"]')?.focus());
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDecisionOpen(false); };
    document.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', close);
    };
  }, [decisionOpen]);

  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); const active = STAGES.find((item) => item.id === stage); return items.filter((item) => (!needle || [item.name, item.nik, item.file_no, item.subdistrict].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle))) && (!active?.statuses || active.statuses.includes(item.status))); }, [items, query, stage]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selected) return null;
  const toast = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2600); };
  const chooseStage = (id: StageId) => { setStage(id); const active = STAGES.find((item) => item.id === id); if (!active?.statuses || active.statuses.includes(selected.status)) return; const first = items.find((item) => active.statuses?.includes(item.status)); if (first) setSelectedId(first.id); };
  const choosePerson = (item: MustahikView) => {
    setSelectedId(item.id);
    setTab('summary');
    setExpanded(false);
    setMobileView('profile');
    if (window.innerWidth < 768) requestAnimationFrame(() => requestAnimationFrame(() => {
      const backButton = document.querySelector<HTMLButtonElement>('[aria-label="Kembali ke antrean"]');
      backButton?.closest('main')?.scrollIntoView({ block: 'start' });
      window.scrollBy({ top: -64, behavior: 'auto' });
      backButton?.focus({ preventScroll: true });
    }));
  };
  const openDecision = () => {
    decisionTriggerRef.current = document.activeElement as HTMLElement;
    setDecisionOpen(true);
  };
  const closeDecision = () => {
    setDecisionOpen(false);
    requestAnimationFrame(() => decisionTriggerRef.current?.focus());
  };

  return <div className="mx-auto max-w-[1880px] space-y-4 pb-8 text-slate-950"><header className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[1fr_auto_1fr]"><div><h1 className="text-2xl font-extrabold tracking-tight">Data Mustahik</h1><div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1"><p className="max-w-2xl text-sm leading-6 text-slate-500">Kelola pengajuan, verifikasi, dan progres penyaluran dalam satu ruang kerja yang mudah dipahami.</p><div className="flex items-center gap-2 text-xs font-bold text-slate-600 xl:hidden"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" /></span><span><strong className="text-emerald-700">Data tersinkron</strong><small className="ml-1 font-semibold text-slate-400">· 10:15 WIB</small></span></div></div></div><div className="hidden items-center gap-2 text-xs font-bold text-slate-600 xl:flex xl:justify-self-center"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" /></span><span><strong className="text-emerald-700">Data tersinkron</strong><small className="mt-0.5 block font-semibold text-slate-400">25 Agustus 2026 · 10:15 WIB</small></span></div><div className="flex gap-2 md:justify-self-end xl:justify-self-end"><button type="button" onClick={() => toast('Panel impor data siap digunakan')} className="flex h-11 whitespace-nowrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold sm:px-4 sm:text-sm"><Upload className="size-4" />Impor data</button><button type="button" onClick={() => toast('Form Mustahik baru dibuka')} className="flex h-11 whitespace-nowrap items-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white sm:px-4 sm:text-sm"><Plus className="size-4" />Tambah Mustahik</button></div></header><StageRail value={stage} onChange={chooseStage} />
    <section className="overflow-clip rounded-[22px] border border-slate-200 bg-slate-50/55 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"><div className="grid min-h-[640px] md:grid-cols-[280px_minmax(0,1fr)]"><div className={`${mobileView === 'queue' ? 'block' : 'hidden'} md:block`}><Queue items={filtered} selected={selected} query={query} onQuery={setQuery} onSelect={choosePerson} /></div><div className={`${mobileView === 'profile' ? 'block' : 'hidden'} min-w-0 md:block`}><Profile selected={selected} tab={tab} onTab={setTab} expanded={expanded} onExpand={() => setExpanded((value) => !value)} onBack={() => setMobileView('queue')} onDecision={openDecision} /></div></div></section>
    {decisionOpen && <div className="fixed inset-0 z-[80]"><button type="button" tabIndex={-1} aria-label="Tutup dialog keputusan melalui latar" onClick={closeDecision} className="mustahik-overlay absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" /><section role="dialog" aria-modal="true" aria-label="Keputusan Mustahik" className="mustahik-decision-sheet absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl md:inset-y-0 md:left-auto md:w-[400px] md:max-h-none md:rounded-none"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-base font-extrabold">Panel keputusan</p><p className="mt-0.5 text-xs text-slate-500">{selected.name} · {selected.file_no}</p></div><button type="button" aria-label="Tutup panel keputusan" onClick={closeDecision} className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-500"><X className="size-4" /></button></div><Decision selected={selected} note={note} onNote={setNote} onNotice={toast} prefix="drawer" /></section></div>}
    {notice && <div role="status" className="mustahik-toast fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl"><CheckCircle2 className="size-4 text-emerald-400" />{notice}</div>}
  </div>;
}
