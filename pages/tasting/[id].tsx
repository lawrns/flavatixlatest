import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { toast } from '@/lib/toast';
import { ChevronLeft } from 'lucide-react';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

const TastingSessionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [session, setSession] = useState<QuickTasting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const supabase = getSupabaseClient();

  const loadSession = useCallback(async () => {
    if (!id || typeof id !== 'string' || !user) {
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setError('Invalid tasting session ID format');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch the tasting session
      const { data: sessionData, error: sessionError } = await supabase
        .from('quick_tastings')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          setError('Tasting session not found');
        } else if (sessionError.message?.includes('invalid input syntax for type uuid')) {
          setError('Invalid tasting session ID format');
        } else {
          throw sessionError;
        }
        return;
      }

      // Check access based on tasting mode
      const tastingMode = (sessionData as any).mode;
      const isCreator = (sessionData as any).user_id === user.id;

      if (tastingMode === 'quick') {
        // For quick tasting: only creator has access, no participant records needed
        if (!isCreator) {
          setError('You do not have access to this tasting session');
          return;
        }
        // Quick tasting doesn't need participant records
      } else {
        // For study mode: use full participant logic
        const { data: participantData, error: participantError } = await supabase
          .from('tasting_participants')
          .select('*')
          .eq('tasting_id', id)
          .eq('user_id', user.id)
          .single();

        const isParticipant = !participantError && participantData;

        if (!isCreator && !isParticipant) {
          // User has no access to this session
          setError('You do not have access to this tasting session');
          return;
        }

        // If user is creator but not a participant record, add them as participant
        if (isCreator && !isParticipant) {
          try {
            const { error: addError } = await supabase.from('tasting_participants').insert({
              tasting_id: id as string,
              user_id: user.id,
              role: 'host', // Creator gets host role
            } as any);

            if (addError && !(addError as any)?.message?.includes('duplicate key')) {
              // Only fail if it's not a duplicate key error
              throw addError;
            }
          } catch (addError) {
            if (!(addError as any)?.message?.includes('duplicate key')) {
              console.error('Error adding creator as participant:', addError);
              setError('Failed to initialize session access');
              return;
            }
          }
        }
      }

      setSession(sessionData);
      setHasAccess(true);
    } catch (error: any) {
      console.error('Error loading session:', error);
      setError(error.message || 'Failed to load tasting session');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, supabase]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (id && user) {
      loadSession();
    }
  }, [id, user, loading, router, loadSession]);

  const handleSessionComplete = (completedSession: QuickTasting) => {
    setSession(completedSession);
    toast.success('Tasting session completed!');
    // Redirect to dashboard after completion
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500); // Give user time to see the success message
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">
            Loading tasting session...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-md py-lg max-w-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-md">
              <svg
                className="w-8 h-8 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-sm">
              Session Not Found
            </h1>
            <p className="text-body text-text-secondary mb-lg">{error}</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !hasAccess) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-20">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
          </div>

          {/* Tasting Session */}
          <ErrorBoundary>
            <QuickTastingSession
              session={session}
              userId={user!.id}
              onSessionComplete={handleSessionComplete}
            />
          </ErrorBoundary>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
        <nav className="flex justify-around p-2">
          <Link
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300"
            href="/dashboard"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300"
            href="/taste"
          >
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-medium">Taste</span>
          </Link>
          <Link
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300"
            href="/review"
          >
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </Link>
          <Link
            className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300"
            href="/flavor-wheels"
          >
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default TastingSessionPage;
