import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { FileText, PenTool, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface Review {
  id: string;
  review_id: string;
  item_name: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const MyReviewsPage: React.FC = () => {
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
      // Load quick reviews
      const { data: quickReviewsData, error: quickReviewsError } = await supabase
        .from('quick_reviews')
        .select('id, review_id, item_name, category, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quickReviewsError) {
        throw quickReviewsError;
      }

      // Load prose reviews
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: 'Completed',
        color: 'bg-signal-good/10 text-signal-good dark:bg-signal-good/20 dark:text-signal-good',
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-signal-warn/10 text-signal-warn dark:bg-signal-warn/20 dark:text-signal-warn',
      },
      published: {
        label: 'Published',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const completedReviews = reviews.filter(
    (r) => r.status === 'completed' || r.status === 'published'
  );
  const inProgressReviews = reviews.filter((r) => r.status === 'in_progress');
  const completedProseReviews = proseReviews.filter(
    (r) => r.status === 'completed' || r.status === 'published'
  );
  const inProgressProseReviews = proseReviews.filter((r) => r.status === 'in_progress');

  if (loading || isLoading) {
    return (
      <PageLayout title="My Reviews" showBack backUrl="/review">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-fg-muted dark:text-fg-subtle font-medium">Loading reviews...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout title="My Reviews" subtitle="All review history" showBack backUrl="/review">
      {/* Reviews Section */}
      <div className="space-y-6">
        {/* Completed Reviews */}
        <div className="bg-white dark:bg-zinc-800 rounded-pane border border-line dark:border-zinc-700 p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <FileText size={24} className="text-primary mr-2" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Reviews</h2>
            <span className="ml-auto text-sm text-fg-subtle dark:text-fg-subtle">
              {completedReviews.length} {completedReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {completedReviews.length === 0 ? (
            <p className="text-fg-subtle dark:text-fg-subtle text-center py-8">
              No completed reviews yet
            </p>
          ) : (
            <div className="space-y-3">
              {completedReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/summary/${review.id}`)}
                  className="w-full text-left p-4 bg-bg-inset dark:bg-zinc-800 hover:bg-bg-inset dark:hover:bg-zinc-700 rounded-soft transition-colors border border-line dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-white mb-1 truncate">
                        {review.review_id || review.item_name}
                      </div>
                      <div className="text-sm text-fg-subtle dark:text-fg-subtle truncate">
                        {review.item_name} • {review.category}
                      </div>
                      <div className="text-xs text-fg-subtle dark:text-fg-subtle mt-1">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">{getStatusBadge(review.status)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prose Reviews */}
        <div className="bg-white dark:bg-zinc-800 rounded-pane border border-line dark:border-zinc-700 p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <PenTool size={24} className="text-primary mr-2" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Prose Reviews</h2>
            <span className="ml-auto text-sm text-fg-subtle dark:text-fg-subtle">
              {completedProseReviews.length}{' '}
              {completedProseReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {completedProseReviews.length === 0 ? (
            <p className="text-fg-subtle dark:text-fg-subtle text-center py-8">
              No completed prose reviews yet
            </p>
          ) : (
            <div className="space-y-3">
              {completedProseReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/summary/${review.id}?type=prose`)}
                  className="w-full text-left p-4 bg-bg-inset dark:bg-zinc-800 hover:bg-bg-inset dark:hover:bg-zinc-700 rounded-soft transition-colors border border-line dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-white mb-1 truncate">
                        {review.review_id || review.item_name}
                      </div>
                      <div className="text-sm text-fg-subtle dark:text-fg-subtle truncate">
                        {review.item_name} • {review.category}
                      </div>
                      <div className="text-xs text-fg-subtle dark:text-fg-subtle mt-1">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">{getStatusBadge(review.status)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reviews in Progress */}
        <div className="bg-white dark:bg-zinc-800 rounded-pane border border-line dark:border-zinc-700 p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Clock size={24} className="text-primary mr-2" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Reviews in Progress
            </h2>
            <span className="ml-auto text-sm text-fg-subtle dark:text-fg-subtle">
              {inProgressReviews.length + inProgressProseReviews.length}{' '}
              {inProgressReviews.length + inProgressProseReviews.length === 1
                ? 'review'
                : 'reviews'}
            </span>
          </div>

          {inProgressReviews.length === 0 && inProgressProseReviews.length === 0 ? (
            <p className="text-fg-subtle dark:text-fg-subtle text-center py-8">
              No reviews in progress
            </p>
          ) : (
            <div className="space-y-3">
              {inProgressReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/structured?id=${review.id}`)}
                  className="w-full text-left p-4 bg-bg-inset dark:bg-zinc-800 hover:bg-bg-inset dark:hover:bg-zinc-700 rounded-soft transition-colors border border-line dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-white mb-1 truncate">
                        {review.review_id || review.item_name}
                      </div>
                      <div className="text-sm text-fg-subtle dark:text-fg-subtle truncate">
                        {review.item_name} • {review.category} • Review
                      </div>
                      <div className="text-xs text-fg-subtle dark:text-fg-subtle mt-1">
                        Last updated: {formatDate(review.updated_at)}
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">{getStatusBadge(review.status)}</div>
                  </div>
                </button>
              ))}
              {inProgressProseReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/prose?id=${review.id}`)}
                  className="w-full text-left p-4 bg-bg-inset dark:bg-zinc-800 hover:bg-bg-inset dark:hover:bg-zinc-700 rounded-soft transition-colors border border-line dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-white mb-1 truncate">
                        {review.review_id || review.item_name}
                      </div>
                      <div className="text-sm text-fg-subtle dark:text-fg-subtle truncate">
                        {review.item_name} • {review.category} • Prose Review
                      </div>
                      <div className="text-xs text-fg-subtle dark:text-fg-subtle mt-1">
                        Last updated: {formatDate(review.updated_at)}
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">{getStatusBadge(review.status)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MyReviewsPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
