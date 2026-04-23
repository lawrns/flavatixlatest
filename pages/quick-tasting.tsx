import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import CategorySelector from '@/components/quick-tasting/CategorySelector';
import QuickTastingSummary from '@/components/quick-tasting/QuickTastingSummary';
import { toast } from '@/lib/toast';
import PageLayout from '@/components/layout/PageLayout';
import { logger } from '@/lib/logger';
import { normalizeCategoryId } from '@/lib/categoryPacks';
import { HeroPanel, StickyActionBar } from '@/components/ui/PremiumPrimitives';

type _QuickTasting = Database['public']['Tables']['quick_tastings']['Row'];
type QuickTastingWithNull = {
  id: string;
  user_id: string;
  category: string;
  custom_category_name: string | null;
  session_name: string | null;
  notes: string | null;
  total_items: number;
  completed_items: number;
  average_score: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type TastingStep = 'category' | 'session' | 'summary';

const steps: { key: TastingStep; label: string }[] = [
  { key: 'category', label: 'Category' },
  { key: 'session', label: 'Tasting' },
  { key: 'summary', label: 'Summary' },
];

const stepIndex = (step: TastingStep) => steps.findIndex((s) => s.key === step);

const QuickTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient() as any;
  const [currentStep, setCurrentStep] = useState<TastingStep>('category');
  const [currentSession, setCurrentSession] = useState<QuickTastingWithNull | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleCategorySelect = useCallback(async (category: string) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);

    try {
      const { error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError) {
        toast.error('Authentication error. Please try again.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        toast.error('User profile not found. Please contact support.');
        return;
      }

      const { data, error } = await supabase
        .from('quick_tastings')
        .insert({
          user_id: user.id,
          category,
          session_name: `${category.charAt(0).toUpperCase() + category.slice(1)} Tasting`,
          mode: 'quick'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          toast.error('Permission denied. Please try logging out and back in.');
          return;
        } else if (error.code === 'PGRST116') {
          toast.error('Authentication error. Please refresh the page and try again.');
          return;
        } else {
          toast.error('Failed to create tasting session. Please try again.');
          return;
        }
      }

      setCurrentSession(data);
      setCurrentStep('session');
      toast.success('Tasting session started!');
    } catch {
      toast.error('Failed to start tasting session');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    const preset = normalizeCategoryId(router.query.category);

    logger.debug('🔄 QuickTastingPage: preset evaluation', {
      loading,
      hasUser: !!user,
      hasCurrentSession: !!currentSession,
      isLoading,
      preset
    });

    if (!loading && user && !currentSession && !isLoading) {
      if (preset) {
        handleCategorySelect(preset);
      } else {
        setCurrentStep('category');
      }
    }
  }, [router.query.category, user, loading, currentSession, isLoading, handleCategorySelect]);

  const handleSessionComplete = async (sessionData: QuickTastingWithNull) => {
    router.push(`/tasting-summary/${sessionData.id}`);
  };

  const handleStartNewSession = () => {
    setCurrentSession(null);
    setCurrentStep('category');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-bg p-sm">
        <main id="main-content" className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentIdx = stepIndex(currentStep);

  return (
    <PageLayout
      title="New tasting"
      subtitle="Start a quick tasting session to explore flavors and record your impressions"
      showBack
      archetype="workflow"
      stickyAction={
        currentStep === 'session' && currentSession ? (
          <StickyActionBar>
            <div>
              <p className="text-sm font-semibold text-fg">
                {currentSession.session_name || 'Active tasting'}
              </p>
              <p className="text-xs text-fg-muted">
                Autosaves notes and scores as you work
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push('/my-tastings')}
                className="inline-flex min-h-[40px] items-center justify-center rounded-soft border border-line bg-bg px-3 text-sm font-semibold text-fg-muted hover:text-fg"
              >
                Archive
              </button>
            </div>
          </StickyActionBar>
        ) : null
      }
    >
      <HeroPanel
        eyebrow="Flagship workflow"
        title={currentStep === 'category' ? 'Choose a category and start capturing taste.' : 'Stay focused on the item in front of you.'}
        description="Progress, item context, notes, descriptors, and scoring stay close together so the tasting moves without form fatigue."
      />

      <div className="rounded-pane border border-line bg-bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.key}>
              <span
                className={`rounded-full px-3 py-1.5 text-caption font-semibold uppercase tracking-[0.18em] ${
                  idx === currentIdx
                    ? 'bg-primary text-white'
                    : idx < currentIdx
                    ? 'bg-primary/10 text-primary'
                    : 'bg-bg-inset text-fg-subtle'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && <span className="hidden text-fg-subtle sm:inline">/</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-inset">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-pane border border-line bg-bg-surface p-4 shadow-sm sm:p-6">
        {currentStep === 'category' && (
          <CategorySelector
            onCategorySelect={handleCategorySelect}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'session' && (
          <QuickTastingSession
            session={currentSession as any}
            userId={user!.id}
            onSessionComplete={(data) => handleSessionComplete(data as any)}
            onSessionUpdate={(data) => setCurrentSession(data as any)}
            onSessionCreate={(data) => setCurrentSession(data as any)}
          />
        )}

        {currentStep === 'summary' && currentSession && (
          <QuickTastingSummary
            session={currentSession as any}
            onStartNewSession={handleStartNewSession}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default QuickTastingPage;
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
