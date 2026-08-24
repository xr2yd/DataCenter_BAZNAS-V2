import type { PenyaluranByKecamatan } from '@/lib/api/types';

export const DEMO_KECAMATAN_DATA: Record<string, Partial<PenyaluranByKecamatan>> = {
  Batuceper: { totalMustahik: 840, totalDisalurkan: 1250000000, desil1Count: 310, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Peduli' },
  Benda: { totalMustahik: 620, totalDisalurkan: 890000000, desil1Count: 240, urgencyLevel: 'Sedang', topProgram: 'Tangerang Cerdas' },
  Cibodas: { totalMustahik: 1120, totalDisalurkan: 1840000000, desil1Count: 420, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Sehat' },
  Ciledug: { totalMustahik: 1350, totalDisalurkan: 2100000000, desil1Count: 510, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Makmur' },
  Cipondoh: { totalMustahik: 1480, totalDisalurkan: 2450000000, desil1Count: 560, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Peduli' },
  Jatiuwung: { totalMustahik: 780, totalDisalurkan: 1150000000, desil1Count: 290, urgencyLevel: 'Sedang', topProgram: 'Tangerang Makmur' },
  Karangtengah: { totalMustahik: 920, totalDisalurkan: 1420000000, desil1Count: 340, urgencyLevel: 'Sedang', topProgram: 'Tangerang Cerdas' },
  Karawaci: { totalMustahik: 1290, totalDisalurkan: 1980000000, desil1Count: 470, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Sehat' },
  Larangan: { totalMustahik: 810, totalDisalurkan: 1210000000, desil1Count: 280, urgencyLevel: 'Sedang', topProgram: 'Tangerang Peduli' },
  Neglasari: { totalMustahik: 950, totalDisalurkan: 1380000000, desil1Count: 380, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Peduli' },
  Periuk: { totalMustahik: 890, totalDisalurkan: 1310000000, desil1Count: 320, urgencyLevel: 'Sedang', topProgram: 'Tangerang Cerdas' },
  Pinang: { totalMustahik: 1050, totalDisalurkan: 1620000000, desil1Count: 390, urgencyLevel: 'Sedang', topProgram: 'Tangerang Makmur' },
  Tangerang: { totalMustahik: 1240, totalDisalurkan: 1950000000, desil1Count: 450, urgencyLevel: 'Tinggi', topProgram: 'Tangerang Peduli' },
};

export function getChoroplethColor(count: number): string {
  if (count > 1200) return '#00663d'; // Deep Emerald
  if (count > 900) return '#008B5A';  // Primary BAZNAS Emerald
  if (count > 700) return '#10b981';  // Light Emerald
  if (count > 500) return '#6ee7b7';  // Mint Emerald
  return '#a7f3d0';                   // Soft Tint
}
