import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import { toast } from '@/lib/toast';

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
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

const StudyTastingPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<QuickTasting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id || !user) return;

    const loadSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('quick_tastings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error('Study session not found');
          router.push('/my-tastings');
          return;
        }

        // Verify this is a study mode session
        if (data.mode !== 'study') {
          toast.error('This is not a study mode session');
          router.push('/my-tastings');
          return;
        }

        setSession(data);
      } catch (error) {
        console.error('Error loading study session:', error);
        toast.error('Failed to load study session');
        router.push('/my-tastings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [id, user, supabase, router]);

  const handleSessionComplete = (completedSession: QuickTasting) => {
    toast.success('Study session completed!');
    router.push('/my-tastings');
  };

  const handleSessionUpdate = (updatedSession: QuickTasting) => {
    setSession(updatedSession);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <QuickTastingSession
          session={session}
          userId={user!.id}
          onSessionComplete={handleSessionComplete}
          onSessionUpdate={handleSessionUpdate}
        />
      </div>

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

export default StudyTastingPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
