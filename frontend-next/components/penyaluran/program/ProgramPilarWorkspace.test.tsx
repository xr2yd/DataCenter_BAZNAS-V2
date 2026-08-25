import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramPilarWorkspace } from './ProgramPilarWorkspace';

describe('ProgramPilarWorkspace Mockup Fidelity', () => {
  it('renders header, top 5 pillar cards, and default Tangerang Sehat deep-dive', () => {
    render(<ProgramPilarWorkspace />);

    // Header title
    expect(screen.getByRole('heading', { name: 'Lima Pilar, Satu Dampak untuk Kota Tangerang' })).toBeInTheDocument();

    // Top 5 Pillars
    expect(screen.getByRole('button', { name: /Tangerang Cerdas/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tangerang Makmur/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tangerang Sehat/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tangerang Takwa/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tangerang Peduli/ })).toBeInTheDocument();

    // Value chain & Impact metrics
    expect(screen.getByRole('heading', { name: 'Dari Anggaran ke Dampak Sosial — Tangerang Sehat' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dampak Utama — Tangerang Sehat' })).toBeInTheDocument();

    // Check 6 metric items
    expect(screen.getByText('Pasien Mustahik Dilayani')).toBeInTheDocument();
    expect(screen.getByText('Intervensi Sukses')).toBeInTheDocument();
    expect(screen.getByText('Rata-rata Bantuan')).toBeInTheDocument();
  });

  it('switches active pillar when clicking another pillar card', () => {
    render(<ProgramPilarWorkspace />);

    const cerdasButton = screen.getByRole('button', { name: /Tangerang Cerdas/ });
    expect(cerdasButton).toBeInTheDocument();

    if (cerdasButton) {
      fireEvent.click(cerdasButton);
      expect(screen.getByRole('heading', { name: 'Dari Anggaran ke Dampak Sosial — Tangerang Cerdas' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Dampak Utama — Tangerang Cerdas' })).toBeInTheDocument();
    }
  });
});
