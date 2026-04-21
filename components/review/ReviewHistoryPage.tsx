import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { FileText, PenTool, Clock, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  review_id: string;
  item_name: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  },
  published: {
    label: 'Published',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  },
} as const;

const ReviewSection: React.FC<{
  title: string;
  icon: React.ElementType;
  count: number;
  emptyLabel: string;
  items: Review[];
  onOpen: (review: Review) => void;
}> = ({ title, icon: Icon, count, emptyLabel, items, onOpen }) => (
  <section className="rounded-[2rem] border border-line bg-white/90 p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)] sm:p-6">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-inset text-fg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-h3 font-semibold text-fg">{title}</h2>
          <p className="text-caption uppercase tracking-[0.22em] text-fg-muted">{count} total</p>
        </div>
      </div>
    </div>

    {items.length === 0 ? (
      <div className="mt-5 rounded-[1.5rem] border border-dashed border-line bg-[#fbfaf7] p-5 text-center">
        <p className="text-body-sm text-fg-muted">{emptyLabel}</p>
      </div>
    ) : (
      <div className="mt-5 space-y-3">
        {items.map((review) => (
          <button
            key={review.id}
            onClick={() => onOpen(review)}
            className={cn(
              'group w-full rounded-[1.25rem] border border-line bg-bg-surface p-4 text-left',
              'transition-all hover:-translate-y-0.5 hover:border-fg-muted/30 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.25)]'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-body font-semibold text-fg">
                  {review.review_id || review.item_name}
                </p>
                <p className="mt-1 truncate text-body-sm text-fg-muted">
                  {review.item_name} • {review.category}
                </p>
                <p className="mt-2 text-caption text-fg-muted">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                    statusConfig[review.status as keyof typeof statusConfig]?.color ||
                      'bg-zinc-100 text-zinc-700 border-zinc-200'
                  )}
                >
                  {statusConfig[review.status as keyof typeof statusConfig]?.label ||
                    review.status}
                </span>
                <ArrowRight className="h-4 w-4 text-fg-muted transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </section>
);

export default function ReviewHistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [proseReviews, setProseReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient() as any;

  const loadReviews = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: quickReviewsData, error: quickReviewsError } = await supabase
        .from('quick_reviews')
        .select('id, review_id, item_name, category, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quickReviewsError) {
        throw quickReviewsError;
      }

      const { data: proseReviewsData, error: proseReviewsError } = await supabase
        .from('prose_reviews')
        .select('id, review_id, item_name, category, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (proseReviewsError) {
        throw proseReviewsError;
      }

      setReviews(quickReviewsData || []);
      setProseReviews(proseReviewsData || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      loadReviews();
    }
  }, [user, loading, router, loadReviews]);

  const completedReviews = reviews.filter((r) => r.status === 'completed' || r.status === 'published');
  const inProgressReviews = reviews.filter((r) => r.status === 'in_progress');
  const completedProseReviews = proseReviews.filter(
    (r) => r.status === 'completed' || r.status === 'published'
  );
  const inProgressProseReviews = proseReviews.filter((r) => r.status === 'in_progress');
  const inProgressItems = [
    ...inProgressReviews.map((review) => ({ review, type: 'structured' as const })),
    ...inProgressProseReviews.map((review) => ({ review, type: 'prose' as const })),
  ];

  const handleOpenReview = (review: Review, type: 'structured' | 'prose' = 'structured') => {
    if (type === 'prose') {
      router.push(`/review/summary/${review.id}?type=prose`);
      return;
    }

    if (review.status === 'in_progress') {
      router.push(`/review/structured?id=${review.id}`);
      return;
    }

    router.push(`/review/summary/${review.id}`);
  };

  if (loading || isLoading) {
    return (
      <PageLayout title="My Reviews" showBack backUrl="/review" containerSize="2xl">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-[2rem] border border-line bg-white/70" />
          <div className="h-72 animate-pulse rounded-[2rem] border border-line bg-white/70" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="My Reviews"
      subtitle="All review history, grouped by format and state."
      showBack
      backUrl="/review"
      containerSize="2xl"
    >
      <div className="grid gap-6">
        <section className="rounded-[2rem] border border-line bg-white/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)]">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Completed', value: completedReviews.length + completedProseReviews.length },
              { label: 'In progress', value: inProgressReviews.length + inProgressProseReviews.length },
              { label: 'Total', value: reviews.length + proseReviews.length },
            ].map((metric) => (
              <div key={metric.label} className="rounded-[1.5rem] border border-line bg-bg-surface p-4">
                <p className="text-caption uppercase tracking-[0.22em] text-fg-muted">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-fg">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <ReviewSection
            title="Structured Reviews"
            icon={FileText}
            count={reviews.length}
            emptyLabel="No structured reviews yet. Start one from the Reviews hub."
            items={reviews}
            onOpen={(review) => handleOpenReview(review, 'structured')}
          />

          <ReviewSection
            title="Prose Reviews"
            icon={PenTool}
            count={proseReviews.length}
            emptyLabel="No prose reviews yet. Add a short note when you want speed over scoring."
            items={proseReviews}
            onOpen={(review) => handleOpenReview(review, 'prose')}
          />

          <section className="rounded-[2rem] border border-line bg-bg-surface p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-inset text-fg-muted">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-fg">Reviews in progress</h2>
                <p className="text-caption uppercase tracking-[0.22em] text-fg-muted">
                  Resume where you left off
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {inProgressItems.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-line bg-white p-5 text-center">
                  <p className="text-body-sm text-fg-muted">No reviews in progress.</p>
                </div>
              ) : (
                inProgressItems.map(({ review, type }) => (
                  <button
                    key={review.id}
                    onClick={() => handleOpenReview(review, type)}
                    className="flex items-center justify-between rounded-[1.25rem] border border-line bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-fg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body font-semibold text-fg">
                        {review.review_id || review.item_name}
                      </p>
                      <p className="mt-1 truncate text-body-sm text-fg-muted">
                        {review.item_name} • {review.category}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-fg-muted" />
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
