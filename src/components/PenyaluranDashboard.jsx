import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  X,
  Users,
  TrendingUp,
  ArrowUpRight,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  PENYALURAN_METRICS,
  ASNAF_DISTRIBUTION,
  PENYALURAN_PROGRAMS,
  PENYALURAN_TRANSACTIONS,
  PENYALURAN_CHART_12M,
  PENERIMAAN_METRICS
} from '../data/penerimaanData';
import { getGreeting, getFormattedDate, getHijriDate } from '../data/dashboardData';
import { formatRupiah, formatRupiahChart } from '../utils/format';

const PILAR_CONFIG = {
  pendidikan: { label: 'Tangerang Cerdas', color: '#2563eb' },
  kesehatan: { label: 'Tangerang Sehat', color: '#059669' },
  sosial: { label: 'Tangerang Peduli', color: '#e11d48' },
  ekonomi: { label: 'Tangerang Makmur', color: '#d97706' },
  dakwah: { label: 'Tangerang Takwa', color: '#7c3aed' },
};

const periods = [
  { label: '12 Bulan', months: 12 },
  { label: '6 Bulan', months: 6 },
  { label: '3 Bulan', months: 3 },
];

export default function PenyaluranDashboard({ currentUser, onNavigate }) {
  let user = currentUser;
  if (!user && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('baznas_auth_user');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}
  }
  const userName = user?.name || 'Amil Penyaluran';
  const greeting = getGreeting();
  const date = getFormattedDate();
  const hijri = getHijriDate();

  const [period, setPeriod] = useState(0);
  const monthsToShow = periods[period].months;
  const chartData = PENYALURAN_CHART_12M.slice(-monthsToShow);

  const [transactions, setTransactions] = useState(PENYALURAN_TRANSACTIONS);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAllSheet, setShowAllSheet] = useState(false);

  // Form states
  const [formMustahik, setFormMustahik] = useState('');
  const [formProgram, setFormProgram] = useState('Tangerang Cerdas');
  const [formAsnaf, setFormAsnaf] = useState('Miskin');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('Semua');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '' });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const addedAmount = transactions.slice(PENYALURAN_TRANSACTIONS.length).reduce((sum, trx) => sum + trx.amount, 0);
    const totalPenyaluran = PENYALURAN_METRICS.totalPenyaluran + addedAmount;
    const balance = PENERIMAAN_METRICS.totalPenerimaan - totalPenyaluran;

    return {
      totalPenyaluran,
      penyaluranBulanIni: PENYALURAN_METRICS.penyaluranBulanIni + addedAmount,
      totalMustahik: PENYALURAN_METRICS.totalMustahik + (transactions.length - PENYALURAN_TRANSACTIONS.length),
      efektivitasPenyaluran: PENYALURAN_METRICS.efektivitasPenyaluran,
      balance: balance > 0 ? balance : 0,
    };
  }, [transactions]);

  const totalByAsnaf = useMemo(() => {
    const baseObj = {
      'Fakir': ASNAF_DISTRIBUTION[0].value,
      'Miskin': ASNAF_DISTRIBUTION[1].value,
      'Amil': ASNAF_DISTRIBUTION[2].value,
      'Mualaf': ASNAF_DISTRIBUTION[3].value,
      'Fisabilillah': ASNAF_DISTRIBUTION[4].value,
      'Ibnu Sabil & Lainnya': ASNAF_DISTRIBUTION[5].value,
    };

    transactions.slice(PENYALURAN_TRANSACTIONS.length).forEach(trx => {
      const category = trx.asnaf === 'Ibnu Sabil' ? 'Ibnu Sabil & Lainnya' : trx.asnaf;
      if (baseObj[category] !== undefined) {
        baseObj[category] += trx.amount;
      } else {
        baseObj['Ibnu Sabil & Lainnya'] += trx.amount;
      }
    });

    return [
      { name: 'Fakir', value: baseObj['Fakir'], color: '#e11d48' },
      { name: 'Miskin', value: baseObj['Miskin'], color: '#d97706' },
      { name: 'Amil', value: baseObj['Amil'], color: '#2563eb' },
      { name: 'Mualaf', value: baseObj['Mualaf'], color: '#0d9488' },
      { name: 'Fisabilillah', value: baseObj['Fisabilillah'], color: '#059669' },
      { name: 'Ibnu Sabil & Lainnya', value: baseObj['Ibnu Sabil & Lainnya'], color: '#64748b' },
    ];
  }, [transactions]);

  const sumAsnafTotal = useMemo(() => {
    return totalByAsnaf.reduce((sum, item) => sum + item.value, 0);
  }, [totalByAsnaf]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formMustahik || !formAmount) {
      alert('Harap isi semua kolom input!');
      return;
    }

    const newTrx = {
      date: formDate,
      mustahik: formMustahik,
      program: formProgram,
      amount: parseFloat(formAmount),
      status: 'Disalurkan',
      asnaf: formAsnaf,
    };

    setTransactions([newTrx, ...transactions]);
    setShowAddSheet(false);
    showToast(`Penyaluran dana ke ${formMustahik} berhasil dicatat!`);

    setFormMustahik('');
    setFormAmount('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchSearch = trx.mustahik.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trx.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trx.asnaf.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProgram = filterProgram === 'Semua' || trx.program === filterProgram;
      return matchSearch && matchProgram;
    });
  }, [transactions, searchTerm, filterProgram]);

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-5">
      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-card border border-border shadow-2xl rounded-xl p-3.5 animate-fade-in pr-10 min-w-[320px]">
          <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-foreground">Pemberitahuan</p>
            <p className="text-muted-foreground">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ show: false, message: '' })} className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Command Strip (Linear Clean Aesthetic) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Dashboard Penyaluran & Asesmen
            </h1>
            <Badge variant="outline" className="text-[10px] font-medium py-0 px-2 text-muted-foreground">
              {hijri}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat bekerja, <span className="font-semibold text-foreground">{userName}</span> • {date}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
            onClick={() => onNavigate && onNavigate('peta_sebaran')}
          >
            <Compass className="size-3.5 text-emerald-600 mr-1.5" /> Peta Sebaran 13 Kec.
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs cursor-pointer px-3"
            onClick={() => onNavigate && onNavigate('mustahik')}
          >
            Data Mustahik <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* 2. High-Density Executive Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden border border-border">
        <div className="bg-card p-4 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Total Penyaluran ZIS</p>
          <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground">
            {formatRupiah(metrics.totalPenyaluran, true)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <TrendingUp className="size-3" /> +12.4% vs tahun lalu
          </div>
        </div>

        <div className="bg-card p-4 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Penyaluran Bulan Ini</p>
          <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground">
            {formatRupiah(metrics.penyaluranBulanIni, true)}
          </p>
          <p className="text-[10px] text-muted-foreground">87 Berkas Terealisasi</p>
        </div>

        <div className="bg-card p-4 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Mustahik Terbantu</p>
          <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground">
            {metrics.totalMustahik.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">100% Terverifikasi</p>
        </div>

        <div className="bg-card p-4 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Efektivitas (SROI)</p>
          <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-emerald-600">
            {metrics.efektivitasPenyaluran}%
          </p>
          <p className="text-[10px] text-muted-foreground">Standar Nasional &gt;90%</p>
        </div>

        <div className="bg-card p-4 space-y-1 col-span-2 md:col-span-1">
          <p className="text-[11px] font-medium text-muted-foreground">Sisa Alokasi Siap Salur</p>
          <p className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-600">
            {formatRupiah(metrics.balance, true)}
          </p>
          <p className="text-[10px] text-muted-foreground">Kas Penyaluran Aktif</p>
        </div>
      </div>

      {/* 3. Analytics Section: 5 Pilar Trend Chart & Asnaf Pie Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Trend Penyaluran 5 Pilar (7 Cols) */}
        <Card className="lg:col-span-7 xl:col-span-8 shadow-2xs border-border rounded-xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-border/60">
            <div>
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                Tren Distribusi 5 Pilar BAZNAS
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Realisasi program per bulan (Rp Miliar)</p>
            </div>

            {/* Segmented Period Control */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              {periods.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(idx)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    period === idx
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-3">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(val) => `${(val / 1_000_000_000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(v) => [formatRupiah(v), '']} 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="pendidikan" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="kesehatan" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sosial" stackId="a" fill="#e11d48" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ekonomi" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="dakwah" stackId="a" fill="#7c3aed" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clean Chart Legends */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
              {Object.entries(PILAR_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-xs" style={{ backgroundColor: config.color }} />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 8 Asnaf Distribution (5 Cols) */}
        <Card className="lg:col-span-5 xl:col-span-4 shadow-2xs border-border rounded-xl flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Alokasi 8 Golongan Asnaf
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Proporsi pembagian syariat penyaluran ZIS</p>
          </CardHeader>

          <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalByAsnaf}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {totalByAsnaf.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v) => [formatRupiah(v), '']} 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground">Total Asnaf</span>
                <span className="text-xs font-bold font-mono text-foreground">{formatRupiah(sumAsnafTotal, true)}</span>
              </div>
            </div>

            {/* Asnaf Legend Matrix */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60 text-xs">
              {totalByAsnaf.map((item) => (
                <div key={item.name} className="p-1.5 rounded-md bg-muted/30 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="size-2 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">{formatRupiah(item.value, true)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Distribution Ledger Table */}
      <Card className="shadow-2xs border-border rounded-xl overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Buku Kas Transaksi Penyaluran Terkini
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Daftar realisasi permohonan bantuan yang telah disalurkan kepada mustahik
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7.5 text-xs font-semibold rounded-lg cursor-pointer"
              onClick={() => setShowAddSheet(true)}
            >
              <Plus className="size-3.5 mr-1 text-emerald-600" /> Catat Realisasi
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setShowAllSheet(true)}
            >
              Lihat Semua ({transactions.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5">Nama Mustahik</th>
                  <th className="px-4 py-2.5">Program 5 Pilar</th>
                  <th className="px-4 py-2.5">Asnaf</th>
                  <th className="px-4 py-2.5 text-right">Nominal (Rp)</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.slice(0, 6).map((trx, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{trx.date}</td>
                    <td className="px-4 py-2.5 font-semibold text-foreground">{trx.mustahik}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{trx.program}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground">
                        {trx.asnaf}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-right text-foreground">
                      {formatRupiah(trx.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant="outline" className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
                        {trx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet: Catat Penyaluran Baru */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent className="w-full sm:max-w-md p-5 overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-base font-bold text-foreground">Catat Realisasi Penyaluran</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Nama Penerima / Mustahik *</label>
              <Input
                required
                placeholder="Contoh: Sdr. Sulaiman"
                value={formMustahik}
                onChange={(e) => setFormMustahik(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Program 5 Pilar</label>
                <select
                  value={formProgram}
                  onChange={(e) => setFormProgram(e.target.value)}
                  className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2 text-foreground"
                >
                  <option value="Tangerang Cerdas">Tangerang Cerdas (Pendidikan)</option>
                  <option value="Tangerang Sehat">Tangerang Sehat (Kesehatan)</option>
                  <option value="Tangerang Peduli">Tangerang Peduli (Kemanusiaan)</option>
                  <option value="Tangerang Makmur">Tangerang Makmur (Ekonomi)</option>
                  <option value="Tangerang Takwa">Tangerang Takwa (Dakwah)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Golongan Asnaf</label>
                <select
                  value={formAsnaf}
                  onChange={(e) => setFormAsnaf(e.target.value)}
                  className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2 text-foreground"
                >
                  <option value="Fakir">Fakir</option>
                  <option value="Miskin">Miskin</option>
                  <option value="Mualaf">Mualaf</option>
                  <option value="Gharimin">Gharimin</option>
                  <option value="Fisabilillah">Fisabilillah</option>
                  <option value="Ibnu Sabil">Ibnu Sabil</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nominal (Rp) *</label>
                <Input
                  required
                  type="number"
                  placeholder="5000000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="h-8 text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tanggal</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAddSheet(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Simpan Penyaluran
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet: Lihat Semua Transaksi */}
      <Sheet open={showAllSheet} onOpenChange={setShowAllSheet}>
        <SheetContent className="w-full sm:max-w-2xl p-5 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-border">
            <SheetTitle className="text-base font-bold text-foreground">Riwayat Semua Penyaluran</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 pt-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari mustahik / program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="h-8 text-xs rounded-lg border border-border bg-background px-2 text-foreground"
              >
                <option value="Semua">Semua Program</option>
                <option value="Tangerang Cerdas">Tangerang Cerdas</option>
                <option value="Tangerang Sehat">Tangerang Sehat</option>
                <option value="Tangerang Peduli">Tangerang Peduli</option>
                <option value="Tangerang Makmur">Tangerang Makmur</option>
                <option value="Tangerang Takwa">Tangerang Takwa</option>
              </select>
            </div>

            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden text-xs max-h-[500px] overflow-y-auto">
              {filteredTransactions.map((trx, idx) => (
                <div key={idx} className="p-3 hover:bg-muted/20 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{trx.mustahik}</p>
                    <p className="text-[11px] text-muted-foreground">{trx.program} • Asnaf {trx.asnaf} • {trx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-foreground">{formatRupiah(trx.amount)}</p>
                    <Badge variant="outline" className="text-[9px] py-0 text-emerald-600 border-emerald-500/30">
                      {trx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
