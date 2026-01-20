import React, { useState } from 'react';
import { TastingTemplate, TemplateField } from '@/lib/templates/tastingTemplates';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface TemplateBasedTastingProps {
  template: TastingTemplate;
  itemName: string;
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  initialData?: Record<string, any>;
}

export const TemplateBasedTasting: React.FC<TemplateBasedTastingProps> = ({
  template,
  itemName,
  onSave,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Group fields by category
  const sections = template.fields.reduce(
    (acc, field) => {
      const category = field.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    },
    {} as Record<string, TemplateField[]>
  );

  const sectionNames = Object.keys(sections);
  const currentFields = sections[sectionNames[currentSection]] || [];

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="form-input w-full"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="form-input w-full h-24 resize-none"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="form-input w-full"
            required={field.required}
          />
        );

      case 'slider':
        return (
          <div>
            <input
              type="range"
              value={value || field.min || 0}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full"
              required={field.required}
            />
            <div className="flex justify-between text-xs text-text-secondary mt-xs">
              <span>{field.min}</span>
              <span className="font-semibold text-primary">{value || field.min || 0}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="form-input w-full"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-xs">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="form-checkbox mr-sm"
                />
                <span className="text-body">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="form-checkbox mr-sm"
            />
            <span className="text-body">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  const calculateScore = (): number => {
    if (!template.scoringMethod || !template.maxScore) {
      return 0;
    }

    let totalScore = 0;
    let totalWeight = 0;

    template.fields.forEach((field) => {
      const value = formData[field.id];
      const weight = field.weight || 1;

      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'slider' || field.type === 'number') {
          totalScore += parseFloat(value) * weight;
          totalWeight += (field.max || 10) * weight;
        } else if (field.type === 'multiselect') {
          const selectedCount = (value || []).length;
          const totalOptions = field.options?.length || 1;
          totalScore += (selectedCount / totalOptions) * 10 * weight;
          totalWeight += 10 * weight;
        }
      }
    });

    if (template.scoringMethod === 'sum') {
      return Math.round(totalScore);
    } else if (template.scoringMethod === 'average') {
      return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    } else if (template.scoringMethod === 'weighted') {
      return totalWeight > 0 ? Math.round((totalScore / totalWeight) * template.maxScore) : 0;
    }

    return 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const score = calculateScore();
      await onSave({
        ...formData,
        calculated_score: score,
        template_id: template.id,
      });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isLastSection = currentSection === sectionNames.length - 1;
  const canProceed = currentFields.every(
    (field) =>
      !field.required ||
      (formData[field.id] !== undefined && formData[field.id] !== null && formData[field.id] !== '')
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-lg">
        <div className="flex items-center justify-between mb-sm">
          <h2 className="text-h2 font-heading font-bold text-text-primary">{itemName}</h2>
          <button onClick={onCancel} className="text-text-secondary hover:text-text-primary">
            <ChevronLeft size={20} />
          </button>
        </div>
        <p className="text-small text-text-secondary">
          {template.name} • {sectionNames[currentSection]?.toUpperCase()}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-lg">
        <div className="flex gap-xs">
          {sectionNames.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                index === currentSection
                  ? 'bg-primary'
                  : index < currentSection
                    ? 'bg-success'
                    : 'bg-border-default'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-xs text-center">
          Section {currentSection + 1} of {sectionNames.length}
        </p>
      </div>

      {/* Fields */}
      <div className="card p-lg mb-lg">
        <div className="space-y-md">
          {currentFields.map((field) => (
            <div key={field.id}>
              <label className="block text-small font-body font-medium text-text-primary mb-xs">
                {field.label}
                {field.required && <span className="text-error ml-xs">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
          disabled={currentSection === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ChevronLeft size={16} className="mr-xs" />
          Previous
        </button>

        {isLastSection ? (
          <button
            onClick={handleSave}
            disabled={!canProceed || isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save size={16} className="mr-xs" />
            {isSaving ? 'Saving...' : 'Save & Finish'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection((prev) => Math.min(sectionNames.length - 1, prev + 1))}
            disabled={!canProceed}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next
            <ChevronRight size={16} className="ml-xs" />
          </button>
        )}
      </div>

      {/* Score Preview */}
      {template.scoringMethod && (
        <div className="mt-lg card p-md bg-primary/5 border-2 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-small font-semibold text-text-primary">Current Score</span>
            <span className="text-h2 font-bold text-primary">{calculateScore()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
