import { BriefcaseBusiness, ChartNoAxesCombined, Compass, FileText, Layers, LayoutDashboard, ListTodo, ScrollText, Users, WalletCards, type LucideIcon } from 'lucide-react';

export interface PenyaluranNavItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: Array<{ id: string; label: string; href: string; icon: LucideIcon }>;
}

export const PENYALURAN_NAV_ITEMS: PenyaluranNavItem[] = [
  { id: 'beranda', label: 'Beranda', href: '/penyaluran', icon: LayoutDashboard, exact: true },
  { id: 'mustahik', label: 'Mustahik', href: '/penyaluran/mustahik', icon: Users },
  { id: 'operasional', label: 'Operasional', icon: BriefcaseBusiness, children: [
    { id: 'transaksi', label: 'Transaksi', href: '/penyaluran/transaksi', icon: WalletCards },
    { id: 'tugas', label: 'Tugas', href: '/penyaluran/tugas', icon: ListTodo },
  ] },
  { id: 'program', label: 'Program', href: '/penyaluran/program', icon: Layers },
  { id: 'analitik', label: 'Analitik', icon: ChartNoAxesCombined, children: [
    { id: 'peta', label: 'Peta', href: '/penyaluran/peta', icon: Compass },
    { id: 'laporan', label: 'Laporan', href: '/penyaluran/laporan', icon: FileText },
    { id: 'audit', label: 'Audit', href: '/penyaluran/audit', icon: ScrollText },
  ] },
];
