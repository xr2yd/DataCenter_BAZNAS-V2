import React from 'react';
import { TrendingUp, Users, Layers3, WalletCards } from 'lucide-react';
import type { DashboardData } from './dashboard-data';

export function ImpactMetrics({ data }: { data: DashboardData }) {
  const formatRupiah = (num: number) => {
    if (!num || num === 0) return 'Rp 0';
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} M`;
    }
    if (num < 1_000_000) {
      return `Rp ${Math.round(num / 1_000)} Rb`;
    }
    return `Rp ${(num / 1000000).toFixed(0)} Jt`;
  };

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:grid-cols-4">
      <div className="bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold text-zinc-500">Total Penyaluran · {data.periodLabel}</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
          {formatRupiah(data.summary.totalDisbursed)}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
          <TrendingUp className="size-3.5" /> {data.summary.change > 0 ? `+${data.summary.change}%` : `${data.summary.change}%`} vs {data.comparisonLabel}
        </div>
      </div>

      <div className="border-l border-zinc-200 bg-white p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><Users className="size-3.5 text-emerald-700" /> Mustahik Terbantu</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
          {data.summary.beneficiaries.toLocaleString('id-ID')} <span className="text-base">jiwa</span>
        </p>
        <p className="mt-2 text-xs font-semibold text-emerald-700">Terverifikasi pada periode aktif</p>
      </div>

      <div className="border-t border-zinc-200 bg-white p-4 sm:border-l sm:border-t-0 sm:p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><Layers3 className="size-3.5 text-emerald-700" /> Program & Transaksi</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
          {data.summary.activePrograms} <span className="text-base">program</span>
        </p>
        <p className="mt-2 text-xs font-medium text-zinc-500">{data.summary.transactions.toLocaleString('id-ID')} transaksi penyaluran</p>
      </div>

      <div className="border-l border-t border-zinc-200 bg-white p-4 sm:border-t-0 sm:p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><WalletCards className="size-3.5 text-amber-600" /> Rata-rata Bantuan</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
          {formatRupiah(data.summary.averageAssistance)}
        </p>
        <p className="mt-2 text-xs font-medium text-zinc-500">Nilai rata-rata per mustahik</p>
      </div>
    </div>
  );
}
