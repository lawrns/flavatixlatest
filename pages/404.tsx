import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, FileText, Search, Sparkles } from 'lucide-react'

const actions = [
  {
    href: '/taste',
    title: 'Taste hub',
    description: 'Open the main action surface for sessions and reviews.',
    icon: Sparkles,
  },
  {
    href: '/flavor-wheels',
    title: 'Flavor wheels',
    description: 'See the patterns your tasting notes have already built.',
    icon: BarChart3,
  },
  {
    href: '/my-tastings',
    title: 'My tastings',
    description: 'Return to recent sessions and pick up where you left off.',
    icon: Search,
  },
]

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Flavatix</title>
        <meta
          name="description"
          content="The page you’re looking for does not exist. Return to Flavatix and keep tasting."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>

      <main className="min-h-[100dvh] overflow-hidden bg-bg text-fg">
        <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-pane border border-line bg-bg-surface/85 p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fg-subtle">
                Page missing
              </p>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fg-subtle">
                  404
                </p>
                <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg sm:text-6xl">
                  Nothing here.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
                  The link drifted away. Use one of the routes below to get back to
                  the part of Flavatix that matters right now.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-soft bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back home
                </Link>
                <Link
                  href="/taste"
                  className="inline-flex items-center justify-center gap-2 rounded-soft border border-line-strong bg-bg-surface px-6 py-3.5 text-sm font-semibold text-fg transition-transform duration-150 hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.99]"
                >
                  Open Taste Hub
                </Link>
              </div>
            </motion.section>

            <section className="grid gap-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="rounded-pane border border-line bg-bg p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fg-subtle">
                      Suggested routes
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
                      Keep the session moving
                    </h2>
                  </div>
                  <div className="rounded-full border border-line bg-bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                    Flavatix
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.12 + index * 0.06 }}
                      >
                        <Link
                          href={action.href}
                          className="group flex items-start gap-4 rounded-soft border border-line bg-bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft border border-line bg-bg-inset text-fg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold tracking-tight text-fg">
                              {action.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                              {action.description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="rounded-pane border border-line bg-bg-surface/85 p-6 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-soft bg-signal-warn/10 text-signal-warn">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fg-subtle">
                      Support
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-fg">
                      Still stuck?
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                  If you expected a tasting or review route here, try the Taste hub or
                  return to Home. If the link keeps failing, reach out to support.
                </p>
                <a
                  href="mailto:support@flavatix.com"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-fg transition-colors hover:text-fg-muted"
                >
                  Contact support
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </a>
              </motion.div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
