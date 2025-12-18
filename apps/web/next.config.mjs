/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@retire-strong/shared-ui", "@retire-strong/shared-api"],

  // API Rewrites Configuration
  // IMPORTANT: Rewrites only work in development mode
  // In production (static export), the frontend uses NEXT_PUBLIC_API_URL directly
  // All components use getApiUrl() helper from @/lib/api-client to handle both modes
  async rewrites() {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) return []; // No rewrites in production (static export mode)

    // Development mode: proxy /api/* to local API server or NEXT_PUBLIC_API_URL
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

