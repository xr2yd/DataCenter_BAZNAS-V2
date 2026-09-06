import { PetaSebaranWorkspace } from '@/components/penyaluran/peta/PetaSebaranWorkspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Peta Sebaran Penyaluran GIS',
};

export default function PetaPage() {
  return <PetaSebaranWorkspace mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN} />;
}
