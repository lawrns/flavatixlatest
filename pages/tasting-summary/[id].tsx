import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { getSupabaseClient } from '../../lib/supabase';
import QuickTastingSummary from '../../components/quick-tasting/QuickTastingSummary';
import { logger } from '@/lib/logger';
import { toast } from '../../lib/toast';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import { EmptyState } from '../../components/ui/EmptyState';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  custom_category_name?: string | null;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
}

export default function TastingSummaryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<QuickTasting | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id || !user) {
      logger.debug('TastingSummary', 'Waiting for id or user', { id, hasUser: !!user });
      return;
    }

    const loadSession = async () => {
      try {
        logger.debug('TastingSummary', 'Loading session', { id });
        setLoading(true);
        const { data, error } = await supabase
          .from('quick_tastings')
          .select('*')
          .eq('id', id)
          .single<QuickTasting>();

        if (error) {
          logger.error('TastingSummary', 'Supabase error', error);
          throw error;
        }

        if (!data) {
          logger.error('TastingSummary', 'No data returned');
          toast.error('Tasting session not found');
          router.push('/my-tastings');
          return;
        }

        // Verify user has access
        if (data.user_id !== user.id) {
          logger.error('TastingSummary', 'User ID mismatch', { expected: user.id, actual: data.user_id });
          toast.error('You do not have access to this tasting');
          router.push('/my-tastings');
          return;
        }

        logger.debug('TastingSummary', 'Session loaded successfully');
        setSession(data);
      } catch (error) {
        logger.error('TastingSummary', 'Error loading tasting session', error);
        toast.error('Failed to load tasting session');
        router.push('/my-tastings');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id, user, supabase, router]);

  const handleStartNewSession = () => {
    router.push('/quick-tasting');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tasting summary...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <EmptyState
          icon="🧭"
          title="We couldn't find that tasting"
          description="It may have been deleted or you no longer have access. Start a new tasting or browse your history."
          action={{ label: 'Start a New Tasting', onClick: () => router.push('/quick-tasting') }}
          secondaryAction={{ label: 'Back to My Tastings', onClick: () => router.push('/my-tastings') }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/my-tastings')}
            className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 mb-2 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Tastings
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tasting Summary</h1>
        </div>
      </div>

      {/* Summary Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <QuickTastingSummary session={session} onStartNewSession={handleStartNewSession} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
