import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  X,
  Calendar,
  Layers,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { PENERIMAAN_TRANSACTIONS } from '../data/penerimaanData';
import { formatRupiah } from '../utils/format';

export default function LaporanPenerimaanPage() {
  const [transactions] = useState(PENERIMAAN_TRANSACTIONS);

  // Filter form states
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterSumber, setFilterSumber] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isExporting, setIsExporting] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Perform dynamic filtering on memo
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => {
      // Date filter
      const trxDate = new Date(trx.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const matchStart = !start || trxDate >= start;
      const matchEnd = !end || trxDate <= end;
      
      // Jenis filter
      const matchJenis = filterJenis === 'Semua' || trx.jenis === filterJenis;
      
      // Sumber filter
      const matchSumber = filterSumber === 'Semua' || trx.sumber === filterSumber;
      
      // Search term
      const matchSearch = !searchTerm || 
                          trx.muzakki.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trx.jenis.toLowerCase().includes(searchTerm.toLowerCase());
                          
      return matchStart && matchEnd && matchJenis && matchSumber && matchSearch;
    });
  }, [transactions, startDate, endDate, filterJenis, filterSumber, searchTerm]);

  // Totals calculations
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, trx) => sum + trx.amount, 0);
  }, [filteredTransactions]);

  const handleExport = (format) => {
    setIsExporting(format);
    showToast(`Sedang menyiapkan berkas laporan penerimaan dalam format ${format.toUpperCase()}...`);
    setTimeout(() => {
      showToast(`Berkas Laporan_Penerimaan_${startDate}_to_${endDate}.${format} berhasil diunduh!`, 'success');
      setIsExporting(null);
    }, 1500);
  };

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-3 sm:space-y-4 md:space-y-5 relative">
      
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Laporan Penerimaan</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Buat, saring, dan ekspor laporan rekapitulasi penyerapan dana muzakki
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isExporting !== null}
            className="h-8 text-xs bg-card hover:bg-muted text-foreground gap-1.5 border-border" 
            onClick={() => handleExport('xlsx')}
          >
            {isExporting === 'xlsx' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            Ekspor Excel
          </Button>
          <Button 
            size="sm" 
            disabled={isExporting !== null}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" 
            onClick={() => handleExport('pdf')}
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Unduh PDF
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="shadow-card animate-fade-in-up fill-mode-both">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Filter className="size-4 text-emerald-600" /> Saring Data Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider">Tanggal Mulai</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider">Tanggal Akhir</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
                />
              </div>
            </div>

             <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider">Jenis Dana</label>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-border bg-background px-3 py-1 shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Zakat Maal">Zakat Maal</option>
                <option value="Zakat Fitrah">Zakat Fitrah</option>
                <option value="Infak">Infak</option>
                <option value="Sedekah">Sedekah</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider">Sumber Saluran</label>
              <select
                value={filterSumber}
                onChange={(e) => setFilterSumber(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-border bg-background px-3 py-1 shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
              >
                <option value="Semua">Semua Sumber</option>
                <option value="Individu">Individu</option>
                <option value="Korporasi">Korporasi</option>
                <option value="UPZ">UPZ</option>
                <option value="ASN">ASN</option>
                <option value="Online">Online</option>
              </select>
            </div>

          </div>
          
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/60">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi (ID, Nama Muzakki, Keterangan)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>
            <Button 
              size="sm" 
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4"
              onClick={() => {
                setStartDate('2026-07-01');
                setEndDate('2026-07-31');
                setFilterJenis('Semua');
                setFilterSumber('Semua');
                setSearchTerm('');
                showToast('Filter pencarian dibersihkan!');
              }}
            >
              Reset Saringan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-fade-in-up fill-mode-both delay-100">
        <Card className="shadow-card bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Total Penerimaan Terfilter</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                {formatRupiah(totalAmount)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Jumlah Transaksi Terkait</p>
              <h3 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                {filteredTransactions.length} Transaksi
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table Card */}
      <Card className="shadow-card animate-fade-in-up fill-mode-both delay-200">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-semibold">Tabel Hasil Pencarian Rekapitulasi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-page-enter">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-3">
                <Search className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Transaksi Ditemukan</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Kata kunci atau penyaringan laporan Anda tidak mencocokkan transaksi apa pun.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 h-8 text-xs font-semibold"
                onClick={() => {
                  setStartDate('2026-07-01');
                  setEndDate('2026-07-31');
                  setFilterJenis('Semua');
                  setFilterSumber('Semua');
                  setSearchTerm('');
                }}
              >
                Reset Saringan
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">ID Muzakki</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Muzakki</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Jenis Dana</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Sumber Pembayaran</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Nominal Penerimaan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((trx, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{trx.date}</td>
                    <td className="px-4 py-3 text-muted-foreground font-medium">MZK-{(idx + 101)}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{trx.muzakki}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trx.jenis}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trx.sumber}</td>
                    <td className="px-4 py-3 text-right font-black text-foreground">
                      {formatRupiah(trx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
