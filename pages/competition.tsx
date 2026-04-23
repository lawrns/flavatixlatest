import React from 'react';
import { useRouter } from 'next/router';
import { BarChart3, Trophy, Users } from 'lucide-react';
import { useRequireAuth } from '@/hooks';
import PageLayout from '@/components/layout/PageLayout';
import ModeCard from '@/components/ui/ModeCard';
import { AnalyticsStrip, HeroPanel, InsightRail } from '@/components/ui/PremiumPrimitives';

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
      archetype="workspace"
      sideRail={
        <InsightRail eyebrow="Event mode" title="Designed for the room">
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">Answer keys</p>
            <p className="mt-1 text-sm text-fg-muted">Score identification and rubric accuracy.</p>
          </div>
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">Leaderboards</p>
            <p className="mt-1 text-sm text-fg-muted">Keep the competitive state distinct from normal tasting.</p>
          </div>
        </InsightRail>
      }
    >
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Competition hub"
          title="Run tasting events with scoring, answer keys, and clear momentum."
          description="Competition mode keeps event-oriented tasting separate from normal note capture, with join and create actions front and center."
          actions={[
            { label: 'Create competition', onClick: () => router.push('/taste/create/competition/new') },
            { label: 'Join competition', onClick: () => router.push('/join-tasting'), variant: 'secondary' },
          ]}
        />

        <AnalyticsStrip
          items={[
            { label: 'Live', value: 0, hint: 'Active competitions' },
            { label: 'Upcoming', value: 0, hint: 'Scheduled sessions' },
            { label: 'Completed', value: 0, hint: 'Past scored events' },
          ]}
          className="xl:grid-cols-3"
        />

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
              <div className="flex h-11 w-11 items-center justify-center rounded-pane bg-bg-inset text-fg-muted">
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
