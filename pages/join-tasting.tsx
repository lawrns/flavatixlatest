import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';
import PageLayout from '../components/layout/PageLayout';

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
    <PageLayout
      title="Join a Tasting"
      subtitle="Enter the tasting code to join a collaborative session"
      showBack
      containerSize="2xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-pane border border-line bg-bg-surface/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
                Session code
              </p>
              <h2 className="text-h2 font-semibold tracking-tight text-fg">
                Join the room with a single code.
              </h2>
            </div>
          </div>

          <form onSubmit={handleJoinTasting} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="tastingCode" className="block text-sm font-semibold text-fg">
                Tasting Code
              </label>
              <input
                id="tastingCode"
                type="text"
                autoComplete="off"
                value={tastingCode}
                onChange={(e) => setTastingCode(e.target.value)}
                placeholder="Paste the code shared by the host"
                className="w-full rounded-[1rem] border border-line bg-bg-surface px-4 py-3 text-body text-fg transition-colors placeholder:text-fg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                disabled={isJoining}
              />
              <p className="text-sm text-fg-muted">
                The tasting code is a unique session ID shared by the host.
              </p>
            </div>

            <button
              type="submit"
              disabled={isJoining || !tastingCode.trim()}
              className="inline-flex w-full items-center justify-center rounded-soft bg-primary px-4 py-3.5 text-sm font-semibold text-fg-inverse transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-bg-inset disabled:text-fg-subtle disabled:transform-none active:scale-[0.99]"
            >
              {isJoining ? 'Joining...' : 'Join Tasting'}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="rounded-pane border border-line bg-bg-surface p-6 shadow-sm">
            <h3 className="text-h3 font-semibold text-fg">How it works</h3>
            <ol className="mt-4 space-y-3 text-body-sm text-fg-muted">
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-primary">1.</span>
                <span>Get the tasting code from the session host.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-primary">2.</span>
                <span>Paste the code and join the session.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-primary">3.</span>
                <span>Start tasting, scoring, and sharing notes with the group.</span>
              </li>
            </ol>
          </div>

          <div className="rounded-pane border border-dashed border-line bg-bg p-6">
            <h3 className="text-h3 font-semibold text-fg">Prefer to host?</h3>
            <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
              Create your own session if you want to control the category, pacing, and
              participant rules.
            </p>
            <button
              type="button"
              onClick={() => router.push('/create-tasting')}
              className="mt-5 inline-flex items-center justify-center rounded-soft border border-line-strong bg-bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-transform duration-150 hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.99]"
            >
              Create a tasting session
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
