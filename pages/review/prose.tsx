import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import ProseReviewForm, { ProseReviewFormData } from '@/components/review/ProseReviewForm';
import { generateReviewId } from '@/lib/reviewIdGenerator';
import { PageLayout } from '@/components/layout/PageLayout';

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

  if (loading || isLoadingReview) {
    return (
      <PageLayout title="Prose Review" showBack backUrl="/review">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="Prose Review"
      subtitle="Write your review in your own words"
      showBack
      backUrl="/review"
      containerSize="lg"
    >
      <ProseReviewForm
        initialData={existingReview || undefined}
        onSubmit={handleSubmit}
        onPhotoUpload={handlePhotoUpload}
        isSubmitting={isSubmitting}
      />
    </PageLayout>
  );
};

export default ProseReviewPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
