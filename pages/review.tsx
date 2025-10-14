import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, PenTool, History, ChevronLeft } from 'lucide-react';

const ReviewPage: React.FC = () => {
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

  const reviewOptions = [
    {
      title: 'Review',
      description: 'for in depth analysis of flavor characteristics',
      icon: FileText,
      path: '/review/create',
      color: 'primary'
    },
    {
      title: 'Prose Review',
      description: 'just write my review',
      icon: PenTool,
      path: '/review/prose',
      color: 'secondary'
    },
    {
      title: 'My Reviews',
      description: 'Review History',
      icon: History,
      path: '/review/my-reviews',
      color: 'accent'
    }
  ];

  return (
    <div className="bg-background-light font-display text-zinc-900 min-h-screen">
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
              Reviews
            </h1>
            <p className="text-body font-body text-text-secondary">
              Create detailed reviews or browse your review history
            </p>
          </div>

          {/* Review Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md max-w-6xl mx-auto">
            {reviewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.path}
                  onClick={() => router.push(option.path)}
                  className="card p-lg text-left hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div className="flex flex-col items-center text-center space-y-md">
                    <div className={`w-16 h-16 rounded-full bg-${option.color}/10 flex items-center justify-center group-hover:bg-${option.color}/20 transition-colors`}>
                      <Icon size={32} className={`text-${option.color}`} />
                    </div>
                    <div>
                      <h2 className="text-h3 font-heading font-semibold text-text-primary mb-xs">
                        {option.title}
                      </h2>
                      <p className="text-small font-body text-text-secondary">
                        ({option.description})
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-xl max-w-4xl mx-auto">
            <div className="card p-md bg-primary/5 border-primary/20">
              <h3 className="text-h4 font-heading font-semibold text-text-primary mb-sm">
                About Reviews
              </h3>
              <div className="space-y-sm text-small font-body text-text-secondary">
                <p>
                  <strong>Review:</strong> Conduct an in-depth analysis with structured scoring (1-100) across 12 characteristics including aroma, flavor, texture, and more.
                </p>
                <p>
                  <strong>Prose Review:</strong> Write a free-form review in your own words. Descriptors from your text will be automatically added to your flavor wheels.
                </p>
                <p>
                  <strong>My Reviews:</strong> Access all your completed reviews, prose reviews, and reviews in progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-medium">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-bold">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default ReviewPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
