const { withSentryConfig } = require('@sentry/nextjs');
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
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

  // Experimental settings
  experimental: {
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

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses all logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps only in production
  widenClientFileUpload: true,
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
};

// Wrap the config with Sentry only if DSN is configured
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;