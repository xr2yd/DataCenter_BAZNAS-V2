import { describe, expect, it } from 'vitest';
import { getDashboardSnapshot } from './dashboard-data';

describe('getDashboardSnapshot', () => {
  it('returns a complete dummy dashboard snapshot for each supported period', () => {
    const snapshot = getDashboardSnapshot('7d');

    expect(snapshot.periodLabel).toBe('7 hari terakhir');
    expect(snapshot.metrics.totalPenyaluran).toBeGreaterThan(0);
    expect(snapshot.asnaf).toHaveLength(8);
    expect(snapshot.programs).toHaveLength(5);
    expect(snapshot.kecamatan).toHaveLength(13);
    expect(snapshot.activities.length).toBeGreaterThan(0);
    expect(snapshot.priorities.length).toBeGreaterThan(0);
  });

  it('changes the distribution values when the selected period changes', () => {
    const week = getDashboardSnapshot('7d');
    const year = getDashboardSnapshot('1y');

    expect(year.metrics.totalPenyaluran).toBeGreaterThan(week.metrics.totalPenyaluran);
    expect(year.kecamatan.find((item) => item.name === 'Cibodas')?.totalDisalurkan)
      .toBeGreaterThan(week.kecamatan.find((item) => item.name === 'Cibodas')?.totalDisalurkan ?? 0);
  });
});
