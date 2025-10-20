import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Zap, Users, ChevronLeft, UserPlus, History } from 'lucide-react';

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
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading...</div>
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
      description: 'Tasting notes on the fly. Take notes and save them for future reference while growing your Flavor Wheels',
      icon: Zap,
      path: '/quick-tasting',
      color: 'primary'
    },
    {
      title: 'Create Tasting',
      description: 'Study Mode, Competition Mode, My Tastings, and Join Tasting',
      icon: Users,
      path: '/create-tasting',
      color: 'secondary'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Taste
            </h1>
            <p className="text-body font-body text-text-secondary">
              Choose your tasting experience
            </p>
          </div>

          {/* Taste Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto mb-lg">
            {tasteOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.path}
                  onClick={() => router.push(option.path)}
                  className="card p-xl text-left hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div className="flex flex-col items-center text-center space-y-md">
                    <div className={`w-20 h-20 rounded-full bg-${option.color}/10 flex items-center justify-center group-hover:bg-${option.color}/20 transition-colors`}>
                      <Icon size={40} className={`text-${option.color}`} />
                    </div>
                    <div>
                      <h2 className="text-h2 font-heading font-semibold text-text-primary mb-sm">
                        {option.title}
                      </h2>
                      <p className="text-body font-body text-text-secondary">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/join-tasting')}
              className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-text-primary">Join Tasting</h3>
                <p className="text-sm text-text-secondary">Enter a code to join</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/my-tastings')}
              className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <History size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-text-primary">My Tastings</h3>
                <p className="text-sm text-text-secondary">View your sessions</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-bold">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
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
