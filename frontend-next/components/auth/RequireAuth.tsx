'use client';

import { useAuth } from './AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${nextParam}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-zinc-500">Memverifikasi sesi amil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 text-center">
        <h2 className="text-base font-bold text-zinc-900">Akses Ditolak</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Akun Anda ({user.role}) tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
