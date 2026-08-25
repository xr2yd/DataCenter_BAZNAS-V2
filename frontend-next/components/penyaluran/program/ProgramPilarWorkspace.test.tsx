import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ProgramPilarWorkspace } from './ProgramPilarWorkspace';

describe('ProgramPilarWorkspace', () => {
  it('menjelaskan tujuan workspace Program 5 Pilar sejak awal', () => {
    render(<ProgramPilarWorkspace />);

    expect(
      screen.getByRole('heading', { level: 1, name: /workspace program 5 pilar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pilih pilar untuk melihat capaian, prioritas, dan portofolio program/i),
    ).toBeInTheDocument();
  });

  it('menyajikan kelima pilar sebagai navigasi tab dengan status aktif yang jelas', () => {
    render(<ProgramPilarWorkspace />);

    const navigation = screen.getByRole('tablist', { name: /navigasi program 5 pilar/i });
    const tabs = within(navigation).getAllByRole('tab');

    expect(tabs).toHaveLength(5);
    expect(within(navigation).getByRole('tab', { name: /Tangerang Cerdas/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(within(navigation).getByRole('tab', { name: /Tangerang Makmur/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(within(navigation).getByRole('tab', { name: /Tangerang Sehat/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(navigation).getByRole('tab', { name: /Tangerang Takwa/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(within(navigation).getByRole('tab', { name: /Tangerang Peduli/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('memperbarui ringkasan detail ketika pengguna memilih pilar lain', () => {
    render(<ProgramPilarWorkspace />);

    const sehatTab = screen.getByRole('tab', { name: /Tangerang Sehat/i });
    const cerdasTab = screen.getByRole('tab', { name: /Tangerang Cerdas/i });

    expect(sehatTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Pasien Mustahik Dilayani')).toBeInTheDocument();

    fireEvent.click(cerdasTab);

    expect(cerdasTab).toHaveAttribute('aria-selected', 'true');
    expect(sehatTab).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('heading', { name: /Dari Anggaran ke Dampak Sosial — Tangerang Cerdas/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Siswa / Mahasiswa Terbantu')).toBeInTheDocument();
    expect(screen.queryByText('Pasien Mustahik Dilayani')).not.toBeInTheDocument();
  });

  it('memindahkan pilar aktif dengan tombol panah keyboard', () => {
    render(<ProgramPilarWorkspace />);

    const sehatTab = screen.getByRole('tab', { name: /Tangerang Sehat/i });
    const takwaTab = screen.getByRole('tab', { name: /Tangerang Takwa/i });

    sehatTab.focus();
    fireEvent.keyDown(sehatTab, { key: 'ArrowRight' });

    expect(takwaTab).toHaveFocus();
    expect(takwaTab).toHaveAttribute('aria-selected', 'true');
  });

  it('menampilkan prioritas tindak lanjut dan portofolio program sebagai bagian yang mudah dikenali', () => {
    render(<ProgramPilarWorkspace />);

    const priorities = screen.getByRole('region', { name: /prioritas tindak lanjut/i });
    const portfolio = screen.getByRole('region', { name: /portofolio program/i });

    expect(within(priorities).getByRole('heading', { name: /prioritas tindak lanjut/i })).toBeInTheDocument();
    expect(within(priorities).getByText(/butuh perhatian/i)).toBeInTheDocument();
    expect(within(portfolio).getByRole('heading', { name: /portofolio program/i })).toBeInTheDocument();
    expect(within(portfolio).getByRole('table')).toBeInTheDocument();
  });
});
