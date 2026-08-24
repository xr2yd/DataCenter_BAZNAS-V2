import React from 'react';
import Link from 'next/link';
import { ArrowRight, UserCheck, FileCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

type PriorityItem = {
  id: string;
  title: string;
  program: string;
  count: number;
  amount: number;
  action: string;
  tone: 'high' | 'medium' | 'low';
};

const defaultActions: PriorityItem[] = [
    {
      id: 'act-1',
      title: 'Verifikasi Berkas Baru',
      count: 14,
      program: 'Pengajuan online & rekomendasi UPZ', amount: 25000000, action: 'Verifikasi', tone: 'high',
    },
    {
      id: 'act-2',
      title: 'Jadwal Survey Faktual',
      count: 8,
      program: 'Wilayah Cipondoh & Karawaci', amount: 18000000, action: 'Atur survey', tone: 'medium',
    },
    {
      id: 'act-3',
      title: 'Pencairan Dana (PPD/FPD)',
      count: 5,
      program: 'Siap transfer rekening mustahik', amount: 12000000, action: 'Proses PPD', tone: 'low',
    },
];

const iconFor = [Clock, UserCheck, CheckCircle2];

export function ActionRail({ priorities = defaultActions }: { priorities?: PriorityItem[] }) {

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          Antrean Keputusan Hari Ini
        </h3>
        <span className="text-[11px] text-zinc-500">{priorities.reduce((total, item) => total + item.count, 0)} Berkas Aktif</span>
      </div>

      <div className="space-y-2">
        {priorities.map((item, index) => {
          const Icon = iconFor[index % iconFor.length] ?? Clock;
          return (
            <Link
              key={item.id}
              href="/penyaluran/mustahik"
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
                  <p className="text-[11px] text-zinc-500">{item.program} · {item.action}</p>
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
