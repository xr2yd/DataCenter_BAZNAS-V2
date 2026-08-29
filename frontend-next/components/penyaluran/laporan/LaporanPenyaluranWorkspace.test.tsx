import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LaporanPenyaluranWorkspace } from './LaporanPenyaluranWorkspace';

describe('LaporanPenyaluranWorkspace', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the library before a balanced insight grid', () => {
    render(<LaporanPenyaluranWorkspace />);

    expect(screen.getByRole('heading', { name: 'Library laporan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alokasi 5 pilar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Komposisi asnaf' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kesiapan laporan' })).toBeInTheDocument();
    expect(screen.getByLabelText('Insight laporan')).toBeInTheDocument();
  });

  it('shows the matching per asnaf report after its category is selected', () => {
    render(<LaporanPenyaluranWorkspace />);

    fireEvent.click(screen.getByRole('button', { name: /^per asnaf/i }));

    expect(screen.getByRole('heading', { name: 'Distribusi Penyaluran per Asnaf' })).toBeInTheDocument();
    expect(screen.queryByText('Rekapitulasi Penyaluran ZIS')).not.toBeInTheDocument();
  });

  it('filters the archive with the report search field', () => {
    render(<LaporanPenyaluranWorkspace />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari arsip laporan' }), { target: { value: 'LPJ' } });

    expect(screen.getByRole('heading', { name: 'LPJ Penyaluran & Kelengkapan Dokumen' })).toBeInTheDocument();
    expect(screen.queryByText('Rekapitulasi Penyaluran ZIS')).not.toBeInTheDocument();
  });

  it('confirms that a PDF export is ready for backend processing', () => {
    render(<LaporanPenyaluranWorkspace />);

    fireEvent.click(screen.getByRole('button', { name: 'Siapkan PDF: Rekapitulasi Penyaluran ZIS' }));

    expect(screen.getByRole('status')).toHaveTextContent('PDF untuk Rekapitulasi Penyaluran ZIS siap diproses');
  });

  it('auto-dismisses and allows dismissing feedback toast actions', () => {
    vi.useFakeTimers();
    render(<LaporanPenyaluranWorkspace />);

    fireEvent.click(screen.getByRole('button', { name: 'Buat laporan' }));
    expect(screen.getByRole('status')).toHaveTextContent('Draft laporan baru siap disusun');

    fireEvent.click(screen.getByRole('button', { name: 'Tutup notifikasi' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole('button', { name: 'Buat laporan' }));
    act(() => {
      vi.advanceTimersByTime(3200);
    });

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
