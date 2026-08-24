'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api/client';
import type { Mustahik } from '@/lib/api/types';
import { StatusBadge } from '../StatusBadge';
import {
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  MapPin,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'all', label: 'Semua Kasus', stepNum: '★' },
  { id: 'diajukan', label: '1. Pengajuan Masuk', stepNum: '1', statusMatch: 'Diajukan' },
  { id: 'verifikasi', label: '2. Verifikasi Syarat', stepNum: '2', statusMatch: 'Verifikasi Administrasi' },
  { id: 'survey', label: '3. Survey Lapangan', stepNum: '3', statusMatch: 'Survey' },
  { id: 'mpzis', label: '4. Sidang MPZIS', stepNum: '4', statusMatch: 'Persetujuan MPZIS' },
  { id: 'ppd', label: '5. Pencairan PPD', stepNum: '5', statusMatch: 'Pengajuan Dana (PPD)' },
  { id: 'selesai', label: '✓ Tersalurkan', stepNum: '6', statusMatch: 'Penyaluran Selesai' },
];

export function MustahikWorkspace() {
  const [mustahikList, setMustahikList] = useState<Mustahik[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMustahik, setSelectedMustahik] = useState<Mustahik | null>(null);

  useEffect(() => {
    api.getMustahikList()
      .then((res) => {
        if (res.data) setMustahikList(res.data);
      })
      .catch(() => {
        // Fallback sample data if local backend is offline during dev
        setMustahikList([
          {
            id: 1,
            file_no: 'BZN-2026-0089',
            name: 'Ahmad Fauzi',
            nik: '3671011508820003',
            phone: '081298765432',
            address: 'Jl. KH Hasyim Ashari No. 12, Buaran Indah',
            subdistrict: 'Cipondoh',
            village: 'Buaran Indah',
            asnaf: 'Fakir / Miskin',
            program: 'Tangerang Peduli',
            status: 'Verifikasi Administrasi',
            recommended_amount: 3500000,
            approved_amount: 3500000,
            received_date: '2026-08-20',
          },
          {
            id: 2,
            file_no: 'BZN-2026-0090',
            name: 'Siti Maryam',
            nik: '3671025409890001',
            phone: '081387654321',
            address: 'Kp. Cikokol RT 03/RW 02',
            subdistrict: 'Tangerang',
            village: 'Cikokol',
            asnaf: 'Fakir / Miskin',
            program: 'Tangerang Cerdas',
            status: 'Survey',
            recommended_amount: 2500000,
            approved_amount: 2500000,
            received_date: '2026-08-21',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredList = useMemo(() => {
    return mustahikList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery) ||
        (item.file_no && item.file_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subdistrict && item.subdistrict.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeTab === 'all') return true;
      if (activeTab === 'ppd') {
        return item.status === 'Pengajuan Dana (FPD)' || item.status === 'Pengajuan Dana (PPD)';
      }
      const step = PIPELINE_STEPS.find((s) => s.id === activeTab);
      return step ? item.status === step.statusMatch : true;
    });
  }, [mustahikList, searchQuery, activeTab]);

  const formatRupiah = (val?: number) => {
    if (!val) return 'Rp 0';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Manajemen Berkas & Data Mustahik
          </h1>
          <p className="text-xs text-zinc-500">
            Database master mustahik, verifikasi persyaratan, alur survey, dan riwayat bantuan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="size-3.5 text-zinc-500" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Tambah Mustahik</span>
          </button>
        </div>
      </div>

      {/* 2. Linear-Style Segmented Pipeline */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-zinc-100/80 border border-zinc-200/80 rounded-xl no-scrollbar">
        {PIPELINE_STEPS.map((step) => {
          const isActive = activeTab === step.id;
          const count =
            step.id === 'all'
              ? mustahikList.length
              : step.id === 'ppd'
              ? mustahikList.filter((m) => m.status === 'Pengajuan Dana (FPD)' || m.status === 'Pengajuan Dana (PPD)').length
              : mustahikList.filter((m) => m.status === step.statusMatch).length;

          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-zinc-900 shadow-2xs font-bold border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'
              }`}
            >
              <span className={`size-4.5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-300 text-zinc-600'}`}>
                {step.stepNum}
              </span>
              <span>{step.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-zinc-200/60 text-zinc-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari NIK, Nama Mustahik, No. Berkas, atau Kecamatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* 4. High-Density Master Ledger Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">No. Berkas & NIK</th>
                <th className="px-4 py-3">Nama Mustahik</th>
                <th className="px-4 py-3">Wilayah (Kecamatan)</th>
                <th className="px-4 py-3">Program & Asnaf</th>
                <th className="px-4 py-3 text-right">Nominal Bantuan</th>
                <th className="px-4 py-3">Tahap / Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Memuat data mustahik...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Tidak ada data mustahik yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedMustahik(item)}
                    className="hover:bg-zinc-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-zinc-900">{item.file_no || `BZN-${item.id}`}</p>
                      <p className="font-mono text-[10px] text-zinc-400">{item.nik}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900">{item.name}</p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Phone className="size-3 text-zinc-400" /> {item.phone || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{item.subdistrict || 'Kota Tangerang'}</p>
                      <p className="text-[10px] text-zinc-400">{item.village || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-emerald-700">{item.program || 'Tangerang Peduli'}</p>
                      <p className="text-[10px] text-zinc-400">{item.asnaf || 'Fakir / Miskin'}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                      {formatRupiah(item.approved_amount || item.recommended_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} priority={item.priority} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMustahik(item);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      >
                        Detail <ChevronRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
