import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import CategorySelector from '@/components/quick-tasting/CategorySelector';
import QuickTastingSummary from '@/components/quick-tasting/QuickTastingSummary';
import { toast } from '@/lib/toast';

type QuickTasting = Database['public']['Tables']['quick_tastings']['Row'];
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

// Helper functions to convert between types
const toQuickTasting = (data: QuickTastingWithNull): QuickTasting => ({
  ...data,
  session_name: data.session_name === null ? undefined : data.session_name,
  notes: data.notes === null ? undefined : data.notes,
  average_score: data.average_score === null ? undefined : data.average_score,
  completed_at: data.completed_at === null ? undefined : data.completed_at,
  custom_category_name: data.custom_category_name,
} as any);

const toQuickTastingWithNull = (data: QuickTasting): QuickTastingWithNull => ({
  ...data,
  session_name: data.session_name === undefined ? null : data.session_name,
  notes: data.notes === undefined ? null : data.notes,
  average_score: data.average_score === undefined ? null : data.average_score,
  completed_at: data.completed_at === undefined ? null : data.completed_at,
  custom_category_name: (data as any).custom_category_name || null,
} as QuickTastingWithNull);

type TastingStep = 'category' | 'session' | 'summary';

const QuickTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading, refreshSession } = useAuth();
  const supabase = getSupabaseClient() as any;
  const [currentStep, setCurrentStep] = useState<TastingStep>('session');
  const [currentSession, setCurrentSession] = useState<QuickTastingWithNull | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    console.log('🔄 QuickTastingPage: useEffect triggered', {
      loading,
      hasUser: !!user,
      hasCurrentSession: !!currentSession,
      isLoading
    });

    if (!loading && user && !currentSession && !isLoading) {
      console.log('🔄 QuickTastingPage: Creating default session for user:', user.id);

      // Create default session with coffee category
      const createDefaultSession = async () => {
        setIsLoading(true);
        try {
          console.log('📝 QuickTastingPage: Inserting session...');
          const { data, error } = await supabase
            .from('quick_tastings')
            .insert({
              user_id: user.id,
              category: 'coffee',
              session_name: 'Quick Tasting',
              mode: 'quick'
            })
            .select()
            .single();

          if (error) {
            console.error('❌ QuickTastingPage: Error creating session:', error);
            throw error;
          }

          console.log('✅ QuickTastingPage: Session created:', data.id);
          setCurrentSession(data);
        } catch (error) {
          console.error('❌ QuickTastingPage: Error in createDefaultSession:', error);
          toast.error('Failed to start tasting session');
        } finally {
          setIsLoading(false);
        }
      };

      createDefaultSession();
    }
  }, [user, loading, currentSession, isLoading, supabase]);

  const handleCategorySelect = async (category: string) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Refreshing session for auth synchronization...');
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError) {
        console.error('Session refresh failed:', sessionError);
        toast.error('Authentication error. Please try again.');
        return;
      }

      console.log('Session refreshed successfully');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('User profile not found:', profileError);
        toast.error('User profile not found. Please contact support.');
        return;
      }

      console.log('Auth state debug:', {
        'auth.uid()': (await supabase.auth.getUser()).data.user?.id,
        'user.id': user.id,
        'profile.user_id': profile.user_id,
        'session': (await supabase.auth.getSession()).data.session
      });

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
        console.error('Error creating tasting session:', error);
        console.error('RLS Policy Debug:', {
          'Attempting to insert user_id': user.id,
          'Current auth.uid()': (await supabase.auth.getUser()).data.user?.id,
          'Error details': error
        });

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
    } catch (error) {
      console.error('Error creating tasting session:', error);
      toast.error('Failed to start tasting session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = async (sessionData: QuickTastingWithNull) => {
    setCurrentSession(sessionData);
    setCurrentStep('summary');
  };

  const handleStartNewSession = () => {
    setCurrentSession(null);
    setCurrentStep('session');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-app p-sm">
        <main id="main-content" className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-20">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg">
          <div className="mb-lg">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Quick Tasting
            </h1>
            <p className="text-body font-body text-text-secondary">
              Start a quick tasting session to explore flavors and record your impressions
            </p>
          </div>

          <div className="mb-lg">
            <div className="flex items-center justify-center space-x-sm">
              <div className={`flex items-center ${
                currentStep === 'session' ? 'text-neutral-800' :
                currentStep === 'summary' ? 'text-neutral-600' : 'text-text-secondary'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 'session' ? 'border-neutral-800 bg-neutral-800 text-white' :
                  currentStep === 'summary' ? 'border-neutral-600 bg-neutral-600 text-white' :
                  'border-border-default bg-white dark:bg-zinc-800 text-text-secondary'
                }`}>
                  1
                </div>
                <span className="ml-xs font-body font-medium">Tasting</span>
              </div>
              <div className={`w-8 h-0.5 ${
                currentStep === 'summary' ? 'bg-neutral-600' : 'bg-border-default'
              }`}></div>
              <div className={`flex items-center ${
                currentStep === 'summary' ? 'text-neutral-800' : 'text-text-secondary'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 'summary' ? 'border-neutral-800 bg-neutral-800 text-white' :
                  'border-border-default bg-white dark:bg-zinc-800 text-text-secondary'
                }`}>
                  2
                </div>
                <span className="ml-xs font-body font-medium">Summary</span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
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

export default QuickTastingPage;
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
