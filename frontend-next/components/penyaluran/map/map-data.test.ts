import { describe, expect, it } from 'vitest';
import {
  getKecamatanInsight,
  getKecamatanMapValue,
  getMapMetricPresentation,
  getMapMetricValue,
} from './map-data';

describe('peta metric helpers', () => {
  it('uses API realization for the funds metric', () => {
    expect(
      getKecamatanMapValue('Cipondoh', 'funds', [
        {
          id: 'cipondoh',
          name: 'Cipondoh',
          totalDisalurkan: 2_900_000_000,
          totalMustahik: 1_500,
          desil1Count: 600,
        },
      ]),
    ).toBe(2_900_000_000);
  });

  it('uses fallback beneficiary data when API data is unavailable', () => {
    expect(getKecamatanMapValue('Cipondoh', 'beneficiaries')).toBe(1_480);
  });

  it('returns a known kecamatan insight', () => {
    expect(getKecamatanInsight('Karawaci')).toMatchObject({
      topProgram: 'Tangerang Sehat',
      dominantAsnaf: 'Miskin',
    });
  });

  it('provides a readable legend label for asnaf need', () => {
    expect(getMapMetricPresentation('asnafNeed')).toMatchObject({
      label: 'Kebutuhan asnaf',
      unit: 'KK prioritas',
    });
  });

  it('keeps API values ahead of dashboard period data', () => {
    expect(getMapMetricValue('Cipondoh', 'funds', [{
      id: 'cipondoh', name: 'Cipondoh', totalDisalurkan: 2_900_000_000, totalMustahik: 1_500, desil1Count: 600,
    }], { Cipondoh: { amount: 1_000_000_000, beneficiaries: 500 } })).toBe(2_900_000_000);
  });

  it('uses desil one fallback for the asnaf need metric', () => {
    expect(getKecamatanMapValue('Cipondoh', 'asnafNeed')).toBe(560);
  });
});
