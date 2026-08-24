'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ImpactMetrics } from './ImpactMetrics';
import { ActionRail } from './ActionRail';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api/client';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

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
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [kecamatanData, setKecamatanData] = useState<PenyaluranByKecamatan[]>([]);

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

  return (
    <div className="space-y-6">
      {/* 1. Command Strip Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Ruang Operasional Penyaluran ZIS
          </h1>
          <p className="text-xs text-zinc-500">
            Monitoring penyaluran 13 Kecamatan, antrean berkas mustahik, dan serapan 5 Pilar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/penyaluran/peta"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <Compass className="size-3.5 text-emerald-600" />
            <span>Peta Sebaran GIS</span>
          </Link>

          <Link
            href="/penyaluran/mustahik"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Users className="size-3.5" />
            <span>Data Mustahik</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Executive Metric Strip */}
      <ImpactMetrics />

      {/* 3. Main Workspace: Real Map & Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Map & Subdistrict Detail (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Peta Sebaran Penyaluran 13 Kecamatan
            </h2>
            <span className="text-[11px] text-zinc-500">
              Klik wilayah kecamatan untuk melihat data
            </span>
          </div>

          <RealKecamatanMap
            selectedKecamatan={selectedKecamatan}
            onSelectKecamatan={(name) => setSelectedKecamatan(name)}
            liveData={kecamatanData}
          />

          {/* Subdistrict detail info bar if selected */}
          {selectedKecamatan && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">
                  Kecamatan Terpilih
                </span>
                <h4 className="text-base font-bold text-zinc-900">{selectedKecamatan}</h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Mustahik Terbantu:{' '}
                  <strong className="text-zinc-900">
                    {selectedData?.totalMustahik?.toLocaleString('id-ID') || '840'} Jiwa
                  </strong>{' '}
                  · Program Dominan:{' '}
                  <strong className="text-zinc-900">
                    {selectedData?.topProgram || 'Tangerang Peduli'}
                  </strong>
                </p>
              </div>

              <Link
                href={`/penyaluran/mustahik?kecamatan=${encodeURIComponent(selectedKecamatan)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Mustahik {selectedKecamatan} <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right: Daily Action Queue & Activity (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <ActionRail />

          {/* 5 Pilar Quick Snapshot */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Alokasi 5 Pilar BAZNAS
              </h3>
              <Link href="/penyaluran/program" className="text-[11px] font-semibold text-emerald-700 hover:underline">
                Kelola Pilar
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Tangerang Peduli (Sosial)</span>
                <span className="font-bold font-mono text-zinc-900">Rp 6,8 M (42%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Tangerang Cerdas (Pendidikan)</span>
                <span className="font-bold font-mono text-zinc-900">Rp 4,2 M (26%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Tangerang Sehat (Kesehatan)</span>
                <span className="font-bold font-mono text-zinc-900">Rp 2,9 M (18%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Tangerang Makmur (Ekonomi)</span>
                <span className="font-bold font-mono text-zinc-900">Rp 1,6 M (10%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Tangerang Takwa (Dakwah)</span>
                <span className="font-bold font-mono text-zinc-900">Rp 650 Jt (4%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
