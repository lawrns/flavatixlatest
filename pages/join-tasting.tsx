import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function JoinTastingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tastingCode, setTastingCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleJoinTasting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tastingCode.trim()) {
      toast.error('Please enter a tasting code');
      return;
    }

    setIsJoining(true);
    const supabase = getSupabaseClient();

    try {
      // Find tasting by ID (code)
      const { data: tasting, error: tastingError } = await supabase
        .from('quick_tastings')
        .select('*')
        .eq('id', tastingCode.trim())
        .single();

      if (tastingError || !tasting) {
        toast.error('Invalid tasting code. Please check and try again.');
        return;
      }

      // Check if user is already a participant
      const { data: existing } = await supabase
        .from('tasting_participants')
        .select('id')
        .eq('tasting_id', (tasting as any).id)
        .eq('user_id', user!.id)
        .single();

      if (existing) {
        toast.success('You are already part of this tasting!');
        router.push(`/tasting/${(tasting as any).id}`);
        return;
      }

      // Add user as participant
      const { error: joinError } = await (supabase as any)
        .from('tasting_participants')
        .insert({
          tasting_id: (tasting as any).id,
          user_id: user!.id,
          role: 'participant'
        });

      if (joinError) {
        toast.error('Failed to join tasting. Please try again.');
        console.error('Join error:', joinError);
        return;
      }

      toast.success(`Joined "${(tasting as any).session_name || 'tasting'}" successfully!`);
      router.push(`/tasting/${(tasting as any).id}`);

    } catch (error) {
      console.error('Error joining tasting:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-display text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-zinc-50 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Join a Tasting</h1>
            <p className="text-zinc-600 dark:text-zinc-300">Enter the tasting code to join a collaborative session</p>
          </div>

          <form onSubmit={handleJoinTasting} className="space-y-6">
            <div>
              <label htmlFor="tastingCode" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                Tasting Code
              </label>
              <input
                id="tastingCode"
                type="text"
                value={tastingCode}
                onChange={(e) => setTastingCode(e.target.value)}
                placeholder="Enter the code shared by the host"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isJoining}
              />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">
                The tasting code is a unique ID shared by the session host
              </p>
            </div>

            <button
              type="submit"
              disabled={isJoining || !tastingCode.trim()}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Tasting'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">How it works:</h3>
            <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex">
                <span className="font-semibold text-primary mr-2">1.</span>
                <span>Get the tasting code from the session host</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-primary mr-2">2.</span>
                <span>Enter the code above and click "Join Tasting"</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-primary mr-2">3.</span>
                <span>Start tasting and sharing your notes with the group!</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/create-tasting')}
            className="text-primary hover:underline text-sm font-medium"
          >
            Or create your own tasting session
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-medium">Taste</span>
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
}

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
