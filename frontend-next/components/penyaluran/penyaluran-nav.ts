import {
  LayoutDashboard,
  Users,
  Layers,
  Compass,
  FileText,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export interface PenyaluranNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const PENYALURAN_NAV_ITEMS: PenyaluranNavItem[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    href: '/penyaluran',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: 'mustahik',
    label: 'Data Mustahik',
    href: '/penyaluran/mustahik',
    icon: Users,
  },
  {
    id: 'transaksi',
    label: 'Transaksi',
    href: '/penyaluran/transaksi',
    icon: WalletCards,
  },
  {
    id: 'program',
    label: 'Program 5 Pilar',
    href: '/penyaluran/program',
    icon: Layers,
  },
  {
    id: 'peta',
    label: 'Peta Sebaran',
    href: '/penyaluran/peta',
    icon: Compass,
  },
  {
    id: 'laporan',
    label: 'Laporan Penyaluran',
    href: '/penyaluran/laporan',
    icon: FileText,
  },
];
