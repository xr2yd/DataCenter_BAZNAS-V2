'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, Menu, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { PENYALURAN_NAV_ITEMS } from './penyaluran-nav';
import { useAuth } from '../auth/AuthProvider';

export function PenyaluranTopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = user?.name || 'Amil Penyaluran';
  const initials = userName.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const isActive = (href?: string, exact?: boolean) => href ? (exact ? pathname === href : pathname.startsWith(href)) : false;

  const navItems = PENYALURAN_NAV_ITEMS.map((item) => item.id === 'analitik' && item.children ? { ...item, children: item.children.filter((child) => child.id !== 'audit' || user?.role === 'admin') } : item);
  return <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
    <div className="mx-auto grid h-16 max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
      <Link href="/penyaluran" className="flex min-w-0 items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md"><img src="/baznas-logo.png" alt="BAZNAS Kota Tangerang" className="size-full object-contain" /></span><span className="hidden flex-col leading-none sm:flex"><strong className="text-xs font-black tracking-tight text-zinc-900">BAZNAS</strong><small className="text-[9px] font-semibold tracking-wider text-emerald-700">KOTA TANGERANG</small></span></Link>
      <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">{navItems.map((item) => {
        const Icon = item.icon; const childrenActive = item.children?.some((child) => pathname.startsWith(child.href)); const active = isActive(item.href, item.exact) || childrenActive;
        if (!item.children) return <Link key={item.id} href={item.href!} className={`relative flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}><Icon className="size-4" />{item.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-600" />}</Link>;
        return <div key={item.id} className="relative"><button type="button" aria-expanded={menuOpen === item.id} onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)} className={`relative flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}><Icon className="size-4" />{item.label}<ChevronDown className={`size-3.5 transition ${menuOpen === item.id ? 'rotate-180' : ''}`} /></button>{menuOpen === item.id && <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{item.children.map((child) => { const ChildIcon = child.icon; return <Link key={child.id} href={child.href} onClick={() => setMenuOpen(null)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${pathname.startsWith(child.href) ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}><ChildIcon className="size-4" />{child.label}</Link>; })}</div>}</div>;
      })}</nav>
      <div className="relative flex items-center gap-2 justify-self-end"><button type="button" aria-label="Buka navigasi" onClick={() => setMobileOpen(!mobileOpen)} className="grid size-10 place-items-center rounded-xl border border-zinc-200 text-zinc-700 md:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button><button type="button" onClick={() => { setProfileOpen(!profileOpen); setMenuOpen(null); }} className="flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 py-1 pl-1.5 pr-2.5 text-left text-xs transition hover:bg-zinc-100"><span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{initials || 'AP'}</span><span className="hidden flex-col leading-none sm:flex"><strong className="max-w-[130px] truncate text-sm text-zinc-900">{userName}</strong><small className="mt-1 text-[10px] font-medium text-zinc-500">Bidang Penyaluran</small></span><ChevronDown className="size-3 text-zinc-400" /></button>{profileOpen && <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"><div className="border-b border-zinc-100 px-3 py-2"><p className="text-xs font-bold text-zinc-900">{userName}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{user?.email || 'amil@baznas.go.id'}</p></div>{user?.role === 'admin' && <Link href="/penyaluran/pengaturan" onClick={() => setProfileOpen(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50"><Settings2 className="size-4" />Pengaturan</Link>}<button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"><LogOut className="size-4" />Keluar</button></div>}</div>
    </div>
    {mobileOpen && <nav aria-label="Navigasi mobile" className="border-t border-zinc-100 bg-white p-3 md:hidden">{navItems.map((item) => { const Icon = item.icon; return <div key={item.id}>{item.href ? <Link href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-800"><Icon className="size-4 text-emerald-700" />{item.label}</Link> : <><p className="px-3 pt-3 text-xs font-black uppercase tracking-wider text-slate-400">{item.label}</p>{item.children?.map((child) => { const ChildIcon = child.icon; return <Link key={child.id} href={child.href} onClick={() => setMobileOpen(false)} className="ml-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700"><ChildIcon className="size-4 text-slate-400" />{child.label}</Link>; })}</>}</div>; })}</nav>}
  </header>;
}
