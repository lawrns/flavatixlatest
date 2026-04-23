import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Clock, Coffee, Sparkles, Wine } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { Button } from '@/components/ui/Button';
import { useCurrentProfile } from '@/lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '@/lib/query/hooks/useTastings';
import PageLayout from '@/components/layout/PageLayout';
import {
  AnalyticsStrip,
  DescriptorChipSet,
  HeroPanel,
  InsightRail,
  SessionPreviewCard,
} from '@/components/ui/PremiumPrimitives';

const SocialFeedWidget = dynamic(() => import('@/components/social/SocialFeedWidget'), {
  ssr: false,
  loading: () => (
    <div className="surface-page p-4">
      <div className="mb-4 h-6 w-40 rounded-full bg-bg-inset animate-pulse" />
      <div className="space-y-3">
        <div className="h-20 rounded-soft bg-bg-inset animate-pulse" />
        <div className="h-20 rounded-soft bg-bg-inset animate-pulse" />
        <div className="h-20 rounded-soft bg-bg-inset animate-pulse" />
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: tastingStats, isLoading: statsLoading } = useTastingStats(user?.id);
  const { data: recentTastings = [], isLoading: tastingsLoading } = useRecentTastings(user?.id, 5);

  const loading = authLoading || profileLoading || statsLoading || tastingsLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (!user || loading) {
    return null;
  }

  return (
    <PageLayout
      title="Home"
      archetype="workspace"
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
      sideRail={
        <InsightRail eyebrow="Next best action" title="Keep tasting momentum">
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">Start a focused tasting</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Quick tasting is the fastest path when you have something in front of you.
            </p>
            <Button className="mt-4 w-full" onClick={() => router.push('/quick-tasting')}>
              Start tasting
            </Button>
          </div>
          <DescriptorChipSet
            items={[
              { label: 'Coffee', value: tastingStats?.categoryCounts?.coffee || 0 },
              { label: 'Wine', value: tastingStats?.categoryCounts?.wine || 0 },
              { label: 'Tea', value: tastingStats?.categoryCounts?.tea || 0 },
              { label: 'Spirits', value: tastingStats?.categoryCounts?.spirits || 0 },
            ]}
          />
        </InsightRail>
      }
    >
      <div className="animate-fade-in">
        <HeroPanel
          eyebrow="Resume your work"
          title={<>Welcome back, {profile?.full_name || user?.email?.split('@')[0]}</>}
          description="Your dashboard is the control center for active tastings, review drafts, flavor patterns, and the next sensory decision."
          actions={[
            { label: 'Start quick tasting', onClick: () => router.push('/quick-tasting') },
            { label: 'Open Taste Hub', onClick: () => router.push('/taste'), variant: 'secondary' },
          ]}
          media={
            <div className="grid h-full gap-3 rounded-soft border border-line bg-bg p-3">
              <div className="flex items-center gap-3">
                <AvatarWithFallback
                  src={profile?.avatar_url}
                  alt={profile?.full_name || 'Profile'}
                  fallback={(profile?.full_name || user?.email || '?')[0].toUpperCase()}
                  size={48}
                />
                <div>
                  <p className="text-sm font-semibold text-fg">
                    {profile?.username ? `@${profile.username}` : 'Tasting profile'}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {tastingStats?.recentActivity || 0} sessions in the last 30 days
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Coffee, label: 'Coffee' },
                  { icon: Wine, label: 'Wine' },
                  { icon: Sparkles, label: 'Wheels' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-soft border border-line bg-bg-surface p-3 text-center"
                  >
                    <Icon className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-2 text-xs font-medium text-fg-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <AnalyticsStrip
          items={[
            {
              label: 'Tastings',
              value: tastingStats?.totalTastings || profile?.tastings_count || 0,
              hint: 'All captured sessions',
            },
            {
              label: 'Completed',
              value: tastingStats?.completedTastings || 0,
              hint: 'Finished records',
            },
            {
              label: 'Avg score',
              value: tastingStats?.averageScore ? tastingStats.averageScore.toFixed(1) : '—',
              hint: 'Across completed sessions',
            },
            { label: 'Recent', value: tastingStats?.recentActivity || 0, hint: 'Last 30 days' },
          ]}
        />

        {recentTastings.length > 0 ? (
          <section className="rounded-soft border border-line bg-bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                  Recent work
                </p>
                <h3 className="mt-1 text-lg font-semibold text-fg">Recent Tastings</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/my-tastings')}>
                View All
              </Button>
            </div>
            <div className="grid divide-y divide-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {recentTastings.map((tasting) => (
                <SessionPreviewCard
                  key={tasting.id}
                  title={
                    tasting.session_name ||
                    `${tasting.category?.replace('_', ' ') || 'Tasting'} session`
                  }
                  subtitle={
                    tasting.created_at && !isNaN(new Date(tasting.created_at).getTime())
                      ? new Date(tasting.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent session'
                  }
                  meta={
                    <div className="flex flex-wrap items-center gap-2 text-caption text-fg-muted">
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-inset px-2.5 py-1 capitalize">
                        <Clock className="h-3 w-3" />
                        {tasting.completed_at ? 'Completed' : 'In progress'}
                      </span>
                      <span>{tasting.total_items || 0} items</span>
                      {tasting.average_score && (
                        <span className="font-semibold text-primary">
                          {tasting.average_score.toFixed(1)}/100
                        </span>
                      )}
                    </div>
                  }
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/tasting/${tasting.id}`)}
                    >
                      Open
                    </Button>
                  }
                  className="rounded-none border-0 bg-transparent shadow-none"
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="surface-page p-6">
            <EmptyStateCard
              image="/generated-images/empty-tastings.webp"
              headline="No tastings yet — start your first flight"
              description="Capture a few notes and you'll unlock a personalized flavor wheel that evolves with every session."
              cta={{
                label: 'Start a Tasting',
                onClick: () => router.push('/quick-tasting'),
                variant: 'primary',
              }}
              secondaryCta={{
                label: 'Explore Flavor Wheels',
                onClick: () => router.push('/flavor-wheels'),
              }}
            />
          </div>
        )}

        {user && <SocialFeedWidget userId={user.id} limit={5} />}
      </div>
    </PageLayout>
  );
}
