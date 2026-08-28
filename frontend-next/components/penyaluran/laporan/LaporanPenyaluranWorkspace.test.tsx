import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LaporanPenyaluranWorkspace } from './LaporanPenyaluranWorkspace';

describe('LaporanPenyaluranWorkspace', () => {
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
});
