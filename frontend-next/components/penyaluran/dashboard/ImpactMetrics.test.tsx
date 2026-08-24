import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getDashboardData } from './dashboard-data';
import { ImpactMetrics } from './ImpactMetrics';

describe('ImpactMetrics', () => {
  it('formats sub-million average assistance without rounding it to zero', () => {
    render(<ImpactMetrics data={getDashboardData('30d')} />);

    expect(screen.getByText('Rp 284 Rb')).toBeInTheDocument();
  });
});
