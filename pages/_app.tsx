import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '../contexts/SimpleAuthContext'
import GlobalInspirationBox from '../components/GlobalInspirationBox'
import PerformanceMonitor from '../components/analytics/PerformanceMonitor'
import ErrorBoundary from '../components/ui/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
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
    <AuthProvider>
      <Head>
        <title>Flavatix - The one place for all your tasting needs</title>
        <meta name="description" content="The world's most pivotal tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content={isDark ? '#1a1410' : '#FEF3E7'} />
        <link rel="icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
        <link rel="apple-touch-icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
      </Head>
      <ErrorBoundary>
        <GlobalInspirationBox>
          <Component {...pageProps} />
          <PerformanceMonitor />
        </GlobalInspirationBox>
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </AuthProvider>
  )
}