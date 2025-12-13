import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { getUserTastingHistory, TastingHistory } from '../lib/historyService';
import { toast } from '../lib/toast';
import PageLayout from '../components/layout/PageLayout';

export default function MyTastingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tastings, setTastings] = useState<TastingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  const loadTastings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await getUserTastingHistory(user.id, {}, 50, 0);

      if (error) {
        toast.error('Failed to load tastings');
        console.error('Error loading tastings:', error);
        return;
      }

      let filteredData = data || [];

      if (filter === 'completed') {
        filteredData = filteredData.filter(t => t.completed_at !== null);
      } else if (filter === 'in_progress') {
        filteredData = filteredData.filter(t => t.completed_at === null);
      }

      setTastings(filteredData);
    } catch (error) {
      console.error('Error loading tastings:', error);
      toast.error('Failed to load tastings');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadTastings();
    }
  }, [user, authLoading, router, filter, loadTastings]);

  const handleDeleteTasting = async (tastingId: string) => {
    if (!confirm('Are you sure you want to delete this tasting? This action cannot be undone.')) {
      return;
    }

    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('quick_tastings')
        .delete()
        .eq('id', tastingId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Tasting deleted successfully');
      loadTastings();
    } catch (error) {
      console.error('Error deleting tasting:', error);
      toast.error('Failed to delete tasting');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="My Tastings"
      subtitle="View and manage all your tasting sessions"
      showBack
      containerSize="2xl"
    >
      {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
              filter === 'in_progress'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
          >
            In Progress
          </button>
        </div>

        {/* Tastings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tastings.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700 p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">No tastings yet</h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">Start your first tasting session to track your flavor journey</p>
            <button
              onClick={() => router.push('/taste')}
              className="px-6 py-3 bg-primary text-white rounded-[14px] font-medium hover:bg-primary/90 transition-colors"
            >
              Start Tasting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tastings.map((tasting) => (
              <div
                key={tasting.id}
                className="bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {tasting.session_name || `${tasting.category} Tasting`}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-300">
                      {new Date(tasting.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {tasting.completed_at ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      In Progress
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{tasting.total_items}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{tasting.completed_items}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Scored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {tasting.average_score ? tasting.average_score.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Avg Score</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {tasting.mode === 'competition' ? (
                    <>
                      <button
                        onClick={() => router.push(`/competition/${tasting.id}`)}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-[14px] font-medium hover:bg-primary/90 transition-colors"
                      >
                        {tasting.completed_at ? 'View Results' : 'Start Competition'}
                      </button>
                      {tasting.rank_participants && (
                        <button
                          onClick={() => router.push(`/competition/${tasting.id}/leaderboard`)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-[14px] font-medium hover:bg-yellow-600 transition-colors"
                        >
                          Leaderboard
                        </button>
                      )}
                    </>
                  ) : tasting.mode === 'study' ? (
                    <button
                      onClick={() => router.push(`/taste/study/${tasting.id}`)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-[14px] font-medium hover:bg-primary/90 transition-colors"
                    >
                      {tasting.completed_at ? 'View Study' : 'Continue Study'}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(tasting.completed_at ? `/tasting-summary/${tasting.id}` : `/quick-tasting?session=${tasting.id}`)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-[14px] font-medium hover:bg-primary/90 transition-colors"
                    >
                      {tasting.completed_at ? 'View Details' : 'Continue'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTasting(tasting.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-[14px] font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </PageLayout>
  );
}

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
