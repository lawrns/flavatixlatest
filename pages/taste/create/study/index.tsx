import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { BookOpen, FileText, ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { HeroPanel } from '@/components/ui/PremiumPrimitives';

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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="Study Mode"
      subtitle="Create a structured tasting session for learning and evaluation"
      showBack
      backUrl="/create-tasting"
      archetype="workspace"
    >
      <HeroPanel
        eyebrow="Study setup"
        title="Build a guided tasting from scratch or start with a protocol."
        description="Study mode is for repeatable sensory work, templates, and collaborative learning."
      />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => router.push('/taste/create/study/new')}
              className="surface-page p-xl text-center hover:shadow-md transition-all duration-200 group rounded-pane"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen size={40} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-h3 font-semibold text-fg mb-sm">
                    Create Tasting
                  </h2>
                  <p className="text-body text-fg-muted">
                    Build a custom tasting from scratch
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/taste/create/study/templates')}
              className="surface-page p-xl text-center hover:shadow-md transition-all duration-200 group rounded-pane"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <FileText size={40} className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-h3 font-semibold text-fg mb-sm">
                    Use Template
                  </h2>
                  <p className="text-body text-fg-muted">
                    Start with a preset protocol
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/create-tasting')}
              className="surface-page p-xl text-center hover:shadow-md transition-all duration-200 group rounded-pane"
            >
              <div className="flex flex-col items-center space-y-md">
                <div className="w-20 h-20 rounded-full bg-bg-inset flex items-center justify-center group-hover:bg-bg-inset transition-colors">
                  <ArrowLeft size={40} className="text-fg-muted dark:text-fg-muted" />
                </div>
                <div>
                  <h2 className="text-h3 font-semibold text-fg mb-sm">
                    Back
                  </h2>
                  <p className="text-body text-fg-muted">
                    Return to tasting options
                  </p>
                </div>
              </div>
            </button>
          </div>
    </PageLayout>
  );
};

export default StudyModeLanding;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
