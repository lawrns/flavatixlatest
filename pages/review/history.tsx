import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { generateReviewId } from '@/lib/reviewIdGenerator';
import { FileText, Edit3, Clock, ChevronRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface Review {
  id: string;
  item_name: string;
  category: string;
  batch_id: string;
  created_at: string;
  status: string;
  overall_score?: number;
  review_type?: 'structured' | 'prose';
}

interface ProseReview {
  id: string;
  item_name: string;
  category: string;
  batch_id: string;
  created_at: string;
  status: string;
  review_type?: 'structured' | 'prose';
}

const MyReviewsPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient() as any;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [proseReviews, setProseReviews] = useState<ProseReview[]>([]);
  const [drafts, setDrafts] = useState<(Review | ProseReview)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      // Load structured reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('quick_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      // Load prose reviews
      const { data: proseData, error: proseError } = await supabase
        .from('prose_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (proseError) {
        throw proseError;
      }

      // Separate completed and drafts
      const completedReviews =
        reviewsData?.filter((r: Review) => r.status === 'completed' || r.status === 'published') ||
        [];
      const completedProse =
        proseData?.filter(
          (r: ProseReview) => r.status === 'completed' || r.status === 'published'
        ) || [];

      // Add review_type to distinguish between structured and prose reviews
      const structuredDrafts = (
        reviewsData?.filter((r: Review) => r.status === 'in_progress') || []
      ).map((r: Review) => ({ ...r, review_type: 'structured' as const }));
      const proseDrafts = (
        proseData?.filter((r: ProseReview) => r.status === 'in_progress') || []
      ).map((r: ProseReview) => ({ ...r, review_type: 'prose' as const }));
      const allDrafts = [...structuredDrafts, ...proseDrafts];

      setReviews(completedReviews);
      setProseReviews(completedProse);
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      loadReviews();
    }
  }, [user, loading, router, loadReviews]);

  const formatReviewId = (review: Review | ProseReview) => {
    return generateReviewId(
      review.category,
      review.item_name,
      review.batch_id || '',
      new Date(review.created_at)
    );
  };

  if (loading || isLoading) {
    return (
      <PageLayout title="My Reviews" showBack backUrl="/review">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
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
      subtitle="View and manage all your reviews"
      showBack
      backUrl="/review"
    >
      <div className="space-y-6">
        {/* Reviews in Progress */}
        {drafts.length > 0 && (
          <div className="bg-white dark:bg-zinc-800/50 rounded-[22px] border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Reviews in Progress
              </h3>
            </div>
            <div className="space-y-3">
              {drafts.map((draft) => {
                const reviewPath =
                  draft.review_type === 'prose'
                    ? `/review/prose?id=${draft.id}`
                    : `/review/structured?id=${draft.id}`;

                return (
                  <button
                    key={draft.id}
                    onClick={() => router.push(reviewPath)}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-[14px] transition-colors text-left border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">
                          {draft.item_name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                          {formatReviewId(draft)} •{' '}
                          {draft.review_type === 'prose' ? 'Prose' : 'Structured'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Continue
                        </span>
                        <ChevronRight size={16} className="text-zinc-400" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Structured Reviews */}
        <div className="bg-white dark:bg-zinc-800/50 rounded-[22px] border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-primary" size={24} />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Reviews</h3>
          </div>
          {reviews.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/summary/${review.id}`)}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-[14px] transition-colors text-left border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-white truncate">
                        {review.item_name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        {formatReviewId(review)}
                      </p>
                      {review.overall_score && (
                        <p className="text-sm text-primary font-bold mt-1">
                          Score: {review.overall_score}/100
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-zinc-400 ml-3 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prose Reviews */}
        <div className="bg-white dark:bg-zinc-800/50 rounded-[22px] border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Edit3 className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Prose Reviews</h3>
          </div>
          {proseReviews.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
              No prose reviews yet
            </p>
          ) : (
            <div className="space-y-3">
              {proseReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/review/summary/${review.id}`)}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-[14px] transition-colors text-left border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-white truncate">
                        {review.item_name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        {formatReviewId(review)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-400 ml-3 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create New Review Button */}
        <button
          onClick={() => router.push('/review')}
          className="w-full bg-primary text-white rounded-[14px] px-5 py-3 min-h-[44px] font-semibold hover:bg-primary-600 transition-colors"
        >
          Create New Review
        </button>
      </div>
    </PageLayout>
  );
};

export default MyReviewsPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
