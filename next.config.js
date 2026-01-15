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

  // Comprehensive Security Headers (GDPR, OWASP compliant)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS - Force HTTPS for 1 year (includeSubDomains for all subdomains)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy (CSP) - Prevent XSS, clickjacking, and other code injection attacks
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://kobuclkvlacdwvxmakvq.supabase.co https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://kobuclkvlacdwvxmakvq.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://kobuclkvlacdwvxmakvq.supabase.co https://*.sentry.io https://api.anthropic.com wss://kobuclkvlacdwvxmakvq.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          // X-Frame-Options - Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options - Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-XSS-Protection - Enable XSS filter (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy - Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy - Control browser features
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=(self)',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },
          // X-DNS-Prefetch-Control - Control DNS prefetching
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Cross-Origin-Embedder-Policy - Isolate cross-origin resources
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          // Cross-Origin-Opener-Policy - Prevent cross-origin attacks
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Cross-Origin-Resource-Policy - Control resource loading
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
        ],
      },
      // API routes with CORS headers
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://flavatix.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Content-Type, X-CSRF-Token, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
    ];
  },

  // Webpack configuration for aggressive performance optimization
  webpack: (config, { isServer, dev }) => {
    // Prevent Next.js Document components from being imported outside _document.tsx
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/document': false,
      };
    }

    // Aggressive performance optimizations for production
    if (!dev) {
      // Disable custom splitChunks to avoid 'self is not defined' error
      // The aggressive chunking strategy was causing webpack to generate
      // browser-specific code (using 'self') in server bundles
      /* config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate D3.js into its own chunk (large library)
            d3: {
              test: /[\\/]node_modules[\\/]d3.*[\\/]/,
              name: 'vendors-d3',
              priority: 40,
              reuseExistingChunk: true,
            },
            // Separate framer-motion into its own chunk
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'vendors-framer',
              priority: 35,
              reuseExistingChunk: true,
            },
            // Separate recharts into its own chunk
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'vendors-recharts',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Separate Supabase into its own chunk
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'vendors-supabase',
              priority: 25,
              reuseExistingChunk: true,
            },
            // React and Next.js core
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'vendors-react',
              priority: 50,
              reuseExistingChunk: true,
            },
            // UI libraries (lucide, radix)
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
              name: 'vendors-ui',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Other vendor dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common code shared across routes
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }; */
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
        destination: '/my-tastings',
        permanent: true,
      },
    ];
  },

  // Skip generating static error pages
  generateBuildId: async () => {
    return 'flavatix-build';
  },
};

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
// Disabled during build to prevent "self is not defined" error
module.exports = nextConfig;
