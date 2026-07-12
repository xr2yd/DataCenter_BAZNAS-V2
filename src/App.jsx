import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import StatCard from './components/StatCard';
import LineChartCard from './components/LineChartCard';
import DonutChartCard from './components/DonutChartCard';
import ZakatFitriProgress from './components/ZakatFitriProgress';
import ASNDashboard from './components/ASNDashboard';
import ProgramImpact from './components/ProgramImpact';
import RecentTransactions from './components/RecentTransactions';
import QuickMenu from './components/QuickMenu';
import Announcements from './components/Announcements';
import PenerimaanDashboard from './components/PenerimaanDashboard';
import PenyaluranDashboard from './components/PenyaluranDashboard';
import MuzakkiPage from './components/MuzakkiPage';
import MustahikPage from './components/MustahikPage';
import ProgramBantuanPage from './components/ProgramBantuanPage';
import LaporanPenerimaanPage from './components/LaporanPenerimaanPage';
import LaporanPenyaluranPage from './components/LaporanPenyaluranPage';
import UPZPage from './components/UPZPage';
import LaporanUPZPage from './components/LaporanUPZPage';
import KerjasamaPage from './components/KerjasamaPage';
import KeuanganDashboard from './components/KeuanganDashboard';
import RKATPage from './components/RKATPage';
import RealisasiAnggaranPage from './components/RealisasiAnggaranPage';
import LaporanKeuanganPage from './components/LaporanKeuanganPage';
import PegawaiPage from './components/PegawaiPage';
import AbsensiPage from './components/AbsensiPage';
import KinerjaPage from './components/KinerjaPage';
import AIDataEntryPage from './components/AIDataEntryPage';
import { WalletIcon, HandHeartIcon, CoinsIcon, PeopleIcon } from './components/icons';

function DashboardUtama() {
  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-5 sm:space-y-6 md:space-y-8">
      {/* Row 1: Welcome Banner */}
      <WelcomeBanner />

      {/* Row 2: Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          icon={WalletIcon}
          iconBg="#ecfdf5"
          iconColor="#059669"
          label="Total Penerimaan"
          value=""
          rawValue={2_450_000_000_000}
          change="12,5%"
          delay={0}
        />
        <StatCard
          icon={HandHeartIcon}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          label="Total Penyaluran"
          value=""
          rawValue={1_890_000_000_000}
          change="8,7%"
          delay={100}
        />
        <StatCard
          icon={CoinsIcon}
          iconBg="#fffbeb"
          iconColor="#d97706"
          label="Saldo Dana"
          value=""
          rawValue={560_000_000_000}
          change="5,3%"
          delay={200}
        />
        <StatCard
          icon={PeopleIcon}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          label="Total Muzakki"
          value=""
          rawValue={2_345_000}
          change="6,2%"
          delay={300}
        />
        <StatCard
          icon={PeopleIcon}
          iconBg="#f0fdfa"
          iconColor="#14b8a6"
          label="Total Mustahik"
          value=""
          rawValue={5_678_000}
          change="9,1%"
          delay={400}
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        <LineChartCard />
        <DonutChartCard />
      </div>

      {/* Row 4: Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <ZakatFitriProgress delay={0} />
        <ASNDashboard delay={100} />
        <ProgramImpact delay={200} />
      </div>

      {/* Row 5: Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-[7fr_5fr] gap-3 sm:gap-4">
        <div className="relative min-h-0">
          <div className="absolute inset-0">
            <RecentTransactions />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <QuickMenu />
          <Announcements />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState('utama');

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset className="min-w-0">
        <Header activePage={activePage} />

        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div key={activePage} className="animate-page-enter w-full min-h-[75vh] flex flex-col">
            {activePage === 'utama' && <DashboardUtama />}
            {activePage === 'penerimaan' && <PenerimaanDashboard />}
            {activePage === 'penyaluran' && <PenyaluranDashboard />}
            {activePage === 'muzakki' && <MuzakkiPage />}
            {activePage === 'mustahik' && <MustahikPage />}
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
            {!['utama', 'penerimaan', 'penyaluran', 'muzakki', 'mustahik', 'program_bantuan', 'laporan_penerimaan', 'laporan_penyaluran', 'data_upz', 'laporan_upz', 'kerjasama', 'keuangan_dashboard', 'rkat', 'realisasi_anggaran', 'laporan_keuangan', 'pegawai', 'absensi', 'kinerja', 'ai_entry'].includes(activePage) && (
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
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
