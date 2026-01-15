/**
 * ReviewFormItemInfo Component
 *
 * Handles the item information section of the review form.
 * Displays fields for item name, picture, brand, country, etc.
 *
 * @module components/review/ReviewFormItemInfo
 */

import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import {
  REVIEW_CATEGORIES,
  COUNTRIES,
  getStatesForCountry,
  hasStates,
} from '@/lib/reviewCategories';

export interface ReviewFormData {
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
}

export interface ReviewFormItemInfoProps {
  formData: ReviewFormData;
  isUploadingPhoto: boolean;
  onFieldUpdate: <K extends keyof ReviewFormData>(field: K, value: ReviewFormData[K]) => void;
  onPhotoUpload?: (file: File) => Promise<string>;
}

/**
 * Item Information section of review form
 */
export const ReviewFormItemInfo: React.FC<ReviewFormItemInfoProps> = ({
  formData,
  isUploadingPhoto,
  onFieldUpdate,
  onPhotoUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onPhotoUpload) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      // Toast error handled by parent
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // Toast error handled by parent
      return;
    }

    try {
      const photoUrl = await onPhotoUpload(file);
      onFieldUpdate('picture_url', photoUrl);
    } catch (error) {
      // Error handled by parent
      throw error;
    }
  };

  const availableStates = formData.country ? getStatesForCountry(formData.country) : [];

  return (
    <div className="card p-md">
      <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">
        Item Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Item Name/Variety (REQUIRED) */}
        <div className="md:col-span-2">
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Item Name/Variety *
          </label>
          <input
            type="text"
            value={formData.item_name}
            onChange={(e) => onFieldUpdate('item_name', e.target.value)}
            className="form-input w-full"
            placeholder="e.g., Ethiopian Yirgacheffe"
            required
          />
        </div>

        {/* Picture (optional upload) */}
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
                onClick={() => onFieldUpdate('picture_url', undefined)}
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

        {/* Brand */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Brand
          </label>
          <input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => onFieldUpdate('brand', e.target.value)}
            className="form-input w-full"
            placeholder="e.g., Starbucks"
          />
        </div>

        {/* Category (REQUIRED dropdown) */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFieldUpdate('category', e.target.value)}
            className="form-input w-full"
            required
          >
            <option value="">Select a category</option>
            {REVIEW_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Country (dropdown) */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Country
          </label>
          <select
            value={formData.country || ''}
            onChange={(e) => {
              onFieldUpdate('country', e.target.value);
              // Clear state if country changes
              if (!hasStates(e.target.value)) {
                onFieldUpdate('state', undefined);
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

        {/* State (dropdown - conditional) */}
        {formData.country && hasStates(formData.country) && (
          <div>
            <label className="block text-small font-body font-medium text-text-primary mb-xs">
              State
            </label>
            <select
              value={formData.state || ''}
              onChange={(e) => onFieldUpdate('state', e.target.value)}
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

        {/* Region */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Region
          </label>
          <input
            type="text"
            value={formData.region || ''}
            onChange={(e) => onFieldUpdate('region', e.target.value)}
            className="form-input w-full"
            placeholder="e.g., Napa Valley"
          />
        </div>

        {/* Vintage (4 digit format) */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Vintage
          </label>
          <input
            type="text"
            value={formData.vintage || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              onFieldUpdate('vintage', value);
            }}
            className="form-input w-full"
            placeholder="YYYY"
            maxLength={4}
          />
        </div>

        {/* Batch ID */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Batch ID
          </label>
          <input
            type="text"
            value={formData.batch_id || ''}
            onChange={(e) => onFieldUpdate('batch_id', e.target.value)}
            className="form-input w-full"
            placeholder="e.g., LOT-2024-001"
          />
        </div>

        {/* Scan UPC/Barcode */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            UPC/Barcode
          </label>
          <input
            type="text"
            value={formData.upc_barcode || ''}
            onChange={(e) => onFieldUpdate('upc_barcode', e.target.value)}
            className="form-input w-full"
            placeholder="Scan or enter barcode"
          />
        </div>
      </div>
    </div>
  );
};
