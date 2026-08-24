import Link from 'next/link';
import { ArrowRight, ShieldCheck, HeartHandshake, FileSearch, UserPlus } from 'lucide-react';

export const metadata = {
  title: 'Portal Publik Mustahik - BAZNAS Kota Tangerang',
};

export default function PublicPortalPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 overflow-hidden rounded-md">
              <img
                src="/baznas-logo.png"
                alt="BAZNAS Kota Tangerang"
                className="size-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-zinc-900">
                BAZNAS
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                KOTA TANGERANG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <span>Portal Amil SIM</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-4 py-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <ShieldCheck className="size-3.5" />
          <span>Sistem Informasi Penyaluran ZIS Terpercaya & Transparan</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          Layanan Bantuan Mustahik & Transparansi Penyaluran ZIS
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto">
          Cek status permohonan bantuan secara mandiri menggunakan NIK atau ajukan permohonan bantuan Program 5 Pilar BAZNAS Kota Tangerang.
        </p>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left pt-4">
          <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/60 space-y-2 hover:border-emerald-600 transition-colors">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileSearch className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Cek Status Pengajuan</h3>
            <p className="text-xs text-zinc-500">
              Lacak perkembangan verifikasi berkas dan jadwal pencairan dana bantuan dengan NIK KTP Anda.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/60 space-y-2 hover:border-emerald-600 transition-colors">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserPlus className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Permohonan Bantuan</h3>
            <p className="text-xs text-zinc-500">
              Ajukan permohonan bantuan biaya pendidikan, kesehatan darurat, modal usaha, dan santunan sosial.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
        © 2026 Badan Amil Zakat Nasional (BAZNAS) Kota Tangerang. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
