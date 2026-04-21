import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import SocialFeedWidget from '../components/social/SocialFeedWidget';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import { CategoryStamp } from '@/components/ui';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { Button } from '@/components/ui/Button';
import { getUserPresets, DEFAULT_PRESETS } from '@/lib/presetService';
import { CategoryPackId } from '@/lib/categoryPacks';
import { useCurrentProfile } from '../lib/query/hooks/useProfile';
import { useRecentTastings, useTastingStats } from '../lib/query/hooks/useTastings';
import PageLayout from '@/components/layout/PageLayout';
import { Zap, Users, UserPlus } from 'lucide-react';

const jumpToLinks = [
  { label: 'Social Feed', sub: 'See what others are tasting', href: '/social', icon: 'people' },
  { label: 'Competition', sub: 'Join or create a flight', href: '/competition', icon: 'emoji_events' },
  { label: 'My Tastings', sub: 'All past sessions', href: '/my-tastings', icon: 'history' },
  { label: 'Profile', sub: 'Edit your account', href: '/profile', icon: 'account_circle' },
];

const tasteActions = [
  { label: 'Quick Tasting', href: '/quick-tasting', icon: Zap, desc: 'Fast notes while tasting' },
  { label: 'Create Session', href: '/create-tasting', icon: Users, desc: 'Study or competition' },
  { label: 'Join Session', href: '/join-tasting', icon: UserPlus, desc: 'Enter a code' },
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
      title="Home"
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
    >
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Welcome + Quick actions */}
        <div className="surface-inset p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AvatarWithFallback
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Profile'}
              fallback={(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-h3 font-semibold text-fg dark:text-white truncate">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-body-sm text-fg-muted dark:text-zinc-400">
                {profile?.username && `@${profile.username} · `}
                {tastingStats?.totalTastings || profile?.tastings_count || 0} tastings
              </p>
            </div>
          </div>

          {/* Taste actions — merged from /taste */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {tasteActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-1 p-3 rounded-soft bg-bg-surface dark:bg-zinc-800 border border-line dark:border-zinc-700 hover:bg-bg-hover dark:hover:bg-zinc-700 transition-colors text-center"
              >
                <action.icon className="w-5 h-5 text-primary" />
                <span className="text-caption font-medium text-fg dark:text-zinc-100">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-caption font-medium text-fg-muted dark:text-zinc-400 mb-2 uppercase tracking-wider">
              Quick presets
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
              <h3 className="text-h3 font-semibold text-fg dark:text-zinc-50">
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
                  className="w-full bg-bg-inset dark:bg-zinc-700 p-3 rounded-soft hover:bg-bg-hover dark:hover:bg-zinc-600 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-fg dark:text-zinc-50 font-medium capitalize">
                      {tasting.category?.replace('_', ' ') || 'Tasting'}
                    </span>
                    <span className="text-fg-subtle text-caption">
                      {tasting.created_at && !isNaN(new Date(tasting.created_at).getTime())
                        ? new Date(tasting.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-body-sm text-fg-muted dark:text-zinc-300">
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

        {/* Jump to */}
        <div>
          <p className="text-caption font-medium text-fg-muted dark:text-zinc-400 mb-2 px-1 uppercase tracking-wider">
            Quick links
          </p>
          <div className="surface-page divide-y divide-line dark:divide-zinc-700/60 overflow-hidden">
            {jumpToLinks.map(({ label, sub, href, icon }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover dark:hover:bg-zinc-700/50 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-fg-subtle dark:text-zinc-500 text-xl">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-medium text-fg dark:text-zinc-100">
                    {label}
                  </div>
                  <div className="text-caption text-fg-muted dark:text-zinc-400">{sub}</div>
                </div>
                <span className="material-symbols-outlined text-fg-subtle dark:text-zinc-600 text-base">
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
