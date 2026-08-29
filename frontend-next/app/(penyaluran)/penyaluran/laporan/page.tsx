import { LaporanPenyaluranWorkspace } from '@/components/penyaluran/laporan/LaporanPenyaluranWorkspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Laporan Penyaluran',
};

export default function LaporanPage() {
  return <LaporanPenyaluranWorkspace />;
}
