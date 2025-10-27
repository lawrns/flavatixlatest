import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft } from 'lucide-react';
import ReviewForm, { ReviewFormData } from '@/components/review/ReviewForm';
import { generateReviewId } from '@/lib/reviewIdGenerator';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CreateReviewPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseClient() as any;

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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

  const handleSubmit = async (data: ReviewFormData, action: 'done' | 'save' | 'new') => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Generate Review ID
      const reviewId = generateReviewId(
        data.category,
        data.item_name,
        data.batch_id || '',
        new Date()
      );

      // Determine status based on action
      const status = action === 'done' ? 'completed' : 'in_progress';

      // Insert review into database
      // Convert 0 scores to null to avoid database constraint violations
      const { data: review, error } = await supabase
        .from('quick_reviews')
        .insert({
          user_id: user.id,
          review_id: reviewId,
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
          aroma_notes: data.aroma_notes,
          aroma_intensity: data.aroma_intensity || null,
          salt_notes: data.salt_notes,
          salt_score: data.salt_score || null,
          sweetness_notes: data.sweetness_notes,
          sweetness_score: data.sweetness_score || null,
          acidity_notes: data.acidity_notes,
          acidity_score: data.acidity_score || null,
          umami_notes: data.umami_notes,
          umami_score: data.umami_score || null,
          spiciness_notes: data.spiciness_notes,
          spiciness_score: data.spiciness_score || null,
          flavor_notes: data.flavor_notes,
          flavor_intensity: data.flavor_intensity || null,
          texture_notes: data.texture_notes,
          typicity_score: data.typicity_score || null,
          complexity_score: data.complexity_score || null,
          other_notes: data.other_notes,
          overall_score: data.overall_score || null,
          status: status
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save review: ${error.message || 'Unknown error'}`);
      }

      if (!review) {
        throw new Error('Review was not created successfully');
      }

      if (action === 'done') {
        toast.success('Review completed!');
        router.push(`/review/summary/${review.id}`);
      } else if (action === 'save') {
        toast.success('Review saved for later');
        router.push('/review/my-reviews');
      } else if (action === 'new') {
        toast.success('Review completed! Starting new review...');
        // Navigate to a fresh page with a timestamp to force reload
        router.push(`/review/create?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error saving review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save review';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content" className="pb-24">
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
              Create Review
            </h1>
            <p className="text-body font-body text-text-secondary">
              In-depth analysis of flavor characteristics
            </p>
          </div>

          {/* Review Form */}
          <ReviewForm
            onSubmit={handleSubmit}
            onPhotoUpload={handlePhotoUpload}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default CreateReviewPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
