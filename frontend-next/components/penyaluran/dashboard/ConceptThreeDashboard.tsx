'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ImpactMetrics } from './ImpactMetrics';
import { ActionRail } from './ActionRail';
import { DashboardPeriodControl } from './DashboardPeriodControl';
import { TrendPanel } from './TrendPanel';
import { AsnafBreakdown } from './AsnafBreakdown';
import { ProgramImpactGrid } from './ProgramImpactGrid';
import { DecisionStudioHero } from './DecisionStudioHero';
import { getDashboardData, type DashboardPeriod } from './dashboard-data';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api/client';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import { ArrowRight, MapPinned } from 'lucide-react';

const RealKecamatanMap = dynamic(
  () => import('../map/RealKecamatanMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
        Memuat Peta Geospasial Tangerang...
      </div>
    ),
  }
);

export function ConceptThreeDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [kecamatanData, setKecamatanData] = useState<PenyaluranByKecamatan[]>([]);
  const data = getDashboardData(period);

  useEffect(() => {
    api.getPenyaluranByKecamatan()
      .then((res) => {
        if (res.data) setKecamatanData(res.data);
      })
      .catch(() => {
        // Fallback to local demo data
      });
  }, []);

  const selectedData = selectedKecamatan
    ? kecamatanData.find(
        (k) => k.name.toLowerCase() === selectedKecamatan.toLowerCase()
      )
    : null;

  const selectedFallback = selectedKecamatan ? data.map[selectedKecamatan] : null;

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 pb-10">
      <DecisionStudioHero data={data} />

      <ImpactMetrics data={data} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(350px,0.85fr)]">
            <TrendPanel data={data} />
            <AsnafBreakdown data={data} />
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900"><MapPinned className="size-4 text-emerald-700" /> Peta Sebaran Penyaluran</div>
                <p className="mt-1 text-sm text-zinc-500">Klik kecamatan untuk membuka konteks mustahik dan program dominannya.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">13 kecamatan terjangkau</span>
            </div>
            <RealKecamatanMap selectedKecamatan={selectedKecamatan} onSelectKecamatan={setSelectedKecamatan} liveData={kecamatanData} periodData={data.map} />
            {selectedKecamatan && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Kecamatan terpilih</p>
                  <h2 className="mt-1 text-lg font-black text-zinc-950">{selectedKecamatan}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{(selectedData?.totalMustahik ?? selectedFallback?.beneficiaries ?? 0).toLocaleString('id-ID')} mustahik · {selectedData?.topProgram ?? selectedFallback?.program ?? 'Tangerang Peduli'}</p>
                </div>
                <Link href={`/penyaluran/mustahik?kecamatan=${encodeURIComponent(selectedKecamatan)}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950">Lihat detail mustahik <ArrowRight className="size-4" /></Link>
              </div>
            )}
          </section>

          <ProgramImpactGrid data={data} />
        </div>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:sticky xl:top-20">
          <ActionRail data={data} />
        </aside>
      </div>
    </div>
  );
}
