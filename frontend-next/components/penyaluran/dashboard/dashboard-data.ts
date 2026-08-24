import type { PenyaluranByKecamatan } from '@/lib/api/types';

export type DashboardPeriod = '7d' | '30d' | '1y';

export interface DashboardSnapshot {
  period: DashboardPeriod;
  periodLabel: string;
  metrics: {
    totalPenyaluran: number;
    mustahikCount: number;
    efektivitas: number;
    sisaAlokasi: number;
    trend: number;
  };
  asnaf: Array<{ name: string; amount: number; percentage: number; beneficiaries: number; color: string }>;
  programs: Array<{ name: string; category: string; amount: number; percentage: number; beneficiaries: number; color: string }>;
  kecamatan: PenyaluranByKecamatan[];
  activities: Array<{ id: string; title: string; detail: string; time: string; tone: 'emerald' | 'violet' | 'amber' }>;
  priorities: Array<{ id: string; title: string; program: string; count: number; amount: number; action: string; tone: 'high' | 'medium' | 'low' }>;
}

export const DASHBOARD_PERIODS: Array<{ id: DashboardPeriod; label: string }> = [
  { id: '7d', label: '7 hari' },
  { id: '30d', label: '30 hari' },
  { id: '1y', label: '1 tahun' },
];

const periods: Record<DashboardPeriod, { label: string; multiplier: number; trend: number; effectiveness: number; balance: number }> = {
  '7d': { label: '7 hari terakhir', multiplier: 0.055, trend: 8.7, effectiveness: 91.8, balance: 875000000, },
  '30d': { label: '30 hari terakhir', multiplier: 0.242, trend: 14.6, effectiveness: 93.4, balance: 2160000000, },
  '1y': { label: '1 tahun terakhir', multiplier: 1, trend: 18.7, effectiveness: 94.2, balance: 4250000000, },
};

const asnafDefinitions = [
  ['Fakir', 25, '#008b5a'], ['Miskin', 24, '#20a36b'], ['Amil', 12, '#1f7a8c'], ['Mualaf', 8, '#7663d8'],
  ['Riqab', 5, '#a855f7'], ['Gharim', 7, '#e68a00'], ['Fisabilillah', 13, '#0d9488'], ['Ibnu Sabil', 6, '#e05d4d'],
] as const;

const programDefinitions = [
  ['Tangerang Peduli', 'Sosial kemanusiaan', 32, '#008b5a'], ['Tangerang Cerdas', 'Pendidikan', 24, '#287fe6'],
  ['Tangerang Sehat', 'Kesehatan', 20, '#e87917'], ['Tangerang Makmur', 'Pemberdayaan ekonomi', 15, '#8756d8'],
  ['Tangerang Takwa', 'Dakwah & advokasi', 9, '#e74c3c'],
] as const;

const kecamatanDefinitions = [
  ['Batuceper', 6, 'Tangerang Peduli'], ['Benda', 4, 'Tangerang Cerdas'], ['Cibodas', 7, 'Tangerang Sehat'],
  ['Ciledug', 10, 'Tangerang Makmur'], ['Cipondoh', 12, 'Tangerang Peduli'], ['Jatiuwung', 6, 'Tangerang Makmur'],
  ['Karangtengah', 7, 'Tangerang Cerdas'], ['Karawaci', 11, 'Tangerang Sehat'], ['Larangan', 7, 'Tangerang Peduli'],
  ['Neglasari', 7, 'Tangerang Peduli'], ['Periuk', 6, 'Tangerang Cerdas'], ['Pinang', 9, 'Tangerang Makmur'], ['Tangerang', 8, 'Tangerang Peduli'],
] as const;

const rupiah = (value: number, multiplier: number) => Math.round(value * multiplier / 1000) * 1000;
const count = (value: number, multiplier: number) => Math.max(1, Math.round(value * multiplier));

export function getDashboardSnapshot(period: DashboardPeriod): DashboardSnapshot {
  const selected = periods[period];
  const totalPenyaluran = rupiah(18_450_000_000, selected.multiplier);
  const mustahikCount = count(12_450, selected.multiplier);

  return {
    period,
    periodLabel: selected.label,
    metrics: {
      totalPenyaluran,
      mustahikCount,
      efektivitas: selected.effectiveness,
      sisaAlokasi: selected.balance,
      trend: selected.trend,
    },
    asnaf: asnafDefinitions.map(([name, percentage, color]) => ({
      name, percentage, color,
      amount: rupiah(totalPenyaluran * percentage / 100, 1),
      beneficiaries: count(mustahikCount * percentage / 100, 1),
    })),
    programs: programDefinitions.map(([name, category, percentage, color]) => ({
      name, category, percentage, color,
      amount: rupiah(totalPenyaluran * percentage / 100, 1),
      beneficiaries: count(mustahikCount * percentage / 100, 1),
    })),
    kecamatan: kecamatanDefinitions.map(([name, weight, topProgram]) => ({
      id: name.toLowerCase(),
      name,
      totalMustahik: count(12_450 * weight / 100, selected.multiplier),
      totalDisalurkan: rupiah(18_450_000_000 * weight / 100, selected.multiplier),
      desil1Count: count(4_680 * weight / 100, selected.multiplier),
      topProgram,
      urgencyLevel: weight >= 10 ? 'Tinggi' : weight >= 7 ? 'Sedang' : 'Rendah',
      demo: true,
    })),
    activities: [
      { id: 'approval', title: 'Verifikasi disetujui', detail: `${count(42, selected.multiplier)} pengajuan bantuan pendidikan`, time: period === '7d' ? '38 menit lalu' : 'Hari ini', tone: 'emerald' },
      { id: 'survey', title: 'Survey lapangan selesai', detail: `${count(31, selected.multiplier)} keluarga di Kecamatan Cipondoh`, time: period === '7d' ? '2 jam lalu' : 'Kemarin', tone: 'violet' },
      { id: 'payment', title: 'PPD dicairkan', detail: `Rp ${Math.round(totalPenyaluran * 0.084 / 1_000_000).toLocaleString('id-ID')} Jt kepada ${count(68, selected.multiplier)} mustahik`, time: period === '7d' ? '4 jam lalu' : '2 hari lalu', tone: 'amber' },
      { id: 'received', title: 'Penyaluran diterima', detail: `${count(54, selected.multiplier)} penerima mengonfirmasi bantuan`, time: period === '7d' ? '6 jam lalu' : '3 hari lalu', tone: 'emerald' },
    ],
    priorities: [
      { id: 'verification', title: 'Verifikasi pengajuan baru', program: 'Tangerang Cerdas', count: count(14, selected.multiplier), amount: rupiah(totalPenyaluran * 0.031, 1), action: 'Verifikasi', tone: 'high' },
      { id: 'survey', title: 'Tindak lanjut survey lapangan', program: 'Tangerang Peduli', count: count(8, selected.multiplier), amount: rupiah(totalPenyaluran * 0.022, 1), action: 'Atur survey', tone: 'medium' },
      { id: 'payment', title: 'Pencairan PPD tertunda', program: 'Tangerang Makmur', count: count(5, selected.multiplier), amount: rupiah(totalPenyaluran * 0.017, 1), action: 'Proses PPD', tone: 'low' },
    ],
  };
}
