import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import StatCard from './StatCard';
import {
  WalletIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  TargetIcon,
  Search,
  Plus,
  Download,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  PENERIMAAN_METRICS,
  JENIS_ZAKAT_DATA,
  SUMBER_PENERIMAAN,
  PENERIMAAN_TRANSACTIONS,
  PENERIMAAN_CHART_12M,
} from '../data/penerimaanData';
import { formatRupiah, formatRupiahChart } from '../utils/format';
import useCountUp from '../hooks/useCountUp';

const jenisChartConfig = {
  zakatMaal: { label: 'Zakat Maal', color: 'var(--chart-1)' },
  zakatFitrah: { label: 'Zakat Fitrah', color: 'var(--chart-3)' },
  infak: { label: 'Infak', color: 'var(--chart-4)' },
  sedekah: { label: 'Sedekah', color: 'var(--chart-5)' },
};

const periods = [
  { label: '12 Bulan', months: 12 },
  { label: '6 Bulan', months: 6 },
  { label: '3 Bulan', months: 3 },
];

const statusStyles = {
  Diterima: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  Diproses: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Terverifikasi: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
};

export default function PenerimaanDashboard() {
  const [period, setPeriod] = useState(0);
  const monthsToShow = periods[period].months;
  const chartData = PENERIMAAN_CHART_12M.slice(-monthsToShow);

  // Dynamic state for transactions
  const [transactions, setTransactions] = useState(PENERIMAAN_TRANSACTIONS);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAllSheet, setShowAllSheet] = useState(false);

  // Form states
  const [formMuzakki, setFormMuzakki] = useState('');
  const [formJenis, setFormJenis] = useState('Zakat Maal');
  const [formSumber, setFormSumber] = useState('Individu');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Search & Filter states for Lihat Semua
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Metrics recalculation if transactions change
  const metrics = useMemo(() => {
    // Since transactions only have recent 8 items + new ones, let's scale total based on real base metrics
    const addedAmount = transactions.slice(PENERIMAAN_TRANSACTIONS.length).reduce((sum, trx) => sum + trx.amount, 0);
    
    return {
      totalPenerimaan: PENERIMAAN_METRICS.totalPenerimaan + addedAmount,
      penerimaanBulanIni: PENERIMAAN_METRICS.penerimaanBulanIni + addedAmount,
      targetPenerimaan: PENERIMAAN_METRICS.targetPenerimaan,
      totalMuzakki: PENERIMAAN_METRICS.totalMuzakki + (transactions.length - PENERIMAAN_TRANSACTIONS.length),
      avgPenerimaan: Math.round((PENERIMAAN_METRICS.totalPenerimaan + addedAmount) / (PENERIMAAN_METRICS.totalMuzakki + (transactions.length - PENERIMAAN_TRANSACTIONS.length))),
    };
  }, [transactions]);

  const targetPercent = useMemo(() => {
    return Math.min(100, Math.round((metrics.totalPenerimaan / metrics.targetPenerimaan) * 100));
  }, [metrics]);

  const animatedTotal = useCountUp(metrics.totalPenerimaan, 1500, '', '', true);
  const animatedMonthly = useCountUp(metrics.penerimaanBulanIni, 1200, '', '', true);
  const animatedMuzakki = useCountUp(metrics.totalMuzakki, 1500, '', '', true);
  const animatedAvg = useCountUp(metrics.avgPenerimaan, 1200, '', '', true);
  const animatedTarget = useCountUp(targetPercent, 1000, '', '', true);

  const totalByJenis = useMemo(() => {
    // Dynamically calculate pie chart totals based on current transactions
    const baseObj = {
      'Zakat Maal': JENIS_ZAKAT_DATA[0].value,
      'Zakat Fitrah': JENIS_ZAKAT_DATA[1].value,
      'Infak': JENIS_ZAKAT_DATA[2].value,
      'Sedekah': JENIS_ZAKAT_DATA[3].value,
    };
    
    transactions.slice(PENERIMAAN_TRANSACTIONS.length).forEach(trx => {
      if (baseObj[trx.jenis] !== undefined) {
        baseObj[trx.jenis] += trx.amount;
      }
    });

    return [
      { name: 'Zakat Maal', value: baseObj['Zakat Maal'], color: 'var(--chart-1)' },
      { name: 'Zakat Fitrah', value: baseObj['Zakat Fitrah'], color: 'var(--chart-3)' },
      { name: 'Infak', value: baseObj['Infak'], color: 'var(--chart-4)' },
      { name: 'Sedekah', value: baseObj['Sedekah'], color: 'var(--chart-5)' },
    ];
  }, [transactions]);

  const sumByJenisTotal = useMemo(() => {
    return totalByJenis.reduce((sum, item) => sum + item.value, 0);
  }, [totalByJenis]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formMuzakki || !formAmount) {
      showToast('Harap isi semua kolom input!', 'error');
      return;
    }

    const newTrx = {
      date: formDate,
      muzakki: formMuzakki,
      jenis: formJenis,
      amount: parseFloat(formAmount),
      status: 'Diterima',
      sumber: formSumber,
    };

    setTransactions([newTrx, ...transactions]);
    setShowAddSheet(false);
    showToast(`Penerimaan dari ${formMuzakki} berhasil dicatat!`);

    // Reset Form
    setFormMuzakki('');
    setFormAmount('');
    setFormJenis('Zakat Maal');
    setFormSumber('Individu');
  };

  const handleExportPDF = () => {
    showToast('Mengekspor laporan penerimaan ke format PDF...');
    setTimeout(() => {
      showToast('Laporan PDF Berhasil diunduh!', 'success');
    }, 2000);
  };

  // Filtered transactions for the Detail sheet
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchSearch = trx.muzakki.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.jenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trx.sumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchJenis = filterJenis === 'Semua' || trx.jenis === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [transactions, searchTerm, filterJenis]);

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-5 sm:space-y-6 md:space-y-8 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card border border-border shadow-2xl rounded-xl p-4 animate-fade-in pr-10 min-w-[300px]">
          <CheckCircle2 className={`size-5 shrink-0 ${toast.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">
              {toast.type === 'success' ? 'Berhasil' : 'Pemberitahuan'}
            </span>
            <span className="text-[11px] text-muted-foreground">{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Penerimaan</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau penerimaan zakat, infak, dan sedekah secara real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportPDF}>
            <Download className="size-3.5" /> Export PDF
          </Button>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setShowAddSheet(true)}>
            <Plus className="size-3.5" /> Tambah Penerimaan
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          icon={WalletIcon}
          iconBg="#ecfdf5"
          iconColor="#059669"
          label="Total Penerimaan"
          value={animatedTotal}
          rawValue={metrics.totalPenerimaan}
          change="12,5%"
          delay={0}
        />
        <StatCard
          icon={CalendarIcon}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          label="Penerimaan Bulan Ini"
          value={animatedMonthly}
          rawValue={metrics.penerimaanBulanIni}
          change="8,3%"
          delay={100}
        />
        <StatCard
          icon={UsersIcon}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          label="Total Muzakki"
          value={animatedMuzakki}
          rawValue={metrics.totalMuzakki}
          change="6,2%"
          delay={200}
        />
        <StatCard
          icon={TrendingUpIcon}
          iconBg="#fffbeb"
          iconColor="#d97706"
          label="Rata-rata/Muzakki"
          value={animatedAvg}
          rawValue={metrics.avgPenerimaan}
          change="4,1%"
          delay={300}
        />
        <StatCard
          icon={TargetIcon}
          iconBg="#f0fdfa"
          iconColor="#14b8a6"
          label="Realisasi Target"
          value={`${animatedTarget}%`}
          rawValue={targetPercent}
          change="On Track"
          trend="up"
          delay={400}
        />
      </div>

      {/* Row 2: Trend Chart + Distribusi Jenis */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3 sm:gap-4">
        {/* Trend Chart */}
        <Card className="card-spotlight shadow-card transition-all-smooth hover:shadow-card-hover animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold">Trend Penerimaan per Jenis</CardTitle>
            <div className="flex gap-1">
              {periods.map((p, idx) => (
                <Button
                  key={p.label}
                  variant={idx === period ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 sm:h-7 text-[10px] sm:text-[11px] px-1.5 sm:px-2"
                  onClick={() => setPeriod(idx)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[260px] md:h-[300px] w-full">
              <ChartContainer config={jenisChartConfig} className="h-full w-full">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    dy={8}
                    interval={monthsToShow > 6 ? 1 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    tickFormatter={formatRupiahChart}
                    width={45}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          }).format(value)
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} verticalAlign="top" align="left" />
                  <Bar dataKey="zakatMaal" stackId="a" fill="var(--color-zakatMaal)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="zakatFitrah" stackId="a" fill="var(--color-zakatFitrah)" />
                  <Bar dataKey="infak" stackId="a" fill="var(--color-infak)" />
                  <Bar dataKey="sedekah" stackId="a" fill="var(--color-sedekah)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Jenis */}
        <Card className="card-spotlight shadow-card transition-all-smooth hover:shadow-card-hover animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold">Distribusi per Jenis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full relative">
              <PieChart width={260} height={220} className="mx-auto">
                <Pie
                  data={totalByJenis}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {totalByJenis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs font-bold text-foreground">{formatRupiah(sumByJenisTotal, true)}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              {totalByJenis.map((item) => {
                const percent = Math.round((item.value / sumByJenisTotal) * 100);
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-foreground">{formatRupiah(item.value, true)}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Sumber Penerimaan + Tabel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-3 sm:gap-4">
        {/* Sumber Penerimaan */}
        <Card className="card-spotlight shadow-card transition-all-smooth hover:shadow-card-hover animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold">Sumber Penerimaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUMBER_PENERIMAAN.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{formatRupiah(item.amount, true)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabel Transaksi */}
        <Card className="card-spotlight shadow-card transition-all-smooth hover:shadow-card-hover animate-fade-in-up flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-semibold">Transaksi Penerimaan Terbaru</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => setShowAllSheet(true)}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="min-w-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 font-medium text-muted-foreground rounded-l-lg">Tanggal</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Muzakki</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Jenis</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Sumber</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground text-right">Jumlah</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground text-right rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.slice(0, 8).map((trx, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2.5 text-muted-foreground">{trx.date}</td>
                      <td className="px-2 py-2.5 font-medium text-foreground truncate max-w-[140px]">{trx.muzakki}</td>
                      <td className="px-2 py-2.5 text-muted-foreground">{trx.jenis}</td>
                      <td className="px-2 py-2.5 text-muted-foreground">{trx.sumber}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-foreground">{formatRupiah(trx.amount)}</td>
                      <td className="px-2 py-2.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[trx.status] || 'bg-gray-100 text-gray-700'}`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sheet 1: Tambah Penerimaan */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="sm:max-w-md bg-card text-card-foreground border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Tambah Penerimaan Baru</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Catat zakat, infak, atau sedekah baru yang diterima dari muzakki
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Muzakki</label>
              <Input
                placeholder="Contoh: Budi Sudarsono / PT Abadi Jaya"
                value={formMuzakki}
                onChange={(e) => setFormMuzakki(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Jenis Dana</label>
              <select
                value={formJenis}
                onChange={(e) => setFormJenis(e.target.value)}
                className="w-full h-9 text-xs rounded-md border border-input border-border bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <option value="Zakat Maal">Zakat Maal</option>
                <option value="Zakat Fitrah">Zakat Fitrah</option>
                <option value="Infak">Infak</option>
                <option value="Sedekah">Sedekah</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Sumber Penerimaan</label>
              <select
                value={formSumber}
                onChange={(e) => setFormSumber(e.target.value)}
                className="w-full h-9 text-xs rounded-md border border-input border-border bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <option value="Individu">Individu</option>
                <option value="Korporasi">Korporasi</option>
                <option value="UPZ">UPZ (Unit Pengumpul Zakat)</option>
                <option value="ASN">Aparatur Sipil Negara (ASN)</option>
                <option value="Online">Online / Web</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Jumlah (IDR)</label>
              <Input
                type="number"
                placeholder="Contoh: 5000000"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tanggal Penerimaan</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="pt-4 flex gap-2 border-t border-border mt-6">
              <Button type="button" variant="outline" className="flex-1 text-xs h-9" onClick={() => setShowAddSheet(false)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet 2: Lihat Semua Transaksi */}
      <Sheet open={showAllSheet} onOpenChange={setShowAllSheet}>
        <SheetContent side="right" className="sm:max-w-2xl bg-card text-card-foreground border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Daftar Lengkap Penerimaan</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Telusuri dan saring semua transaksi penerimaan yang tercatat di database
            </SheetDescription>
          </SheetHeader>

          {/* Filter Bar */}
          <div className="flex gap-2 py-4 border-b border-border/80">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama muzakki..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2 py-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Fitrah">Zakat Fitrah</option>
              <option value="Infak">Infak</option>
              <option value="Sedekah">Sedekah</option>
            </select>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Tidak ada data transaksi yang cocok dengan kriteria filter.
              </div>
            ) : (
              <table className="w-full text-left text-[11px] sm:text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 font-medium text-muted-foreground rounded-l-md">Tanggal</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Muzakki</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Jenis</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">Sumber</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground text-right">Jumlah</th>
                    <th className="px-2 py-2 font-medium text-muted-foreground text-right rounded-r-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((trx, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2 text-muted-foreground">{trx.date}</td>
                      <td className="px-2 py-2 font-medium text-foreground truncate max-w-[130px]">{trx.muzakki}</td>
                      <td className="px-2 py-2 text-muted-foreground">{trx.jenis}</td>
                      <td className="px-2 py-2 text-muted-foreground">{trx.sumber}</td>
                      <td className="px-2 py-2 text-right font-semibold text-foreground">{formatRupiah(trx.amount)}</td>
                      <td className="px-2 py-2 text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[trx.status] || 'bg-gray-100 text-gray-700'}`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="pt-3 border-t border-border mt-auto flex justify-between items-center text-xs text-muted-foreground">
            <span>Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi</span>
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => setShowAllSheet(false)}>
              Tutup
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
