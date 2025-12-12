import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from './HeroSection.module.css'
import Container from '@/components/layout/Container'

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50">
      <Head>
        <title>Flavatix - The one place for all your tasting needs</title>
        <meta name="description" content="The world's most pivotal tasting app for anything with flavor or aroma. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
        <link rel="apple-touch-icon" href="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <div className={`${styles.hero} relative overflow-hidden`}>
          
          {/* Content Container */}
          <Container size="md" className="relative z-10 py-2xl text-center">
            {/* Logo/Brand Area */}
            <div className="mb-lg">
              <Image
                src="https://kobuclkvlacdwvxmakvq.supabase.co/storage/v1/object/public/images/flavicon.png"
                alt="Flavatix Logo"
                width={64}
                height={64}
                className="w-16 h-16 mx-auto mb-md"
              />
              
              {/* App Name */}
              <h1 className="font-heading font-bold text-h1 text-white mb-sm">
                Flavatix
              </h1>

              {/* Tagline */}
              <p className="text-h3 text-white font-medium mb-xs">
                The one place for all your tasting needs
              </p>

              {/* Subtitle */}
              <p className="text-body text-white/90 max-w-2xl mx-auto leading-body">
                The world's most pivotal tasting app for anything with flavor or aroma.
                Discover, analyze, and share your tasting experiences with our intuitive platform
                designed for everyone from casual enthusiasts to industry professionals.
              </p>
            </div>
            
            {/* Key Features Preview */}
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-md mb-xl max-w-3xl mx-auto">
              <div className={`${styles.card} card-tasting p-md text-center`}>
                <div className="w-12 h-12 bg-flavor-fruity rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24" style={{display: 'block'}}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8M12 8v8"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Tasting Notes
                </h3>
                <p className="text-small text-text-secondary">
                  On-the-fly tasting note storage and analysis
                </p>
              </div>
              
              <div className={`${styles.card} card-tasting p-md text-center`}>
                <div className="w-12 h-12 bg-flavor-vegetal rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24" style={{display: 'block'}}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Create Tastings
                </h3>
                <p className="text-small text-text-secondary">
                  Customizable study sessions and competitions for groups
                </p>
              </div>
              
              <div className={`${styles.card} card-tasting p-md text-center`}>
                <div className="w-12 h-12 bg-flavor-roasted rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24" style={{display: 'block'}}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Flavor Wheels
                </h3>
                <p className="text-small text-text-secondary">
                  AI-generated visualizations from your tasting data
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