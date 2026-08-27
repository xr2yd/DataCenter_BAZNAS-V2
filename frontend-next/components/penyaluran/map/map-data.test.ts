import { describe, expect, it } from 'vitest';
import { getKecamatanInsight, getKecamatanMapValue } from './map-data';

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
});
