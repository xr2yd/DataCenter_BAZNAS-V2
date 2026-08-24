import { RequireAuth } from '@/components/auth/RequireAuth';
import { PenyaluranShell } from '@/components/penyaluran/PenyaluranShell';

export default function PenyaluranLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={['admin', 'penyaluran', 'surveyor']}>
      <PenyaluranShell>{children}</PenyaluranShell>
    </RequireAuth>
  );
}
