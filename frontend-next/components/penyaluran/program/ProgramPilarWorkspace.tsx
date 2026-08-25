'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Store,
  Heart,
  Landmark,
  Shield,
  Check,
  Briefcase,
  Plus,
} from 'lucide-react';
import {
  TOP_PILAR_LIST,
  PILAR_DETAILS_MAP,
  type PilarSummary,
} from './program-data';
import { PilarValueChain } from './PilarValueChain';
import { PilarImpactMetrics } from './PilarImpactMetrics';
import { PilarTrendProjection } from './PilarTrendProjection';
import { PilarAnalyticsRow } from './PilarAnalyticsRow';
import { PilarInitiativesTable } from './PilarInitiativesTable';

const PILAR_ICON_MAP = {
  education: GraduationCap,
  economy: Store,
  health: Heart,
  faith: Landmark,
  social: Shield,
};

export function ProgramPilarWorkspace() {
  const [selectedPilarId, setSelectedPilarId] = useState('sehat');

  const selectedPilarSummary =
    TOP_PILAR_LIST.find((p) => p.id === selectedPilarId) || TOP_PILAR_LIST[2]!;

  const detailedData =
    PILAR_DETAILS_MAP[selectedPilarId] || PILAR_DETAILS_MAP['sehat']!;

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Lima pilar, satu dampak untuk Kota Tangerang.
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Dari anggaran menjadi perubahan nyata bagi mustahik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-zinc-700">Data terkini</span>
            <span>· 25 Agustus 2026 - 10:15 WIB</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <Briefcase className="size-4" />
            <span>Kelola Portofolio</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 Pilar Interactive Cards (5 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {TOP_PILAR_LIST.map((pilar) => {
          const isSelected = selectedPilarId === pilar.id;
          const Icon = PILAR_ICON_MAP[pilar.iconType] || Heart;

          // Generate simple SVG sparkline points
          const min = Math.min(...pilar.sparkline);
          const max = Math.max(...pilar.sparkline);
          const points = pilar.sparkline
            .map((val, i) => {
              const x = (i / (pilar.sparkline.length - 1)) * 100;
              const y = 30 - ((val - min) / (max - min || 1)) * 25;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <button
              key={pilar.id}
              onClick={() => setSelectedPilarId(pilar.id)}
              className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-md'
                  : 'border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="size-3 stroke-[3]" />
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="size-9 rounded-xl flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: pilar.color }}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 pr-6">
                  <h3 className="text-xs font-bold text-zinc-900 truncate">
                    {pilar.name}
                  </h3>
                </div>
              </div>

              {/* Amount & Percent */}
              <div>
                <p className="text-lg font-black font-mono text-zinc-900 tracking-tight">
                  {pilar.budgetFormatted}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-bold text-emerald-700">
                    {pilar.percentage}% dari target
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {pilar.beneficiariesFormatted}
                </p>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="w-full h-8 mt-2 pt-1 border-t border-zinc-100">
                <svg viewBox="0 0 100 32" className="size-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke={pilar.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {pilar.sparkline.map((val, i) => {
                    const x = (i / (pilar.sparkline.length - 1)) * 100;
                    const y = 30 - ((val - min) / (max - min || 1)) * 25;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="1.8"
                        fill={pilar.color}
                      />
                    );
                  })}
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Mid-Section (2 Columns): Value Chain & Trend + Impact Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols on XL): Value Chain & Trend Projection */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <PilarValueChain
            pilarName={selectedPilarSummary.name}
            steps={detailedData.valueChain}
          />

          <PilarTrendProjection
            trends={detailedData.monthlyTrends}
            projection={detailedData.projection}
          />
        </div>

        {/* Right Column (5 cols on XL): Dampak Utama 6 Metrics */}
        <div className="lg:col-span-5 xl:col-span-5">
          <PilarImpactMetrics
            pilarName={selectedPilarSummary.name}
            metrics={detailedData.impactMetrics}
          />
        </div>
      </div>

      {/* 4. Intermediate Section: Funnel, Asnaf Donut, Top Kecamatan, & Realization */}
      <PilarAnalyticsRow
        funnels={detailedData.funnelOutcome}
        asnaf={detailedData.asnafComposition}
        topKecamatan={detailedData.topKecamatan}
        targetVsRealization={detailedData.targetVsRealization}
        timeline={detailedData.timelineMilestones}
      />

      {/* 5. Bottom Section: Inisiatif Aktif Table & Rekomendasi Prioritas */}
      <PilarInitiativesTable
        pilarName={selectedPilarSummary.name}
        initiatives={detailedData.initiatives}
        recommendations={detailedData.recommendations}
      />
    </div>
  );
}
