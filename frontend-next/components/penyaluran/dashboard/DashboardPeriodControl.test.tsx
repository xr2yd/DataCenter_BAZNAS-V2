import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPeriodControl } from './DashboardPeriodControl';

describe('DashboardPeriodControl', () => {
  it('reports the newly selected dashboard period', () => {
    const onChange = vi.fn();

    render(<DashboardPeriodControl value="30d" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '7 Hari' }));

    expect(onChange).toHaveBeenCalledWith('7d');
  });

  it('marks the active period for assistive technology', () => {
    render(<DashboardPeriodControl value="1y" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '1 Tahun' })).toHaveAttribute('aria-pressed', 'true');
  });
});
