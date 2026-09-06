import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PetaSebaranWorkspace } from './PetaSebaranWorkspace';

const getPenyaluranByKecamatan = vi.hoisted(() => vi.fn());

vi.mock('next/dynamic', () => ({
  default: () => function RealKecamatanMapMock({ onSelectKecamatan, mapboxAccessToken }: { onSelectKecamatan: (name: string) => void; mapboxAccessToken?: string }) {
    return <button type="button" data-mapbox-token={mapboxAccessToken} onClick={() => onSelectKecamatan('Karawaci')}>Pilih Karawaci</button>;
  },
}));

vi.mock('@/lib/api/client', () => ({
  api: {
    getPenyaluranByKecamatan,
  },
}));

describe('PetaSebaranWorkspace', () => {
  it('forwards the server-provided public Mapbox token to the map renderer', () => {
    render(<PetaSebaranWorkspace mapboxAccessToken="public-mapbox-token" />);

    expect(screen.getByRole('button', { name: 'Pilih Karawaci' })).toHaveAttribute('data-mapbox-token', 'public-mapbox-token');
  });

  beforeEach(() => {
    getPenyaluranByKecamatan.mockReset();
    getPenyaluranByKecamatan.mockRejectedValue(new Error('Data API belum tersedia'));
  });

  it('updates selected detail after selecting a map area', async () => {
    render(<PetaSebaranWorkspace />);

    fireEvent.click(await screen.findByRole('button', { name: 'Pilih Karawaci' }));

    expect(screen.getByRole('heading', { name: 'Karawaci' })).toBeInTheDocument();
    expect(screen.getAllByText('Tangerang Sehat')).not.toHaveLength(0);
  });

  it('changes metric wording to jumlah mustahik', async () => {
    render(<PetaSebaranWorkspace />);

    fireEvent.click(await screen.findByRole('button', { name: 'Jumlah mustahik' }));

    expect(screen.getAllByText('Mustahik terbantu')).not.toHaveLength(0);
  });

  it('does not present a program filter before filtering is available', async () => {
    render(<PetaSebaranWorkspace />);

    await screen.findByRole('button', { name: 'Realisasi dana' });

    expect(screen.queryByRole('button', { name: 'Semua program' })).not.toBeInTheDocument();
  });

  it('uses the current API top program in the selected area detail', async () => {
    getPenyaluranByKecamatan.mockResolvedValue({
      data: [{
        id: 'cipondoh', name: 'Cipondoh', totalDisalurkan: 2_900_000_000,
        totalMustahik: 1_500, desil1Count: 600, topProgram: 'Program API Terkini',
      }],
    });

    render(<PetaSebaranWorkspace />);

    const detail = await screen.findByLabelText('Detail wilayah terpilih');
    expect(within(detail).getByText('Program API Terkini')).toBeInTheDocument();
  });
});
