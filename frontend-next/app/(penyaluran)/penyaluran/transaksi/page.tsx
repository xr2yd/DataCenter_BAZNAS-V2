import { TransactionJournal } from '@/components/penyaluran/transaksi/TransactionJournal';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Riwayat Transaksi | Penyaluran BAZNAS' };

export default function TransactionPage() {
  return <TransactionJournal />;
}
