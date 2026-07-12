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
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  ShieldCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { MUZAKKI_LIST } from '../data/penerimaanData';
import { formatRupiah } from '../utils/format';

export default function MuzakkiPage() {
  const [muzakkiList, setMuzakkiList] = useState(MUZAKKI_LIST);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Individu');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDonation, setFormDonation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
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
    const total = muzakkiList.length;
    const active = muzakkiList.filter(m => m.status === 'Aktif').length;
    const passive = total - active;
    const totalContribution = muzakkiList.reduce((sum, m) => sum + m.totalDonation, 0);

    return { total, active, passive, totalContribution };
  }, [muzakkiList]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName) {
      showToast('Nama Muzakki wajib diisi!', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newMuzakki = {
        id: `MZK-${String(muzakkiList.length + 1).padStart(3, '0')}`,
        name: formName,
        type: formType,
        email: formEmail || '-',
        phone: formPhone || '-',
        totalDonation: formDonation ? parseFloat(formDonation) : 0,
        lastDonation: new Date().toISOString().split('T')[0],
        status: 'Aktif'
      };

      setMuzakkiList([newMuzakki, ...muzakkiList]);
      setIsSubmitting(false);
      setShowAddSheet(false);
      showToast(`Muzakki baru "${formName}" berhasil terdaftar!`);

      // Reset Form
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormDonation('');
      setFormType('Individu');
    }, 750);
  };

  // Filter list
  const filteredMuzakki = useMemo(() => {
    return muzakkiList.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'Semua' || m.type === filterType;
      const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [muzakkiList, searchTerm, filterType, filterStatus]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Data Muzakki</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola data perorangan dan korporasi yang membayarkan zakat, infak, dan sedekah
          </p>
        </div>
        <div>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setShowAddSheet(true)}>
            <Plus className="size-3.5" /> Tambah Muzakki
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
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Total Muzakki</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Status Aktif</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <X className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Status Pasif</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{stats.passive}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">Total Kontribusi</p>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5 truncate max-w-[160px]" title={formatRupiah(stats.totalContribution)}>
                {formatRupiah(stats.totalContribution, true)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table + Filter Card */}
      <Card className="shadow-card animate-fade-in-up fill-mode-both delay-100">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-sm font-semibold">Daftar Anggota Muzakki</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari Muzakki (Nama/ID/Email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="Individu">Individu</option>
              <option value="Korporasi">Korporasi</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 text-[11px] rounded-md border border-border bg-background px-2.5 focus-visible:ring-2 focus-visible:ring-emerald-500 text-foreground"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {filteredMuzakki.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-page-enter">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-3">
                <Search className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Muzakki</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Kata kunci atau filter pencarian Anda tidak mencocokkan record Muzakki apa pun.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 h-8 text-xs font-semibold"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('Semua');
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
                  <th className="px-4 py-3 font-semibold text-muted-foreground">ID Muzakki</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Anggota</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Tipe</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Kontak</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Total Kontribusi</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Terakhir Bayar</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMuzakki.map((m, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-muted-foreground">{m.id}</td>
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        {m.type === 'Korporasi' ? (
                          <Building className="size-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <User className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        m.type === 'Korporasi' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-[11px]"><Mail className="size-3 text-muted-foreground/60" /> {m.email}</span>
                        <span className="flex items-center gap-1 text-[11px]"><Phone className="size-3 text-muted-foreground/60" /> {m.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">
                      {formatRupiah(m.totalDonation)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3 text-muted-foreground/60" /> {m.lastDonation}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
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

      {/* Sheet: Tambah Muzakki */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border p-6 flex flex-col h-full z-50">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold text-foreground">Daftar Muzakki Baru</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Masukkan data profil perorangan atau korporasi ke dalam sistem data center
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Lengkap / Nama Perusahaan</label>
              <Input
                placeholder="Contoh: Dr. H. Slamet Riyadi / PT Sentosa"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tipe Muzakki</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full h-9 text-xs rounded-md border border-border bg-background px-3 py-1 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <option value="Individu">Individu (Perorangan)</option>
                <option value="Korporasi">Korporasi (Perusahaan / Yayasan)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Contoh: muzakki@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nomor Telepon / WhatsApp</label>
              <Input
                placeholder="Contoh: 08123456789"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Donasi Awal (IDR - Opsional)</label>
              <Input
                type="number"
                placeholder="Contoh: 1000000"
                value={formDonation}
                onChange={(e) => setFormDonation(e.target.value)}
                className="h-9 text-xs focus-visible:ring-emerald-500 border-border"
              />
              {formDonation && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in pl-1">
                  Format: {formatRupiah(parseFloat(formDonation) || 0)}
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
                  'Daftarkan Muzakki'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
