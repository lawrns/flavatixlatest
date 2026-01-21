import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { REVIEW_CATEGORIES, COUNTRIES, US_STATES, MEXICAN_STATES } from '@/lib/reviewCategories';
import { PageLayout } from '@/components/layout/PageLayout';

const StructuredReviewPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Item ID fields
  const [itemName, setItemName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [region, setRegion] = useState('');
  const [vintage, setVintage] = useState('');
  const [batchId, setBatchId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');

  // Characteristics
  const [aromaNotes, setAromaNotes] = useState('');
  const [aromaIntensity, setAromaIntensity] = useState(0);
  const [saltNotes, setSaltNotes] = useState('');
  const [saltScore, setSaltScore] = useState(0);
  const [sweetnessNotes, setSweetnessNotes] = useState('');
  const [sweetnessScore, setSweetnessScore] = useState(0);
  const [acidityNotes, setAcidityNotes] = useState('');
  const [acidityScore, setAcidityScore] = useState(0);
  const [umamiNotes, setUmamiNotes] = useState('');
  const [umamiScore, setUmamiScore] = useState(0);
  const [spicinessNotes, setSpicinessNotes] = useState('');
  const [spicinessScore, setSpicinessScore] = useState(0);
  const [flavorNotes, setFlavorNotes] = useState('');
  const [flavorIntensity, setFlavorIntensity] = useState(0);
  const [textureNotes, setTextureNotes] = useState('');
  const [typicityScore, setTypicityScore] = useState(0);
  const [complexityScore, setComplexityScore] = useState(0);
  const [otherNotes, setOtherNotes] = useState('');
  const [overallScore, setOverallScore] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Load existing review if id is provided in query params
  useEffect(() => {
    const loadReview = async () => {
      const { id } = router.query;
      if (!id || typeof id !== 'string') {
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quick_reviews')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Populate form with existing data
        setReviewId(data.id);
        setItemName(data.item_name || '');
        setPhotoUrl(data.picture_url || '');
        setBrand(data.brand || '');
        setCountry(data.country || '');
        setState(data.state || '');
        setRegion(data.region || '');
        setVintage(data.vintage || '');
        setBatchId(data.batch_id || '');
        setBarcode(data.upc_barcode || '');
        setCategory(data.category || '');
        setAromaNotes(data.aroma_notes || '');
        setAromaIntensity(data.aroma_intensity ?? 0);
        setSaltNotes(data.salt_notes || '');
        setSaltScore(data.salt_score ?? 0);
        setSweetnessNotes(data.sweetness_notes || '');
        setSweetnessScore(data.sweetness_score ?? 0);
        setAcidityNotes(data.acidity_notes || '');
        setAcidityScore(data.acidity_score ?? 0);
        setUmamiNotes(data.umami_notes || '');
        setUmamiScore(data.umami_score ?? 0);
        setSpicinessNotes(data.spiciness_notes || '');
        setSpicinessScore(data.spiciness_score ?? 0);
        setFlavorNotes(data.flavor_notes || '');
        setFlavorIntensity(data.flavor_intensity ?? 0);
        setTextureNotes(data.texture_notes || '');
        setTypicityScore(data.typicity_score ?? 0);
        setComplexityScore(data.complexity_score ?? 0);
        setOtherNotes(data.other_notes || '');
        setOverallScore(data.overall_score ?? 0);

        toast.success('Review loaded');
      } catch (error) {
        console.error('Error loading review:', error);
        toast.error('Failed to load review');
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      loadReview();
    }
  }, [router.isReady, router.query, supabase]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tasting-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('tasting-photos').getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
      toast.success('Photo uploaded!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const extractDescriptors = async (reviewId: string, reviewData: any) => {
    try {
      const extractionPayload = {
        sourceType: 'quick_review',
        sourceId: reviewId,
        structuredData: {
          aroma_notes: reviewData.aroma_notes || '',
          flavor_notes: reviewData.flavor_notes || '',
          salt_notes: reviewData.salt_notes || '',
          sweetness_notes: reviewData.sweetness_notes || '',
          acidity_notes: reviewData.acidity_notes || '',
          umami_notes: reviewData.umami_notes || '',
          spiciness_notes: reviewData.spiciness_notes || '',
          other_notes: reviewData.other_notes || '',
        },
        itemContext: {
          itemName: reviewData.item_name,
          itemCategory: reviewData.category,
          brand: reviewData.brand,
          country: reviewData.country,
          region: reviewData.region,
        },
      };

      // Get current session for auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session for descriptor extraction');
        return;
      }

      const response = await fetch('/api/flavor-wheels/extract-descriptors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
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

  const saveReview = async (status: 'in_progress' | 'completed') => {
    if (!user) {
      return;
    }

    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!category) {
      toast.error('Category is required');
      return;
    }

    setIsSaving(true);
    try {
      const reviewData = {
        user_id: user.id,
        item_name: itemName,
        picture_url: photoUrl || null,
        brand: brand || null,
        country: country || null,
        state: state || null,
        region: region || null,
        vintage: vintage || null,
        batch_id: batchId || null,
        upc_barcode: barcode || null,
        category,
        aroma_notes: aromaNotes || null,
        aroma_intensity: aromaIntensity,
        salt_notes: saltNotes || null,
        salt_score: saltScore,
        sweetness_notes: sweetnessNotes || null,
        sweetness_score: sweetnessScore,
        acidity_notes: acidityNotes || null,
        acidity_score: acidityScore,
        umami_notes: umamiNotes || null,
        umami_score: umamiScore,
        spiciness_notes: spicinessNotes || null,
        spiciness_score: spicinessScore,
        flavor_notes: flavorNotes || null,
        flavor_intensity: flavorIntensity,
        texture_notes: textureNotes || null,
        typicity_score: typicityScore,
        complexity_score: complexityScore,
        other_notes: otherNotes || null,
        overall_score: overallScore,
        status,
      };

      let data;
      let error;

      if (reviewId) {
        // Update existing review
        const result = await supabase
          .from('quick_reviews')
          .update(reviewData)
          .eq('id', reviewId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new review
        const result = await supabase.from('quick_reviews').insert(reviewData).select().single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }

      // Extract flavor descriptors in the background (don't block user flow)
      if (data?.id) {
        extractDescriptors(data.id, reviewData);
      }

      toast.success(status === 'in_progress' ? 'Review saved for later' : 'Review completed!');

      if (status === 'completed') {
        router.push(`/review/summary/${data.id}`);
      } else {
        router.push('/review/history');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };

  const startNewReview = async () => {
    await saveReview('completed');
    // Reset form
    window.location.reload();
  };

  return (
    <PageLayout
      title="Structured Review"
      subtitle="In-depth analysis of flavor characteristics"
      showBack
      backUrl="/review"
      containerSize="lg"
    >
      <div className="space-y-6">
        {/* ITEM ID Section */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Item Information</h3>
          <p className="text-sm text-text-secondary mb-4">Fill in all that apply</p>

          <div className="space-y-4">
            {/* Item Name - Required */}
            <div>
              <label className="label">
                Item Name / Variety <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="form-input"
                placeholder="Enter item name"
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="label">Picture (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-secondary w-full"
              >
                {isUploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              {photoUrl && (
                <div className="relative mt-2 w-full h-48">
                  <Image
                    src={photoUrl}
                    alt="Review item"
                    fill
                    className="object-cover rounded-lg"
                    sizes="100vw"
                  />
                </div>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="label">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-input"
                placeholder="Enter brand name"
              />
            </div>

            {/* Category - Required */}
            <div>
              <label className="label">
                Category <span className="text-error">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select category</option>
                {REVIEW_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="label">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="label">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-input"
              >
                <option value="">Select state</option>
                {country === 'United States' &&
                  US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                {country === 'Mexico' &&
                  MEXICAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="label">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="form-input"
                placeholder="Enter region"
              />
            </div>

            {/* Vintage */}
            <div>
              <label className="label">Vintage (4 digit format)</label>
              <input
                type="text"
                value={vintage}
                onChange={(e) => setVintage(e.target.value)}
                className="form-input"
                placeholder="YYYY"
                maxLength={4}
                pattern="[0-9]{4}"
              />
            </div>

            {/* Batch ID */}
            <div>
              <label className="label">Batch ID</label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="form-input"
                placeholder="Enter batch ID"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="label">Scan UPC / Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="form-input"
                placeholder="Enter or scan barcode"
              />
            </div>
          </div>
        </div>

        {/* Characteristics Section */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Characteristics</h3>

          <div className="space-y-6">
            {/* Aroma */}
            <div>
              <label className="label">Aroma</label>
              <textarea
                value={aromaNotes}
                onChange={(e) => setAromaNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe the aroma..."
              />
              <label className="text-sm text-text-secondary mb-1 block">Intensity of Aroma</label>
              <input
                type="range"
                min="0"
                max="100"
                value={aromaIntensity}
                onChange={(e) => setAromaIntensity(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {aromaIntensity}/100
              </div>
            </div>

            {/* Saltiness */}
            <div>
              <label className="label">Saltiness</label>
              <textarea
                value={saltNotes}
                onChange={(e) => setSaltNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe saltiness..."
              />
              <input
                type="range"
                min="0"
                max="100"
                value={saltScore}
                onChange={(e) => setSaltScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {saltScore}/100
              </div>
            </div>

            {/* Sweetness */}
            <div>
              <label className="label">Sweetness</label>
              <textarea
                value={sweetnessNotes}
                onChange={(e) => setSweetnessNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe sweetness..."
              />
              <input
                type="range"
                min="0"
                max="100"
                value={sweetnessScore}
                onChange={(e) => setSweetnessScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {sweetnessScore}/100
              </div>
            </div>

            {/* Acidity */}
            <div>
              <label className="label">Acidity</label>
              <textarea
                value={acidityNotes}
                onChange={(e) => setAcidityNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe acidity..."
              />
              <input
                type="range"
                min="0"
                max="100"
                value={acidityScore}
                onChange={(e) => setAcidityScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {acidityScore}/100
              </div>
            </div>

            {/* Umami */}
            <div>
              <label className="label">Umami</label>
              <textarea
                value={umamiNotes}
                onChange={(e) => setUmamiNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe umami..."
              />
              <input
                type="range"
                min="0"
                max="100"
                value={umamiScore}
                onChange={(e) => setUmamiScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {umamiScore}/100
              </div>
            </div>

            {/* Spiciness */}
            <div>
              <label className="label">Spiciness (Chile pepper)</label>
              <textarea
                value={spicinessNotes}
                onChange={(e) => setSpicinessNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe spiciness..."
              />
              <input
                type="range"
                min="0"
                max="100"
                value={spicinessScore}
                onChange={(e) => setSpicinessScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {spicinessScore}/100
              </div>
            </div>

            {/* Flavor */}
            <div>
              <label className="label">Flavor</label>
              <textarea
                value={flavorNotes}
                onChange={(e) => setFlavorNotes(e.target.value)}
                className="form-input h-20 resize-none mb-2"
                placeholder="Describe flavor..."
              />
              <label className="text-sm text-text-secondary mb-1 block">Intensity of Flavor</label>
              <input
                type="range"
                min="0"
                max="100"
                value={flavorIntensity}
                onChange={(e) => setFlavorIntensity(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {flavorIntensity}/100
              </div>
            </div>

            {/* Texture */}
            <div>
              <label className="label">Texture</label>
              <textarea
                value={textureNotes}
                onChange={(e) => setTextureNotes(e.target.value)}
                className="form-input h-20 resize-none"
                placeholder="Describe texture..."
              />
            </div>

            {/* Typicity */}
            <div>
              <label className="label">Typicity (Tastes how it should)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={typicityScore}
                onChange={(e) => setTypicityScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {typicityScore}/100
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="label">Complexity</label>
              <input
                type="range"
                min="0"
                max="100"
                value={complexityScore}
                onChange={(e) => setComplexityScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-2xl font-bold text-primary mt-2">
                {complexityScore}/100
              </div>
            </div>

            {/* Other */}
            <div>
              <label className="label">Other</label>
              <textarea
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
                className="form-input h-20 resize-none"
                placeholder="Other notes..."
              />
            </div>

            {/* Overall */}
            <div>
              <label className="label">Overall</label>
              <input
                type="range"
                min="0"
                max="100"
                value={overallScore}
                onChange={(e) => setOverallScore(parseInt(e.target.value))}
                className="w-full slider-ultra-thin"
              />
              <div className="text-center text-3xl font-bold text-primary mt-2">
                {overallScore}/100
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => saveReview('completed')}
              disabled={isSaving}
              className="btn-primary"
            >
              Done
            </button>
            <button
              onClick={() => saveReview('in_progress')}
              disabled={isSaving}
              className="btn-secondary"
            >
              Save for Later
            </button>
            <button onClick={startNewReview} disabled={isSaving} className="btn-ghost">
              New Review
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default StructuredReviewPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}
