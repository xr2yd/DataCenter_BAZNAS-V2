import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  ChevronDown,
  FileText,
  Users,
  HeartHandshake,
  ClipboardList,
  ChartPie,
  Wallet,
  FileSpreadsheet,
  UserCheck,
  Calendar,
  Star,
  Bot,
  Settings,
  Building2,
} from 'lucide-react';
import baznasLogo from '@/assets/baznas-logo.png';

const menuGroups = [
  {
    label: 'Penerimaan',
    icon: Wallet,
    items: [
      { icon: ChartPie, label: 'Dashboard Penerimaan' },
      { icon: Users, label: 'Data Muzakki' },
      { icon: FileText, label: 'Laporan Penerimaan' },
    ],
  },
  {
    label: 'Penyaluran',
    icon: HeartHandshake,
    items: [
      { icon: ChartPie, label: 'Dashboard Penyaluran' },
      { icon: Users, label: 'Data Mustahik' },
      { icon: HeartHandshake, label: 'Portal Publik Mustahik' },
      { icon: ClipboardList, label: 'Program Bantuan' },
      { icon: FileText, label: 'Laporan Penyaluran' },
    ],
  },
  {
    label: 'UPZ & Mitra',
    icon: Building2,
    items: [
      { icon: Users, label: 'Data UPZ' },
      { icon: FileText, label: 'Laporan UPZ' },
      { icon: ClipboardList, label: 'Kerja Sama' },
    ],
  },
  {
    label: 'Keuangan & Pelaporan',
    icon: Wallet,
    items: [
      { icon: ChartPie, label: 'Dashboard Keuangan' },
      { icon: FileSpreadsheet, label: 'RKAT' },
      { icon: Wallet, label: 'Realisasi Anggaran' },
      { icon: FileText, label: 'Laporan Keuangan' },
    ],
  },
  {
    label: 'SDM',
    icon: Users,
    items: [
      { icon: ChartPie, label: 'Dashboard SDM' },
      { icon: UserCheck, label: 'Data Pegawai' },
      { icon: Calendar, label: 'Presensi' },
      { icon: Star, label: 'Kinerja' },
    ],
  },
];

export default function AppSidebar({ activePage = 'utama', onNavigate = () => {} }) {
  const { state, isMobile } = useSidebar();
  const [openGroups, setOpenGroups] = useState({ Penerimaan: true });

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {state === 'collapsed' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#"
                    className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white p-1 shadow-sm transition-all hover:bg-white hover:shadow-md"
                  >
                    <img
                      src={baznasLogo}
                      alt="BAZNAS"
                      className="h-6 w-auto object-contain"
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">ZAKAT Management System</TooltipContent>
              </Tooltip>
            ) : (
              <a
                href="#"
                className="group flex items-center gap-3 rounded-xl border border-emerald-700/40 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md hover:border-emerald-600/50"
              >
                <img
                  src={baznasLogo}
                  alt="BAZNAS Kota Tangerang"
                  className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm text-emerald-900">ZAKAT</span>
                  <span className="text-[10px] text-emerald-700/80">Management System</span>
                </div>
              </a>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activePage === 'utama'}
                  tooltip="Dashboard Utama"
                  onClick={() => onNavigate('utama')}
                >
                  <LayoutDashboard />
                  <span>Dashboard Utama</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {menuGroups.map((group) => {
          const labelMap = {
            'Dashboard Penerimaan': 'penerimaan',
            'Data Muzakki': 'muzakki',
            'Laporan Penerimaan': 'laporan_penerimaan',
            'Dashboard Penyaluran': 'penyaluran',
            'Data Mustahik': 'mustahik',
            'Portal Publik Mustahik': 'portal',
            'Program Bantuan': 'program_bantuan',
            'Laporan Penyaluran': 'laporan_penyaluran',
            'Data UPZ': 'data_upz',
            'Laporan UPZ': 'laporan_upz',
            'Kerja Sama': 'kerjasama',
            'Dashboard Keuangan': 'keuangan_dashboard',
            'RKAT': 'rkat',
            'Realisasi Anggaran': 'realisasi_anggaran',
            'Laporan Keuangan': 'laporan_keuangan',
            'Data Pegawai': 'pegawai',
            'Absensi & Cuti': 'absensi',
            'Penilaian Kinerja': 'kinerja',
          };

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {state === 'collapsed' && !isMobile ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton tooltip={group.label} className="hover:bg-muted">
                          <group.icon />
                          <span>{group.label}</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-56 bg-card border border-border shadow-md p-1 ml-1.5 z-50">
                        <div className="px-2 py-1 text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b border-border/40 mb-1">
                          {group.label}
                        </div>
                        {group.items.map((item) => {
                          const pageKey = labelMap[item.label] || null;
                          return (
                            <DropdownMenuItem
                              key={item.label}
                              onClick={() => pageKey && onNavigate(pageKey)}
                              className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-md cursor-pointer ${
                                activePage === pageKey
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              <item.icon className="size-3.5 shrink-0" />
                              <span>{item.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Collapsible
                      open={openGroups[group.label]}
                      onOpenChange={() => toggleGroup(group.label)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={group.label}>
                            <group.icon />
                            <span>{group.label}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {group.items.map((item) => {
                              const pageKey = labelMap[item.label] || null;
                              return (
                                <SidebarMenuSubItem key={item.label}>
                                  <SidebarMenuSubButton
                                    isActive={!!pageKey && activePage === pageKey}
                                    onClick={() => pageKey && onNavigate(pageKey)}
                                  >
                                    <item.icon />
                                    <span>{item.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activePage === 'ai_entry'}
                  tooltip="AI Data Entry"
                  onClick={() => onNavigate('ai_entry')}
                >
                  <Bot />
                  <span>AI Data Entry</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Pengaturan">
              <Settings />
              <span>Pengaturan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-3 py-2 mt-1">
          <p className="text-[10px] text-sidebar-foreground/40 text-center">BAZNAS v2.0</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
