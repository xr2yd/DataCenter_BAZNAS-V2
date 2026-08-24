import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: {
    template: '%s - BAZNAS Kota Tangerang',
    default: 'Data Center BAZNAS Kota Tangerang',
  },
  description: 'Sistem Informasi Manajemen & Data Center Penyaluran BAZNAS Kota Tangerang',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full bg-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full font-sans antialiased bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
