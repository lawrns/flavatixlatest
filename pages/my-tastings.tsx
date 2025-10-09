import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { getUserTastingHistory, TastingHistory } from '../lib/historyService';
import { toast } from '../lib/toast';

export default function MyTastingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tastings, setTastings] = useState<TastingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadTastings();
    }
  }, [user, authLoading, router, filter]);

  const loadTastings = async () => {
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
  };

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
    <div className="min-h-screen bg-background-light font-display text-zinc-900 pb-40">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-3xl font-bold text-zinc-900 mb-2">My Tastings</h1>
          <p className="text-zinc-600">View and manage all your tasting sessions</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in_progress'
                ? 'bg-primary text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
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
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No tastings yet</h3>
            <p className="text-zinc-600 mb-6">Start your first tasting session to track your flavor journey</p>
            <button
              onClick={() => router.push('/taste')}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Tasting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tastings.map((tasting) => (
              <div
                key={tasting.id}
                className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">
                      {tasting.session_name || `${tasting.category} Tasting`}
                    </h3>
                    <p className="text-sm text-zinc-500">
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
                    <div className="text-sm text-zinc-600">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{tasting.completed_items}</div>
                    <div className="text-sm text-zinc-600">Scored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {tasting.average_score ? tasting.average_score.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-zinc-600">Avg Score</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {tasting.mode === 'competition' ? (
                    <>
                      <button
                        onClick={() => router.push(`/competition/${tasting.id}`)}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        {tasting.completed_at ? 'View Results' : 'Start Competition'}
                      </button>
                      {tasting.rank_participants && (
                        <button
                          onClick={() => router.push(`/competition/${tasting.id}/leaderboard`)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                        >
                          Leaderboard
                        </button>
                      )}
                    </>
                  ) : tasting.mode === 'study' ? (
                    <button
                      onClick={() => router.push(`/taste/study/${tasting.id}`)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {tasting.completed_at ? 'View Study' : 'Continue Study'}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/quick-tasting?session=${tasting.id}`)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {tasting.completed_at ? 'View Details' : 'Continue'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTasting(tasting.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-medium">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}
