import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
  MapPin,
  HeartHandshake,
  UserCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { MUSTAHIK_LIST } from '../data/penerimaanData';
import { formatRupiah } from '../utils/format';

export default function MustahikPage() {
  const [mustahikList, setMustahikList] = useState(MUSTAHIK_LIST);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAsnaf, setFormAsnaf] = useState('Miskin');
  const [formLocation, setFormLocation] = useState('');
  const [formAidType, setFormAidType] = useState('');
  const [formAidAmount, setFormAidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsnaf, setFilterAsnaf] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Recalculate quick stats
  const stats = useMemo(() => {
    const total = mustahikList.length;
    const fakirCount = mustahikList.filter(m => m.asnaf === 'Fakir').length;
    const miskinCount = mustahikList.filter(m => m.asnaf === 'Miskin').length;
    const totalAidRealized = mustahikList.reduce((sum, m) => sum + m.totalAid, 0);

    return { total, fakirCount, miskinCount, totalAidRealized };
  }, [mustahikList]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formLocation || !formAidType) {
      showToast('Harap lengkapi semua field wajib!', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newMustahik = {
        id: `MST-${String(mustahikList.length + 1).padStart(3, '0')}`,
        name: formName,
        asnaf: formAsnaf,
        location: formLocation,
        aidType: formAidType,
        totalAid: formAidAmount ? parseFloat(formAidAmount) : 0,
        status: 'Aktif'
      };

      setMustahikList([newMustahik, ...mustahikList]);
      setIsSubmitting(false);
      setShowAddSheet(false);
      showToast(`Mustahik baru "${formName}" berhasil dicatat dalam program bantuan!`);

      // Reset Form
      setFormName('');
      setFormLocation('');
      setFormAidType('');
      setFormAidAmount('');
      setFormAsnaf('Miskin');
    }, 750);
  };

  // Filter list
  const filteredMustahik = useMemo(() => {
    return mustahikList.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.aidType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAsnaf = filterAsnaf === 'Semua' || m.asnaf === filterAsnaf;
      const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;
      return matchSearch && matchAsnaf && matchStatus;
    });
  }, [mustahikList, searchTerm, filterAsnaf, filterStatus]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Data Mustahik</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola data perorangan maupun lembaga penerima manfaat penyaluran zakat (asnaf delapan)
          </p>
        </div>
        <div>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setShowAddSheet(true)}>
            <Plus className="size-3.5" /> Tambah Mustahik
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up fill-mode-both">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Total Mustahik</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Golongan Fakir</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.fakirCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Golongan Miskin</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.miskinCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Dana Tersalurkan</p>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5 truncate max-w-[160px]" title={formatRupiah(stats.totalAidRealized)}>
                {formatRupiah(stats.totalAidRealized, true)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table + Filter Card */}
      <Card className="shadow-card animate-fade-in-up fill-mode-both delay-100">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-sm font-semibold">Daftar Penerima Manfaat</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari Mustahik (Nama/Program/Wilayah)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>

            <select
              value={filterAsnaf}
              onChange={(e) => setFilterAsnaf(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Asnaf</option>
              <option value="Fakir">Fakir</option>
              <option value="Miskin">Miskin</option>
              <option value="Fisabilillah">Fisabilillah</option>
              <option value="Mualaf">Mualaf</option>
              <option value="Gharimin">Gharimin</option>
              <option value="Ibnu Sabil">Ibnu Sabil</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {filteredMustahik.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-page-enter">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-3">
                <Search className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Mustahik</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Kata kunci atau filter pencarian Anda tidak mencocokkan record Mustahik apa pun.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 h-8 text-xs font-semibold"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAsnaf('Semua');
                  setFilterStatus('Semua');
                }}
              >
                Reset Pencarian
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">ID Mustahik</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Penerima</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Golongan Asnaf</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Kecamatan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Jenis Bantuan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Nominal Bantuan</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMustahik.map((m, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-muted-foreground">{m.id}</td>
                    <td className="px-4 py-3.5 font-bold text-foreground">{m.name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        m.asnaf === 'Fakir' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                        m.asnaf === 'Miskin' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        m.asnaf === 'Fisabilillah' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {m.asnaf}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="size-3 text-muted-foreground/60 shrink-0" /> {m.location}</span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-medium">{m.aidType}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">
                      {formatRupiah(m.totalAid)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Sheet: Tambah Mustahik */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Tambah Penerima Bantuan</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Catat profil penerima manfaat (Mustahik) baru serta jenis program penyalurannya
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Mustahik / Lembaga Penerima</label>
              <Input
                placeholder="Contoh: Ibu Minah, Yayasan Yatim Piatu"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Golongan Asnaf</label>
              <select
                value={formAsnaf}
                onChange={(e) => setFormAsnaf(e.target.value)}
                className="w-full h-9 text-xs rounded-md border border-border bg-background px-3 py-1 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <option value="Fakir">Fakir</option>
                <option value="Miskin">Miskin</option>
                <option value="Fisabilillah">Fisabilillah</option>
                <option value="Mualaf">Mualaf</option>
                <option value="Gharimin">Gharimin</option>
                <option value="Ibnu Sabil">Ibnu Sabil</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Kecamatan Domisili</label>
              <Input
                placeholder="Contoh: Karawaci, Cipondoh, Batuceper"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Jenis Bantuan / Program</label>
              <Input
                placeholder="Contoh: Beasiswa Sekolah, Sembako Bulanan, Kursi Roda"
                value={formAidType}
                onChange={(e) => setFormAidType(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nominal Bantuan yang Diterima (IDR)</label>
              <Input
                type="number"
                placeholder="Contoh: 5000000"
                value={formAidAmount}
                onChange={(e) => setFormAidAmount(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
              />
              {formAidAmount && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in pl-1">
                  Format: {formatRupiah(parseFloat(formAidAmount) || 0)}
                </p>
              )}
            </div>

            <div className="pt-4 flex gap-2 border-t border-border mt-6">
              <Button type="button" variant="outline" disabled={isSubmitting} className="flex-1 text-xs h-9" onClick={() => setShowAddSheet(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Data Mustahik'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
