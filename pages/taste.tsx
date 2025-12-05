import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { 
  Zap, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  UserPlus, 
  History 
} from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';

// Taste mode card component with motion
interface TasteModeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  onClick: () => void;
  delay?: number;
}

const TasteModeCard: React.FC<TasteModeCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  onClick,
  delay = 0
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/60 
                 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out
                 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30
                 active:scale-[0.98] active:shadow-lg
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
                 opacity-100"
    >
      <div className="flex items-start gap-4">
        {/* Icon Badge */}
        <div 
          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full ${iconBgColor} 
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-110`}
        >
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 self-center">
          <ChevronRight 
            className="w-5 h-5 text-zinc-400 dark:text-zinc-500 transition-transform duration-300
                       group-hover:translate-x-1 group-hover:text-primary" 
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
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-safe">
      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          {/* Back button with underline animation */}
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 
                       mb-4 transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-0.5" />
            <span className="relative">
              Back to dashboard
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </span>
          </button>

          {/* Hero header */}
          <div className="relative">
            {/* Decorative dots */}
            <div className="absolute -top-2 -left-2 flex gap-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Taste
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
                Choose how you want to capture your tasting experience.
              </p>
            </div>

            {/* Subtle gradient underline */}
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-blue-500 to-green-500 opacity-70" />
          </div>
        </div>

        {/* Taste Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {tasteOptions.map((option, index) => (
            <TasteModeCard
              key={option.path}
              title={option.title}
              description={option.description}
              icon={option.icon}
              iconBgColor={option.iconBgColor}
              iconColor={option.iconColor}
              onClick={() => router.push(option.path)}
              delay={index * 50}
            />
          ))}
        </div>

        {/* Value proposition */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-blue-500/5 to-green-500/5 
                        border border-zinc-200/50 dark:border-zinc-700/50">
          <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
            Every tasting builds your flavor wheels and creates a personal archive of your palate.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default TastePage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
