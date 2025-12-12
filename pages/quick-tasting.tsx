import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import CategorySelector from '@/components/quick-tasting/CategorySelector';
import QuickTastingSummary from '@/components/quick-tasting/QuickTastingSummary';
import { toast } from '@/lib/toast';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/layout/Container';
import { logger } from '@/lib/logger';

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
    logger.debug('🔄 QuickTastingPage: useEffect triggered', {
      loading,
      hasUser: !!user,
      hasCurrentSession: !!currentSession,
      isLoading
    });

    if (!loading && user && !currentSession && !isLoading) {
      logger.debug('🔄 QuickTastingPage: Creating default session for user:', user.id);

      // Create default session with coffee category
      const createDefaultSession = async () => {
        setIsLoading(true);
        try {
          logger.debug('📝 QuickTastingPage: Inserting session...');
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
            logger.error('[ERROR] QuickTastingPage: Error creating session:', error);
            throw error;
          }

          logger.debug('[SUCCESS] QuickTastingPage: Session created:', data.id);
          setCurrentSession(data);
        } catch (error) {
          logger.error('[ERROR] QuickTastingPage: Error in createDefaultSession:', error);
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
    <PageLayout
      title="Quick Tasting"
      subtitle="Start a quick tasting session to explore flavors and record your impressions"
      showBack
      containerSize="md"
    >
      {/* Step indicator */}
      <div className="mb-6 mt-2">
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

      <Container size="2xl">
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
      </Container>
    </PageLayout>
  );
};

export default QuickTastingPage;
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
