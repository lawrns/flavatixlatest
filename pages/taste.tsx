import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Zap, Users, UserPlus, History } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { CategoryStamp } from '@/components/ui';
import ModeCard from '@/components/ui/ModeCard';
import { LoadingState } from '@/components/ui/LoadingState';

const primaryOptions = [
  {
    title: 'Quick Tasting',
    description: 'Fast notes while tasting — grow your flavor wheels.',
    icon: Zap,
    iconBgColor: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    href: '/quick-tasting',
  },
  {
    title: 'Create Tasting',
    description: 'Study, competition, or group tasting sessions.',
    icon: Users,
    iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-500',
    href: '/create-tasting',
  },
];

const secondaryOptions = [
  {
    title: 'Join Tasting',
    description: "Enter a code to join someone else's session.",
    icon: UserPlus,
    iconBgColor: 'bg-green-500/10 dark:bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-500',
    href: '/join-tasting',
  },
  {
    title: 'My Tastings',
    description: 'Browse your past and ongoing sessions.',
    icon: History,
    iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-500',
    href: '/my-tastings',
  },
];

const TastePage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState variant="skeleton-page" />;
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="Taste"
      subtitle="Choose how you want to capture your tasting experience."
      showBack
      backUrl="/dashboard"
    >
      {/* One-tap presets */}
      <div className="mt-2">
        <p className="text-xs font-medium text-gemini-text-gray dark:text-zinc-400 mb-2">
          Quick presets
        </p>
        <div className="flex flex-wrap gap-2">
          {(['whiskey', 'coffee', 'mezcal'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => router.push(`/quick-tasting?category=${cat}`)}
              className="active:scale-[0.98]"
            >
              <CategoryStamp category={cat} />
            </button>
          ))}
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-3 mt-4">
        {primaryOptions.map((opt) => (
          <ModeCard key={opt.href} {...opt} />
        ))}
      </div>

      {/* Secondary actions */}
      <div className="mt-4">
        <p className="text-xs font-medium text-gemini-text-gray dark:text-zinc-400 mb-2 px-1">
          More options
        </p>
        <div className="flex flex-col gap-3">
          {secondaryOptions.map((opt) => (
            <ModeCard key={opt.href} {...opt} />
          ))}
        </div>
      </div>

      {/* Value proposition */}
      <div className="mt-8 p-4 surface-inset">
        <p className="text-sm text-center text-gemini-text-gray dark:text-zinc-400">
          Every tasting builds your flavor wheels and creates a personal archive of your palate.
        </p>
      </div>
    </PageLayout>
  );
};

export default TastePage;

export async function getServerSideProps() {
  return { props: {} };
}
