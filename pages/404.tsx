import Head from 'next/head'
import Link from 'next/link'
import { Search, PieChart, FileText, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Flavatix</title>
        <meta name="description" content="The page you're looking for doesn't exist. Let's get you back to tasting!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* 404 Hero Section */}
          <div className="text-center mb-12">
            {/* Large 404 Number */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-agave opacity-10 blur-3xl rounded-full" />
              <h1 className="relative text-9xl font-bold text-primary opacity-20 select-none">
                404
              </h1>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
              The page you&apos;re looking for seems to have wandered off during a tasting session.
              Let&apos;s get you back to discovering flavors!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-card font-medium transition-all duration-200 shadow-primary hover:shadow-primary-hover hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>

              <Link
                href="/flavor-wheels"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-card font-medium transition-all duration-200"
              >
                <PieChart className="w-5 h-5" />
                Explore Flavor Wheels
              </Link>
            </div>
          </div>

          {/* Helpful Suggestions */}
          <div className="bg-gemini-card dark:bg-zinc-800 rounded-card p-8 mb-8">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6 text-center">
              What would you like to do?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Start Tasting */}
              <Link
                href="/taste"
                className="group flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">
                  Start Tasting
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                  Record a new tasting session
                </p>
              </Link>

              {/* Explore Flavors */}
              <Link
                href="/flavor-wheels"
                className="group flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                  <PieChart className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">
                  Explore Flavors
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                  Discover flavor wheels
                </p>
              </Link>

              {/* My Tastings */}
              <Link
                href="/my-tastings"
                className="group flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">
                  My Tastings
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                  View your tasting history
                </p>
              </Link>
            </div>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-2">
              Still can&apos;t find what you&apos;re looking for?
            </p>
            <a
              href="mailto:support@flavatix.com"
              className="text-sm text-primary hover:text-primary-600 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Contact Support
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Flavatix Logo */}
          <div className="mt-12 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/flavatix-logo.svg"
              alt="Flavatix"
              className="w-32 h-auto mx-auto opacity-50"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
              The one place for all your tasting needs
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
