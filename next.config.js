/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'export', // Commented out for development to allow API routes
  // trailingSlash: true,

  images: {
    domains: ['kobuclkvlacdwvxmakvq.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Disable static optimization to avoid Html import errors
  experimental: {
    disableOptimizedLoading: true,
    esmExternals: false,
  },

  // Disable fetchPriority warnings
  compiler: {
    removeConsole: false,
  },

  // Suppress fetchPriority warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Webpack configuration for performance optimization
  webpack: (config, { isServer, dev }) => {
    // Prevent Next.js Document components from being imported outside _document.tsx
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/document': false,
      };
    }

    // Performance optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Continue build even if there are build errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  async redirects() {
    return [
      {
        source: '/history',
        destination: '/flavor-wheels',
        permanent: true,
      },
    ]
  },

  // Skip generating static error pages
  generateBuildId: async () => {
    return 'flavatix-build'
  },

}

module.exports = nextConfig