import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PenyaluranPage from './page';

describe('PenyaluranPage App Router Entry', () => {
  it('renders the current operational dashboard entry', () => {
    render(<PenyaluranPage />);
    expect(screen.getByRole('heading', { name: 'Ruang kendali penyaluran' })).toBeInTheDocument();
    expect(screen.getByText('Capaian periode aktif')).toBeInTheDocument();
    expect(screen.getByText('Prioritas hari ini')).toBeInTheDocument();
  });
});
