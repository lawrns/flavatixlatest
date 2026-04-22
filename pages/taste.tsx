import React from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, BarChart3, FileText, PlayCircle, UserPlus, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const tasteActions = [
  {
    title: 'Quick Tasting',
    description: 'Start a guided session and capture notes fast.',
    href: '/quick-tasting',
    icon: PlayCircle,
  },
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
      containerSize="xl"
    >
      <div className="space-y-6 animate-fade-in">
        <section className="surface-inset p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
                Tasting hub
              </p>
              <h2 className="text-h3 font-semibold text-fg">
                One place for everything that starts a tasting.
              </h2>
              <p className="text-body-sm text-fg-muted">
                Use this page for the active paths. Home stays on overview and recent activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-body-sm font-medium text-fg-muted hover:text-fg transition-colors"
            >
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tasteActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="group rounded-pane border border-line bg-bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-fg-muted/40 hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-inset text-fg-muted transition-colors group-hover:text-fg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-body font-medium text-fg">{action.title}</h3>
                      <p className="mt-1 text-body-sm text-fg-muted">{action.description}</p>
                    </div>
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
