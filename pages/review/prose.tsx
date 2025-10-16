import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft } from 'lucide-react';
import ProseReviewForm, { ProseReviewFormData } from '@/components/review/ProseReviewForm';
import { generateReviewId } from '@/lib/reviewIdGenerator';

const ProseReviewPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<ProseReviewFormData | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load existing review if id is provided in query params
  useEffect(() => {
    const loadReview = async () => {
      const { id } = router.query;
      if (!id || typeof id !== 'string') return;

      setIsLoadingReview(true);
      try {
        const { data, error } = await supabase
          .from('prose_reviews')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Populate form with existing data
        setReviewId(data.id);
        setExistingReview({
          item_name: data.item_name || '',
          picture_url: data.picture_url || '',
          brand: data.brand || '',
          country: data.country || '',
          state: data.state || '',
          region: data.region || '',
          vintage: data.vintage || '',
          batch_id: data.batch_id || '',
          upc_barcode: data.upc_barcode || '',
          category: data.category || '',
          review_content: data.review_content || ''
        });

        toast.success('Review loaded');
      } catch (error) {
        console.error('Error loading review:', error);
        toast.error('Failed to load review');
      } finally {
        setIsLoadingReview(false);
      }
    };

    if (router.isReady) {
      loadReview();
    }
  }, [router.isReady, router.query, supabase]);

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `review-${Date.now()}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tasting-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tasting-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const extractDescriptors = async (reviewId: string, reviewData: any) => {
    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session for descriptor extraction');
        return;
      }

      const extractionPayload = {
        sourceType: 'prose_review',
        sourceId: reviewId,
        text: reviewData.review_content || '',
        itemContext: {
          itemName: reviewData.item_name,
          itemCategory: reviewData.category,
          brand: reviewData.brand,
          country: reviewData.country,
          region: reviewData.region,
        }
      };

      const response = await fetch('/api/flavor-wheels/extract-descriptors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(extractionPayload),
      });

      if (!response.ok) {
        console.warn('Descriptor extraction failed, but review was saved');
      }
    } catch (error) {
      console.warn('Error extracting descriptors:', error);
    }
  };

  const handleSubmit = async (data: ProseReviewFormData, action: 'done' | 'save' | 'new') => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Determine status based on action
      const status = action === 'done' ? 'completed' : 'in_progress';

      let review;
      let error;

      const reviewData: any = {
        user_id: user.id,
        item_name: data.item_name,
        picture_url: data.picture_url,
        brand: data.brand,
        country: data.country,
        state: data.state,
        region: data.region,
        vintage: data.vintage,
        batch_id: data.batch_id,
        upc_barcode: data.upc_barcode,
        category: data.category,
        review_content: data.review_content,
        status: status
      };

      // Generate Review ID for new reviews only
      if (!reviewId) {
        reviewData.review_id = generateReviewId(
          data.category,
          data.item_name,
          data.batch_id || '',
          new Date()
        );
      }

      if (reviewId) {
        // Update existing review
        const result = await supabase
          .from('prose_reviews')
          .update(reviewData)
          .eq('id', reviewId)
          .select()
          .single();
        review = result.data;
        error = result.error;
      } else {
        // Insert new review
        const result = await supabase
          .from('prose_reviews')
          .insert(reviewData)
          .select()
          .single();
        review = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Extract flavor descriptors in the background (don't block user flow)
      if (review?.id) {
        extractDescriptors(review.id, reviewData);
      }

      if (action === 'done') {
        toast.success('Prose review completed!');
        router.push(`/review/summary/${review.id}?type=prose`);
      } else if (action === 'save') {
        toast.success('Prose review saved for later');
        router.push('/review/my-reviews');
      } else if (action === 'new') {
        toast.success('Prose review completed! Starting new review...');
        router.reload();
      }
    } catch (error) {
      console.error('Error saving prose review:', error);
      toast.error('Failed to save prose review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 min-h-screen">
      <main id="main-content" className="pb-32">
        <div className="container mx-auto px-md py-lg max-w-4xl">
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
              Prose Review
            </h1>
            <p className="text-body font-body text-text-secondary">
              Write your review in your own words
            </p>
          </div>

          {/* Prose Review Form */}
          <ProseReviewForm
            initialData={existingReview || undefined}
            onSubmit={handleSubmit}
            onPhotoUpload={handlePhotoUpload}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>

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
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-bold">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default ProseReviewPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}

