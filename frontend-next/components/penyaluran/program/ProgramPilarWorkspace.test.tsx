import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramPilarWorkspace } from './ProgramPilarWorkspace';

describe('ProgramPilarWorkspace Mockup Fidelity', () => {
  it('renders header, top 5 pillar cards, and default Tangerang Sehat deep-dive', () => {
    render(<ProgramPilarWorkspace />);

    // Header title
    expect(screen.getByText('Lima pilar, satu dampak untuk Kota Tangerang.')).toBeInTheDocument();

    // Top 5 Pillars
    expect(screen.getByText('Tangerang Cerdas')).toBeInTheDocument();
    expect(screen.getByText('Tangerang Makmur')).toBeInTheDocument();
    expect(screen.getByText('Tangerang Sehat')).toBeInTheDocument();
    expect(screen.getByText('Tangerang Beriman')).toBeInTheDocument();
    expect(screen.getByText('Tangerang Peduli')).toBeInTheDocument();

    // Value chain & Impact metrics
    expect(screen.getByText('Dari anggaran ke dampak — Tangerang Sehat')).toBeInTheDocument();
    expect(screen.getByText('Dampak utama — Tangerang Sehat')).toBeInTheDocument();

    // Check 6 metric items
    expect(screen.getByText('Pasien dilayani')).toBeInTheDocument();
    expect(screen.getByText('Intervensi berhasil')).toBeInTheDocument();
    expect(screen.getByText('Rata-rata bantuan')).toBeInTheDocument();
  });

  it('switches active pillar when clicking another pillar card', () => {
    render(<ProgramPilarWorkspace />);

    const cerdasButton = screen.getByText('Tangerang Cerdas').closest('button');
    expect(cerdasButton).toBeInTheDocument();

    if (cerdasButton) {
      fireEvent.click(cerdasButton);
      expect(screen.getByText('Dari anggaran ke dampak — Tangerang Cerdas')).toBeInTheDocument();
      expect(screen.getByText('Dampak utama — Tangerang Cerdas')).toBeInTheDocument();
    }
  });
});
