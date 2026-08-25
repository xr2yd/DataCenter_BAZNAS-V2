import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ProgramPilarWorkspace } from './ProgramPilarWorkspace';

describe('ProgramPilarWorkspace', () => {
  it('membuka halaman dengan konteks Lima Pilar yang mudah dipahami', () => {
    render(<ProgramPilarWorkspace />);

    expect(
      screen.getByRole('heading', { level: 1, name: /lima pilar, satu dampak untuk kota tangerang/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/transformasi akuntabel dana zakat/i)).toBeInTheDocument();
  });

  it('menyajikan kelima pilar sebagai tab dengan Tangerang Sehat aktif', () => {
    render(<ProgramPilarWorkspace />);

    const navigation = screen.getByRole('tablist', { name: /pilih program 5 pilar/i });
    const tabs = within(navigation).getAllByRole('tab');

    expect(tabs).toHaveLength(5);
    expect(within(navigation).getByRole('tab', { name: /tangerang sehat/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('memperbarui data terpadu saat pilar lain dipilih', () => {
    render(<ProgramPilarWorkspace />);

    const makmurTab = screen.getByRole('tab', { name: /tangerang makmur/i });
    fireEvent.click(makmurTab);

    const panel = screen.getByRole('tabpanel');
    const insights = within(panel).getByRole('group', { name: /ringkasan proyeksi dan jangkauan/i });

    expect(
      screen.getByRole('heading', { name: /dari anggaran ke dampak sosial — tangerang makmur/i }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: /kinerja program terpadu/i })).getByRole('heading', {
        name: /kinerja tangerang makmur/i,
      }),
    ).toBeInTheDocument();
    expect(makmurTab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', makmurTab.id);
    expect(within(insights).getByText('Rp 9,13 M')).toBeInTheDocument();
    expect(within(insights).getByText('Rp 11,30 M')).toBeInTheDocument();
    expect(within(insights).getByText('Rp 3,82 M')).toBeInTheDocument();
    expect(within(insights).getByText('81% target')).toBeInTheDocument();
  });

  it('mendukung perpindahan pilar dengan tombol panah keyboard', () => {
    render(<ProgramPilarWorkspace />);

    const sehat = screen.getByRole('tab', { name: /tangerang sehat/i });
    fireEvent.keyDown(sehat, { key: 'ArrowRight' });

    const takwa = screen.getByRole('tab', { name: /tangerang takwa/i });
    expect(takwa).toHaveAttribute('aria-selected', 'true');
    expect(takwa).toHaveFocus();
  });

  it('menggabungkan grafik dan tepat empat KPI utama tanpa panel dampak terpisah', () => {
    render(<ProgramPilarWorkspace />);

    const region = screen.getByRole('region', { name: /kinerja program terpadu/i });
    const metrics = within(region).getByRole('list', { name: /empat indikator dampak utama/i });

    expect(within(region).getByRole('heading', { name: /tren penyaluran bulanan/i })).toBeInTheDocument();
    expect(within(metrics).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('heading', { name: /^dampak utama/i })).not.toBeInTheDocument();
  });

  it('menempatkan proyeksi dan indikator sekunder dalam satu insight strip', () => {
    render(<ProgramPilarWorkspace />);

    const insights = within(
      screen.getByRole('region', { name: /kinerja program terpadu/i }),
    ).getByRole('group', { name: /ringkasan proyeksi dan jangkauan/i });

    expect(within(insights).getByText(/proyeksi serapan 2026/i)).toBeInTheDocument();
    expect(within(insights).getByText(/pagu tahunan/i)).toBeInTheDocument();
    expect(within(insights).getByText(/sisa kuota/i)).toBeInTheDocument();
    expect(within(insights).getByText(/kecamatan terjangkau/i)).toBeInTheDocument();
    expect(within(insights).getByText(/penerima baru/i)).toBeInTheDocument();
  });

  it('menjaga komposisi tablet dan mobile tetap padat tanpa sel kosong paksa', () => {
    render(<ProgramPilarWorkspace />);

    const navigation = screen.getByRole('tablist', { name: /pilih program 5 pilar/i });
    const tabs = within(navigation).getAllByRole('tab');
    const region = screen.getByRole('region', { name: /kinerja program terpadu/i });
    const metrics = within(region).getByRole('list', { name: /empat indikator dampak utama/i });
    const insights = within(region).getByRole('group', { name: /ringkasan proyeksi dan jangkauan/i });
    const analytics = screen.getByRole('region', { name: /analitik penyaluran program/i });

    expect(tabs.at(-1)).toHaveClass('sm:last:col-span-2', 'lg:last:col-span-1');
    expect(metrics).toHaveClass('grid-cols-2');
    expect(insights.firstElementChild).toHaveClass('sm:col-span-2', 'xl:col-span-1');
    expect(within(region).getByRole('article').parentElement).toHaveClass('items-start');
    expect(analytics).toHaveClass('items-start');
    expect(analytics).not.toHaveClass('xl:items-stretch');
  });

  it('menyediakan portofolio berbentuk kartu yang mudah dipindai pada layar kecil', () => {
    render(<ProgramPilarWorkspace />);

    const mobilePortfolio = screen.getByRole('list', {
      name: /portofolio sub-program untuk layar kecil/i,
    });

    expect(within(mobilePortfolio).getAllByRole('listitem')).toHaveLength(4);
    expect(within(mobilePortfolio).getByText(/klinik mustahik/i)).toBeInTheDocument();
  });
});
