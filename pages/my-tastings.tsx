import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { toast } from '../lib/toast';
import { cn } from '@/lib/utils';
import PageLayout from '../components/layout/PageLayout';
import EmptyStateCard from '../components/ui/EmptyStateCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useTastings, useDeleteTasting, TastingFilters } from '../lib/query/hooks/useTastings';

const ITEMS_PER_PAGE = 20;

export default function MyTastingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [page, setPage] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const queryFilters: TastingFilters = {};
  if (filter === 'completed') {
    queryFilters.completed = true;
  } else if (filter === 'in_progress') {
    queryFilters.completed = false;
  }

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

  const handleDeleteTasting = (tastingId: string) => {
    setConfirmConfig({
      title: 'Delete tasting?',
      description: 'This action cannot be undone.',
      onConfirm: () => {
        deleteMutation.mutate(tastingId, {
          onSuccess: () => {
            toast.success('Tasting deleted');
          },
          onError: () => {
            toast.error('Failed to delete tasting');
          },
        });
        setConfirmOpen(false);
      },
    });
    setConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    setConfirmConfig({
      title: `Delete ${idsToDelete.length} tastings?`,
      description: 'This action cannot be undone.',
      onConfirm: async () => {
        try {
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
        } catch {
          toast.error('Failed to delete tastings');
        }
        setConfirmOpen(false);
      },
    });
    setConfirmOpen(true);
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="My Tastings"
      subtitle="View and manage all your tasting sessions"
      showBack
      containerSize="xl"
    >
      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={selectMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedIds(new Set());
            }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </Button>
          {selectMode && tastings.length > 0 && (
            <Button variant="secondary" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === tastings.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
        {selectMode && selectedIds.size > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            Delete {selectedIds.size}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'completed', 'in_progress'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tastings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : tastings.length === 0 ? (
        <div className="surface-page">
          <EmptyStateCard
            image="/generated-images/empty-tastings.webp"
            headline="No tastings yet — start your first flight"
            description="Capture a few notes and you'll unlock a personalized flavor wheel that evolves with every session."
            cta={{
              label: 'Start a Tasting',
              onClick: () => router.push('/quick-tasting'),
              variant: 'primary',
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tastings.map((tasting) => (
            <div
              key={tasting.id}
              className={cn(
                'bg-bg-surface dark:bg-zinc-800 rounded-pane shadow-sm border border-line dark:border-zinc-700 p-5 hover:shadow-md transition-shadow',
                selectMode && selectedIds.has(tasting.id) ? 'ring-2 ring-primary' : ''
              )}
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
                        className="w-5 h-5 rounded-sharp border-line text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-h3 font-semibold text-fg dark:text-zinc-50 mb-1">
                      {tasting.session_name || `${tasting.category} Tasting`}
                    </h3>
                    <p className="text-body-sm text-fg-muted dark:text-zinc-300">
                      {new Date(tasting.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {tasting.completed_at ? (
                  <Badge variant="completed">Completed</Badge>
                ) : (
                  <Badge variant="inProgress">In Progress</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{tasting.total_items}</div>
                  <div className="text-body-sm text-fg-muted dark:text-zinc-300">Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{tasting.completed_items}</div>
                  <div className="text-body-sm text-fg-muted dark:text-zinc-300">Scored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {tasting.average_score ? tasting.average_score.toFixed(1) : '—'}
                  </div>
                  <div className="text-body-sm text-fg-muted dark:text-zinc-300">Avg Score</div>
                </div>
              </div>

              <div className="flex gap-2">
                {tasting.mode === 'competition' ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => router.push(`/competition/${tasting.id}`)}
                    >
                      {tasting.completed_at ? 'View Results' : 'Start Competition'}
                    </Button>
                    {tasting.rank_participants && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => router.push(`/competition/${tasting.id}/leaderboard`)}
                      >
                        Leaderboard
                      </Button>
                    )}
                  </>
                ) : tasting.mode === 'study' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => router.push(`/taste/study/${tasting.id}`)}
                  >
                    {tasting.completed_at ? 'View Study' : 'Continue Study'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() =>
                      router.push(
                        tasting.completed_at
                          ? `/tasting-summary/${tasting.id}`
                          : `/quick-tasting?session=${tasting.id}`
                      )
                    }
                  >
                    {tasting.completed_at ? 'View Details' : 'Continue'}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => handleDeleteTasting(tasting.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-line dark:border-zinc-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-body-sm text-fg-muted dark:text-zinc-300">Page {page}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
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
