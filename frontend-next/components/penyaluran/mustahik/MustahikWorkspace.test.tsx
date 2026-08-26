import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MustahikWorkspace } from './MustahikWorkspace';
import { resolveMustahikCenter, TANGERANG_CENTER } from './MustahikLocationMap';

vi.mock('@/lib/api/client', () => ({
  api: {
    getMustahikList: vi.fn().mockRejectedValue(new Error('offline')),
  },
}));

describe('MustahikWorkspace', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses a master-detail workspace and updates the profile when an applicant is selected', async () => {
    render(<MustahikWorkspace />);

    expect(await screen.findByRole('heading', { name: 'Data Mustahik' })).toBeInTheDocument();
    expect(screen.getByText('Antrean verifikasi')).toBeInTheDocument();
    expect(screen.getByText('Profil & kelayakan')).toBeInTheDocument();
    expect(screen.getByText('Keputusan siap ditinjau')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /pilih ahmad fauzi/i }));

    expect(screen.getByRole('heading', { name: 'Ahmad Fauzi' })).toBeInTheDocument();
    expect(screen.getByText('Tangerang Peduli')).toBeInTheDocument();
  });

  it('filters the queue by workflow stage', async () => {
    render(<MustahikWorkspace />);
    await screen.findByText('Antrean verifikasi');

    fireEvent.click(screen.getByRole('button', { name: /pilih ahmad fauzi/i }));
    fireEvent.click(screen.getByRole('button', { name: /survey 8/i }));

    expect(screen.getByRole('button', { name: /pilih siti maryam/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pilih ahmad fauzi/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Siti Maryam' })).toBeInTheDocument();
  });

  it('shows an actionable empty state when search has no match', async () => {
    render(<MustahikWorkspace />);
    const search = await screen.findByPlaceholderText('Cari nama, NIK, atau no. pengajuan…');

    fireEvent.change(search, { target: { value: 'tidak-ada-orang-ini' } });

    await waitFor(() => expect(screen.getByText('Data tidak ditemukan')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Hapus pencarian' })).toBeInTheDocument();
  });

  it('shows the score as one centered value and a real location map', async () => {
    render(<MustahikWorkspace />);

    expect(await screen.findByLabelText('Skor kelayakan 86 dari 100')).toHaveTextContent('86/100');
    expect(screen.getByRole('region', { name: 'Peta lokasi Siti Maryam' })).toBeInTheDocument();
  });

  it('groups secondary profile information into accessible tabs', async () => {
    render(<MustahikWorkspace />);
    await screen.findByRole('heading', { name: 'Siti Maryam' });

    expect(screen.getByRole('tab', { name: 'Ringkasan' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Dokumen' }));

    expect(screen.getByRole('region', { name: 'Dokumen Mustahik' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kartu keluarga.*belum ada/i })).toBeInTheDocument();
  });

  it('opens and closes the responsive decision drawer', async () => {
    render(<MustahikWorkspace />);
    await screen.findByRole('heading', { name: 'Siti Maryam' });

    fireEvent.click(screen.getByRole('button', { name: 'Buka panel keputusan' }));
    expect(screen.getByRole('dialog', { name: 'Keputusan Mustahik' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tutup panel keputusan' }));
    expect(screen.queryByRole('dialog', { name: 'Keputusan Mustahik' })).not.toBeInTheDocument();
  });

  it('uses Tangerang as a safe fallback when a subdistrict has no coordinate', () => {
    expect(resolveMustahikCenter('Kecamatan Tidak Ada')).toEqual(TANGERANG_CENTER);
  });

  it('keeps the workspace focused by moving desktop decisions into the drawer', async () => {
    render(<MustahikWorkspace />);

    expect(await screen.findByRole('heading', { name: 'Siti Maryam' })).toBeInTheDocument();
    expect(screen.getAllByRole('complementary')).toHaveLength(1);
    expect(screen.getByText('Keputusan siap ditinjau')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Buka panel keputusan' }));
    expect(screen.getByRole('dialog', { name: 'Keputusan Mustahik' })).toBeInTheDocument();
  });
});
