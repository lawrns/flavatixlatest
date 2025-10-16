import React, { useState } from 'react';
import { ALL_TEMPLATES, TastingTemplate, getTemplatesByCategory } from '@/lib/templates/tastingTemplates';
import { FileText, Star, ChevronRight } from 'lucide-react';

interface TemplateSelectorProps {
  category?: string;
  onSelectTemplate: (template: TastingTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  category,
  onSelectTemplate,
  selectedTemplateId
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const templates = category 
    ? getTemplatesByCategory(category)
    : ALL_TEMPLATES;

  if (templates.length === 0) {
    return (
      <div className="card p-lg text-center">
        <FileText size={48} className="mx-auto mb-md text-text-secondary opacity-50" />
        <p className="text-body text-text-secondary">
          No templates available for this category yet.
        </p>
        <p className="text-small text-text-secondary mt-xs">
          You can still create a custom tasting session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-h3 font-heading font-semibold text-text-primary">
          Choose a Template
        </h3>
        <p className="text-small text-text-secondary">
          {templates.length} template{templates.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {templates.map((template) => (
          <div key={template.id}>
            <button
              onClick={() => {
                if (selectedTemplateId === template.id) {
                  setShowDetails(showDetails === template.id ? null : template.id);
                } else {
                  onSelectTemplate(template);
                }
              }}
              className={`w-full card p-md text-left transition-all hover:shadow-lg ${
                selectedTemplateId === template.id
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border border-border-default hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-sm">
                <div className="flex items-center gap-sm">
                  {template.icon && (
                    <span className="text-2xl">{template.icon}</span>
                  )}
                  <div>
                    <h4 className="text-body font-semibold text-text-primary">
                      {template.name}
                    </h4>
                    {template.isOfficial && (
                      <div className="flex items-center gap-xs mt-xs">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-yellow-700 font-medium">Official</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedTemplateId === template.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-small text-text-secondary mb-sm">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{template.fields.length} fields</span>
                {template.maxScore && (
                  <span>Max Score: {template.maxScore}</span>
                )}
              </div>

              {selectedTemplateId === template.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(showDetails === template.id ? null : template.id);
                  }}
                  className="mt-sm text-xs text-primary hover:text-primary-dark flex items-center gap-xs"
                >
                  {showDetails === template.id ? 'Hide' : 'Show'} Details
                  <ChevronRight 
                    size={12} 
                    className={`transition-transform ${showDetails === template.id ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
            </button>

            {/* Template Details */}
            {showDetails === template.id && selectedTemplateId === template.id && (
              <div className="mt-sm card p-md bg-background-light border border-border-default">
                <h5 className="text-small font-semibold text-text-primary mb-sm">
                  Template Fields
                </h5>
                <div className="space-y-xs">
                  {template.fields.map((field) => (
                    <div 
                      key={field.id}
                      className="flex items-center justify-between text-xs py-xs px-sm bg-white dark:bg-zinc-800 rounded"
                    >
                      <div className="flex items-center gap-sm">
                        <span className="text-text-primary font-medium">{field.label}</span>
                        {field.required && (
                          <span className="text-error">*</span>
                        )}
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="text-text-secondary capitalize">{field.type}</span>
                        {field.category && (
                          <span className="px-xs py-0.5 bg-primary/10 text-primary rounded text-xs">
                            {field.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {template.scoringMethod && (
                  <div className="mt-sm pt-sm border-t border-border-default">
                    <p className="text-xs text-text-secondary">
                      <span className="font-semibold">Scoring Method:</span>{' '}
                      {template.scoringMethod.charAt(0).toUpperCase() + template.scoringMethod.slice(1)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Template Option */}
      <div className="card p-md border-2 border-dashed border-border-default hover:border-primary/50 transition-all">
        <button
          onClick={() => onSelectTemplate({
            id: 'custom',
            name: 'Custom Template',
            description: 'Create your own custom tasting template',
            category: category || 'custom',
            fields: []
          })}
          className="w-full text-left"
        >
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-background-light flex items-center justify-center">
              <FileText size={24} className="text-text-secondary" />
            </div>
            <div>
              <h4 className="text-body font-semibold text-text-primary mb-xs">
                Custom Template
              </h4>
              <p className="text-small text-text-secondary">
                Create your own custom tasting form with your preferred fields
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

