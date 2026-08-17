import { useState, lazy, Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './components/Sidebar';
import Header from './components/Header';

// Dynamic Code-Splitting & React.lazy() for All Pages & Views
const DashboardUtama = lazy(() => import('./components/DashboardUtama'));
const PublicPortalPage = lazy(() => import('./components/PublicPortalPage'));
const MustahikPage = lazy(() => import('./components/MustahikPage'));
const PenerimaanDashboard = lazy(() => import('./components/PenerimaanDashboard'));
const PenyaluranDashboard = lazy(() => import('./components/PenyaluranDashboard'));
const MuzakkiPage = lazy(() => import('./components/MuzakkiPage'));
const ProgramBantuanPage = lazy(() => import('./components/ProgramBantuanPage'));
const LaporanPenerimaanPage = lazy(() => import('./components/LaporanPenerimaanPage'));
const LaporanPenyaluranPage = lazy(() => import('./components/LaporanPenyaluranPage'));
const UPZPage = lazy(() => import('./components/UPZPage'));
const LaporanUPZPage = lazy(() => import('./components/LaporanUPZPage'));
const KerjasamaPage = lazy(() => import('./components/KerjasamaPage'));
const KeuanganDashboard = lazy(() => import('./components/KeuanganDashboard'));
const RKATPage = lazy(() => import('./components/RKATPage'));
const RealisasiAnggaranPage = lazy(() => import('./components/RealisasiAnggaranPage'));
const LaporanKeuanganPage = lazy(() => import('./components/LaporanKeuanganPage'));
const PegawaiPage = lazy(() => import('./components/PegawaiPage'));
const AbsensiPage = lazy(() => import('./components/AbsensiPage'));
const KinerjaPage = lazy(() => import('./components/KinerjaPage'));
const AIDataEntryPage = lazy(() => import('./components/AIDataEntryPage'));

function PageFallbackSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse py-2">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded-md" />
          <div className="h-9 w-28 bg-emerald-500/20 rounded-md" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/40 rounded-xl p-4 border border-border/40 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10" />
            </div>
            <div className="h-7 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="h-96 w-full bg-muted/30 rounded-xl border border-border/40 p-6 flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
          <div className="absolute w-5 h-5 rounded-full bg-emerald-500/10 animate-ping" />
        </div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse">Memuat modul data BAZNAS...</p>
      </div>
    </div>
  );
}

function PortalFallbackSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-emerald-400/20 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-emerald-400/90 animate-pulse tracking-wide">
        Memuat Portal Layanan Publik BAZNAS...
      </p>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState('portal');

  // If in portal mode, show standalone public portal view with Suspense fallback (100% independent without Sidebar wrapper)
  if (activePage === 'portal' || activePage === 'portal_publik') {
    return (
      <Suspense fallback={<PortalFallbackSkeleton />}>
        <PublicPortalPage 
          onNavigateToDashboard={(page) => setActivePage(page || 'utama')} 
          onNavigate={setActivePage} 
        />
      </Suspense>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset className="min-w-0">
        <Header activePage={activePage} onNavigate={setActivePage} />

        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div key={activePage} className="animate-page-enter w-full min-h-[75vh] flex flex-col">
            <Suspense fallback={<PageFallbackSkeleton />}>
              {(activePage === 'utama' || activePage === 'dashboard') && <DashboardUtama />}
              {activePage === 'penerimaan' && <PenerimaanDashboard />}
              {activePage === 'penyaluran' && <PenyaluranDashboard />}
              {activePage === 'muzakki' && <MuzakkiPage />}
              {activePage === 'mustahik' && <MustahikPage onNavigate={setActivePage} />}
              {activePage === 'program_bantuan' && <ProgramBantuanPage />}
              {activePage === 'laporan_penerimaan' && <LaporanPenerimaanPage />}
              {activePage === 'laporan_penyaluran' && <LaporanPenyaluranPage />}
              {activePage === 'data_upz' && <UPZPage />}
              {activePage === 'laporan_upz' && <LaporanUPZPage />}
              {activePage === 'kerjasama' && <KerjasamaPage />}
              {activePage === 'keuangan_dashboard' && <KeuanganDashboard />}
              {activePage === 'rkat' && <RKATPage />}
              {activePage === 'realisasi_anggaran' && <RealisasiAnggaranPage />}
              {activePage === 'laporan_keuangan' && <LaporanKeuanganPage />}
              {activePage === 'pegawai' && <PegawaiPage />}
              {activePage === 'absensi' && <AbsensiPage />}
              {activePage === 'kinerja' && <KinerjaPage />}
              {activePage === 'ai_entry' && <AIDataEntryPage onNavigate={setActivePage} />}
              {!['utama', 'dashboard', 'penerimaan', 'penyaluran', 'muzakki', 'mustahik', 'program_bantuan', 'laporan_penerimaan', 'laporan_penyaluran', 'data_upz', 'laporan_upz', 'kerjasama', 'keuangan_dashboard', 'rkat', 'realisasi_anggaran', 'laporan_keuangan', 'pegawai', 'absensi', 'kinerja', 'ai_entry'].includes(activePage) && (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-center">
                  <h2 className="text-lg font-bold text-foreground">Halaman Belum Tersedia</h2>
                  <p className="text-xs text-muted-foreground">Modul "{activePage}" sedang dalam tahap pengembangan.</p>
                  <button 
                    onClick={() => setActivePage('utama')} 
                    className="px-3 py-1.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold cursor-pointer"
                  >
                    Kembali ke Utama
                  </button>
                </div>
              )}
            </Suspense>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
