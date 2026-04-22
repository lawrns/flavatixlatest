import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { Button } from '@/components/ui/Button';
import { useCurrentProfile } from '@/lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '@/lib/query/hooks/useTastings';
import PageLayout from '@/components/layout/PageLayout';

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
  const { data: recentTastings = [], isLoading: tastingsLoading } = useRecentTastings(
    user?.id,
    5
  );

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
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
    >
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="surface-inset p-4">
          <div className="mb-4 flex items-center gap-3">
            <AvatarWithFallback
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Profile'}
              fallback={(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-h3 font-semibold text-fg truncate">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-body-sm text-fg-muted">
                {profile?.username && `@${profile.username} · `}
                {tastingStats?.totalTastings || profile?.tastings_count || 0} tastings
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-body-sm text-fg-muted">
              Home shows your latest activity. Taste is the dedicated entry point for
              starting or joining a session.
            </p>
            <Button
              onClick={() => router.push('/taste')}
              className="w-full shrink-0 md:w-auto md:self-start"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Open Taste Hub
            </Button>
          </div>
        </div>

        {recentTastings.length > 0 ? (
          <div className="surface-page p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-h3 font-semibold text-fg">Recent Tastings</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/my-tastings')}>
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentTastings.map((tasting) => (
                <button
                  key={tasting.id}
                  onClick={() => router.push(`/tasting/${tasting.id}`)}
                  className="w-full rounded-soft bg-bg-inset p-3 text-left transition-colors hover:bg-bg-hover"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-body-sm font-medium capitalize text-fg">
                      {tasting.category?.replace('_', ' ') || 'Tasting'}
                    </span>
                    <span className="text-caption text-fg-subtle">
                      {tasting.created_at && !isNaN(new Date(tasting.created_at).getTime())
                        ? new Date(tasting.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-caption text-fg-muted">
                    {tasting.average_score && (
                      <>
                        <span className="font-semibold text-primary">
                          {tasting.average_score.toFixed(1)}/100
                        </span>
                        <span className="text-fg-subtle">•</span>
                      </>
                    )}
                    <span>{tasting.total_items || 0} items</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
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
