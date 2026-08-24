import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PenyaluranPage from './page';

describe('PenyaluranPage App Router Entry', () => {
  it('renders without crashing and displays header title', () => {
    render(<PenyaluranPage />);
    expect(screen.getByText('Ruang Operasional Penyaluran ZIS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 Hari' })).toBeInTheDocument();
    expect(screen.getByText('Komposisi 8 Asnaf')).toBeInTheDocument();
    expect(screen.getByText('Tren Penyaluran')).toBeInTheDocument();
  });
});
