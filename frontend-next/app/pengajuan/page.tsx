import { PublicApplicationForm } from '@/components/public-portal/PublicApplicationForm';

export const metadata = { title: 'Ajukan Bantuan | BAZNAS Kota Tangerang' };

export default function PengajuanPage() {
  return <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_32rem)] px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto mb-8 max-w-4xl text-center"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">BAZNAS Kota Tangerang</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Permohonan bantuan yang mudah dipahami.</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">Lengkapi data sesuai dokumen Anda. Setelah dikirim, BAZNAS akan melakukan verifikasi administrasi dan survey bila diperlukan.</p></div><PublicApplicationForm /></main>;
}
