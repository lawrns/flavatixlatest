import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { REVIEW_CATEGORIES, COUNTRIES, getStatesForCountry, hasStates } from '@/lib/reviewCategories';
import { toast } from '@/lib/toast';

export interface ProseReviewFormData {
  // ITEM ID Fields (10 fields)
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
  
  // Review content
  review_content: string;
}

interface ProseReviewFormProps {
  initialData?: Partial<ProseReviewFormData>;
  onSubmit: (data: ProseReviewFormData, action: 'done' | 'save' | 'new') => void;
  onPhotoUpload?: (file: File) => Promise<string>;
  isSubmitting?: boolean;
}

const ProseReviewForm: React.FC<ProseReviewFormProps> = ({
  initialData,
  onSubmit,
  onPhotoUpload,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<ProseReviewFormData>({
    item_name: '',
    category: '',
    review_content: '',
    ...initialData
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateField = <K extends keyof ProseReviewFormData>(
    field: K,
    value: ProseReviewFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onPhotoUpload) return;

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

  const handleSubmit = (action: 'done' | 'save' | 'new') => {
    if (!formData.item_name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.review_content.trim()) {
      toast.error('Review content is required');
      return;
    }
    onSubmit(formData, action);
  };

  const availableStates = formData.country ? getStatesForCountry(formData.country) : [];

  return (
    <div className="space-y-lg">
      {/* ITEM ID Section */}
      <div className="card p-md">
        <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Item Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* 1. Item Name/Variety (REQUIRED) */}
          <div className="md:col-span-2">
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
              Item Name/Variety *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) => updateField('item_name', e.target.value)}
              className="form-input w-full"
              placeholder="e.g., Ethiopian Yirgacheffe"
              required
            />
          </div>

          {/* 2. Picture (optional upload) */}
          <div className="md:col-span-2">
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
              Picture
            </label>
            {formData.picture_url ? (
              <div className="relative">
                <img
                  src={formData.picture_url}
                  alt={formData.item_name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => updateField('picture_url', undefined)}
                  className="absolute top-2 right-2 w-8 h-8 bg-error text-white rounded-full hover:bg-error/90 transition-colors flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
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
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
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
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="form-input w-full"
              required
            >
              <option value="">Select a category</option>
              {REVIEW_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Country (dropdown) */}
          <div>
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
              Country
            </label>
            <select
              value={formData.country || ''}
              onChange={(e) => {
                updateField('country', e.target.value);
                if (!hasStates(e.target.value)) {
                  updateField('state', undefined);
                }
              }}
              className="form-input w-full"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* 5. State (dropdown - conditional) */}
          {formData.country && hasStates(formData.country) && (
            <div>
              <label className="block text-small font-body font-medium text-text-primary mb-xs">
                State
              </label>
              <select
                value={formData.state || ''}
                onChange={(e) => updateField('state', e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select a state</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Region */}
          <div>
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
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
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
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
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
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
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
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

      {/* Review Content Section */}
      <div className="card p-md">
        <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Write your review</h2>
        <textarea
          value={formData.review_content}
          onChange={(e) => updateField('review_content', e.target.value)}
          placeholder="Write your detailed review here..."
          className="form-input w-full h-64 resize-none"
          required
        />
        <p className="text-xs text-text-secondary mt-2 italic">
          Descriptors from your text will be added to your flavor wheels
        </p>
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-col sm:flex-row gap-md justify-center pb-8">
        <button
          onClick={() => handleSubmit('done')}
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50"
        >
          Done
        </button>
        <button
          onClick={() => handleSubmit('save')}
          disabled={isSubmitting}
          className="btn-secondary disabled:opacity-50"
        >
          Save for Later
        </button>
        <button
          onClick={() => handleSubmit('new')}
          disabled={isSubmitting}
          className="btn-ghost disabled:opacity-50"
        >
          New Prose Review
        </button>
      </div>
    </div>
  );
};

export default ProseReviewForm;

