import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import SocialFeedWidget from '../components/social/SocialFeedWidget';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import { CategoryStamp } from '@/components/ui';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { getUserPresets, DEFAULT_PRESETS } from '@/lib/presetService';
import { CategoryPackId } from '@/lib/categoryPacks';
import { useCurrentProfile } from '../lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '../lib/query/hooks/useTastings';
import PageLayout from '@/components/layout/PageLayout';

const jumpToLinks = [
  { label: 'Social Feed', sub: 'See what others are tasting', href: '/social', icon: 'people' },
  { label: 'Competition', sub: 'Join or create a flight', href: '/competition', icon: 'emoji_events' },
  { label: 'My Tastings', sub: 'All past sessions', href: '/my-tastings', icon: 'history' },
  { label: 'Profile', sub: 'Edit your account', href: '/profile', icon: 'account_circle' },
];

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
      title="Dashboard"
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
    >
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Welcome card */}
        <div className="surface-inset p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <AvatarWithFallback
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Profile'}
              fallback={(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gemini-text-dark dark:text-white truncate">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                {profile?.username && `@${profile.username} · `}
                {tastingStats?.totalTastings || profile?.tastings_count || 0} tastings
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gemini-text-gray dark:text-zinc-400 mb-2">
              Quick tasting presets
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => router.push(`/quick-tasting?category=${category}`)}
                  className="active:scale-[0.98]"
                >
                  <CategoryStamp category={category} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tastings */}
        {recentTastings.length > 0 ? (
          <div className="surface-page p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Recent Tastings
              </h3>
              <button
                onClick={() => router.push('/my-tastings')}
                className="text-primary hover:underline text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentTastings.map((tasting) => (
                <button
                  key={tasting.id}
                  onClick={() => router.push(`/tasting/${tasting.id}`)}
                  className="w-full bg-zinc-50 dark:bg-zinc-700 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-900 dark:text-zinc-50 font-medium capitalize">
                      {tasting.category?.replace('_', ' ') || 'Tasting'}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {tasting.created_at && !isNaN(new Date(tasting.created_at).getTime())
                        ? new Date(tasting.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {tasting.average_score && (
                      <>
                        <span className="text-primary font-semibold">
                          {tasting.average_score.toFixed(1)}/100
                        </span>
                        <span className="text-zinc-400">•</span>
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
                onClick: () => router.push('/taste'),
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

        {/* Jump to */}
        <div>
          <p className="text-xs font-medium text-gemini-text-gray dark:text-zinc-400 mb-2 px-1">
            Quick links
          </p>
          <div className="surface-page divide-y divide-zinc-100 dark:divide-zinc-700/60 overflow-hidden">
            {jumpToLinks.map(({ label, sub, href, icon }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-gemini-text-muted dark:text-zinc-500 text-xl">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gemini-text-dark dark:text-zinc-100">
                    {label}
                  </div>
                  <div className="text-xs text-gemini-text-gray dark:text-zinc-400">{sub}</div>
                </div>
                <span className="material-symbols-outlined text-gemini-text-muted dark:text-zinc-600 text-base">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
