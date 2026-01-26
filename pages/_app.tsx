import '@/lib/polyfills'
import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '../contexts/SimpleAuthContext'
import { QueryProvider } from '../lib/query/queryClient'
import GlobalInspirationBox from '../components/GlobalInspirationBox'
import PerformanceMonitor from '../components/analytics/PerformanceMonitor'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import { LiveRegionProvider } from '../components/ui/LiveRegion'
import { analyticsTracker } from '@/lib/analytics/tracker'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

export default function App({ Component, pageProps }: AppProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Initialize analytics tracker
    analyticsTracker.initialize()

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        if (e.matches) {
          document.documentElement.classList.add('dark')
          setIsDark(true)
        } else {
          document.documentElement.classList.remove('dark')
          setIsDark(false)
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        <Head>
          <title>Flavatix - The one place for all your tasting needs</title>
          <meta name="description" content="The world's most comprehensive tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta name="theme-color" content={isDark ? '#1a1410' : '#FEF3E7'} />
          <link rel="icon" href="/logos/flavatix-icon.svg" />
          <link rel="apple-touch-icon" href="/logos/flavatix-icon.svg" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Flavatix" />
          <meta property="og:title" content="Flavatix - The one place for all your tasting needs" />
          <meta property="og:description" content="The world's most comprehensive tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
          <meta property="og:image" content="https://flavatix.com/icons/social-share-image.png" />
          <meta property="og:url" content="https://flavatix.com" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@flavatix" />
          <meta name="twitter:creator" content="@flavatix" />
          <meta name="twitter:title" content="Flavatix - The one place for all your tasting needs" />
          <meta name="twitter:description" content="The world's most comprehensive tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
          <meta name="twitter:image" content="https://flavatix.com/icons/social-share-image.png" />

          {/* Additional SEO Meta Tags */}
          <meta name="keywords" content="tasting app, flavor analysis, wine tasting, coffee tasting, tea tasting, flavor notes, aroma wheel, tasting journal" />
          <meta name="author" content="Flavatix" />
          <link rel="canonical" href="https://flavatix.com" />

          {/* Google Analytics 4 */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </Head>
        
        {/* Skip to main content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          Skip to main content
        </a>
        
        <LiveRegionProvider>
          <ErrorBoundary>
            <GlobalInspirationBox>
              <main id="main-content" tabIndex={-1} className="outline-none">
                <Component {...pageProps} />
              </main>
              <PerformanceMonitor />
            </GlobalInspirationBox>
          </ErrorBoundary>
        </LiveRegionProvider>
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme={isDark ? 'dark' : 'light'}
          limit={2}
          className="!mb-20"
          toastClassName="!rounded-xl !shadow-lg"
        />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
}