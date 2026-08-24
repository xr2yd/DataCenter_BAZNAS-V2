import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PenyaluranPage from './page';

describe('PenyaluranPage App Router Entry', () => {
  it('renders the redesigned dashboard heading', () => {
    render(<PenyaluranPage />);
    expect(screen.getByRole('heading', { name: 'Ruang keputusan yang berdampak' })).toBeInTheDocument();
  });

  it('offers the agreed dashboard period controls', () => {
    render(<PenyaluranPage />);

    expect(screen.getByRole('button', { name: '7 hari' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 hari' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 tahun' })).toBeInTheDocument();
  });
});
