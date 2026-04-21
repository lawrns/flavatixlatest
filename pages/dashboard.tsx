import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import SocialFeedWidget from '../components/social/SocialFeedWidget';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { Button } from '@/components/ui/Button';
import { getUserPresets, DEFAULT_PRESETS } from '@/lib/presetService';
import { CategoryPackId } from '@/lib/categoryPacks';
import { useCurrentProfile } from '../lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '../lib/query/hooks/useTastings';
import PageLayout from '@/components/layout/PageLayout';
import { Zap, Users, UserPlus } from 'lucide-react';

const tasteActions = [
  { label: 'Quick Tasting', href: '/quick-tasting', icon: Zap },
  { label: 'Create Session', href: '/create-tasting', icon: Users },
  { label: 'Join Session', href: '/join-tasting', icon: UserPlus },
];

function formatCategoryName(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [quickPresets, setQuickPresets] = useState<CategoryPackId[]>(DEFAULT_PRESETS);
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: tastingStats, isLoading: statsLoading } = useTastingStats(user?.id);
  const { data: recentTastings = [], isLoading: tastingsLoading } = useRecentTastings(user?.id, 5);

  const loading = authLoading || profileLoading || statsLoading || tastingsLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (user) {
      setQuickPresets(getUserPresets());
    }
  }, [user, authLoading, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <PageLayout
      title="Home"
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
    >
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Welcome */}
        <div className="surface-inset p-4">
          <div className="flex items-center gap-3 mb-4">
            <AvatarWithFallback
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Profile'}
              fallback={(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-h3 font-semibold text-fg truncate">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-body-sm text-fg-muted">
                {profile?.username && `@${profile.username} · `}
                {tastingStats?.totalTastings || profile?.tastings_count || 0} tastings
              </p>
            </div>
          </div>

          {/* Taste actions */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {tasteActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex items-center gap-2 text-body-sm text-fg hover:text-fg-muted transition-colors"
              >
                <action.icon className="w-4 h-4 text-fg-muted" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-caption text-fg-muted mb-2">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => router.push(`/quick-tasting?category=${category}`)}
                  className="bg-bg-inset rounded-soft px-3 py-1 text-caption text-fg hover:bg-bg-hover transition-colors"
                >
                  {formatCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tastings */}
        {recentTastings.length > 0 ? (
          <div className="surface-page p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold text-fg">
                Recent Tastings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/my-tastings')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentTastings.map((tasting) => (
                <button
                  key={tasting.id}
                  onClick={() => router.push(`/tasting/${tasting.id}`)}
                  className="w-full bg-bg-inset p-3 rounded-soft hover:bg-bg-hover transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm font-medium text-fg capitalize">
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
                        <span className="text-primary font-semibold">
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

        {/* Social Feed Widget */}
        {user && <SocialFeedWidget userId={user.id} limit={5} />}
      </div>
    </PageLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
