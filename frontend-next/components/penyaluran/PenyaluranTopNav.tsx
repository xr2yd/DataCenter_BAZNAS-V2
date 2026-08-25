'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PENYALURAN_NAV_ITEMS } from './penyaluran-nav';
import { useAuth } from '../auth/AuthProvider';
import { LogOut, UserCircle, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function PenyaluranTopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const userName = user?.name || 'Amil Penyaluran';
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto grid h-14 max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center">
          <Link href="/penyaluran" className="flex items-center gap-2.5">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-md">
              <img
                src="/baznas-logo.png"
                alt="BAZNAS Kota Tangerang"
                className="size-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-tight text-zinc-900">
                BAZNAS
              </span>
              <span className="text-[9px] font-semibold text-emerald-700 tracking-wider">
                KOTA TANGERANG
              </span>
            </div>
          </Link>

        </div>

        {/* Desktop nav stays mathematically centered regardless of brand/profile width. */}
        <nav className="hidden md:flex items-center gap-1">
            {PENYALURAN_NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <Icon className={`size-3.5 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center justify-self-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 py-1 pl-1.5 pr-2.5 text-left text-xs transition-colors hover:bg-zinc-100/80 cursor-pointer"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {initials || 'AP'}
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-bold text-zinc-900 truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium mt-0.5">
                  Bidang Penyaluran
                </span>
              </div>
              <ChevronDown className="size-3 text-zinc-400" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-zinc-100">
                  <p className="text-xs font-bold text-zinc-900">{userName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'amil@baznas.go.id'}</p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer mt-0.5"
                >
                  <LogOut className="size-3.5" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
