import { ConceptThreeDashboard } from '@/components/penyaluran/dashboard/ConceptThreeDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Beranda Penyaluran',
};

export default function PenyaluranPage() {
  return <ConceptThreeDashboard mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN} />;
}
