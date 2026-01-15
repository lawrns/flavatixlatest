import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { toast } from '../lib/toast';
import PageLayout from '../components/layout/PageLayout';
import EmptyStateCard from '../components/ui/EmptyStateCard';
import { useTastings, useDeleteTasting, TastingFilters } from '../lib/query/hooks/useTastings';

const ITEMS_PER_PAGE = 20;

export default function MyTastingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [page, setPage] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Build filters for React Query
  const queryFilters: TastingFilters = {};
  if (filter === 'completed') {
    queryFilters.completed = true;
  } else if (filter === 'in_progress') {
    queryFilters.completed = false;
  }

  // React Query hooks
  const {
    data: tastingData,
    isLoading: loading,
  } = useTastings(user?.id, queryFilters, page, ITEMS_PER_PAGE);

  const deleteMutation = useDeleteTasting();

  const tastings = tastingData?.tastings || [];
  const hasMore = tastingData?.hasMore || false;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
  }, [user, authLoading, router]);

  const handleDeleteTasting = async (tastingId: string) => {
    if (!confirm('Are you sure you want to delete this tasting? This action cannot be undone.')) {
      return;
    }

    deleteMutation.mutate(tastingId, {
      onSuccess: () => {
        toast.success('Tasting deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting tasting:', error);
        toast.error('Failed to delete tasting');
      },
    });
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (!confirm(`Delete ${idsToDelete.length} tastings? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete all tastings sequentially
      for (const id of idsToDelete) {
        await new Promise<void>((resolve, reject) => {
          deleteMutation.mutate(id, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        });
      }

      setSelectedIds(new Set());
      setSelectMode(false);
      toast.success(`${idsToDelete.length} tastings deleted`);
    } catch (error) {
      console.error('Error deleting tastings:', error);
      toast.error('Failed to delete tastings');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tastings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tastings.map((t) => t.id)));
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
      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedIds(new Set());
            }}
            className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
              selectMode
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-800'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          {selectMode && tastings.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 rounded-[14px] font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              {selectedIds.size === tastings.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        {selectMode && selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-[14px] font-medium hover:bg-red-700 transition-colors"
          >
            Delete {selectedIds.size} Selected
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter('completed');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => {
            setFilter('in_progress');
            setPage(1);
          }}
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
        <div className="bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700">
          <EmptyStateCard
            image="/generated-images/empty-tastings.webp"
            headline="No tastings yet, but your palate awaits"
            description="Start your first tasting to begin discovering new flavors and building your taste profile"
            cta={{
              label: 'Create Your First Tasting',
              onClick: () => router.push('/taste'),
              variant: 'primary',
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tastings.map((tasting) => (
            <div
              key={tasting.id}
              className={`bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow ${
                selectMode && selectedIds.has(tasting.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={selectMode ? () => toggleSelection(tasting.id) : undefined}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {selectMode && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(tasting.id)}
                        onChange={() => toggleSelection(tasting.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {tasting.session_name || `${tasting.category} Tasting`}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-300">
                      {new Date(tasting.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
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
                    onClick={() =>
                      router.push(
                        tasting.completed_at
                          ? `/tasting-summary/${tasting.id}`
                          : `/quick-tasting?session=${tasting.id}`
                      )
                    }
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

          {/* Pagination Controls */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
                  page === 1
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className={`px-4 py-2 rounded-[14px] font-medium transition-colors ${
                  !hasMore
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
