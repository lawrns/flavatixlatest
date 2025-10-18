import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft, Plus, Trash2, Eye, Save } from 'lucide-react';
import { STUDY_MODE_TEMPLATES, getStudyModeTemplateById } from '@/lib/templates/tastingTemplates';

const BASE_CATEGORIES = [
  'Red Wine',
  'White Wine',
  'Coffee',
  'Beer',
  'Mezcal',
  'Whiskey',
  'Spirits',
  'Tea',
  'Chocolate',
  'Other'
];

interface CategoryInput {
  id: string;
  name: string;
  hasText: boolean;
  hasScale: boolean;
  hasBoolean: boolean;
  scaleMax: number;
  rankInSummary: boolean;
}

interface CreateStudyForm {
  name: string;
  baseCategory: string;
  categories: CategoryInput[];
}

const NewStudyTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient();
  const { templateId } = router.query;

  const [form, setForm] = useState<CreateStudyForm>({
    name: '',
    baseCategory: '',
    categories: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId && typeof templateId === 'string') {
      const template = getStudyModeTemplateById(templateId);
      if (template) {
        setForm({
          name: template.name,
          baseCategory: template.baseCategory,
          categories: template.categories.map((cat, index) => ({
            id: `cat-${Date.now()}-${index}`,
            name: cat.name,
            hasText: cat.hasText,
            hasScale: cat.hasScale,
            hasBoolean: cat.hasBoolean,
            scaleMax: cat.scaleMax || 100,
            rankInSummary: cat.rankInSummary
          }))
        });
      }
    }
  }, [templateId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.length < 1 || form.name.length > 120) {
      newErrors.name = 'Tasting name must be between 1 and 120 characters';
    }

    if (!form.baseCategory) {
      newErrors.baseCategory = 'Please select a base category';
    }

    if (form.categories.length === 0) {
      newErrors.categories = 'Please add at least one category';
    }

    if (form.categories.length > 20) {
      newErrors.categories = 'Maximum 20 categories allowed';
    }

    form.categories.forEach((cat, index) => {
      if (!cat.name) {
        newErrors[`category-${index}-name`] = 'Category name is required';
      }
      if (!cat.hasText && !cat.hasScale && !cat.hasBoolean) {
        newErrors[`category-${index}-type`] = 'Select at least one parameter type';
      }
      if (cat.hasScale && (cat.scaleMax < 5 || cat.scaleMax > 100)) {
        newErrors[`category-${index}-scale`] = 'Scale max must be between 5 and 100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCategory = () => {
    if (form.categories.length >= 20) {
      toast.error('Maximum 20 categories allowed');
      return;
    }

    const newCategory: CategoryInput = {
      id: `cat-${Date.now()}`,
      name: '',
      hasText: false,
      hasScale: true,
      hasBoolean: false,
      scaleMax: 100,
      rankInSummary: true  // Auto-enable ranking when scale is enabled by default
    };

    setForm(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const removeCategory = (id: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id)
    }));
  };

  const updateCategory = (id: string, updates: Partial<CategoryInput>) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    }));
  };

  const handleSubmit = async (saveForLater: boolean = false) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please log in again.');
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/tastings/study/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: form.name,
          baseCategory: form.baseCategory,
          categories: form.categories.map(cat => ({
            name: cat.name,
            hasText: cat.hasText,
            hasScale: cat.hasScale,
            hasBoolean: cat.hasBoolean,
            scaleMax: cat.scaleMax,
            rankInSummary: cat.rankInSummary
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create study session');
      }

      const data = await response.json();
      toast.success('Study session created successfully!');

      if (saveForLater) {
        router.push('/my-tastings');
      } else {
        router.push(`/taste/study/${data.sessionId}`);
      }
    } catch (error) {
      console.error('Error creating study session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create study session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content" className="pb-20">
        <div className="container mx-auto px-md py-lg max-w-4xl">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Create Study Tasting
            </h1>
            <p className="text-body font-body text-text-secondary">
              Design a custom tasting session with your own categories
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-lg">
            {/* Basic Info */}
            <div className="card p-md">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Basic Information</h2>

              <div className="space-y-md">
                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Tasting Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Colombian Coffee Cupping"
                    className={`form-input w-full ${errors.name ? 'border-error' : ''}`}
                    maxLength={120}
                  />
                  <div className="flex justify-between items-center mt-xs">
                    {errors.name && (
                      <span className="text-small text-error">{errors.name}</span>
                    )}
                    <span className="text-xs text-text-secondary ml-auto">
                      {form.name.length}/120
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Base Category *
                  </label>
                  <select
                    value={form.baseCategory}
                    onChange={(e) => setForm(prev => ({ ...prev, baseCategory: e.target.value }))}
                    className={`form-input w-full ${errors.baseCategory ? 'border-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {BASE_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  
                  {/* Custom Category Input */}
                  <div className="mt-sm">
                    <label className="block text-small font-body font-medium text-text-primary mb-xs">
                      Or enter custom category
                    </label>
                    <input
                      type="text"
                      placeholder="Enter custom category name"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setForm(prev => ({ ...prev, baseCategory: e.target.value.trim() }));
                        }
                      }}
                      className="form-input w-full"
                    />
                  </div>
                  
                  {errors.baseCategory && (
                    <span className="text-small text-error mt-xs block">{errors.baseCategory}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="card p-md">
              <div className="mb-md">
                <h2 className="text-h3 font-heading font-semibold text-text-primary">
                  Categories
                </h2>
                <p className="text-small text-text-secondary">
                  Define up to 20 evaluation categories
                </p>
              </div>

              {errors.categories && (
                <div className="mb-md p-sm bg-error/10 border border-error rounded-lg">
                  <span className="text-small text-error">{errors.categories}</span>
                </div>
              )}

              {form.categories.length === 0 ? (
                <div className="text-center py-lg border-2 border-dashed border-border-default rounded-lg">
                  <p className="text-text-secondary">
                    No categories yet. Click "Add Category" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-md">
                  {form.categories.map((category, index) => (
                    <div key={category.id} className="border border-border-default rounded-lg p-md bg-white dark:bg-zinc-800">
                      <div className="flex items-start justify-between mb-sm">
                        <span className="text-small font-body font-medium text-text-secondary">
                          Category {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          className="text-error hover:text-error-dark transition-colors"
                          title="Remove category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-md">
                        <div>
                          <label className="block text-small font-body font-medium text-text-primary mb-xs">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                            placeholder="e.g., Aroma Intensity"
                            className={`form-input w-full ${errors[`category-${index}-name`] ? 'border-error' : ''}`}
                          />
                          {errors[`category-${index}-name`] && (
                            <span className="text-small text-error mt-xs block">
                              {errors[`category-${index}-name`]}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-small font-body font-medium text-text-primary mb-xs">
                            Parameter Types *
                          </label>
                          <div className="space-y-sm">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={category.hasText}
                                onChange={(e) => updateCategory(category.id, { hasText: e.target.checked })}
                                className="form-checkbox mr-sm"
                              />
                              <span className="text-body font-body">Text Input</span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={category.hasScale}
                                onChange={(e) => updateCategory(category.id, {
                                  hasScale: e.target.checked,
                                  // Auto-enable ranking when scale input is enabled
                                  rankInSummary: e.target.checked ? true : category.rankInSummary
                                })}
                                className="form-checkbox mr-sm"
                              />
                              <span className="text-body font-body">Scale Input</span>
                            </label>

                            {category.hasScale && (
                              <div className="ml-md">
                                <label className="block text-small font-body font-medium text-text-primary mb-xs">
                                  Scale Maximum (5-100)
                                </label>
                                <input
                                  type="number"
                                  value={category.scaleMax === 0 ? '' : category.scaleMax}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      // Don't auto-fill, let user clear the field
                                      updateCategory(category.id, { scaleMax: 0 });
                                    } else {
                                      const numVal = parseInt(val);
                                      if (!isNaN(numVal) && numVal >= 5 && numVal <= 100) {
                                        updateCategory(category.id, { scaleMax: numVal });
                                      }
                                    }
                                  }}
                                  onBlur={(e) => {
                                    // Only set minimum on blur if field is empty
                                    if (e.target.value === '' || parseInt(e.target.value) < 5) {
                                      updateCategory(category.id, { scaleMax: 5 });
                                    }
                                  }}
                                  min={5}
                                  max={100}
                                  className={`form-input w-32 ${errors[`category-${index}-scale`] ? 'border-error' : ''}`}
                                />
                                {errors[`category-${index}-scale`] && (
                                  <span className="text-small text-error mt-xs block">
                                    {errors[`category-${index}-scale`]}
                                  </span>
                                )}
                              </div>
                            )}

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={category.hasBoolean}
                                onChange={(e) => updateCategory(category.id, { hasBoolean: e.target.checked })}
                                className="form-checkbox mr-sm"
                              />
                              <span className="text-body font-body">Yes/No Toggle</span>
                            </label>
                          </div>
                          {errors[`category-${index}-type`] && (
                            <span className="text-small text-error mt-xs block">
                              {errors[`category-${index}-type`]}
                            </span>
                          )}
                        </div>

                        {category.hasScale && (
                          <div className="p-sm bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-small text-blue-800">
                              ✓ This category will be included in ranking summary automatically
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Category Button at Bottom */}
              <div className="mt-md flex justify-center">
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={form.categories.length >= 20}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="mr-xs" />
                  Add Category
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={form.categories.length === 0}
                className="btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={16} className="mr-xs" />
                Preview
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className="mr-xs" />
                {isSubmitting ? 'Saving...' : 'Save for Later'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create & Start'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-border-default p-md flex justify-between items-center">
              <h3 className="text-h3 font-heading font-semibold">Preview</h3>
              <div className="flex gap-sm">
                <button
                  onClick={async () => {
                    try {
                      // Save as template logic would go here
                      toast.success('Template saved successfully!');
                      setShowPreview(false);
                    } catch (error) {
                      toast.error('Failed to save template');
                    }
                  }}
                  className="btn-secondary text-small"
                >
                  Save to My Templates
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-md space-y-md">
              <div>
                <h4 className="font-semibold text-text-primary mb-xs">Tasting Name</h4>
                <p className="text-text-secondary">{form.name || 'Unnamed Tasting'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-xs">Base Category</h4>
                <p className="text-text-secondary">{form.baseCategory || 'Not selected'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-sm">Categories ({form.categories.length})</h4>
                <div className="space-y-sm">
                  {form.categories.map((cat, index) => (
                    <div key={cat.id} className="border border-border-default rounded-lg p-sm">
                      <div className="font-medium text-text-primary mb-xs">
                        {index + 1}. {cat.name || 'Unnamed Category'}
                      </div>
                      <div className="text-small text-text-secondary">
                        {cat.hasText && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded mr-xs">Text</span>}
                        {cat.hasScale && <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded mr-xs">Scale (1-{cat.scaleMax})</span>}
                        {cat.hasBoolean && <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded mr-xs">Yes/No</span>}
                        {cat.rankInSummary && <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded">Ranked</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-bold">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default NewStudyTastingPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
