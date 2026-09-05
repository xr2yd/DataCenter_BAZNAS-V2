import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PublicPortalPage from './page';

describe('PublicPortalPage', () => {
  it('links visitors to the functional application and tracking routes', () => {
    render(<PublicPortalPage />);

    expect(screen.getByRole('link', { name: /ajukan bantuan/i })).toHaveAttribute('href', '/pengajuan');
    expect(screen.getByRole('link', { name: /cek status pengajuan/i })).toHaveAttribute('href', '/cek-pengajuan');
  });
});
