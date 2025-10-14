/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'export', // Commented out for development to allow API routes
  // trailingSlash: true,

  images: {
    domains: ['kobuclkvlacdwvxmakvq.supabase.co'],
    unoptimized: true
  },

  // Disable static optimization to avoid Html import errors
  experimental: {
    disableOptimizedLoading: true,
    esmExternals: false,
  },

  // Webpack configuration to prevent Html import issues
  webpack: (config, { isServer }) => {
    // Prevent Next.js Document components from being imported outside _document.tsx
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/document': false,
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