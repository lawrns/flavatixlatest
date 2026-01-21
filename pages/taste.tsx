import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import {
  Zap,
  Users,
  ChevronRight,
  UserPlus,
  History
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { CategoryStamp } from '@/components/ui';

// Taste mode card component with motion
interface TasteModeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  onClick: () => void;
  _delay?: number;
}

const TasteModeCard: React.FC<TasteModeCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  onClick,
  _delay
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-gemini-card dark:bg-zinc-800/90
                 rounded-[22px] p-5 transition-all duration-200 ease-out
                 shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                 hover:shadow-md active:scale-[0.98]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        {/* Icon Badge */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgColor}
                      flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gemini-text-dark dark:text-zinc-50">
            {title}
          </h3>
          <p className="text-sm text-gemini-text-gray dark:text-zinc-400 line-clamp-1">
            {description}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          <ChevronRight
            className="w-5 h-5 text-gemini-text-muted dark:text-zinc-500"
          />
        </div>
      </div>
    </button>
  );
};

const TastePage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tasteOptions = [
    {
      title: 'Quick Tasting',
      description: 'Fast notes while tasting — grow your flavor wheels.',
      icon: Zap,
      iconBgColor: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary',
      path: '/quick-tasting'
    },
    {
      title: 'Create Tasting',
      description: 'Study, competition, or group tasting sessions.',
      icon: Users,
      iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
      path: '/create-tasting'
    },
    {
      title: 'Join Tasting',
      description: "Enter a code to join someone else's session.",
      icon: UserPlus,
      iconBgColor: 'bg-green-500/10 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-500',
      path: '/join-tasting'
    },
    {
      title: 'My Tastings',
      description: 'Browse your past and ongoing sessions.',
      icon: History,
      iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-500',
      path: '/my-tastings'
    }
  ];

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
          <button
            type="button"
            onClick={() => router.push('/quick-tasting?category=whiskey')}
            className="active:scale-[0.98]"
          >
            <CategoryStamp category="whiskey" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/quick-tasting?category=coffee')}
            className="active:scale-[0.98]"
          >
            <CategoryStamp category="coffee" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/quick-tasting?category=mezcal')}
            className="active:scale-[0.98]"
          >
            <CategoryStamp category="mezcal" />
          </button>
        </div>
      </div>

      {/* Taste Options */}
      <div className="flex flex-col gap-3 mt-2">
          {tasteOptions.map((option, index) => (
            <TasteModeCard
              key={option.path}
              title={option.title}
              description={option.description}
              icon={option.icon}
              iconBgColor={option.iconBgColor}
              iconColor={option.iconColor}
              onClick={() => router.push(option.path)}
              _delay={index * 50}
            />
          ))}
        </div>

      {/* Value proposition */}
      <div className="mt-8 p-4 rounded-[22px] bg-gemini-card dark:bg-zinc-800">
        <p className="text-sm text-center text-gemini-text-gray dark:text-zinc-400">
          Every tasting builds your flavor wheels and creates a personal archive of your palate.
        </p>
      </div>
    </PageLayout>
  );
};

export default TastePage;
