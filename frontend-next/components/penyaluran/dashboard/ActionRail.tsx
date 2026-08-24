import React from 'react';
import Link from 'next/link';
import { ArrowRight, UserCheck, FileCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function ActionRail() {
  const pendingActions = [
    {
      id: 'act-1',
      title: 'Verifikasi Berkas Baru',
      count: 14,
      desc: 'Pengajuan online & rekomendasi UPZ',
      href: '/penyaluran/mustahik?tab=diajukan',
      urgency: 'high',
      icon: Clock,
    },
    {
      id: 'act-2',
      title: 'Jadwal Survey Faktual',
      count: 8,
      desc: 'Wilayah Cipondoh & Karawaci',
      href: '/penyaluran/mustahik?tab=survey',
      urgency: 'medium',
      icon: UserCheck,
    },
    {
      id: 'act-3',
      title: 'Pencairan Dana (PPD/FPD)',
      count: 5,
      desc: 'Siap transfer rekening mustahik',
      href: '/penyaluran/mustahik?tab=ppd',
      urgency: 'urgent',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          Antrean Keputusan Hari Ini
        </h3>
        <span className="text-[11px] text-zinc-500">27 Berkas Aktif</span>
      </div>

      <div className="space-y-2">
        {pendingActions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900">
                  {item.count}
                </span>
                <ArrowRight className="size-3.5 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
