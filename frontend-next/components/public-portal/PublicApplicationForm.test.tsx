import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PublicApplicationForm } from './PublicApplicationForm';

const { submitPublicApplication } = vi.hoisted(() => ({ submitPublicApplication: vi.fn() }));

vi.mock('@/lib/api/client', () => ({
  api: { submitPublicApplication, getPublicMasterData: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

describe('PublicApplicationForm', () => {
  beforeEach(() => {
    submitPublicApplication.mockReset();
  });

  it('keeps the visitor on the identity step when required fields are empty', async () => {
    render(<PublicApplicationForm />);

    fireEvent.click(screen.getByRole('button', { name: /lanjut/i }));

    expect(screen.getByText(/nama lengkap wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /data pemohon/i })).toBeInTheDocument();
  });

  it('renders the API registration number after a completed submission', async () => {
    submitPublicApplication.mockResolvedValue({
      success: true,
      data: { id: 44, file_no: 'MST-202609-0044' },
    });
    render(<PublicApplicationForm />);

    fireEvent.change(screen.getByLabelText(/nama lengkap/i), { target: { value: 'Siti Aminah' } });
    fireEvent.change(screen.getByLabelText(/^nik/i), { target: { value: '3671012345678901' } });
    fireEvent.change(screen.getByLabelText(/nomor kartu keluarga/i), { target: { value: '3671012345678902' } });
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /lanjut/i }));
    fireEvent.change(screen.getByLabelText(/alamat domisili/i), { target: { value: 'Jl. Melati No. 1' } });
    fireEvent.click(screen.getByRole('button', { name: /lanjut/i }));
    fireEvent.change(screen.getByLabelText(/uraian kebutuhan/i), { target: { value: 'Bantuan biaya sekolah' } });
    fireEvent.click(screen.getByRole('button', { name: /lanjut/i }));
    fireEvent.change(screen.getByLabelText(/unggah ktp/i), { target: { files: [new File(['ktp'], 'ktp.jpg', { type: 'image/jpeg' })] } });
    fireEvent.change(screen.getByLabelText(/unggah kartu keluarga/i), { target: { files: [new File(['kk'], 'kk.jpg', { type: 'image/jpeg' })] } });
    fireEvent.click(screen.getByRole('button', { name: /lanjut/i }));
    fireEvent.click(screen.getByLabelText(/saya menyatakan/i));
    fireEvent.click(screen.getByRole('button', { name: /kirim pengajuan/i }));

    expect(await screen.findByText('MST-202609-0044')).toBeInTheDocument();
  });
});
