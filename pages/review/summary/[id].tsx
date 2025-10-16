import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft, Share2 } from 'lucide-react';

interface ReviewData {
  id: string;
  review_id: string;
  item_name: string;
  picture_url?: string;
  brand?: string;
  country?: string;
  state?: string;
  region?: string;
  vintage?: string;
  batch_id?: string;
  upc_barcode?: string;
  category: string;
  status: string;
  created_at: string;
  
  // For quick_reviews
  aroma_notes?: string;
  aroma_intensity?: number;
  salt_notes?: string;
  salt_score?: number;
  sweetness_notes?: string;
  sweetness_score?: number;
  acidity_notes?: string;
  acidity_score?: number;
  umami_notes?: string;
  umami_score?: number;
  spiciness_notes?: string;
  spiciness_score?: number;
  flavor_notes?: string;
  flavor_intensity?: number;
  texture_notes?: string;
  typicity_score?: number;
  complexity_score?: number;
  other_notes?: string;
  overall_score?: number;
  
  // For prose_reviews
  review_content?: string;
}

const ReviewSummaryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const supabase = getSupabaseClient() as any;

  const isProse = router.query.type === 'prose';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user && id) {
      loadReview();
    }
  }, [user, loading, id, router]);

  const loadReview = async () => {
    if (!id || typeof id !== 'string') return;

    setIsLoading(true);
    try {
      const tableName = isProse ? 'prose_reviews' : 'quick_reviews';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setReview(data);
    } catch (error) {
      console.error('Error loading review:', error);
      toast.error('Failed to load review');
      router.push('/review/my-reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!review) return;

    setIsPublishing(true);
    try {
      const tableName = isProse ? 'prose_reviews' : 'quick_reviews';
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'published' })
        .eq('id', review.id);

      if (error) throw error;

      toast.success('Review published to feed!');
      setReview({ ...review, status: 'published' });
    } catch (error) {
      console.error('Error publishing review:', error);
      toast.error('Failed to publish review');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading review...</div>
        </div>
      </div>
    );
  }

  if (!user || !review) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg max-w-4xl">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.push('/review/my-reviews')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to My Reviews
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Review Summary
            </h1>
            <p className="text-body font-body text-text-secondary">
              {formatDate(review.created_at)}
            </p>
          </div>

          {/* Review ID */}
          <div className="card p-md mb-lg bg-primary/5 border-primary/20">
            <div className="text-center">
              <div className="text-sm font-medium text-text-secondary mb-1">Review ID</div>
              <div className="text-h3 font-heading font-bold text-primary">
                {review.review_id || 'N/A'}
              </div>
            </div>
          </div>

          {/* Item Information */}
          <div className="card p-md mb-lg">
            <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Item Information</h2>
            
            {review.picture_url && (
              <div className="mb-md">
                <img
                  src={review.picture_url}
                  alt={review.item_name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <div className="text-sm font-medium text-text-secondary">Item Name</div>
                <div className="text-base text-text-primary">{review.item_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-text-secondary">Category</div>
                <div className="text-base text-text-primary">{review.category || 'N/A'}</div>
              </div>
              {review.brand && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">Brand</div>
                  <div className="text-base text-text-primary">{review.brand}</div>
                </div>
              )}
              {review.country && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">Country</div>
                  <div className="text-base text-text-primary">{review.country}</div>
                </div>
              )}
              {review.state && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">State</div>
                  <div className="text-base text-text-primary">{review.state}</div>
                </div>
              )}
              {review.region && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">Region</div>
                  <div className="text-base text-text-primary">{review.region}</div>
                </div>
              )}
              {review.vintage && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">Vintage</div>
                  <div className="text-base text-text-primary">{review.vintage}</div>
                </div>
              )}
              {review.batch_id && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">Batch ID</div>
                  <div className="text-base text-text-primary">{review.batch_id}</div>
                </div>
              )}
              {review.upc_barcode && (
                <div>
                  <div className="text-sm font-medium text-text-secondary">UPC/Barcode</div>
                  <div className="text-base text-text-primary">{review.upc_barcode}</div>
                </div>
              )}
            </div>
          </div>

          {/* Review Content */}
          {isProse ? (
            /* Prose Review Content */
            <div className="card p-md mb-lg">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Review</h2>
              <div className="prose max-w-none">
                <p className="text-base text-text-primary whitespace-pre-wrap">
                  {review.review_content || 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            /* Structured Review Characteristics */
            <div className="card p-md mb-lg">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Characteristics</h2>

              <div className="space-y-md">
                {/* Aroma */}
                {(review.aroma_notes || review.aroma_intensity) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Aroma</div>
                      {review.aroma_intensity && (
                        <div className="text-sm font-semibold text-primary">{review.aroma_intensity}/100</div>
                      )}
                    </div>
                    {review.aroma_notes && (
                      <div className="text-base text-text-primary">{review.aroma_notes}</div>
                    )}
                  </div>
                )}

                {/* Saltiness */}
                {(review.salt_notes || review.salt_score) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Saltiness</div>
                      {review.salt_score && (
                        <div className="text-sm font-semibold text-primary">{review.salt_score}/100</div>
                      )}
                    </div>
                    {review.salt_notes && (
                      <div className="text-base text-text-primary">{review.salt_notes}</div>
                    )}
                  </div>
                )}

                {/* Sweetness */}
                {(review.sweetness_notes || review.sweetness_score) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Sweetness</div>
                      {review.sweetness_score && (
                        <div className="text-sm font-semibold text-primary">{review.sweetness_score}/100</div>
                      )}
                    </div>
                    {review.sweetness_notes && (
                      <div className="text-base text-text-primary">{review.sweetness_notes}</div>
                    )}
                  </div>
                )}

                {/* Acidity */}
                {(review.acidity_notes || review.acidity_score) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Acidity</div>
                      {review.acidity_score && (
                        <div className="text-sm font-semibold text-primary">{review.acidity_score}/100</div>
                      )}
                    </div>
                    {review.acidity_notes && (
                      <div className="text-base text-text-primary">{review.acidity_notes}</div>
                    )}
                  </div>
                )}

                {/* Umami */}
                {(review.umami_notes || review.umami_score) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Umami</div>
                      {review.umami_score && (
                        <div className="text-sm font-semibold text-primary">{review.umami_score}/100</div>
                      )}
                    </div>
                    {review.umami_notes && (
                      <div className="text-base text-text-primary">{review.umami_notes}</div>
                    )}
                  </div>
                )}

                {/* Spiciness */}
                {(review.spiciness_notes || review.spiciness_score) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Spiciness</div>
                      {review.spiciness_score && (
                        <div className="text-sm font-semibold text-primary">{review.spiciness_score}/100</div>
                      )}
                    </div>
                    {review.spiciness_notes && (
                      <div className="text-base text-text-primary">{review.spiciness_notes}</div>
                    )}
                  </div>
                )}

                {/* Flavor */}
                {(review.flavor_notes || review.flavor_intensity) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-text-secondary">Flavor</div>
                      {review.flavor_intensity && (
                        <div className="text-sm font-semibold text-primary">{review.flavor_intensity}/100</div>
                      )}
                    </div>
                    {review.flavor_notes && (
                      <div className="text-base text-text-primary">{review.flavor_notes}</div>
                    )}
                  </div>
                )}

                {/* Texture */}
                {review.texture_notes && (
                  <div>
                    <div className="text-sm font-medium text-text-secondary mb-1">Texture</div>
                    <div className="text-base text-text-primary">{review.texture_notes}</div>
                  </div>
                )}

                {/* Typicity */}
                {review.typicity_score && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-text-secondary">Typicity</div>
                      <div className="text-sm font-semibold text-primary">{review.typicity_score}/100</div>
                    </div>
                  </div>
                )}

                {/* Complexity */}
                {review.complexity_score && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-text-secondary">Complexity</div>
                      <div className="text-sm font-semibold text-primary">{review.complexity_score}/100</div>
                    </div>
                  </div>
                )}

                {/* Other */}
                {review.other_notes && (
                  <div>
                    <div className="text-sm font-medium text-text-secondary mb-1">Other</div>
                    <div className="text-base text-text-primary">{review.other_notes}</div>
                  </div>
                )}

                {/* Overall */}
                {review.overall_score && (
                  <div className="pt-md border-t border-border-default">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-text-primary">Overall Score</div>
                      <div className="text-h3 font-heading font-bold text-primary">{review.overall_score}/100</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            {review.status !== 'published' && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="btn-primary disabled:opacity-50"
              >
                <Share2 size={20} className="mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            )}
            <button
              onClick={() => router.push('/review')}
              className="btn-secondary"
            >
              Reviews
            </button>
          </div>
        </div>
      </main>

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
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-bold">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default ReviewSummaryPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
