import { describe, expect, it } from 'vitest';

import { REPORT_KPIS, REPORT_RECORDS } from './laporan-data';

describe('laporan report library demo data', () => {
  it('provides five monthly report records for the active library', () => {
    expect(REPORT_RECORDS).toHaveLength(5);
    expect(REPORT_RECORDS.every((report) => report.period === 'Agustus 2026')).toBe(true);
  });

  it('provides four summary KPIs for the active month', () => {
    expect(REPORT_KPIS).toHaveLength(4);
    expect(REPORT_KPIS.map((kpi) => kpi.label)).toEqual([
      'Dana tersalurkan',
      'Mustahik terbantu',
      'Program aktif',
      'Kecamatan terjangkau',
    ]);
  });
});
