import { Bell, ChevronDown, LogOut, Settings, UserCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header({ activePage = 'utama' }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-20">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4" />

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Dashboard</span>
        <span className="text-muted-foreground/50">/</span>
        {(() => {
          switch (activePage) {
            case 'penerimaan':
              return (
                <>
                  <span>Penerimaan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Dashboard</span>
                </>
              );
            case 'muzakki':
              return (
                <>
                  <span>Penerimaan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Data Muzakki</span>
                </>
              );
            case 'laporan_penerimaan':
              return (
                <>
                  <span>Penerimaan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Laporan</span>
                </>
              );
            case 'penyaluran':
              return (
                <>
                  <span>Penyaluran</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Dashboard</span>
                </>
              );
            case 'mustahik':
              return (
                <>
                  <span>Penyaluran</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Data Mustahik</span>
                </>
              );
            case 'program_bantuan':
              return (
                <>
                  <span>Penyaluran</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Program Bantuan</span>
                </>
              );
            case 'laporan_penyaluran':
              return (
                <>
                  <span>Penyaluran</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Laporan</span>
                </>
              );
            case 'data_upz':
              return (
                <>
                  <span>UPZ & Mitra</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Data UPZ</span>
                </>
              );
            case 'laporan_upz':
              return (
                <>
                  <span>UPZ & Mitra</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Laporan UPZ</span>
                </>
              );
            case 'kerjasama':
              return (
                <>
                  <span>UPZ & Mitra</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Kerja Sama</span>
                </>
              );
            case 'keuangan_dashboard':
              return (
                <>
                  <span>Keuangan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Dashboard</span>
                </>
              );
            case 'rkat':
              return (
                <>
                  <span>Keuangan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">RKAT</span>
                </>
              );
            case 'realisasi_anggaran':
              return (
                <>
                  <span>Keuangan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Realisasi Anggaran</span>
                </>
              );
            case 'laporan_keuangan':
              return (
                <>
                  <span>Keuangan</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Laporan Keuangan</span>
                </>
              );
            case 'pegawai':
              return (
                <>
                  <span>SDM & Umum</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Data Pegawai</span>
                </>
              );
            case 'absensi':
              return (
                <>
                  <span>SDM & Umum</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Absensi & Cuti</span>
                </>
              );
            case 'kinerja':
              return (
                <>
                  <span>SDM & Umum</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">Penilaian Kinerja</span>
                </>
              );
            default:
              return <span className="text-foreground">Utama</span>;
          }
        })()}
      </div>

      {/* Search */}
      <div className="hidden lg:flex relative flex-1 max-w-xs ml-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Cari menu atau data..."
          className="h-8 pl-8 text-xs rounded-full bg-secondary border-border focus-visible:ring-emerald-500"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-destructive"></span>
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2 h-auto">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                  AN
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-sm">
                <span className="font-medium">Ahmad Naufal</span>
                <span className="text-xs text-muted-foreground">Kepala Bidang Penerimaan</span>
              </div>
              <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Ahmad Naufal</p>
                <p className="text-xs leading-none text-muted-foreground">a.naufal@baznas.go.id</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
