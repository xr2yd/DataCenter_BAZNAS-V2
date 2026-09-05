import { describe, expect, it } from 'vitest';
import { PENYALURAN_NAV_ITEMS } from './penyaluran-nav';

describe('penyaluran navigation information architecture', () => {
  it('keeps exactly five one-word destinations in the primary navigation', () => {
    expect(PENYALURAN_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Beranda', 'Mustahik', 'Operasional', 'Program', 'Analitik',
    ]);
    expect(PENYALURAN_NAV_ITEMS).toHaveLength(5);
  });

  it('groups secondary operational and analytical destinations into submenus', () => {
    const operational = PENYALURAN_NAV_ITEMS.find((item) => item.id === 'operasional');
    const analytics = PENYALURAN_NAV_ITEMS.find((item) => item.id === 'analitik');
    expect(operational?.children?.map((item) => item.label)).toEqual(['Transaksi', 'Tugas']);
    expect(analytics?.children?.map((item) => item.label)).toEqual(['Peta', 'Laporan', 'Audit']);
  });
});
