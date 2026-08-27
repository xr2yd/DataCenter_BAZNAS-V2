import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PetaSebaranWorkspace } from './PetaSebaranWorkspace';

vi.mock('next/dynamic', () => ({
  default: () => function RealKecamatanMapMock({ onSelectKecamatan }: { onSelectKecamatan: (name: string) => void }) {
    return <button type="button" onClick={() => onSelectKecamatan('Karawaci')}>Pilih Karawaci</button>;
  },
}));

vi.mock('@/lib/api/client', () => ({
  api: {
    getPenyaluranByKecamatan: () => Promise.reject(new Error('Data API belum tersedia')),
  },
}));

describe('PetaSebaranWorkspace', () => {
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
});
