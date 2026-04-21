import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/layout/Container'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-fg font-sans">
      <Head>
        <title>Flavatix — Your palate, visualized.</title>
        <meta
          name="description"
          content="Every tasting note you've ever taken, turned into a personal flavor wheel. Discover, analyze, and share your tasting experiences."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/logos/flavatix-icon.svg" />
        <link rel="apple-touch-icon" href="/logos/flavatix-icon.svg" />
      </Head>

      <main>
        {/* Hero */}
        <section className="bg-bg pt-24 pb-20 sm:pt-32 sm:pb-28">
          <Container size="lg">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-fg leading-tight mb-6">
              Your palate,{' '}
              <span className="text-primary">visualized.</span>
            </h1>
            <p className="text-lg sm:text-xl text-fg-muted leading-relaxed mb-10 max-w-xl">
              Every tasting note you&apos;ve ever taken, turned into a personal
              flavor wheel. From coffee and wine to spirits and olive oil —
              finally understand what you taste.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-soft bg-primary text-white px-6 py-3 font-medium text-base hover:opacity-90 transition-opacity duration-150"
            >
              Start Tasting
            </Link>
          </Container>
        </section>

        {/* Feature section */}
        <section className="bg-surface py-20 sm:py-28 border-y border-line">
          <Container size="lg">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold text-fg mb-4">
                A tasting notebook that thinks.
              </h2>
              <p className="text-base text-fg-muted leading-relaxed mb-12">
                Flavatix turns your scattered impressions into structured data.
                Rate aroma, body, acidity, and finish. Compare sessions over
                time. Share flights with friends or run blind competitions with
                your team. No spreadsheets, no lost notebooks — just your
                palate, finally legible.
              </p>
            </div>

            <div className="rounded-pane border border-line shadow-sm overflow-hidden">
              <Image
                src="/screenshots/flavor-wheel.png"
                alt="A Flavatix flavor wheel showing tasting note visualizations"
                width={1200}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="bg-bg-inset py-16">
          <Container size="lg">
            <p className="text-sm text-fg-subtle">
              © {new Date().getFullYear()} Flavatix. All rights reserved.
            </p>
          </Container>
        </footer>
      </main>
    </div>
  )
}
