import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, BookOpen, FileText, ArrowLeft } from 'lucide-react';

const StudyModeLanding: React.FC = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 min-h-screen">
      <main id="main-content" className="pb-20">
        <div className="container mx-auto px-md py-lg max-w-4xl">
          <div className="mb-lg">
            <button
              onClick={() => router.push('/create-tasting')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Study Mode
            </h1>
            <p className="text-body font-body text-text-secondary">
              Create a structured tasting session for learning and evaluation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <button
              onClick={() => router.push('/taste/create/study/new')}
              className="card p-xl text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen size={40} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-h3 font-heading font-semibold text-text-primary mb-sm">
                    Create Tasting
                  </h2>
                  <p className="text-body font-body text-text-secondary">
                    Build a custom tasting from scratch
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/taste/create/study/templates')}
              className="card p-xl text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <FileText size={40} className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-h3 font-heading font-semibold text-text-primary mb-sm">
                    Use Template
                  </h2>
                  <p className="text-body font-body text-text-secondary">
                    Start with a preset protocol
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/create-tasting')}
              className="card p-xl text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <ArrowLeft size={40} className="text-zinc-600" />
                </div>
                <div>
                  <h2 className="text-h3 font-heading font-semibold text-text-primary mb-sm">
                    Back
                  </h2>
                  <p className="text-body font-body text-text-secondary">
                    Return to tasting options
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-bold">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
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

export default StudyModeLanding;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
