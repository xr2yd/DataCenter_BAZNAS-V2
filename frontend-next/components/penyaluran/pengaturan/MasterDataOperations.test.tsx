import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MasterDataOperations } from './MasterDataOperations';

const { getMasterData, createMasterData } = vi.hoisted(() => ({ getMasterData: vi.fn(), createMasterData: vi.fn() }));
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ api: { getMasterData, createMasterData } }));
vi.mock('@/components/auth/AuthProvider', () => ({ useAuth }));

describe('MasterDataOperations', () => {
  beforeEach(() => {
    getMasterData.mockReset();
    createMasterData.mockReset();
    useAuth.mockReturnValue({ user: { role: 'admin' } });
    getMasterData.mockResolvedValue({ success: true, data: [
      { id: 1, category: 'program', record_key: 'tangerang-cerdas', label: 'Tangerang Cerdas', description: 'Pendidikan', is_active: true, sort_order: 1 },
    ] });
  });

  it('renders master records and allows an admin to switch category', async () => {
    render(<MasterDataOperations />);

    expect(await screen.findByText('Tangerang Cerdas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tambah data/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dokumen wajib/i }));
    expect(getMasterData).toHaveBeenLastCalledWith({ category: 'dokumen' });
  });
});
