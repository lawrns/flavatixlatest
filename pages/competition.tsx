import React from 'react';
import { useRouter } from 'next/router';
import { BarChart3, Trophy, Users, PlayCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks';
import PageLayout from '@/components/layout/PageLayout';
import ModeCard from '@/components/ui/ModeCard';

const CompetitionPage: React.FC = () => {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  if (loading || !user) {
    return null;
  }

  return (
    <PageLayout
      title="Competition"
      subtitle="Join a session, create a new bracket, or review how your tasting runs are stacking up."
      containerSize="2xl"
    >
      <div className="space-y-6">
        <section className="rounded-pane border border-line bg-bg-surface/90 p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
                Competition hub
              </p>
              <h2 className="text-h2 font-semibold tracking-tight text-fg">
                Keep competition flows separate from everyday tasting.
              </h2>
              <p className="text-body-sm leading-relaxed text-fg-muted">
                This page groups the actions that matter when you are running or joining
                a scored tasting session.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/taste')}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-body-sm font-semibold text-fg-muted transition-colors hover:text-fg"
            >
              Back to Taste
              <PlayCircle className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            <ModeCard
              icon={Users}
              iconBgColor="bg-signal-good/10"
              iconColor="text-signal-good"
              title="Join Competition"
              description="Enter a competition code and jump into an existing scored tasting session."
              href="/join-tasting"
              delay={0.02}
            />
            <ModeCard
              icon={Trophy}
              iconBgColor="bg-signal-warn/10"
              iconColor="text-signal-warn"
              title="Create Competition"
              description="Set up a new competition session, define the rules, and invite participants."
              href="/create-tasting"
              delay={0.08}
            />
          </div>

          <div className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-inset text-fg-muted">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
                  Status
                </p>
                <h3 className="text-h3 font-semibold text-fg">My competitions</h3>
              </div>
            </div>

            <div className="mt-5 rounded-soft border border-dashed border-line bg-bg-inset p-5">
              <p className="text-body-sm leading-relaxed text-fg-muted">
                No competitions yet. Start one from the cards on the left or join a code
                shared by another host.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default CompetitionPage;
