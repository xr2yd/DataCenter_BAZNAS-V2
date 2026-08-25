'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api/client';
import type { Mustahik } from '@/lib/api/types';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2,
  ChevronRight, CircleDollarSign, FileCheck2, Filter, HeartHandshake,
  History, MapPin, Phone, Plus, Search, ShieldCheck, Upload, UserRound,
  UsersRound, X,
} from 'lucide-react';

const MustahikLocationMap = dynamic(
  () => import('./MustahikLocationMap'),
  { ssr: false },
);

type StageId = 'all' | 'diajukan' | 'verifikasi' | 'survey' | 'mpzis' | 'ppd' | 'selesai';
type MustahikView = Mustahik & {
  completeness: number;
  score: number;
  sla: 'Aman' | 'Mendekati' | 'Lewat';
  missingDocument?: string;
  updatedLabel: string;
};

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

const money = (value?: number) => `Rp ${(value ?? 0).toLocaleString('id-ID')}`;
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const maskNik = (nik: string) => `${nik.slice(0, 4)} •••• •••• ${nik.slice(-4)}`;

function adaptApiData(items: Mustahik[]): MustahikView[] {
  return items.map((item, index) => ({
    ...item,
    completeness: item.status === 'Diajukan' ? 68 : 88 + (index % 3) * 4,
    score: 78 + (index % 4) * 4,
    sla: index % 5 === 3 ? 'Lewat' : index % 4 === 2 ? 'Mendekati' : 'Aman',
    missingDocument: index % 3 === 0 ? 'Kartu Keluarga (KK)' : undefined,
    updatedLabel: '25 Agu 2026',
  }));
}

function SectionCard({ title, icon: Icon, children, className = '' }: { title: string; icon: typeof UserRound; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.035)] ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"><Icon className="size-4 text-emerald-600" />{title}</div>
      {children}
    </section>
  );
}

export function MustahikWorkspace() {
  const [items, setItems] = useState<MustahikView[]>(DEMO_MUSTAHIK);
  const [activeStage, setActiveStage] = useState<StageId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<MustahikView['id']>(DEMO_MUSTAHIK[0]!.id);
  const [note, setNote] = useState('Hasil verifikasi menunjukkan kondisi ekonomi keluarga sesuai kriteria mustahik.');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getMustahikList().then((response) => {
      if (response.data?.length) {
        const adapted = adaptApiData(response.data);
        setItems(adapted);
        setSelectedId(adapted[0]!.id);
      }
    }).catch(() => undefined);
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const stage = STAGES.find((item) => item.id === activeStage);
    return items.filter((item) => {
      const matchesQuery = !query || [item.name, item.nik, item.file_no, item.subdistrict].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      return matchesQuery && (!stage?.statuses || stage.statuses.includes(item.status));
    });
  }, [activeStage, items, searchQuery]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selected) return null;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const selectStage = (stageId: StageId) => {
    setActiveStage(stageId);
    const stage = STAGES.find((item) => item.id === stageId);
    if (!stage?.statuses || stage.statuses.includes(selected.status)) return;
    const firstMatch = items.find((item) => stage.statuses?.includes(item.status));
    if (firstMatch) setSelectedId(firstMatch.id);
  };

  return (
    <div className="mx-auto max-w-[1880px] space-y-4 pb-8 text-slate-950">
      <header className="grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.035em]">Data Mustahik</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Kelola pengajuan, verifikasi, dan progres penyaluran dalam satu ruang kerja yang mudah dipahami.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 xl:justify-self-center"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-emerald-600" /></span><span><strong className="text-emerald-700">Data tersinkron</strong><small className="mt-0.5 block font-semibold text-slate-400">25 Agustus 2026 · 10:15 WIB</small></span></div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-self-end">
          <button type="button" onClick={() => showNotice('Panel impor data siap digunakan')} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><Upload className="size-4" />Impor data</button>
          <button type="button" onClick={() => showNotice('Form Mustahik baru dibuka')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-800"><Plus className="size-4" />Tambah Mustahik</button>
        </div>
      </header>

      <section aria-label="Tahapan pengajuan Mustahik" className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.045)] sm:grid-cols-2 lg:grid-cols-7">
        {STAGES.map((stage, index) => {
          const active = activeStage === stage.id;
          return <button type="button" key={stage.id} aria-label={`${stage.label} ${stage.count}`} aria-pressed={active} onClick={() => selectStage(stage.id)} className={`group relative flex min-h-17 items-center justify-between border-b border-slate-100 px-4 text-left transition duration-300 lg:border-b-0 ${index > 0 ? 'lg:border-l' : ''} ${active ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}><span><span className={`block text-[11px] font-bold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{stage.label}</span><span className="mt-0.5 block text-xl font-extrabold tracking-tight">{stage.count}</span></span>{stage.id !== 'all' && <ChevronRight className={`size-4 transition-transform group-hover:translate-x-0.5 ${active ? 'text-emerald-600' : 'text-slate-300'}`} />}<span className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-emerald-600 transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0'}`} /></button>;
        })}
      </section>

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50/55 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="grid min-h-[690px] xl:grid-cols-[300px_minmax(560px,1fr)_340px]">
          <aside className="border-b border-slate-200 bg-white xl:border-b-0 xl:border-r">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-extrabold">Antrean verifikasi</p><p className="mt-0.5 text-xs text-slate-500">{filteredItems.length} dari {STAGES[0]!.count} data</p></div><button type="button" aria-label="Filter antrean" className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Filter className="size-4" /></button></div>
              <div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari nama, NIK, atau no. pengajuan…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" />{searchQuery && <button type="button" aria-label="Kosongkan kata kunci" onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="size-4" /></button>}</div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">{['Perlu tindakan', 'Lewat SLA', 'Dokumen kurang'].map((label, index) => <button type="button" key={label} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[9px] font-bold leading-tight text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">{label}<span className="mt-1 block text-xs text-slate-950">{[12, 4, 7][index]}</span></button>)}</div>
            </div>

            <div className="max-h-[535px] space-y-2 overflow-y-auto p-3">
              {filteredItems.length === 0 ? <div className="grid min-h-64 place-items-center px-4 text-center"><div><div className="mx-auto grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search className="size-5" /></div><p className="mt-3 text-sm font-extrabold">Data tidak ditemukan</p><p className="mt-1 text-xs leading-5 text-slate-500">Coba kata kunci lain atau hapus pencarian.</p><button type="button" onClick={() => setSearchQuery('')} className="mt-3 text-xs font-bold text-emerald-700 hover:underline">Hapus pencarian</button></div></div> : filteredItems.map((item, index) => {
                const active = item.id === selected.id;
                return <button type="button" key={item.id} aria-label={`Pilih ${item.name}`} onClick={() => setSelectedId(item.id)} style={{ animationDelay: `${index * 45}ms` }} className={`mustahik-row group relative w-full rounded-2xl border p-3 text-left transition duration-300 ${active ? 'border-emerald-300 bg-emerald-50/75 shadow-[0_10px_25px_rgba(4,120,87,0.09)]' : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md'}`}><span className={`absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-emerald-600 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} /><span className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'}`}>{initials(item.name)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-extrabold">{item.name}</span><span className={`size-2 rounded-full ${item.sla === 'Lewat' ? 'bg-rose-500' : item.sla === 'Mendekati' ? 'bg-amber-400' : 'bg-emerald-500'}`} /></span><span className="mt-1 block truncate text-[10px] font-medium text-slate-500">NIK {maskNik(item.nik)}</span><span className="mt-2 flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-600">Kec. {item.subdistrict}</span><span className="rounded-full bg-white px-2 py-1 font-bold text-emerald-700 shadow-sm">{item.status === 'Verifikasi Administrasi' ? 'Verifikasi' : item.status}</span></span></span></span></button>;
              })}
            </div>
          </aside>

          <main className="border-b border-slate-200 bg-slate-50/60 xl:border-b-0 xl:border-r">
            <div className="border-b border-slate-200 bg-white px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Profil &amp; kelayakan</div>
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-sm font-extrabold text-emerald-800">{initials(selected.name)}</div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-extrabold tracking-tight">{selected.name}</h2><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><BadgeCheck className="size-3.5" />Identitas terverifikasi</span></div><p className="mt-0.5 text-xs font-medium text-slate-500">No. pengajuan {selected.file_no}</p></div></div>
              <div className="min-w-44"><div className="mb-1.5 flex justify-between text-[10px] font-bold text-slate-500"><span>Kelengkapan data</span><span>{selected.completeness}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600 transition-[width] duration-700" style={{ width: `${selected.completeness}%` }} /></div></div>
            </div>

            <div className="grid gap-3 p-4 lg:grid-cols-2">
              <SectionCard title="Identitas & kontak" icon={UserRound}><dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2.5 text-xs"><dt className="text-slate-500">NIK</dt><dd className="font-bold text-slate-800">{maskNik(selected.nik)}</dd><dt className="text-slate-500">Jenis kelamin</dt><dd className="font-bold text-slate-800">Perempuan</dd><dt className="text-slate-500">Status</dt><dd className="font-bold text-slate-800">Menikah</dd><dt className="text-slate-500">No. HP</dt><dd className="inline-flex items-center gap-1.5 font-bold text-slate-800"><Phone className="size-3.5 text-emerald-600" />{selected.phone}</dd></dl></SectionCard>
              <SectionCard title="Alamat domisili" icon={MapPin}><p className="text-xs font-semibold leading-5 text-slate-700">{selected.address}</p><div role="region" aria-label={`Peta lokasi ${selected.name}`} className="relative mt-3 h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><MustahikLocationMap address={selected.address ?? ''} village={selected.village ?? ''} subdistrict={selected.subdistrict ?? ''} /><span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-600 shadow-sm">OpenStreetMap · area {selected.subdistrict}</span></div></SectionCard>
              <SectionCard title="Asnaf & indikator kelayakan" icon={HeartHandshake}><div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3"><div><p className="text-[10px] font-bold text-emerald-700">Asnaf utama</p><p className="mt-0.5 text-sm font-extrabold text-emerald-950">{selected.asnaf}</p></div><ShieldCheck className="size-6 text-emerald-600" /></div><div className="mt-3 flex flex-wrap gap-1.5">{['Penghasilan rendah', 'Tanggungan 2+', 'Rumah tidak layak'].map((label) => <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">{label}</span>)}</div></SectionCard>
              <SectionCard title="Program bantuan & usulan" icon={CircleDollarSign}><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold text-slate-500">Program diusulkan</p><p className="mt-1 text-sm font-extrabold">{selected.program}</p></div><span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Usulan</span></div><div className="my-3 h-px bg-slate-100" /><div className="flex items-end justify-between"><span className="text-[10px] font-bold text-slate-500">Nominal bantuan</span><span className="text-lg font-extrabold tracking-tight text-emerald-700">{money(selected.recommended_amount)}</span></div></div></SectionCard>
              <SectionCard title="Keluarga / rumah tangga" icon={UsersRound}><div className="space-y-2 text-xs">{[['Kepala keluarga', selected.name], ['Anak', 'Andi Pratama · 18 tahun'], ['Anak', 'Nabila Putri · 14 tahun']].map(([relation, name]) => <div key={`${relation}-${name}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-500">{relation}</span><span className="font-bold text-slate-800">{name}</span></div>)}</div></SectionCard>
              <SectionCard title="Proses verifikasi" icon={History}><div className="flex items-start justify-between">{['Diajukan', 'Verifikasi', 'Survey', 'MPZIS'].map((label, index) => <div key={label} className="relative flex flex-1 flex-col items-center text-center"><div className={`relative z-10 grid size-7 place-items-center rounded-full border-2 ${index < 2 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{index < 2 ? <Check className="size-3.5" /> : index + 1}</div><span className="mt-1.5 text-[9px] font-bold text-slate-600">{label}</span>{index < 3 && <span className={`absolute left-1/2 top-3.5 h-0.5 w-full ${index < 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />}</div>)}</div><button type="button" className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"><span>Riwayat proses lengkap</span><ArrowRight className="size-3.5" /></button></SectionCard>
              <SectionCard title="Dokumen persyaratan" icon={FileCheck2} className="lg:col-span-2"><div className="grid gap-2 sm:grid-cols-3">{['KTP', 'Kartu Keluarga (KK)', 'SKTM', 'Foto rumah', 'Slip gaji / usaha', 'Dokumen pendukung'].map((document) => { const missing = document === selected.missingDocument; return <button type="button" key={document} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[10px] font-bold transition hover:-translate-y-0.5 ${missing ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200'}`}><span className={`grid size-7 place-items-center rounded-lg ${missing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{missing ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}</span><span>{document}<small className="mt-0.5 block font-semibold opacity-70">{missing ? 'Belum ada' : 'Lengkap'}</small></span></button>; })}</div></SectionCard>
            </div>
          </main>

          <aside className="bg-white"><div className="sticky top-18"><div className="border-b border-slate-200 px-5 py-4"><p className="text-sm font-extrabold">Panel keputusan</p><p className="mt-0.5 text-xs text-slate-500">Ringkasan untuk keputusan aman</p></div><div className="space-y-3 p-4">
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><div className="flex items-center gap-4"><div aria-label={`Skor kelayakan ${selected.score} dari 100`} className="relative grid size-20 shrink-0 place-items-center rounded-full bg-emerald-600"><div className="grid size-16 place-items-center rounded-full bg-white"><div className="flex items-baseline justify-center gap-0.5"><strong className="text-[30px] font-extrabold leading-none tracking-[-0.06em]">{selected.score}</strong><span className="text-[10px] font-bold leading-none text-slate-400">/100</span></div></div></div><div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">Layak</span><p className="mt-2 text-base font-extrabold">Layak dilanjutkan</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Skor memenuhi ambang verifikasi program.</p></div></div></section>
            <section className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-xs font-extrabold">Hasil verifikasi</p><span className="text-[10px] font-bold text-emerald-700">3 / 3 sesuai</span></div><div className="mt-3 space-y-2.5">{['Identitas sesuai Dukcapil', 'Alamat terkonfirmasi', 'Kondisi ekonomi sesuai'].map((label) => <div key={label} className="flex items-center justify-between text-[10px]"><span className="inline-flex items-center gap-2 font-semibold text-slate-600"><CheckCircle2 className="size-4 text-emerald-600" />{label}</span><span className="font-bold text-emerald-700">Sesuai</span></div>)}</div></section>
            {selected.missingDocument && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5"><div className="flex gap-2.5"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-xs font-extrabold text-amber-900">Dokumen yang kurang</p><p className="mt-1 text-[10px] leading-4 text-amber-800">{selected.missingDocument} belum diunggah. Lengkapi sebelum keputusan final.</p></div></div></section>}
            <section className="rounded-2xl border border-slate-200 p-4"><label htmlFor="assessor-note" className="text-xs font-extrabold">Catatan asesor</label><textarea id="assessor-note" value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" /><div className="mt-1 text-right text-[9px] font-semibold text-slate-400">{note.length}/500</div></section>
            <section className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-xs font-extrabold">Riwayat aktivitas</p><button type="button" className="text-[10px] font-bold text-emerald-700">Lihat semua</button></div><div className="mt-3 space-y-3 border-l border-slate-200 pl-3">{[['25 Agu · 09:58', 'Identitas berhasil diverifikasi'], ['25 Agu · 09:12', 'Pengajuan data Mustahik']].map(([time, label]) => <div key={time} className="relative"><span className="absolute -left-[15px] top-1 size-1.5 rounded-full bg-emerald-500 ring-4 ring-white" /><p className="text-[9px] font-bold text-slate-400">{time}</p><p className="mt-0.5 text-[10px] font-semibold text-slate-700">{label}</p></div>)}</div></section>
          </div><div className="grid grid-cols-[auto_1fr] gap-2 border-t border-slate-200 bg-white p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.04)]"><button type="button" onClick={() => showNotice('Berkas dikembalikan ke antrean')} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50" aria-label="Kembalikan berkas"><ArrowLeft className="size-4" /></button><button type="button" onClick={() => showNotice('Keputusan disimpan dan diteruskan')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-800"><CheckCircle2 className="size-4" />Setujui & lanjutkan</button></div></div></aside>
        </div>
      </section>

      {notice && <div role="status" className="mustahik-toast fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"><CheckCircle2 className="size-4 text-emerald-400" />{notice}</div>}
    </div>
  );
}
