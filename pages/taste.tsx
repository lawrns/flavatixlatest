import React from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, BarChart3, FileText, PlayCircle, Trophy, UserPlus, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { HeroPanel, InsightRail } from '@/components/ui/PremiumPrimitives';

const tasteActions = [
  {
    title: 'Create Session',
    description: 'Set up a tasting for a group or a private run.',
    href: '/create-tasting',
    icon: Users,
  },
  {
    title: 'Join Session',
    description: 'Enter a code and join someone else’s tasting.',
    href: '/join-tasting',
    icon: UserPlus,
  },
  {
    title: 'Write Review',
    description: 'Move from tasting notes into a structured review.',
    href: '/review',
    icon: FileText,
  },
  {
    title: 'Competition',
    description: 'Run or join a scored event with participant ranking.',
    href: '/competition',
    icon: Trophy,
  },
  {
    title: 'Flavor Wheels',
    description: 'See the patterns your sessions have built over time.',
    href: '/flavor-wheels',
    icon: BarChart3,
  },
];

const TastePage: React.FC = () => {
  const router = useRouter();

  return (
    <PageLayout
      title="Taste"
      subtitle="The action hub for starting, joining, and shaping tasting work."
      archetype="workspace"
      sideRail={
        <InsightRail eyebrow="Mode guide" title="Pick the right path">
          {[
            ['Quick tasting', 'Fast solo capture with notes, photos, and scores.'],
            ['Study', 'Templates and repeatable protocols.'],
            ['Competition', 'Answer keys, rankings, and event energy.'],
            ['Review', 'Turn notes into a finished record.'],
          ].map(([label, body]) => (
            <div key={label} className="rounded-soft border border-line bg-bg px-3 py-3">
              <p className="text-sm font-semibold text-fg">{label}</p>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{body}</p>
            </div>
          ))}
        </InsightRail>
      }
    >
      <div className="animate-fade-in">
        <HeroPanel
          eyebrow="Tasting launchpad"
          title="Choose the fastest useful path."
          description="Start a solo capture, join a room, or set up a structured tasting without making every option compete for attention."
          actions={[
            { label: 'Quick tasting', onClick: () => router.push('/quick-tasting') },
            {
              label: 'Join code',
              onClick: () => router.push('/join-tasting'),
              variant: 'secondary',
            },
          ]}
          media={
            <div className="grid gap-3 rounded-soft border border-line bg-bg px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-primary/10 text-primary">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">Quick tasting</p>
                  <p className="text-xs text-fg-muted">Notes, score, photo, done.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-fg-muted">
                {['Coffee', 'Wine', 'Tea'].map((label) => (
                  <span
                    key={label}
                    className="rounded-sharp border border-line bg-bg-surface px-2 py-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          }
        />

        <section className="rounded-soft border border-line bg-bg-surface shadow-sm">
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              More ways to work
            </p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
            {tasteActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="group flex min-h-[108px] items-start gap-3 bg-bg-surface p-4 text-left transition-colors hover:bg-bg-inset active:bg-bg-inset sm:p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft border border-line bg-bg text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold tracking-normal text-fg">
                        {action.title}
                      </h3>
                      <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                    </div>
                    <p className="mt-1 text-body-sm text-fg-muted">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default TastePage;

export async function getServerSideProps() {
  return { props: {} };
}
