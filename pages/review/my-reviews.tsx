import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft, FileText, PenTool, Clock } from 'lucide-react';

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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      loadReviews();
    }
  }, [user, loading, router]);

  const loadReviews = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load quick reviews
      const { data: quickReviewsData, error: quickReviewsError } = await supabase
        .from('quick_reviews')
        .select('id, review_id, item_name, category, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quickReviewsError) throw quickReviewsError;

      // Load prose reviews
      const { data: proseReviewsData, error: proseReviewsError } = await supabase
        .from('prose_reviews')
        .select('id, review_id, item_name, category, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (proseReviewsError) throw proseReviewsError;

      setReviews(quickReviewsData || []);
      setProseReviews(proseReviewsData || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      published: { label: 'Published', color: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const completedReviews = reviews.filter(r => r.status === 'completed' || r.status === 'published');
  const inProgressReviews = reviews.filter(r => r.status === 'in_progress');
  const completedProseReviews = proseReviews.filter(r => r.status === 'completed' || r.status === 'published');
  const inProgressProseReviews = proseReviews.filter(r => r.status === 'in_progress');

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg max-w-6xl">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.push('/review')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Reviews
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              My Reviews
            </h1>
            <p className="text-body font-body text-text-secondary">
              All review history
            </p>
          </div>

          {/* Reviews Section */}
          <div className="space-y-lg">
            {/* Completed Reviews */}
            <div className="card p-md">
              <div className="flex items-center mb-md">
                <FileText size={24} className="text-primary mr-2" />
                <h2 className="text-h3 font-heading font-semibold text-text-primary">
                  Reviews
                </h2>
                <span className="ml-auto text-sm text-text-secondary">
                  {completedReviews.length} {completedReviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {completedReviews.length === 0 ? (
                <p className="text-text-secondary text-center py-lg">
                  No completed reviews yet
                </p>
              ) : (
                <div className="space-y-sm">
                  {completedReviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/summary/${review.id}`)}
                      className="w-full text-left p-md bg-background-surface hover:bg-background-app rounded-lg transition-colors border border-border-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary mb-1">
                            {review.review_id || review.item_name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {review.item_name} • {review.category}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prose Reviews */}
            <div className="card p-md">
              <div className="flex items-center mb-md">
                <PenTool size={24} className="text-primary mr-2" />
                <h2 className="text-h3 font-heading font-semibold text-text-primary">
                  Prose Reviews
                </h2>
                <span className="ml-auto text-sm text-text-secondary">
                  {completedProseReviews.length} {completedProseReviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {completedProseReviews.length === 0 ? (
                <p className="text-text-secondary text-center py-lg">
                  No completed prose reviews yet
                </p>
              ) : (
                <div className="space-y-sm">
                  {completedProseReviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/summary/${review.id}?type=prose`)}
                      className="w-full text-left p-md bg-background-surface hover:bg-background-app rounded-lg transition-colors border border-border-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary mb-1">
                            {review.review_id || review.item_name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {review.item_name} • {review.category}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews in Progress */}
            <div className="card p-md">
              <div className="flex items-center mb-md">
                <Clock size={24} className="text-primary mr-2" />
                <h2 className="text-h3 font-heading font-semibold text-text-primary">
                  Reviews in Progress
                </h2>
                <span className="ml-auto text-sm text-text-secondary">
                  {inProgressReviews.length + inProgressProseReviews.length} {inProgressReviews.length + inProgressProseReviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {inProgressReviews.length === 0 && inProgressProseReviews.length === 0 ? (
                <p className="text-text-secondary text-center py-lg">
                  No reviews in progress
                </p>
              ) : (
                <div className="space-y-sm">
                  {inProgressReviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/structured?id=${review.id}`)}
                      className="w-full text-left p-md bg-background-surface hover:bg-background-app rounded-lg transition-colors border border-border-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary mb-1">
                            {review.review_id || review.item_name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {review.item_name} • {review.category} • Review
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            Last updated: {formatDate(review.updated_at)}
                          </div>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                    </button>
                  ))}
                  {inProgressProseReviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => router.push(`/review/prose?id=${review.id}`)}
                      className="w-full text-left p-md bg-background-surface hover:bg-background-app rounded-lg transition-colors border border-border-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary mb-1">
                            {review.review_id || review.item_name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {review.item_name} • {review.category} • Prose Review
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            Last updated: {formatDate(review.updated_at)}
                          </div>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-lg text-center">
            <button
              onClick={() => router.push('/review')}
              className="btn-secondary"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyReviewsPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
