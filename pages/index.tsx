import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, PlayCircle, Sparkles, Users } from 'lucide-react'
import Container from '@/components/layout/Container'

const heroItems = [
  'Coffee',
  'Wine',
  'Tea',
  'Spirits',
  'Chocolate',
]

const featureCards = [
  {
    icon: PlayCircle,
    title: 'Fast capture',
    description: 'Record aroma, body, finish, and notes without digging through a dense form.',
  },
  {
    icon: Users,
    title: 'Shared sessions',
    description: 'Run private tastings, invite guests, and keep everyone in the same flow.',
  },
  {
    icon: BarChart3,
    title: 'Visual summaries',
    description: 'Turn repeated notes into patterns that are easy to compare across sessions.',
  },
]

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#f8f6f1] text-zinc-950">
      <Head>
        <title>Flavatix - Your palate, visualized.</title>
        <meta
          name="description"
          content="Every tasting note you capture, turned into a personal flavor system. Discover, compare, and share how you taste."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/logos/flavatix-icon.svg" />
        <link rel="apple-touch-icon" href="/logos/flavatix-icon.svg" />
      </Head>

      <div className="pointer-events-none fixed inset-0">
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[-4rem] top-32 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl"
          animate={{ y: [0, 22, 0], x: [0, -12, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <main className="relative">
        <section className="relative border-b border-zinc-200/70">
          <Container size="7xl" className="py-20 sm:py-24 lg:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <motion.div variants={fadeIn} className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                    Tasting journal
                  </p>
                  <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl lg:leading-[0.92]">
                    Your palate,
                    <span className="block text-zinc-600">made legible.</span>
                  </h1>
                </motion.div>

                <motion.p
                  variants={fadeIn}
                  className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg"
                >
                  Flavatix turns tasting notes into a structured system for coffee, wine,
                  tea, spirits, chocolate, and anything else worth slowing down for.
                  Capture a session, compare what changed, and see the shape of your palate.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    Start tasting
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/taste"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-zinc-900 transition-transform duration-150 hover:-translate-y-0.5 hover:border-zinc-400 active:scale-[0.99]"
                  >
                    Open Taste Hub
                  </Link>
                  <Link
                    href="/flavor-wheels"
                    className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950"
                  >
                    <Sparkles className="h-4 w-4" />
                    Explore flavor wheels
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="flex flex-wrap gap-2"
                >
                  {heroItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
                    >
                      {item}
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Live wheel
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                        Notes in motion
                      </h2>
                    </div>
                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-[#fbfaf7]">
                      <Image
                        src="/screenshots/flavor-wheel.png"
                        alt="Flavatix flavor wheel preview"
                        width={1200}
                        height={700}
                        className="h-auto w-full"
                        priority
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          Session flow
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                          Keep a tasting moving from setup to summary without losing context.
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-zinc-200 bg-amber-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                          Pattern view
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                          See the repeated descriptors that keep showing up across your notes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="border-b border-zinc-200/70 bg-white/70">
          <Container size="7xl" className="py-14 sm:py-16">
            <div className="grid gap-5 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45 }}
                className="lg:col-span-7 rounded-[2rem] border border-zinc-200 bg-[#fcfbf8] p-6 sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Why it works
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                  A tasting notebook that behaves like software, not a blank document.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
                  The interface stays focused on the current decision, keeps group sessions
                  readable, and gets out of the way when you need to move quickly.
                </p>
              </motion.div>

              <div className="lg:col-span-5 grid gap-5">
                {featureCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.45)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold tracking-tight text-zinc-950">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Container>
        </section>

        <footer className="bg-[#f3f0e8]">
          <Container size="7xl" className="py-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-600">
                © {new Date().getFullYear()} Flavatix
              </p>
              <p className="text-sm text-zinc-500">
                Built for tasting sessions that need structure.
              </p>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  )
}
