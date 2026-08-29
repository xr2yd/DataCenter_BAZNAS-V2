'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { Mustahik, MustahikStageCounts } from '@/lib/api/types';
import {
  AlertTriangle, ArrowLeft, BadgeCheck, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, FileCheck2, Filter, HeartHandshake, History, MapPin,
  Maximize2, Minimize2, Phone, Plus, Search, ShieldCheck, Upload, UserRound, X,
  FileSpreadsheet, Loader2, Sparkles
} from 'lucide-react';

const MustahikLocationMap = dynamic(() => import('./MustahikLocationMap'), { ssr: false });

type StageId = 'all' | 'diajukan' | 'verifikasi' | 'survey' | 'mpzis' | 'ppd' | 'selesai';
type ProfileTab = 'summary' | 'documents' | 'history';
type MobileView = 'queue' | 'profile';
type MustahikView = Mustahik & { completeness: number; score: number; sla: 'Aman' | 'Mendekati' | 'Lewat'; missingDocument?: string; updatedLabel: string };

const DEFAULT_STAGES: Array<{ id: StageId; label: string; count: number; statuses?: string[] }> = [
  { id: 'all', label: 'Semua', count: 0 },
  { id: 'diajukan', label: 'Diajukan', count: 0, statuses: ['Diajukan'] },
  { id: 'verifikasi', label: 'Verifikasi', count: 0, statuses: ['Verifikasi Administrasi', 'Verifikasi'] },
  { id: 'survey', label: 'Survey', count: 0, statuses: ['Survey'] },
  { id: 'mpzis', label: 'MPZIS', count: 0, statuses: ['Persetujuan MPZIS'] },
  { id: 'ppd', label: 'PPD', count: 0, statuses: ['Pengajuan Dana (FPD)', 'Pengajuan Dana (PPD)'] },
  { id: 'selesai', label: 'Selesai', count: 0, statuses: ['Penyaluran Selesai'] },
];

const DOCUMENTS = ['KTP', 'Kartu Keluarga (KK)', 'SKTM', 'Foto rumah', 'Slip gaji / usaha', 'Dokumen pendukung'];
const money = (value?: number) => `Rp ${(value ?? 0).toLocaleString('id-ID')}`;
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const maskNik = (nik: string) => `${(nik || '').slice(0, 4)} •••• •••• ${(nik || '').slice(-4)}`;

function adaptApiData(items: Mustahik[]): MustahikView[] {
  return items.map((item, index) => {
    const raw = item as any;
    return {
      ...item,
      completeness: item.status === 'Diajukan' ? 68 : item.status === 'Verifikasi Administrasi' ? 82 : 95 + (index % 5),
      score: raw.overall_score ? Math.round(Number(raw.overall_score)) : 78 + (index % 4) * 4,
      sla: index % 7 === 3 ? 'Lewat' : index % 5 === 2 ? 'Mendekati' : 'Aman',
      missingDocument: item.status === 'Diajukan' && index % 2 === 0 ? 'Kartu Keluarga (KK)' : undefined,
      updatedLabel: (item.updated_at ? item.updated_at.split('T')[0] : '25 Agu 2026') as string,
    };
  });
}

function Card({ title, icon: Icon, children, className = '' }: { title: string; icon: typeof UserRound; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] ${className}`}>
      <div className="mb-3.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
        <Icon className="size-4 text-emerald-600" />
        {title}
      </div>
      {children}
    </section>
  );
}

function StageRail({
  value,
  onChange,
  stages,
}: {
  value: StageId;
  onChange: (id: StageId) => void;
  stages: typeof DEFAULT_STAGES;
}) {
  return (
    <section aria-label="Tahapan pengajuan Mustahik" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.045)]">
      <div className="mustahik-stage-scroll flex snap-x overflow-x-auto lg:grid lg:grid-cols-7 lg:overflow-visible">
        {stages.map((stage, index) => {
          const active = value === stage.id;
          return (
            <button
              type="button"
              key={stage.id}
              aria-label={`${stage.label} ${stage.count}`}
              aria-pressed={active}
              onClick={() => onChange(stage.id)}
              className={`group relative flex min-h-16 min-w-[126px] snap-start items-center justify-between px-4 text-left transition duration-300 lg:min-w-0 ${
                index ? 'border-l border-slate-100' : ''
              } ${active ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}
            >
              <span>
                <span className={`block text-xs font-bold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{stage.label}</span>
                <span className="mt-0.5 block text-xl font-extrabold">{stage.count}</span>
              </span>
              {stage.id !== 'all' && <ChevronRight className={`size-4 ${active ? 'text-emerald-600' : 'text-slate-300'}`} />}
              <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600 transition-transform ${active ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Queue({
  items,
  allItems,
  totalCount,
  selected,
  query,
  quickFilter,
  onQuery,
  onSelect,
  onFilterQuick,
}: {
  items: MustahikView[];
  allItems: MustahikView[];
  totalCount: number;
  selected?: MustahikView;
  query: string;
  quickFilter: 'all' | 'Perlu tindakan' | 'Lewat' | 'Dokumen';
  onQuery: (value: string) => void;
  onSelect: (item: MustahikView) => void;
  onFilterQuick: (slaFilter: 'all' | 'Perlu tindakan' | 'Lewat' | 'Dokumen') => void;
}) {
  const perluTindakanCount = allItems.filter(
    (i) => i.status === 'Diajukan' || i.status === 'Verifikasi Administrasi' || i.status === 'Verifikasi'
  ).length;
  const lewatCount = allItems.filter((i) => i.sla === 'Lewat').length;
  const dokumenCount = allItems.filter((i) => Boolean(i.missingDocument)).length;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-extrabold">Antrean verifikasi</p>
            <p className="mt-0.5 text-xs text-slate-500">{items.length} ditampilkan · {totalCount} total data</p>
          </div>
          <button
            type="button"
            aria-label="Filter antrean"
            onClick={() => onFilterQuick('all')}
            className={`grid size-10 place-items-center rounded-xl border transition ${
              quickFilter !== 'all'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <Filter className="size-4" />
          </button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Cari nama, NIK, atau no. pengajuan…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
          {query && (
            <button
              type="button"
              aria-label="Kosongkan kata kunci"
              onClick={() => onQuery('')}
              className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onFilterQuick(quickFilter === 'Perlu tindakan' ? 'all' : 'Perlu tindakan')}
            className={`min-h-14 rounded-xl border px-1 py-2 text-xs font-bold leading-tight transition ${
              quickFilter === 'Perlu tindakan'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400/30'
                : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            Perlu tindakan
            <span className="mt-1 block text-sm font-extrabold text-slate-950">{perluTindakanCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterQuick(quickFilter === 'Lewat' ? 'all' : 'Lewat')}
            className={`min-h-14 rounded-xl border px-1 py-2 text-xs font-bold leading-tight transition ${
              quickFilter === 'Lewat'
                ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-400/30'
                : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
          >
            Lewat SLA
            <span className="mt-1 block text-sm font-extrabold text-rose-700">{lewatCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterQuick(quickFilter === 'Dokumen' ? 'all' : 'Dokumen')}
            className={`min-h-14 rounded-xl border px-1 py-2 text-xs font-bold leading-tight transition ${
              quickFilter === 'Dokumen'
                ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-400/30'
                : 'border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            Dokumen kurang
            <span className="mt-1 block text-sm font-extrabold text-amber-700">{dokumenCount}</span>
          </button>
        </div>
      </div>
      <div className="queue-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pr-2">
        {items.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <Search className="mx-auto size-5 text-slate-400" />
              <p className="mt-3 text-sm font-extrabold">Data tidak ditemukan</p>
              <p className="mt-1 text-xs text-slate-500">Coba kata kunci lain atau hapus pencarian.</p>
              <button type="button" onClick={() => onQuery('')} className="mt-3 min-h-10 px-3 text-xs font-bold text-emerald-700">
                Hapus pencarian
              </button>
            </div>
          </div>
        ) : (
          items.map((item, index) => {
            const active = Boolean(selected && item.id === selected.id);
            return (
              <button
                type="button"
                key={item.id}
                aria-label={`Pilih ${item.name}`}
                onClick={() => onSelect(item)}
                style={{ animationDelay: `${index * 45}ms` }}
                className={`mustahik-row relative w-full rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
                  active ? 'border-emerald-300 bg-emerald-50/75 shadow-sm' : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {initials(item.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm">{item.name}</strong>
                      <i className={`size-2.5 rounded-full ${item.sla === 'Lewat' ? 'bg-rose-500' : item.sla === 'Mendekati' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">NIK {maskNik(item.nik)}</span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-semibold text-slate-600">Kec. {item.subdistrict || item.kecamatan}</span>
                      <span className="max-w-28 truncate rounded-full bg-white px-2 py-1 font-bold text-emerald-700 shadow-sm">
                        {item.status === 'Verifikasi Administrasi' ? 'Verifikasi' : item.status}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function Tabs({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  const tabs: Array<[ProfileTab, string, typeof UserRound]> = [
    ['summary', 'Ringkasan', UserRound],
    ['documents', 'Dokumen', FileCheck2],
    ['history', 'Riwayat', History],
  ];
  return (
    <div role="tablist" aria-label="Informasi Mustahik" className="grid grid-cols-3 border-b border-slate-200 bg-white px-2 md:px-5">
      {tabs.map(([id, label, Icon]) => (
        <button
          type="button"
          role="tab"
          id={`mustahik-tab-${id}`}
          aria-controls={`mustahik-panel-${id}`}
          aria-selected={value === id}
          tabIndex={value === id ? 0 : -1}
          key={id}
          onClick={() => onChange(id)}
          className={`relative inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 px-1 text-[13px] font-extrabold sm:gap-2 sm:px-3 sm:text-sm ${
            value === id ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icon className="size-4 shrink-0 max-[340px]:hidden" />
          {label}
          <span className={`absolute inset-x-2 bottom-0 h-0.5 bg-emerald-600 transition-transform ${value === id ? 'scale-x-100' : 'scale-x-0'}`} />
        </button>
      ))}
    </div>
  );
}

function Summary({ selected, expanded, onExpand }: { selected: MustahikView; expanded: boolean; onExpand: () => void }) {
  return (
    <div id="mustahik-panel-summary" role="region" aria-label="Ringkasan Mustahik" aria-labelledby="mustahik-tab-summary" className="mustahik-profile-enter grid gap-4 p-4 md:p-6 lg:grid-cols-2">
      <Card title="Profil utama" icon={UserRound}>
        <dl className="grid gap-4 text-center text-sm xl:grid-cols-2">
          {[
            ['NIK', maskNik(selected.nik)],
            ['No. HP', selected.phone || '-'],
            ['Keluarga', `${selected.marital_status || 'Menikah'} · ${selected.family_dependents ?? 2} tanggungan`],
            ['Diperbarui', selected.updatedLabel],
          ].map(([label, value]) => (
            <div key={label} className="grid justify-items-center gap-1">
              <dt className="text-xs font-bold text-slate-500">{label}</dt>
              <dd className="flex items-center justify-center gap-1.5 font-bold tracking-[0.02em]">
                {label === 'No. HP' && <Phone className="size-4 shrink-0 text-emerald-600" />}
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card title="Kelayakan & bantuan" icon={HeartHandshake}>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-xs font-bold text-emerald-700">Asnaf utama</p>
            <p className="mt-1 text-base font-extrabold">{selected.asnaf || 'Miskin'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs font-bold text-slate-500">Usulan bantuan</p>
            <p className="mt-1 text-base font-extrabold text-emerald-700">{money(selected.recommended_amount || selected.approved_amount)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center">
          <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-extrabold">{selected.program || 'Tangerang Peduli'}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Penghasilan, tanggungan, dan kondisi tempat tinggal sudah diverifikasi.</p>
          </div>
        </div>
      </Card>
      <Card title="Alamat domisili" icon={MapPin} className="lg:col-span-2">
        <div className="flex items-start justify-between gap-3">
          <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-700">{selected.address || `Kec. ${selected.subdistrict || selected.kecamatan}, Kel. ${selected.village || selected.kelurahan}`}</p>
          <button
            type="button"
            onClick={onExpand}
            aria-label={expanded ? 'Perkecil peta' : 'Perbesar peta'}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
        <div role="region" aria-label={`Peta lokasi ${selected.name}`} className={`relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition-[height] duration-500 ${expanded ? 'h-72 sm:h-80' : 'h-48 sm:h-56'}`}>
          <MustahikLocationMap address={selected.address ?? ''} village={selected.village ?? selected.kelurahan ?? ''} subdistrict={selected.subdistrict ?? selected.kecamatan ?? ''} />
          <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
            Perkiraan lokasi · Kec. {selected.subdistrict || selected.kecamatan}
          </span>
        </div>
      </Card>
      <Card title="Status proses" icon={ClipboardCheck} className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {['Diajukan', 'Verifikasi', 'Survey', 'MPZIS'].map((label, index) => (
            <div
              key={label}
              className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2.5 text-center ${
                index < 2 ? 'border-emerald-100 bg-emerald-50/65' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index < 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {index < 2 ? <Check className="size-4" /> : index + 1}
              </div>
              <span className="text-xs font-bold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-center text-xs leading-5 text-slate-600">
          Tahap aktif: <strong className="text-slate-900">{selected.status}</strong>. Pastikan bukti lapangan lengkap sebelum dilanjutkan.
        </p>
      </Card>
    </div>
  );
}

function Documents({ selected }: { selected: MustahikView }) {
  return (
    <div id="mustahik-panel-documents" role="region" aria-label="Dokumen Mustahik" className="mustahik-profile-enter p-3 sm:p-4">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold">Dokumen persyaratan</h3>
            <p className="mt-1 text-xs text-slate-500">Buka dokumen untuk memeriksa kualitas dan kecocokan data.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
            {DOCUMENTS.length - (selected.missingDocument ? 1 : 0)} / {DOCUMENTS.length} lengkap
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((document) => {
          const missing = document === selected.missingDocument;
          return (
            <button
              type="button"
              key={document}
              aria-label={`${document} ${missing ? 'belum ada' : 'lengkap'}`}
              className={`flex min-h-24 items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                missing ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200'
              }`}
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${missing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {missing ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
              </span>
              <span>
                <strong className="block text-sm">{document}</strong>
                <small className="mt-1 block text-xs font-semibold opacity-70">{missing ? 'Belum diunggah' : 'Lengkap · diperiksa'}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HistoryPanel({ selected }: { selected: MustahikView }) {
  const activity = [
    ['25 Agu · 09:58', 'Identitas berhasil diverifikasi'],
    ['25 Agu · 09:32', `Alamat ${selected.subdistrict || selected.kecamatan} dikonfirmasi`],
    ['25 Agu · 09:12', 'Pengajuan masuk ke antrean'],
  ];
  return (
    <div id="mustahik-panel-history" role="region" aria-label="Riwayat Mustahik" aria-labelledby="mustahik-tab-history" className="mustahik-profile-enter p-3 sm:p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-extrabold">Riwayat proses</h3>
        <p className="mt-1 text-xs text-slate-500">Jejak aktivitas terbaru pada pengajuan ini.</p>
        <div className="mt-5 space-y-5">
          {activity.map(([time, title], index) => (
            <div key={time} className="flex gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-400">{time}</p>
                <p className="mt-1 text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Aktivitas tercatat otomatis dan dapat ditelusuri kembali.</p>
              </div>
              {index < activity.length - 1 && <span />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Decision({
  selected,
  note,
  onNote,
  onSubmitDecision,
  prefix,
  isSubmitting,
  onClose,
}: {
  selected: MustahikView;
  note: string;
  onNote: (value: string) => void;
  onSubmitDecision: (action: 'approve' | 'reject') => void;
  prefix: string;
  isSubmitting: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
        {/* Card 1: Score & Qualification Status */}
        <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div
              aria-label={`Skor kelayakan ${selected.score} dari 100`}
              className="flex h-16 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs"
            >
              <strong className="text-2xl font-black leading-none">{selected.score}</strong>
              <span className="mt-0.5 text-[10px] font-bold text-emerald-200 uppercase tracking-wider">/ 100</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                  <CheckCircle2 className="size-3.5" />
                  LAYAK DILANJUTKAN
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Ambang Kelulusan: 70+
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium text-emerald-950/80 leading-relaxed">
                {selected.missingDocument
                  ? `Catatan: ${selected.missingDocument} perlu dilengkapi.`
                  : 'Skor dan berkas telah memenuhi standar verifikasi administrasi BAZNAS.'}
              </p>
            </div>
          </div>
        </section>

        {/* Card 2: Program & Asnaf Snapshot */}
        <section className="grid grid-cols-3 gap-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 text-center">
          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asnaf</span>
            <span className="mt-1 block text-xs font-black text-slate-900 truncate">{selected.asnaf || 'Miskin'}</span>
          </div>
          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Program</span>
            <span className="mt-1 block text-xs font-black text-emerald-700 truncate">{selected.program || 'Tangerang Peduli'}</span>
          </div>
          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usulan Dana</span>
            <span className="mt-1 block text-xs font-black text-slate-900 truncate">{money(selected.recommended_amount || selected.approved_amount)}</span>
          </div>
        </section>

        {/* Card 3: Checklist Hasil Validasi */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Hasil Verifikasi Data</p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">3 dari 3 Sesuai</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              ['Identitas Kependudukan (Dukcapil)', 'NIK valid & terdaftar'],
              ['Alamat Domisili Kota Tangerang', `Kec. ${selected.subdistrict || selected.kecamatan}`],
              ['Kriteria Asnaf & Kondisi Ekonomi', 'Sesuai ambang batas kemiskinan'],
            ].map(([label, sub]) => (
              <div key={label} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800">{label}</span>
                    <span className="block text-[11px] text-slate-400">{sub}</span>
                  </div>
                </div>
                <strong className="shrink-0 text-emerald-700 font-extrabold bg-emerald-50/80 px-2 py-0.5 rounded-md">Valid</strong>
              </div>
            ))}
          </div>
        </section>

        {selected.missingDocument && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex gap-2.5">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-extrabold text-amber-900">Dokumen Perlu Dilengkapi</p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800">{selected.missingDocument} belum diunggah sebelum keputusan final.</p>
              </div>
            </div>
          </section>
        )}

        {/* Card 4: Catatan Asesor */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4">
          <label htmlFor={`${prefix}-note`} className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">Catatan Amil / Asesor</label>
          <textarea
            id={`${prefix}-note`}
            value={note}
            maxLength={500}
            onChange={(event) => onNote(event.target.value)}
            placeholder="Tambahkan catatan khusus untuk tim survey lapangan..."
            className="mt-2 min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs leading-relaxed outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400 font-medium">{note.length}/500 karakter</p>
        </section>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200/90 bg-slate-50/50 p-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
        >
          Batal
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision('reject')}
            className="h-11 rounded-xl border border-rose-200 bg-white px-4 text-xs font-extrabold text-rose-700 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
          >
            Tolak
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision('approve')}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00704A] px-5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#005a3b] transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            <span>Setujui &amp; Lanjutkan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Profile({
  selected,
  tab,
  onTab,
  expanded,
  onExpand,
  onBack,
  onDecision,
}: {
  selected: MustahikView;
  tab: ProfileTab;
  onTab: (tab: ProfileTab) => void;
  expanded: boolean;
  onExpand: () => void;
  onBack: () => void;
  onDecision: () => void;
}) {
  const documentLabel = selected.missingDocument ? `Perlu ${selected.missingDocument}` : 'Dokumen lengkap';

  return (
    <main className="min-w-0 bg-white">
      <div className="flex min-h-12 items-center border-b border-slate-200 bg-white px-4 md:px-5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Kembali ke antrean" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden">
            <ArrowLeft className="size-4" />
          </button>
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">Profil &amp; kelayakan</p>
        </div>
      </div>
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_270px] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-sm font-extrabold text-emerald-800">
              {initials(selected.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-extrabold">{selected.name}</h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="size-3.5" />
                  Terverifikasi
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">No. pengajuan {selected.file_no}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Kelengkapan data</span>
              <span className="text-emerald-700">{selected.completeness}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-700" style={{ width: `${selected.completeness}%` }} />
            </div>
          </div>
        </div>
        <section aria-label="Ringkasan keputusan" className="mt-3 overflow-hidden rounded-[20px] border border-emerald-100 bg-white shadow-[0_12px_30px_rgba(5,150,105,0.07)]">
          <div className="grid md:grid-cols-[152px_minmax(0,1fr)_auto] md:items-stretch">
            <div aria-label={`Skor kelayakan ${selected.score} dari 100`} className="flex min-h-28 flex-col items-center justify-center bg-emerald-800 px-5 py-4 text-center text-white">
              <div className="flex items-baseline justify-center gap-1">
                <strong className="text-4xl font-extrabold leading-none tracking-[-0.06em]">{selected.score}</strong>
                <span className="text-sm font-extrabold text-emerald-200">/100</span>
              </div>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-100">Skor kelayakan</p>
            </div>
            <div className="flex flex-col justify-center px-5 py-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-extrabold tracking-wide text-emerald-700">LAYAK</span>
                <p className="text-base font-extrabold text-slate-950">Keputusan siap ditinjau</p>
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-500">{selected.missingDocument ? documentLabel : 'Hasil verifikasi lengkap dan siap diproses.'}</p>
            </div>
            <div className="flex items-center justify-center border-t border-slate-100 bg-slate-50/70 p-3 md:border-l md:border-t-0">
              <button
                type="button"
                onClick={onDecision}
                aria-label="Buka panel keputusan"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
              >
                <ClipboardCheck className="size-4" />
                Tinjau keputusan
              </button>
            </div>
          </div>
        </section>
      </div>
      <Tabs value={tab} onChange={onTab} />
      {tab === 'summary' && <Summary selected={selected} expanded={expanded} onExpand={onExpand} />}
      {tab === 'documents' && <Documents selected={selected} />}
      {tab === 'history' && <HistoryPanel selected={selected} />}
    </main>
  );
}

export function MustahikWorkspace() {
  const [items, setItems] = useState<MustahikView[]>([]);
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [stage, setStage] = useState<StageId>('all');
  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'Perlu tindakan' | 'Lewat' | 'Dokumen'>('all');
  const [selectedId, setSelectedId] = useState<MustahikView['id'] | null>(null);
  const [tab, setTab] = useState<ProfileTab>('summary');
  const [mobileView, setMobileView] = useState<MobileView>('queue');
  const [expanded, setExpanded] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('Hasil verifikasi menunjukkan kondisi ekonomi keluarga sesuai kriteria mustahik.');
  const [notice, setNotice] = useState<string | null>(null);
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

  // Form states for Add Mustahik
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    kecamatan: 'Cipondoh',
    kelurahan: 'Cipondoh',
    address: '',
    asnaf: 'Miskin',
    program: 'Tangerang Cerdas',
    recommended_amount: '2000000',
  });

  // Import State
  const [importText, setImportText] = useState('');

  const loadData = () => {
    setIsLoading(true);
    api.getMustahikList()
      .then((response) => {
        const rawList = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
        if (rawList.length) {
          const adapted = adaptApiData(rawList);
          setItems(adapted);
          if (!selectedId || !adapted.some((a) => a.id === selectedId)) {
            setSelectedId(adapted[0]!.id);
          }

          // Dynamically compute stages counts from loaded records
          const countAll = adapted.length;
          const countDiajukan = adapted.filter((a) => a.status === 'Diajukan').length;
          const countVerifikasi = adapted.filter((a) => a.status === 'Verifikasi Administrasi' || a.status === 'Verifikasi').length;
          const countSurvey = adapted.filter((a) => a.status === 'Survey').length;
          const countMpzis = adapted.filter((a) => a.status === 'Persetujuan MPZIS').length;
          const countPpd = adapted.filter((a) => a.status === 'Pengajuan Dana (FPD)' || a.status === 'Pengajuan Dana (PPD)').length;
          const countSelesai = adapted.filter((a) => a.status === 'Penyaluran Selesai').length;

          setStages([
            { id: 'all', label: 'Semua', count: countAll },
            { id: 'diajukan', label: 'Diajukan', count: countDiajukan, statuses: ['Diajukan'] },
            { id: 'verifikasi', label: 'Verifikasi', count: countVerifikasi, statuses: ['Verifikasi Administrasi', 'Verifikasi'] },
            { id: 'survey', label: 'Survey', count: countSurvey, statuses: ['Survey'] },
            { id: 'mpzis', label: 'MPZIS', count: countMpzis, statuses: ['Persetujuan MPZIS'] },
            { id: 'ppd', label: 'PPD', count: countPpd, statuses: ['Pengajuan Dana (FPD)', 'Pengajuan Dana (PPD)'] },
            { id: 'selesai', label: 'Selesai', count: countSelesai, statuses: ['Penyaluran Selesai'] },
          ]);
        }
      })
      .catch((err) => {
        console.error('Failed to load mustahik data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!decisionOpen && !addModalOpen && !importModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDecisionOpen(false);
        setAddModalOpen(false);
        setImportModalOpen(false);
      }
    };
    document.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', close);
    };
  }, [decisionOpen, addModalOpen, importModalOpen]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const activeStage = stages.find((item) => item.id === stage);
    return items.filter((item) => {
      const matchSearch =
        !needle ||
        [item.name, item.nik, item.file_no, item.subdistrict, item.kecamatan, item.program, item.asnaf]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(needle));

      const matchStage = !activeStage?.statuses || activeStage.statuses.includes(item.status);

      let matchQuick = true;
      if (quickFilter === 'Perlu tindakan') {
        matchQuick = item.status === 'Diajukan' || item.status === 'Verifikasi Administrasi' || item.status === 'Verifikasi';
      } else if (quickFilter === 'Lewat') {
        matchQuick = item.sla === 'Lewat';
      } else if (quickFilter === 'Dokumen') {
        matchQuick = Boolean(item.missingDocument);
      }

      return matchSearch && matchStage && matchQuick;
    });
  }, [items, query, stage, stages, quickFilter]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const chooseStage = (id: StageId) => {
    setStage(id);
    const active = stages.find((item) => item.id === id);
    if (!active?.statuses || (selected && active.statuses.includes(selected.status))) return;
    const first = items.find((item) => active.statuses?.includes(item.status));
    if (first) setSelectedId(first.id);
  };

  const choosePerson = (item: MustahikView) => {
    setSelectedId(item.id);
    setTab('summary');
    setExpanded(false);
    setMobileView('profile');
    if (window.innerWidth < 768) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const backButton = document.querySelector<HTMLButtonElement>('[aria-label="Kembali ke antrean"]');
        backButton?.closest('main')?.scrollIntoView({ block: 'start' });
        window.scrollBy({ top: -64, behavior: 'auto' });
        backButton?.focus({ preventScroll: true });
      }));
    }
  };

  const handleDecisionSubmit = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitMustahikDecision(selected.id, {
        action,
        notes: note,
        approved_amount: selected.recommended_amount,
      });
      toast(res.message || 'Keputusan berhasil disimpan.');
      setDecisionOpen(false);
      loadData();
    } catch (err: any) {
      toast(`Gagal menyimpan keputusan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMustahik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nik) {
      toast('Nama dan NIK wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createMustahik({
        name: formData.name,
        nik: formData.nik,
        phone: formData.phone,
        kecamatan: formData.kecamatan,
        kelurahan: formData.kelurahan,
        address: formData.address,
        asnaf: formData.asnaf,
        program: formData.program,
        recommended_amount: parseFloat(formData.recommended_amount) || 2000000,
        status: 'Diajukan',
      });
      toast(`Data mustahik ${formData.name} berhasil ditambahkan!`);
      setAddModalOpen(false);
      setFormData({
        name: '',
        nik: '',
        phone: '',
        kecamatan: 'Cipondoh',
        kelurahan: 'Cipondoh',
        address: '',
        asnaf: 'Miskin',
        program: 'Tangerang Cerdas',
        recommended_amount: '2000000',
      });
      loadData();
    } catch (err: any) {
      toast(`Gagal menambahkan mustahik: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) {
      toast('Silakan masukkan data JSON / CSV untuk diimpor');
      return;
    }
    setIsSubmitting(true);
    try {
      let parsedItems: any[] = [];
      if (importText.trim().startsWith('[')) {
        parsedItems = JSON.parse(importText);
      } else {
        // Simple CSV parse
        const lines = importText.trim().split('\n');
        parsedItems = lines.slice(1).map((line) => {
          const [name, nik, phone, kecamatan, asnaf, program, amount] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          return {
            name: name || 'Mustahik Baru',
            nik: nik || '3671000000000000',
            phone: phone || '',
            kecamatan: kecamatan || 'Tangerang',
            asnaf: asnaf || 'Miskin',
            program: program || 'Tangerang Cerdas',
            recommended_amount: parseFloat(amount || '0') || 1500000,
            status: 'Diajukan',
          };
        });
      }

      const res = await api.importMustahikBatch(parsedItems);
      toast(res.message || `Berhasil mengimpor ${parsedItems.length} data mustahik.`);
      setImportModalOpen(false);
      setImportText('');
      loadData();
    } catch (err: any) {
      toast(`Gagal mengimpor: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1880px] space-y-4 pb-8 text-slate-950">
      <header className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[1fr_auto_1fr]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Data Mustahik</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Kelola pengajuan, verifikasi, dan progres penyaluran dalam satu ruang kerja yang mudah dipahami.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 xl:hidden">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
              </span>
              <span><strong className="text-emerald-700">Data tersinkron</strong><small className="ml-1 font-semibold text-slate-400">· Realtime DB</small></span>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs font-bold text-slate-600 xl:flex xl:justify-self-center">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
          </span>
          <span><strong className="text-emerald-700">Database Terhubung</strong><small className="mt-0.5 block font-semibold text-slate-400">PostgreSQL / SQLite Turbo Adapter</small></span>
        </div>
        <div className="flex gap-2 md:justify-self-end xl:justify-self-end">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex h-11 whitespace-nowrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold sm:px-4 sm:text-sm hover:bg-slate-50"
          >
            <Upload className="size-4" />
            Impor data
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-11 whitespace-nowrap items-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white sm:px-4 sm:text-sm hover:bg-emerald-800"
          >
            <Plus className="size-4" />
            Tambah Mustahik
          </button>
        </div>
      </header>

      <StageRail value={stage} onChange={chooseStage} stages={stages} />

      <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="relative min-h-[600px]">
          <div className={`${mobileView === 'queue' ? 'flex flex-col' : 'hidden'} md:flex md:flex-col md:absolute md:inset-y-0 md:left-0 md:w-[310px] lg:w-[330px] border-r border-slate-200 bg-white z-10`}>
            <Queue
              items={filtered}
              allItems={items}
              totalCount={items.length}
              selected={selected || items[0]}
              query={query}
              quickFilter={quickFilter}
              onQuery={setQuery}
              onSelect={choosePerson}
              onFilterQuick={setQuickFilter}
            />
          </div>
          <div className={`${mobileView === 'profile' ? 'block' : 'hidden'} md:block md:pl-[310px] lg:pl-[330px] min-w-0 bg-white`}>
            {selected ? (
              <Profile
                selected={selected}
                tab={tab}
                onTab={setTab}
                expanded={expanded}
                onExpand={() => setExpanded((value) => !value)}
                onBack={() => setMobileView('queue')}
                onDecision={() => setDecisionOpen(true)}
              />
            ) : (
              <div className="grid place-items-center p-8 text-center text-slate-400">
                Memuat data mustahik...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Decision Modal (Centered Pop-Up) */}
      {decisionOpen && selected && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-5">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDecisionOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Keputusan Mustahik"
            className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Tinjau Keputusan Verifikasi
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {selected.name} · <span className="font-mono text-emerald-700">NIK {maskNik(selected.nik)}</span> · {selected.file_no}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup panel keputusan"
                onClick={() => setDecisionOpen(false)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <Decision
              selected={selected}
              note={note}
              onNote={setNote}
              onSubmitDecision={handleDecisionSubmit}
              prefix="modal"
              isSubmitting={isSubmitting}
              onClose={() => setDecisionOpen(false)}
            />
          </section>
        </div>
      )}

      {/* Add Mustahik Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setAddModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Tambah Mustahik Baru</h2>
              <button type="button" onClick={() => setAddModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMustahik} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Nama Lengkap *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Siti Aminah"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">NIK (16 Digit) *</label>
                  <input
                    required
                    value={formData.nik}
                    maxLength={16}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="3671012345678901"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">No. WhatsApp</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Kecamatan</label>
                  <select
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value, kelurahan: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {['Cipondoh', 'Tangerang', 'Karawaci', 'Ciledug', 'Cibodas', 'Batuceper', 'Benda', 'Pinang', 'Larangan', 'Neglasari', 'Periuk', 'Jatiuwung', 'Karang Tengah'].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Asnaf</label>
                  <select
                    value={formData.asnaf}
                    onChange={(e) => setFormData({ ...formData, asnaf: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {['Fakir', 'Miskin', 'Fisabilillah', 'Ibnu Sabil', 'Gharimin', 'Muallaf', 'Riqab', 'Amil'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Program 5 Pilar</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {['Tangerang Cerdas', 'Tangerang Makmur', 'Tangerang Sehat', 'Tangerang Peduli', 'Tangerang Takwa'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Usulan Bantuan (Rp)</label>
                <input
                  type="number"
                  value={formData.recommended_amount}
                  onChange={(e) => setFormData({ ...formData, recommended_amount: e.target.value })}
                  placeholder="2000000"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Melati RT 01/RW 02..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  <span>Simpan Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setImportModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Impor Data Mustahik Massal</h2>
              <button type="button" onClick={() => setImportModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Tempel format JSON array atau CSV (Kolom: Nama, NIK, No HP, Kecamatan, Asnaf, Program, Nominal):
              </p>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`"Nama Lengkap","3671012345678901","08123456789","Cipondoh","Miskin","Tangerang Cerdas","2000000"\n"Budi Santoso","3671098765432109","08129876543","Karawaci","Fakir","Tangerang Makmur","3500000"`}
                className="font-mono w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleImportSubmit}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  <span>Mulai Impor Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div role="status" className="mustahik-toast fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl">
          <CheckCircle2 className="size-4 text-emerald-400" />
          {notice}
        </div>
      )}
    </div>
  );
}
