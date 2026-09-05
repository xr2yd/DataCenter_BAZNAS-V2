import { MasterDataOperations } from '@/components/penyaluran/pengaturan/MasterDataOperations';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Data Master | Penyaluran BAZNAS' };

export default function PengaturanPage() {
  return <MasterDataOperations />;
}
