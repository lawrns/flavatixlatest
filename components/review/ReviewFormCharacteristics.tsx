/**
 * ReviewFormCharacteristics Component
 *
 * Handles the characteristics section of the review form.
 * Displays sliders and text inputs for sensory attributes.
 *
 * @module components/review/ReviewFormCharacteristics
 */

import React from 'react';
import { ReviewFormData } from '@/lib/types/review';
import CharacteristicSlider from './CharacteristicSlider';

export interface ReviewFormCharacteristicsProps {
  formData: ReviewFormData;
  onFieldUpdate: <K extends keyof ReviewFormData>(
    field: K,
    value: ReviewFormData[K]
  ) => void;
}

/**
 * Characteristics section of review form
 */
export const ReviewFormCharacteristics: React.FC<ReviewFormCharacteristicsProps> = ({
  formData,
  onFieldUpdate,
}) => {
  return (
    <div className="card p-md">
      <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">
        Characteristics
      </h2>

      <div className="space-y-lg">
        {/* 1. Aroma: Text input + Slider */}
        <div>
          <CharacteristicSlider
            label="Aroma"
            description="Intensity of Aroma"
            value={formData.aroma_intensity}
            onChange={(value) => onFieldUpdate('aroma_intensity', value)}
          />
          <textarea
            value={formData.aroma_notes || ''}
            onChange={(e) => onFieldUpdate('aroma_notes', e.target.value)}
            placeholder="Describe the aroma..."
            className="form-input w-full h-20 resize-none mt-2"
          />
        </div>

        {/* 2. Saltiness: Text input + Slider */}
        <div>
          <CharacteristicSlider
            label="Saltiness"
            value={formData.salt_score}
            onChange={(value) => onFieldUpdate('salt_score', value)}
          />
          <textarea
            value={formData.salt_notes || ''}
            onChange={(e) => onFieldUpdate('salt_notes', e.target.value)}
            placeholder="Describe the saltiness..."
            className="form-input w-full h-20 resize-none mt-2"
          />
        </div>

        {/* 3. Sweetness: Text input + Slider */}
        <div>
          <CharacteristicSlider
            label="Sweetness"
            value={formData.sweetness_score}
            onChange={(value) => onFieldUpdate('sweetness_score', value)}
          />
          <textarea
            value={formData.sweetness_notes || ''}
            onChange={(e) => onFieldUpdate('sweetness_notes', e.target.value)}
            placeholder="Describe the sweetness..."
            className="form-input w-full h-20 resize-none mt-2"
          />
        </div>

        {/* 4. Acidity: Text input + Slider */}
        <div>
          <CharacteristicSlider
            label="Acidity"
            value={formData.acidity_score}
            onChange={(value) => onFieldUpdate('acidity_score', value)}
          />
          <textarea
            value={formData.acidity_notes || ''}
            onChange={(e) => onFieldUpdate('acidity_notes', e.target.value)}
            placeholder="Describe the acidity..."
            className="form-input w-full h-20 resize-none mt-2"
          />
        </div>

        {/* 5. Umami: Text input + Slider */}
        <div>
          <CharacteristicSlider
            label="Umami"
            value={formData.umami_score}
            onChange={(value) => onFieldUpdate('umami_score', value)}
          />
          <textarea
            value={formData.umami_notes || ''}
            onChange={(e) => onFieldUpdate('umami_notes', e.target.value)}
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
            onChange={(value) => onFieldUpdate('spiciness_score', value)}
          />
          <textarea
            value={formData.spiciness_notes || ''}
            onChange={(e) => onFieldUpdate('spiciness_notes', e.target.value)}
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
            onChange={(value) => onFieldUpdate('flavor_intensity', value)}
          />
          <textarea
            value={formData.flavor_notes || ''}
            onChange={(e) => onFieldUpdate('flavor_notes', e.target.value)}
            placeholder="Describe the flavor..."
            className="form-input w-full h-20 resize-none mt-2"
          />
        </div>

        {/* 8. Texture: Text input ONLY (NO SLIDER) */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Texture
          </label>
          <textarea
            value={formData.texture_notes || ''}
            onChange={(e) => onFieldUpdate('texture_notes', e.target.value)}
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
            onChange={(value) => onFieldUpdate('typicity_score', value)}
          />
        </div>

        {/* 10. Complexity: Slider ONLY (NO TEXT INPUT) */}
        <div>
          <CharacteristicSlider
            label="Complexity"
            value={formData.complexity_score}
            onChange={(value) => onFieldUpdate('complexity_score', value)}
          />
        </div>

        {/* 11. Other: Text input ONLY (NO SLIDER) */}
        <div>
          <label className="block text-small font-body font-medium text-text-primary mb-xs">
            Other
          </label>
          <textarea
            value={formData.other_notes || ''}
            onChange={(e) => onFieldUpdate('other_notes', e.target.value)}
            placeholder="Any other notes..."
            className="form-input w-full h-20 resize-none"
          />
        </div>

        {/* 12. Overall: Slider */}
        <div>
          <CharacteristicSlider
            label="Overall"
            value={formData.overall_score}
            onChange={(value) => onFieldUpdate('overall_score', value)}
          />
        </div>
      </div>
    </div>
  );
};
