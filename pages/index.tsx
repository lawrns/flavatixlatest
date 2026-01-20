import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Users, PieChart } from 'lucide-react'
import styles from './HeroSection.module.css'
import Container from '@/components/layout/Container'

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50">
      <Head>
        <title>Flavatix - The one place for all your tasting needs</title>
        <meta name="description" content="The world's most comprehensive tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="/logos/flavatix-icon.svg" />
        <link rel="apple-touch-icon" href="/logos/flavatix-icon.svg" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <div className={`${styles.hero} relative overflow-hidden`}>
          {/* Hero Background Illustration */}
          <div className="absolute inset-0 opacity-15 dark:opacity-10">
            <Image
              src="/generated-images/hero/hero-background.webp"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-orange-400/5 to-amber-300/5" />

          {/* Content Container */}
          <Container size="md" className="relative z-10 py-2xl text-center">
            {/* Logo/Brand Area */}
            <div className="mb-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/flavatix-logo.svg"
                alt="Flavatix"
                className="w-full max-w-[180px] h-auto mx-auto mb-md"
              />

              {/* Tagline */}
              <p className="text-h3 text-zinc-900 font-semibold">
                The one place for all your tasting needs
              </p>
            </div>

            {/* Key Features Preview */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-xl max-w-2xl mx-auto">
              <div className="text-center p-4 sm:p-6 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm transition-spring hover:shadow-md hover:-translate-y-1 hover:bg-white dark:hover:bg-zinc-800">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 mb-1">
                  Tasting Notes
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Capture and analyze flavors
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm transition-spring hover:shadow-md hover:-translate-y-1 hover:bg-white dark:hover:bg-zinc-800">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 mb-1">
                  Group Tastings
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Studies and competitions
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm transition-spring hover:shadow-md hover:-translate-y-1 hover:bg-white dark:hover:bg-zinc-800">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 mb-1">
                  Flavor Wheels
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  AI-generated visualizations
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-sm">
              <Link href="/auth" className="btn-primary mx-auto block tablet:inline-block">
                Get Started
              </Link>

              <p className="text-caption text-text-muted">
                Join thousands of tasters discovering new flavors every day
              </p>
            </div>
          </Container>
        </div>

        {/* Value Proposition Section */}
        <section className="py-2xl">
          <Container size="md" className="text-center">
            <h2 className="font-heading font-bold text-h2 text-text-primary mb-lg">
              Why Flavatix?
            </h2>

            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-lg max-w-3xl mx-auto">
              <div className="text-center">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  For Everyone
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Whether you&apos;re a casual coffee lover or an industry professional,
                  Flavatix adapts to your needs with intuitive design and powerful customization.
                </p>
              </div>

              <div className="text-center">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Data-Driven Insights
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Transform your subjective tasting notes into beautiful, shareable visualizations
                  that reveal patterns and preferences you never knew existed.
                </p>
              </div>

              <div className="text-center">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Social & Collaborative
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Connect with fellow tasters, share your discoveries, and learn from
                  a community passionate about flavor exploration.
                </p>
              </div>

              <div className="text-center">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Cross-Industry
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  From coffee and wine to spirits and olive oil, Flavatix supports
                  tastings across all industries with customizable templates.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-white py-xl">
          <Container size="md" className="text-center">
            <h3 className="font-heading font-bold text-h3 mb-sm">
              Ready to Transform Your Tasting Experience?
            </h3>
            <p className="text-body mb-lg opacity-90">
              Join the Flavatix community and discover the world of flavor like never before.
            </p>
            <Link href="/auth" className="btn-secondary">
              Start Tasting Today
            </Link>

            <div className="mt-xl pt-lg border-t border-white/20">
              <p className="text-small opacity-70">
                © 2025 Flavatix. The one place for all your tasting needs.
              </p>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  )
}
