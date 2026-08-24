'use client';

import type { DashboardPeriod } from './dashboard-data';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '1y', label: '1 Tahun' },
];

export function DashboardPeriodControl({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm" aria-label="Pilih rentang waktu data">
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
