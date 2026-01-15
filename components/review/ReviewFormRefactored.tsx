/**
 * ReviewForm Component (Refactored)
 *
 * Simplified main form component that delegates to sub-components.
 * Maintains existing functionality while improving maintainability.
 *
 * @module components/review/ReviewFormRefactored
 */

import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { ReviewFormItemInfo } from './ReviewFormItemInfo';
import { ReviewFormCharacteristics } from './ReviewFormCharacteristics';

export interface ReviewFormData {
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

  // Characteristics (12 fields)
  aroma_notes?: string;
  aroma_intensity: number;
  salt_notes?: string;
  salt_score: number;
  sweetness_notes?: string;
  sweetness_score: number;
  acidity_notes?: string;
  acidity_score: number;
  umami_notes?: string;
  umami_score: number;
  spiciness_notes?: string;
  spiciness_score: number;
  flavor_notes?: string;
  flavor_intensity: number;
  texture_notes?: string;
  typicity_score: number;
  complexity_score: number;
  other_notes?: string;
  overall_score: number;
}

interface ReviewFormProps {
  initialData?: Partial<ReviewFormData>;
  onSubmit: (data: ReviewFormData, action: 'done' | 'save' | 'new') => void;
  onPhotoUpload?: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  onReset?: () => void;
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

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateField = <K extends keyof ReviewFormData>(field: K, value: ReviewFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    toast.success('Form reset successfully');
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    if (!onPhotoUpload) {
      throw new Error('Photo upload handler not provided');
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      throw new Error('Invalid file type');
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      throw new Error('File too large');
    }

    setIsUploadingPhoto(true);
    try {
      const photoUrl = await onPhotoUpload(file);
      toast.success('Photo uploaded successfully!');
      return photoUrl;
    } catch (error) {
      toast.error('Failed to upload photo');
      throw error;
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

    if (action === 'new') {
      // First submit the current review, then reset the form
      onSubmit(formData, action);
      resetForm();
      onReset?.();
    } else {
      onSubmit(formData, action);
    }
  };

  return (
    <div className="space-y-lg">
      {/* Item Information Section */}
      <ReviewFormItemInfo
        formData={formData}
        isUploadingPhoto={isUploadingPhoto}
        onFieldUpdate={updateField}
        onPhotoUpload={handlePhotoUpload}
      />

      {/* Characteristics Section */}
      <ReviewFormCharacteristics formData={formData} onFieldUpdate={updateField} />

      {/* Bottom Buttons */}
      <div className="flex flex-col sm:flex-row gap-md justify-center">
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
          New Review
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
