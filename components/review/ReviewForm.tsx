import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { ReviewFormData } from '@/lib/types/review';
import {
  REVIEW_CATEGORIES,
  COUNTRIES,
  getStatesForCountry,
  hasStates,
} from '@/lib/reviewCategories';
import CharacteristicSlider from './CharacteristicSlider';
import { toast } from '@/lib/toast';

interface ReviewFormProps {
  initialData?: Partial<ReviewFormData>;
  onSubmit: (
    data: ReviewFormData,
    action: 'done' | 'save' | 'new'
  ) => void | boolean | Promise<void | boolean>;
  onPhotoUpload?: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  onReset?: () => void;
}

interface ReviewFormValidationErrors {
  item_name?: string;
  category?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  onSubmit,
  onPhotoUpload,
  isSubmitting = false,
  onReset,
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    item_name: '',
    category: '',
    aroma_intensity: 0,
    salt_score: 0,
    sweetness_score: 0,
    acidity_score: 0,
    umami_score: 0,
    spiciness_score: 0,
    flavor_intensity: 0,
    typicity_score: 0,
    complexity_score: 0,
    overall_score: 0,
    ...initialData,
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ReviewFormValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemNameInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateField = <K extends keyof ReviewFormData>(field: K, value: ReviewFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'item_name' || field === 'category') {
      setValidationErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: '',
      aroma_intensity: 0,
      salt_score: 0,
      sweetness_score: 0,
      acidity_score: 0,
      umami_score: 0,
      spiciness_score: 0,
      flavor_intensity: 0,
      typicity_score: 0,
      complexity_score: 0,
      overall_score: 0,
      picture_url: undefined,
      brand: undefined,
      country: undefined,
      state: undefined,
      region: undefined,
      vintage: undefined,
      batch_id: undefined,
      upc_barcode: undefined,
      aroma_notes: undefined,
      salt_notes: undefined,
      sweetness_notes: undefined,
      acidity_notes: undefined,
      umami_notes: undefined,
      spiciness_notes: undefined,
      flavor_notes: undefined,
      texture_notes: undefined,
      other_notes: undefined,
    });

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success('Form reset successfully');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onPhotoUpload) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const photoUrl = await onPhotoUpload(file);
      updateField('picture_url', photoUrl);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const validateRequiredFields = (): ReviewFormValidationErrors => {
    const nextErrors: ReviewFormValidationErrors = {};

    if (!formData.item_name.trim()) {
      nextErrors.item_name = 'Enter an item name before submitting the review.';
    }

    if (!formData.category) {
      nextErrors.category = 'Select a category before submitting the review.';
    }

    return nextErrors;
  };

  const handleSubmit = async (action: 'done' | 'save' | 'new') => {
    const nextErrors = validateRequiredFields();

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      toast.error('Complete the required fields before continuing.');

      if (nextErrors.item_name) {
        itemNameInputRef.current?.focus();
      } else if (nextErrors.category) {
        categorySelectRef.current?.focus();
      }

      return;
    }

    setValidationErrors({});
    const didSubmit = await onSubmit(formData, action);

    if (action === 'new' && didSubmit !== false) {
      resetForm();
      onReset?.();
    }
  };

  const availableStates = formData.country ? getStatesForCountry(formData.country) : [];

  return (
    <form
      className="space-y-lg"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit('done');
      }}
    >
      {/* ITEM ID Section */}
      <div className="card p-md">
        <h2 className="text-h3 font-semibold text-fg mb-md">
          Item Information
        </h2>

        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-md rounded-pane border border-signal-danger/20 bg-signal-danger/10 px-4 py-3 text-sm text-signal-danger" role="alert">
            Complete the required fields before continuing.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* 1. Item Name/Variety (REQUIRED) */}
          <div className="md:col-span-2">
            <label className="block text-small font-medium text-fg mb-xs">
              Item Name/Variety *
            </label>
            <input
              ref={itemNameInputRef}
              type="text"
              value={formData.item_name}
              onChange={(e) => updateField('item_name', e.target.value)}
              className={`form-input w-full ${validationErrors.item_name ? 'border-red-500 ring-1 ring-red-200' : ''}`}
              placeholder="e.g., Ethiopian Yirgacheffe"
              required
              aria-required="true"
              aria-invalid={!!validationErrors.item_name}
              aria-describedby={validationErrors.item_name ? 'review-item-name-error' : undefined}
            />
            {validationErrors.item_name && (
              <p id="review-item-name-error" className="mt-2 text-sm text-red-600">
                {validationErrors.item_name}
              </p>
            )}
          </div>

          {/* 2. Picture (optional upload) */}
          <div className="md:col-span-2">
            <label className="block text-small font-medium text-fg mb-xs">
              Picture
            </label>
            {formData.picture_url ? (
              <div className="relative">
                <Image
                  src={formData.picture_url}
                  alt={formData.item_name}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-48 object-cover rounded-soft"
                />
                <button
                  type="button"
                  onClick={() => updateField('picture_url', undefined)}
                  className="absolute top-2 right-2 w-8 h-8 bg-signal-danger text-white rounded-full hover:bg-signal-danger/90 transition-colors flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="btn-secondary w-full disabled:opacity-50"
              >
                <Camera size={20} className="mr-2" />
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* 3. Brand */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={(e) => updateField('brand', e.target.value)}
              className="form-input w-full"
              placeholder="e.g., Starbucks"
            />
          </div>

          {/* 10. Category (REQUIRED dropdown) */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Category *
            </label>
            <select
              ref={categorySelectRef}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={`form-input w-full ${validationErrors.category ? 'border-red-500 ring-1 ring-red-200' : ''}`}
              required
              aria-required="true"
              aria-invalid={!!validationErrors.category}
              aria-describedby={validationErrors.category ? 'review-category-error' : undefined}
            >
              <option value="">Select a category</option>
              {REVIEW_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p id="review-category-error" className="mt-2 text-sm text-red-600">
                {validationErrors.category}
              </p>
            )}
          </div>

          {/* 4. Country (dropdown) */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Country
            </label>
            <select
              value={formData.country || ''}
              onChange={(e) => {
                updateField('country', e.target.value);
                // Clear state if country changes
                if (!hasStates(e.target.value)) {
                  updateField('state', undefined);
                }
              }}
              className="form-input w-full"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* 5. State (dropdown - conditional) */}
          {formData.country && hasStates(formData.country) && (
            <div>
              <label className="block text-small font-medium text-fg mb-xs">
                State
              </label>
              <select
                value={formData.state || ''}
                onChange={(e) => updateField('state', e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select a state</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Region */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Region
            </label>
            <input
              type="text"
              value={formData.region || ''}
              onChange={(e) => updateField('region', e.target.value)}
              className="form-input w-full"
              placeholder="e.g., Napa Valley"
            />
          </div>

          {/* 7. Vintage (4 digit format) */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Vintage
            </label>
            <input
              type="text"
              value={formData.vintage || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                updateField('vintage', value);
              }}
              className="form-input w-full"
              placeholder="YYYY"
              maxLength={4}
            />
          </div>

          {/* 8. Batch ID */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Batch ID
            </label>
            <input
              type="text"
              value={formData.batch_id || ''}
              onChange={(e) => updateField('batch_id', e.target.value)}
              className="form-input w-full"
              placeholder="e.g., LOT-2024-001"
            />
          </div>

          {/* 9. Scan UPC/Barcode */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              UPC/Barcode
            </label>
            <input
              type="text"
              value={formData.upc_barcode || ''}
              onChange={(e) => updateField('upc_barcode', e.target.value)}
              className="form-input w-full"
              placeholder="Scan or enter barcode"
            />
          </div>
        </div>
      </div>

      {/* Characteristics Section */}
      <div className="card p-md">
        <h2 className="text-h3 font-semibold text-fg mb-md">
          Characteristics
        </h2>

        <div className="space-y-lg">
          {/* 1. Aroma: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Aroma"
              description="Intensity of Aroma"
              value={formData.aroma_intensity}
              onChange={(value) => updateField('aroma_intensity', value)}
            />
            <textarea
              value={formData.aroma_notes || ''}
              onChange={(e) => updateField('aroma_notes', e.target.value)}
              placeholder="Describe the aroma..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 2. Saltiness: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Saltiness"
              value={formData.salt_score}
              onChange={(value) => updateField('salt_score', value)}
            />
            <textarea
              value={formData.salt_notes || ''}
              onChange={(e) => updateField('salt_notes', e.target.value)}
              placeholder="Describe the saltiness..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 3. Sweetness: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Sweetness"
              value={formData.sweetness_score}
              onChange={(value) => updateField('sweetness_score', value)}
            />
            <textarea
              value={formData.sweetness_notes || ''}
              onChange={(e) => updateField('sweetness_notes', e.target.value)}
              placeholder="Describe the sweetness..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 4. Acidity: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Acidity"
              value={formData.acidity_score}
              onChange={(value) => updateField('acidity_score', value)}
            />
            <textarea
              value={formData.acidity_notes || ''}
              onChange={(e) => updateField('acidity_notes', e.target.value)}
              placeholder="Describe the acidity..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 5. Umami: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Umami"
              value={formData.umami_score}
              onChange={(value) => updateField('umami_score', value)}
            />
            <textarea
              value={formData.umami_notes || ''}
              onChange={(e) => updateField('umami_notes', e.target.value)}
              placeholder="Describe the umami..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 6. Spiciness: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Spiciness"
              description="Chile pepper"
              value={formData.spiciness_score}
              onChange={(value) => updateField('spiciness_score', value)}
            />
            <textarea
              value={formData.spiciness_notes || ''}
              onChange={(e) => updateField('spiciness_notes', e.target.value)}
              placeholder="Describe the spiciness..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 7. Flavor: Text input + Slider */}
          <div>
            <CharacteristicSlider
              label="Flavor"
              description="Intensity of Flavor"
              value={formData.flavor_intensity}
              onChange={(value) => updateField('flavor_intensity', value)}
            />
            <textarea
              value={formData.flavor_notes || ''}
              onChange={(e) => updateField('flavor_notes', e.target.value)}
              placeholder="Describe the flavor..."
              className="form-input w-full h-20 resize-none mt-2"
            />
          </div>

          {/* 8. Texture: Text input ONLY (NO SLIDER) */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Texture
            </label>
            <textarea
              value={formData.texture_notes || ''}
              onChange={(e) => updateField('texture_notes', e.target.value)}
              placeholder="Describe the texture..."
              className="form-input w-full h-20 resize-none"
            />
          </div>

          {/* 9. Typicity: Slider ONLY */}
          <div>
            <CharacteristicSlider
              label="Typicity"
              description="Tastes how it should"
              value={formData.typicity_score}
              onChange={(value) => updateField('typicity_score', value)}
            />
          </div>

          {/* 10. Complexity: Slider ONLY (NO TEXT INPUT) */}
          <div>
            <CharacteristicSlider
              label="Complexity"
              value={formData.complexity_score}
              onChange={(value) => updateField('complexity_score', value)}
            />
          </div>

          {/* 11. Other: Text input ONLY (NO SLIDER) */}
          <div>
            <label className="block text-small font-medium text-fg mb-xs">
              Other
            </label>
            <textarea
              value={formData.other_notes || ''}
              onChange={(e) => updateField('other_notes', e.target.value)}
              placeholder="Any other notes..."
              className="form-input w-full h-20 resize-none"
            />
          </div>

          {/* 12. Overall: Slider */}
          <div>
            <CharacteristicSlider
              label="Overall"
              value={formData.overall_score}
              onChange={(value) => updateField('overall_score', value)}
            />
          </div>
        </div>
      </div>

      {/* Action footer — sticky on mobile so actions are always reachable */}
      <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-4 pt-3 bg-white/95 dark:bg-bg/95  border-t border-line dark:border-line sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 flex-1 sm:flex-none"
          >
            {isSubmitting ? 'Saving…' : 'Save Review'}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit('save')}
            disabled={isSubmitting}
            className="btn-secondary disabled:opacity-50 flex-1 sm:flex-none"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit('new')}
            disabled={isSubmitting}
            className="btn-ghost disabled:opacity-50"
          >
            New Review
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReviewForm;
