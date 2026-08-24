import React from 'react';
import { TrendingUp, Users, HeartHandshake, ShieldCheck, Wallet } from 'lucide-react';

export function ImpactMetrics({
  totalPenyaluran = 18450000000,
  mustahikCount = 12450,
  efektivitas = 94.2,
  sisaAlokasi = 4250000000,
  periodLabel = '1 tahun terakhir',
  trend = 12.4,
}: {
  totalPenyaluran?: number;
  mustahikCount?: number;
  efektivitas?: number;
  sisaAlokasi?: number;
  periodLabel?: string;
  trend?: number;
}) {
  const formatRupiah = (num: number) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} M`;
    }
    return `Rp ${(num / 1000000).toFixed(0)} Jt`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200">
      <div className="bg-white p-4 space-y-1">
        <p className="text-[11px] font-medium text-zinc-500">Total Penyaluran · {periodLabel}</p>
        <p className="text-xl font-bold font-mono tracking-tight text-zinc-900">
          {formatRupiah(totalPenyaluran)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
          <TrendingUp className="size-3" /> +{trend.toLocaleString('id-ID')}% vs periode sebelumnya
        </div>
      </div>

      <div className="bg-white p-4 space-y-1">
        <p className="text-[11px] font-medium text-zinc-500">Jiwa Mustahik Terbantu</p>
        <p className="text-xl font-bold font-mono tracking-tight text-zinc-900">
          {mustahikCount.toLocaleString('id-ID')}
        </p>
        <p className="text-[10px] text-emerald-700 font-medium">Penyaluran tercatat pada periode ini</p>
      </div>

      <div className="bg-white p-4 space-y-1">
        <p className="text-[11px] font-medium text-zinc-500">Efektivitas Penyaluran</p>
        <p className="text-xl font-bold font-mono tracking-tight text-emerald-700">
          {efektivitas}%
        </p>
        <p className="text-[10px] text-zinc-500">Standar Nasional &gt;90%</p>
      </div>

      <div className="bg-white p-4 space-y-1">
        <p className="text-[11px] font-medium text-zinc-500">Alokasi Siap Salur (Kas)</p>
        <p className="text-xl font-bold font-mono tracking-tight text-amber-700">
          {formatRupiah(sisaAlokasi)}
        </p>
        <p className="text-[10px] text-zinc-500">Kesiapan Dana Program</p>
      </div>
    </div>
  );
}
