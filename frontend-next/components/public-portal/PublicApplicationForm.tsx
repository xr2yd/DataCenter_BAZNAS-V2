'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, FileUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api/client';

const STEPS = ['Data pemohon', 'Domisili & kondisi', 'Kebutuhan bantuan', 'Dokumen', 'Konfirmasi'];
const PROGRAMS = ['Tangerang Cerdas', 'Tangerang Sehat', 'Tangerang Makmur', 'Tangerang Peduli', 'Tangerang Taqwa'];
const ASNAF = ['Fakir', 'Miskin', 'Gharimin', 'Fisabilillah', 'Ibnu Sabil', 'Mualaf'];
const KECAMATAN = ['Batuceper', 'Benda', 'Cibodas', 'Ciledug', 'Cipondoh', 'Jatiuwung', 'Karangtengah', 'Karawaci', 'Larangan', 'Neglasari', 'Periuk', 'Pinang', 'Tangerang'];

type FormValues = {
  name: string;
  nik: string;
  kkNumber: string;
  phone: string;
  address: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  monthlyIncome: string;
  familyDependents: string;
  program: string;
  asnaf: string;
  requestTitle: string;
  proposedAmount: string;
  notes: string;
  agreed: boolean;
};

const initialValues: FormValues = {
  name: '', nik: '', kkNumber: '', phone: '', address: '', rtRw: '', kelurahan: '', kecamatan: 'Tangerang',
  monthlyIncome: '', familyDependents: '1', program: PROGRAMS[0]!, asnaf: 'Miskin', requestTitle: '', proposedAmount: '', notes: '', agreed: false,
};

function TextField({ label, value, onChange, type = 'text', required = false, hint, name }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; hint?: string; name?: string }) {
  const id = `field-${(name || label).replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  return <label htmlFor={id} className="block text-sm font-bold text-slate-800">{label}{required && <span className="ml-1 text-rose-600">*</span>}<input id={id} name={name ?? id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />{hint && <span className="mt-1.5 block text-xs font-medium text-slate-500">{hint}</span>}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const id = `field-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  return <label htmlFor={id} className="block text-sm font-bold text-slate-800">{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export function PublicApplicationForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [files, setFiles] = useState<Record<'ktp' | 'kk', File | null>>({ ktp: null, kk: null });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fileNumber, setFileNumber] = useState('');

  const stepLabel = useMemo(() => `${step + 1} dari ${STEPS.length}`, [step]);
  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!values.name.trim()) return 'Nama lengkap wajib diisi.';
      if (!/^\d{16}$/.test(values.nik)) return 'NIK harus terdiri dari 16 digit angka.';
      if (!/^\d{16}$/.test(values.kkNumber)) return 'Nomor Kartu Keluarga harus terdiri dari 16 digit angka.';
      if (values.phone.replace(/\D/g, '').length < 10) return 'Nomor WhatsApp belum valid.';
    }
    if (step === 1 && !values.address.trim()) return 'Alamat domisili wajib diisi.';
    if (step === 2 && !values.requestTitle.trim()) return 'Uraian kebutuhan wajib diisi.';
    if (step === 3 && (!files.ktp || !files.kk)) return 'Unggah KTP dan Kartu Keluarga sebelum melanjutkan.';
    if (step === 4 && !values.agreed) return 'Centang pernyataan kebenaran data sebelum mengirim pengajuan.';
    return '';
  };

  const next = () => {
    const message = validateStep();
    if (message) return setError(message);
    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const selectFile = (key: 'ktp' | 'kk', file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setError('Ukuran tiap dokumen maksimal 10 MB.');
    setFiles((current) => ({ ...current, [key]: file }));
    setError('');
  };

  const submit = async () => {
    const message = validateStep();
    if (message) return setError(message);
    setSubmitting(true);
    setError('');
    const payload = new FormData();
    payload.set('name', values.name);
    payload.set('nik', values.nik);
    payload.set('kk_number', values.kkNumber);
    payload.set('phone', values.phone);
    payload.set('address', values.address);
    payload.set('rt_rw', values.rtRw);
    payload.set('kelurahan', values.kelurahan);
    payload.set('kecamatan', values.kecamatan);
    payload.set('monthly_income', values.monthlyIncome || '0');
    payload.set('family_dependents', values.familyDependents);
    payload.set('program', values.program);
    payload.set('asnaf', values.asnaf);
    payload.set('request_title', values.requestTitle);
    payload.set('proposed_amount', values.proposedAmount || '0');
    payload.set('notes', values.notes);
    if (files.ktp) payload.set('ktp', files.ktp);
    if (files.kk) payload.set('kk', files.kk);
    try {
      const response = await api.submitPublicApplication(payload);
      const record = response.data;
      if (!record?.file_no) throw new Error('Nomor berkas tidak diterima dari server.');
      setFileNumber(record.file_no);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Pengajuan belum terkirim. Periksa koneksi lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fileNumber) return <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-[0_20px_60px_rgba(6,95,70,0.12)] sm:p-10"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-9" /></div><p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Pengajuan berhasil diterima</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Simpan nomor berkas Anda</h1><div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-bold text-emerald-800">Nomor registrasi</p><p className="mt-2 font-mono text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{fileNumber}</p></div><p className="mt-5 text-sm leading-6 text-slate-600">Berkas akan masuk ke antrean verifikasi amil BAZNAS. Gunakan nomor ini atau NIK untuk melihat perkembangan pengajuan.</p><Link href={`/cek-pengajuan?q=${encodeURIComponent(fileNumber)}`} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"><ClipboardCheck className="size-4" />Lacak pengajuan</Link></section>;

  return <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"><header className="border-b border-slate-100 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-700 px-5 py-6 text-white sm:px-8"><div className="flex items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-emerald-100"><HeartHandshake className="size-4" /><span className="text-xs font-black uppercase tracking-[0.16em]">Pengajuan bantuan</span></div><h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Ceritakan kebutuhan Anda, kami tindak lanjuti.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/85">Isi secara bertahap. Data digunakan hanya untuk proses verifikasi bantuan BAZNAS Kota Tangerang.</p></div><span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold">{stepLabel}</span></div><ol className="mt-6 grid grid-cols-5 gap-1" aria-label="Tahap pengajuan">{STEPS.map((label, index) => <li key={label} className="min-w-0"><span className={`block h-1 rounded-full ${index <= step ? 'bg-emerald-300' : 'bg-white/20'}`} /><span className={`mt-2 hidden text-[10px] font-bold sm:block ${index === step ? 'text-white' : 'text-emerald-100/65'}`}>{label}</span></li>)}</ol></header><div className="p-5 sm:p-8"><h2 className="text-xl font-black tracking-tight text-slate-950">{STEPS[step]}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{step === 0 ? 'Gunakan data sesuai KTP dan Kartu Keluarga.' : step === 1 ? 'Alamat yang lengkap membantu petugas menjadwalkan survey.' : step === 2 ? 'Pilih bantuan yang paling sesuai dengan kebutuhan saat ini.' : step === 3 ? 'Dokumen jelas mempercepat verifikasi administrasi.' : 'Periksa kembali data sebelum dikirim.'}</p>{error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div>}<div className="mt-7">{step === 0 && <div className="grid gap-5 sm:grid-cols-2"><TextField label="Nama lengkap" required value={values.name} onChange={(value) => setValue('name', value)} /><TextField label="NIK" required name="nik" value={values.nik} onChange={(value) => setValue('nik', value.replace(/\D/g, '').slice(0, 16))} hint="16 digit sesuai KTP" /><TextField label="Nomor Kartu Keluarga" required value={values.kkNumber} onChange={(value) => setValue('kkNumber', value.replace(/\D/g, '').slice(0, 16))} hint="16 digit sesuai KK" /><TextField label="Nomor WhatsApp" required value={values.phone} onChange={(value) => setValue('phone', value)} hint="Kami gunakan untuk update proses." /></div>}{step === 1 && <div className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><label htmlFor="address" className="block text-sm font-bold text-slate-800">Alamat domisili<span className="ml-1 text-rose-600">*</span><textarea id="address" value={values.address} onChange={(event) => setValue('address', event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label></div><TextField label="RT / RW" value={values.rtRw} onChange={(value) => setValue('rtRw', value)} /><TextField label="Kelurahan" value={values.kelurahan} onChange={(value) => setValue('kelurahan', value)} /><SelectField label="Kecamatan" value={values.kecamatan} options={KECAMATAN} onChange={(value) => setValue('kecamatan', value)} /><TextField label="Jumlah tanggungan" type="number" value={values.familyDependents} onChange={(value) => setValue('familyDependents', value)} /></div>}{step === 2 && <div className="grid gap-5 sm:grid-cols-2"><SelectField label="Program bantuan" value={values.program} options={PROGRAMS} onChange={(value) => setValue('program', value)} /><SelectField label="Kategori asnaf" value={values.asnaf} options={ASNAF} onChange={(value) => setValue('asnaf', value)} /><TextField label="Perkiraan penghasilan per bulan" type="number" value={values.monthlyIncome} onChange={(value) => setValue('monthlyIncome', value)} /><TextField label="Usulan nominal bantuan" type="number" value={values.proposedAmount} onChange={(value) => setValue('proposedAmount', value)} /><div className="sm:col-span-2"><label htmlFor="request-title" className="block text-sm font-bold text-slate-800">Uraian kebutuhan<span className="ml-1 text-rose-600">*</span><textarea id="request-title" value={values.requestTitle} onChange={(event) => setValue('requestTitle', event.target.value)} rows={4} placeholder="Contoh: bantuan tunggakan SPP semester berjalan" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label></div><div className="sm:col-span-2"><label htmlFor="notes" className="block text-sm font-bold text-slate-800">Catatan tambahan <span className="font-normal text-slate-400">(opsional)</span><textarea id="notes" value={values.notes} onChange={(event) => setValue('notes', event.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label></div></div>}{step === 3 && <div className="grid gap-4 sm:grid-cols-2">{(['ktp', 'kk'] as const).map((key) => { const label = key === 'ktp' ? 'Unggah KTP' : 'Unggah Kartu Keluarga'; const file = files[key]; return <label key={key} className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-emerald-500 hover:bg-emerald-50"><input aria-label={label} type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => selectFile(key, event.target.files?.[0])} /><span className={`grid size-11 place-items-center rounded-xl ${file ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 shadow-sm'}`}>{file ? <Check className="size-5" /> : <FileUp className="size-5" />}</span><span className="mt-3 text-sm font-black text-slate-900">{file ? file.name : label}</span><span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, atau PDF · maks. 10 MB</span></label>; })}</div>}{step === 4 && <div className="space-y-5"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm font-black text-slate-900">Ringkasan pengajuan</p><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-bold text-slate-500">Pemohon</dt><dd className="mt-1 font-bold text-slate-900">{values.name}</dd></div><div><dt className="text-xs font-bold text-slate-500">Wilayah</dt><dd className="mt-1 font-bold text-slate-900">{values.kecamatan}</dd></div><div><dt className="text-xs font-bold text-slate-500">Program</dt><dd className="mt-1 font-bold text-slate-900">{values.program}</dd></div><div><dt className="text-xs font-bold text-slate-500">Kategori asnaf</dt><dd className="mt-1 font-bold text-slate-900">{values.asnaf}</dd></div></dl></div><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600"><input aria-label="Saya menyatakan data yang diisi benar" type="checkbox" checked={values.agreed} onChange={(event) => setValue('agreed', event.target.checked)} className="mt-1 size-4 accent-emerald-700" />Saya menyatakan data yang saya isi benar dan bersedia diverifikasi oleh petugas BAZNAS Kota Tangerang.</label><div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"><ShieldCheck className="size-4 shrink-0" />Data Anda diproses untuk keperluan layanan bantuan dan verifikasi kelayakan.</div></div>}</div><div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">{step > 0 ? <button type="button" onClick={() => { setError(''); setStep((current) => current - 1); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft className="size-4" />Kembali</button> : <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft className="size-4" />Beranda</Link>}{step < STEPS.length - 1 ? <button type="button" onClick={next} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">Lanjut<ArrowRight className="size-4" /></button> : <button type="button" disabled={submitting} onClick={submit} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70">{submitting ? 'Mengirim…' : 'Kirim pengajuan'}<ArrowRight className="size-4" /></button>}</div></div></section>;
}
