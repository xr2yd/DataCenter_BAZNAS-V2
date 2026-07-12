import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  HeartPulse,
  AlertTriangle,
  Coins,
  BookOpen,
  Search,
  Download,
  User,
  Users,
  Target
} from 'lucide-react';
import { formatRupiah } from '../utils/format';

const programsData = [
  {
    id: 'PRG-01',
    name: 'Tangerang Cerdas',
    category: 'Pendidikan',
    icon: GraduationCap,
    iconColor: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-100 dark:border-blue-900/30',
    description: 'Bantuan biaya pendidikan, beasiswa santri/mahasiswa, serta sarana prasarana sekolah di wilayah Tangerang.',
    budget: 661_500_000_000,
    realized: 570_000_000_000,
    targetMustahik: 12_500,
    realizedMustahik: 10_200,
    subPrograms: [
      { name: 'Beasiswa Tangerang Cerdas (D3/S1)', budget: 200_000_000_000, realized: 185_000_000_000, status: 'Aktif' },
      { name: 'Bantuan Seragam & Buku Siswa Duafa', budget: 150_000_000_000, realized: 125_000_000_000, status: 'Aktif' },
      { name: 'Insentif Guru Honoror & Guru Ngaji', budget: 180_000_000_000, realized: 160_000_000_000, status: 'Aktif' },
      { name: 'Sarana Komputer Pondok Pesantren', budget: 131_500_000_000, realized: 100_000_000_000, status: 'Aktif' }
    ]
  },
  {
    id: 'PRG-02',
    name: 'Tangerang Sehat',
    category: 'Kesehatan',
    icon: HeartPulse,
    iconColor: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    description: 'Bantuan pengobatan darurat duafa, alat penunjang disabilitas, klinik kesehatan gratis, serta khitanan massal.',
    budget: 472_500_000_000,
    realized: 410_000_000_000,
    targetMustahik: 8_000,
    realizedMustahik: 7_120,
    subPrograms: [
      { name: 'Bantuan Biaya Rawat Inap & Obat', budget: 250_000_000_000, realized: 220_000_000_000, status: 'Aktif' },
      { name: 'Pengadaan Alat Bantu (Kursi Roda/Kaki Palsu)', budget: 72_500_000_000, realized: 65_000_000_000, status: 'Aktif' },
      { name: 'Klinik Keliling Tangerang Sehat', budget: 100_000_000_000, realized: 85_000_000_000, status: 'Aktif' },
      { name: 'Sanitasi Sehat Lingkungan Kumuh', budget: 50_000_000_000, realized: 40_000_000_000, status: 'Selesai' }
    ]
  },
  {
    id: 'PRG-03',
    name: 'Tangerang Peduli',
    category: 'Sosial & Kemanusiaan',
    icon: AlertTriangle,
    iconColor: '#ef4444',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    borderColor: 'border-rose-100 dark:border-rose-900/30',
    description: 'Penanggulangan bencana alam, santunan sembako lansia duafa, bedah rumah layak huni, serta santunan anak yatim.',
    budget: 378_000_000_000,
    realized: 330_000_000_000,
    targetMustahik: 25_000,
    realizedMustahik: 23_400,
    subPrograms: [
      { name: 'Sembako Paket Duafa Bulanan', budget: 180_000_000_000, realized: 165_000_000_000, status: 'Aktif' },
      { name: 'Bedah Rumah Tidak Layak Huni (RTLH)', budget: 100_000_000_000, realized: 90_000_000_000, status: 'Aktif' },
      { name: 'Santunan Yatim Piatu & Janda Duafa', budget: 68_000_000_000, realized: 55_000_000_000, status: 'Aktif' },
      { name: 'Posko Tanggap Bencana & Logistik', budget: 30_000_000_000, realized: 20_000_000_000, status: 'Aktif' }
    ]
  },
  {
    id: 'PRG-04',
    name: 'Tangerang Makmur',
    category: 'Pemberdayaan Ekonomi',
    icon: Coins,
    iconColor: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-100 dark:border-amber-900/30',
    description: 'Bantuan modal usaha bergulir tanpa bunga untuk UMKM duafa, pelatihan wirausaha, serta alat produksi pertanian.',
    budget: 226_800_000_000,
    realized: 180_000_000_000,
    targetMustahik: 3_500,
    realizedMustahik: 2_950,
    subPrograms: [
      { name: 'Bantuan Modal Usaha ZMart', budget: 100_000_000_000, realized: 85_000_000_000, status: 'Aktif' },
      { name: 'Alat Kerja Nelayan & Petani Lokal', budget: 50_000_000_000, realized: 40_000_000_000, status: 'Aktif' },
      { name: 'Pelatihan Sertifikasi Kompetensi & IT', budget: 46_800_000_000, realized: 35_000_000_000, status: 'Aktif' },
      { name: 'Koperasi Syariah Mandiri Binaan', budget: 30_000_000_000, realized: 20_000_000_000, status: 'Selesai' }
    ]
  },
  {
    id: 'PRG-05',
    name: 'Tangerang Takwa',
    category: 'Dakwah & Advokasi',
    icon: BookOpen,
    iconColor: '#8b5cf6',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-100 dark:border-purple-900/30',
    description: 'Penyaluran sarana ibadah masjid, pembinaan mualaf, insentif dai pedalaman, serta advokasi hukum kaum mustahik.',
    budget: 151_200_000_000,
    realized: 120_000_000_000,
    targetMustahik: 1_200,
    realizedMustahik: 1_040,
    subPrograms: [
      { name: 'Renovasi Masjid & Mushola', budget: 70_000_000_000, realized: 60_000_000_000, status: 'Aktif' },
      { name: 'Pembinaan & Modal Mualaf Center', budget: 31_200_000_000, realized: 25_000_000_000, status: 'Aktif' },
      { name: 'Insentif Dai Syiar Ramadhan', budget: 30_000_000_000, realized: 25_000_000_000, status: 'Selesai' },
      { name: 'Advokasi Hukum Kaum Tertindas', budget: 20_000_000_000, realized: 10_000_000_000, status: 'Aktif' }
    ]
  }
];

export default function ProgramBantuanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(programsData[0]);

  // Filter programs based on search
  const filteredPrograms = useMemo(() => {
    return programsData.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const overallStats = useMemo(() => {
    const totalBudget = programsData.reduce((sum, p) => sum + p.budget, 0);
    const totalRealized = programsData.reduce((sum, p) => sum + p.realized, 0);
    const percent = Math.round((totalRealized / totalBudget) * 100);
    
    return { totalBudget, totalRealized, percent };
  }, []);

  return (
    <div className="w-full max-w-[1920px] 2xl:mx-auto space-y-3 sm:space-y-4 md:space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Program Bantuan Pilar BAZNAS</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar pilar program penyaluran BAZNAS beserta pagu anggaran RKAT dan realisasi mustahik
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="size-3.5" /> Cetak Rencana Anggaran
          </Button>
        </div>
      </div>

      {/* Summary Widget Card */}
      <Card className="bg-emerald-800 text-emerald-50 dark:bg-emerald-950 dark:text-emerald-50 border-none shadow-md overflow-hidden relative animate-fade-in-up fill-mode-both">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Target className="w-48 h-48" />
        </div>
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-200">Realisasi Keseluruhan Program</span>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {formatRupiah(overallStats.totalRealized)} telah disalurkan
            </h2>
            <p className="text-xs text-emerald-200">
              Dari pagu anggaran RKAT sebesar {formatRupiah(overallStats.totalBudget)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-100">{overallStats.percent}%</span>
              <span className="text-[10px] text-emerald-200">Tingkat Penyerapan Anggaran</span>
            </div>
            <div className="w-20 sm:w-28 h-2.5 bg-emerald-900 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${overallStats.percent}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Program Cards, Right Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3 sm:gap-4 animate-fade-in-up fill-mode-both delay-100">
        
        {/* Left Side: Program List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari pilar program BAZNAS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs focus-visible:ring-emerald-500 bg-card border-border"
            />
          </div>

          {filteredPrograms.map((p) => {
            const Icon = p.icon;
            const percent = Math.round((p.realized / p.budget) * 100);
            const isSelected = selectedProgram.id === p.id;
            
            return (
              <Card
                key={p.id}
                onClick={() => setSelectedProgram(p)}
                className={`cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-emerald-600 dark:border-emerald-500 shadow-md ring-1 ring-emerald-600/30' 
                    : 'border-border hover:shadow-sm'
                }`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 ${p.bgColor}`} style={{ color: p.iconColor }}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{p.category}</span>
                      <span className="text-xs font-bold text-foreground">{percent}%</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{p.name}</h3>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: p.iconColor }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                      <span>Penyaluran: {formatRupiah(p.realized, true)}</span>
                      <span>Target: {p.realizedMustahik}/{p.targetMustahik} Mustahik</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Side: Selected Program Detail */}
        <Card className="shadow-card border-border flex flex-col h-full">
          <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center gap-3">
            <div className={`p-2.5 rounded-lg shrink-0 ${selectedProgram.bgColor}`} style={{ color: selectedProgram.iconColor }}>
              <selectedProgram.icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">{selectedProgram.name}</CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">{selectedProgram.category}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 flex-1 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground">Deskripsi Program</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedProgram.description}
              </p>
            </div>

            {/* Target vs Realized stats */}
            <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-3 rounded-lg border border-border/40">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block uppercase">Mustahik Sasaran</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1">
                  <Users className="size-3.5 text-muted-foreground" /> {selectedProgram.targetMustahik} Jiwa
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block uppercase">Mustahik Terealisasi</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <User className="size-3.5" /> {selectedProgram.realizedMustahik} Jiwa
                </span>
              </div>
            </div>

            {/* Sub-programs table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground">Sub-Program / Penyerapan Anggaran</span>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium text-muted-foreground rounded-l-lg">Sub Program</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">RKAT</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Realisasi</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedProgram.subPrograms.map((sub, idx) => {
                      const prc = Math.round((sub.realized / sub.budget) * 100);
                      return (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[160px]" title={sub.name}>{sub.name}</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-muted-foreground">{formatRupiah(sub.budget, true)}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(sub.realized, true)} ({prc}%)</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              sub.status === 'Aktif' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
