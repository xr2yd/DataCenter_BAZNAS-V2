'use client';

import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar, CheckCircle2 } from 'lucide-react';

export function LaporanPenyaluranWorkspace() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [period, setPeriod] = useState('2026-08');

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Laporan & Ekspor Penyaluran ZIS
          </h1>
          <p className="text-xs text-zinc-500">
            Ekspor rekapitulasi mustahik, realisasi 5 pilar, audit LPJ, dan arsip pertanggungjawaban
          </p>
        </div>
      </div>

      {/* 2. Export Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="size-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Rekapitulasi Penyaluran Bulanan</h2>
              <p className="text-[11px] text-zinc-500">Format resmi LPJ BAZNAS Kota Tangerang</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">Periode Laporan</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">Pilih Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                    selectedFormat === 'pdf'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Dokumen PDF Resmi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('excel')}
                  className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                    selectedFormat === 'excel'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Spreadsheet Excel
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Download className="size-4" />
            <span>Unduh Laporan ({selectedFormat.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
