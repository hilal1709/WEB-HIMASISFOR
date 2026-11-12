/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support API routes
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external images if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Fallback for invalid images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Alias rute berbahasa Indonesia
  async redirects() {
    return [
      { source: '/prestasi', destination: '/achievement', permanent: true },
      { source: '/kurikulum', destination: '/curiculum', permanent: true },
      { source: '/peminatan', destination: '/bidang-keahlian', permanent: true },
    ];
  },

  // Compression and optimization
  compress: true,
  
  // Production optimization
  productionBrowserSourceMaps: false,
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['motion', 'split-type'],
  },
};

module.exports = nextConfig;
