'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import { DEMO_KECAMATAN_DATA } from '../map/map-data';
import { Compass, MapPin, Users, ArrowRight, ShieldCheck, Download } from 'lucide-react';

const RealKecamatanMap = dynamic(
  () => import('../map/RealKecamatanMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
        Memuat Peta Geospasial Tangerang...
      </div>
    ),
  }
);

export function PetaSebaranWorkspace() {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>('Cipondoh');
  const [kecamatanList, setKecamatanList] = useState<PenyaluranByKecamatan[]>([]);

  useEffect(() => {
    api.getPenyaluranByKecamatan()
      .then((res) => {
        if (res.data) setKecamatanList(res.data);
      })
      .catch(() => {});
  }, []);

  const currentData = selectedKecamatan
    ? kecamatanList.find((k) => k.name.toLowerCase() === selectedKecamatan.toLowerCase()) ||
      DEMO_KECAMATAN_DATA[selectedKecamatan] || {
        totalMustahik: 800,
        totalDisalurkan: 1200000000,
        desil1Count: 300,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Peta Sebaran & GIS Penyaluran 13 Kecamatan
          </h1>
          <p className="text-xs text-zinc-500">
            Sebaran spasial mustahik, rasio kemiskinan Desil 1 BPS, dan alokasi 104 Kelurahan se-Kota Tangerang
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <Download className="size-3.5 text-zinc-500" />
          <span>Ekspor Peta GIS</span>
        </button>
      </div>

      {/* 2. Map & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <RealKecamatanMap
            selectedKecamatan={selectedKecamatan}
            onSelectKecamatan={(name) => setSelectedKecamatan(name)}
            liveData={kecamatanList}
          />
        </div>

        {/* Subdistrict Detail Card */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Profil Geospasial
            </span>
            <h2 className="text-base font-bold text-zinc-900">
              Kecamatan {selectedKecamatan || 'Kota Tangerang'}
            </h2>
            <p className="text-xs text-zinc-500">104 Kelurahan terintegrasi</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600">Mustahik Terbantu</span>
              <span className="font-bold font-mono text-zinc-900">
                {currentData?.totalMustahik?.toLocaleString('id-ID')} Jiwa
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600">Realisasi Disalurkan</span>
              <span className="font-bold font-mono text-emerald-700">
                Rp {((currentData?.totalDisalurkan || 1200000000) / 1000000000).toFixed(2)} M
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600">Target Kemiskinan Desil 1</span>
              <span className="font-bold font-mono text-zinc-900">
                {currentData?.desil1Count || 340} KK
              </span>
            </div>
          </div>

          <Link
            href={`/penyaluran/mustahik?kecamatan=${encodeURIComponent(selectedKecamatan || '')}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <span>Buka Data Mustahik {selectedKecamatan}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
