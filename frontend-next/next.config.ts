import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Support static export if needed or server mode
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
