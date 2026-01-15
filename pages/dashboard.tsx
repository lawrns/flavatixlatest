import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/SimpleAuthContext';
import SocialFeedWidget from '../components/social/SocialFeedWidget';
import BottomNavigation from '../components/navigation/BottomNavigation';
import NotificationSystem from '../components/notifications/NotificationSystem';
import Container from '../components/layout/Container';
import { cn } from '@/lib/utils';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import UserAvatarMenu from '@/components/navigation/UserAvatarMenu';
import { CategoryStamp } from '@/components/ui';
import { getUserPresets, DEFAULT_PRESETS } from '@/lib/presetService';
import { CategoryPackId } from '@/lib/categoryPacks';
import { useCurrentProfile } from '../lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '../lib/query/hooks/useTastings';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [quickPresets, setQuickPresets] = useState<CategoryPackId[]>(DEFAULT_PRESETS);
  const router = useRouter();

  // React Query hooks for data fetching
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: tastingStats, isLoading: statsLoading } = useTastingStats(user?.id);
  const { data: recentTastings = [], isLoading: tastingsLoading } = useRecentTastings(user?.id, 5);

  // Combined loading state
  const loading = authLoading || profileLoading || statsLoading || tastingsLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      // Load quick presets from localStorage
      const presets = getUserPresets();
      setQuickPresets(presets);
    }
  }, [user, authLoading, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen font-sans',
        'bg-white dark:bg-zinc-900',
        'text-gemini-text-dark dark:text-zinc-50'
      )}
    >
      <div className="flex min-h-screen flex-col">
        {/* Gemini-style Header */}
        <header
          className={cn(
            'sticky top-0 z-40',
            'bg-white dark:bg-zinc-900',
            'border-b border-gemini-border dark:border-zinc-700/50',
            'pt-4 pb-0'
          )}
        >
          <Container size="md" className="flex items-center justify-between pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gemini-text-dark dark:text-white tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {user && <NotificationSystem userId={user.id} />}
              <UserAvatarMenu
                avatarUrl={profile?.avatar_url || undefined}
                displayName={profile?.full_name || undefined}
                email={user?.email || undefined}
                size={40}
              />
            </div>
          </Container>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <Container size="md" className="pt-6 animate-fade-in flex flex-col gap-8">
            {/* Unified Compact Header */}
            <div
              className={cn(
                'rounded-[22px] p-4',
                'bg-gemini-card dark:bg-zinc-800/80',
                'shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              )}
            >
              {/* Avatar and Welcome */}
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
                    {profile?.username && `@${profile.username}`}
                    {profile?.username && ' | '}
                    {tastingStats?.totalTastings || profile?.tastings_count || 0} tastings
                    {profile?.created_at &&
                      ` | Member since ${new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              {/* Quick tasting presets */}
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

            {/* Quick Actions */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/history')}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-[22px] hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="material-symbols-outlined">history</span>
                <div className="text-left">
                  <div className="font-medium">View History</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Your past tastings</div>
                </div>
              </button>

              {/* Recent Tastings */}
              {recentTastings.length > 0 ? (
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-[22px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      Recent Tastings
                    </h3>
                    <button
                      onClick={() => router.push('/history')}
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
                        className="w-full bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors text-left"
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
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-[22px] text-center">
                  <div className="text-zinc-400 mb-3">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    No Tastings Yet
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                    Start your flavor journey today!
                  </p>
                  <button
                    onClick={() => router.push('/taste')}
                    className="px-4 py-2 bg-primary text-white rounded-[14px] hover:bg-primary-hover transition-colors"
                  >
                    Create Your First Tasting
                  </button>
                </div>
              )}

              {/* Social Feed Widget */}
              {user && <SocialFeedWidget userId={user.id} limit={5} />}
            </div>
          </Container>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
