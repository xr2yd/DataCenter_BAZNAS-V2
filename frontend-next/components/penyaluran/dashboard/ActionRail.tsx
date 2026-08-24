import React from 'react';
import Link from 'next/link';
import { ArrowRight, UserCheck, CheckCircle2, Clock, AlertCircle, Check } from 'lucide-react';
import type { DashboardData } from './dashboard-data';

const ACTION_ICONS = [AlertCircle, UserCheck, CheckCircle2];
const TONE_CLASS = {
  rose: 'border-rose-100 bg-rose-50/70 text-rose-700',
  amber: 'border-amber-100 bg-amber-50/70 text-amber-700',
  emerald: 'border-emerald-100 bg-emerald-50/70 text-emerald-700',
};

export function ActionRail({ data }: { data: DashboardData }) {

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-zinc-900">Prioritas Tindakan</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Yang perlu diputuskan hari ini</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600">{data.actions.reduce((total, item) => total + item.count, 0)} aktif</span>
      </div>

      <div className="space-y-2">
        {data.actions.map((item, index) => {
          const Icon = ACTION_ICONS[index] ?? Clock;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center justify-between rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${TONE_CLASS[item.tone]} group`}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/80 font-bold shadow-sm">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-emerald-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-600">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-zinc-900">
                  {item.count}
                </span>
                <ArrowRight className="size-3.5 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-900">Aktivitas terbaru</h3>
          <span className="text-xs font-bold text-emerald-700">Live</span>
        </div>
        <div className="space-y-3">
          {data.activities.map((activity) => (
            <div key={activity.title} className="flex gap-3">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${activity.tone === 'emerald' ? 'bg-emerald-500' : activity.tone === 'violet' ? 'bg-violet-500' : 'bg-amber-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-xs font-bold text-zinc-800">{activity.title}</p>
                  <span className="shrink-0 text-[10px] text-zinc-400">{activity.time}</span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">{activity.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
