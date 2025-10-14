import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { ChevronLeft, Users, Trophy, BookOpen, Eye, EyeOff, Plus, Trash2, FileText } from 'lucide-react';
import { StudyModeSelector, StudyApproach } from '@/components/quick-tasting/StudyModeSelector';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { TastingTemplate } from '@/lib/templates/tastingTemplates';

type TastingMode = 'study' | 'competition' | 'quick';

interface TastingItem {
  id: string;
  item_name: string;
  category: string;
  correct_answers?: Record<string, any>;
  include_in_ranking: boolean;
}

interface CreateTastingForm {
  mode: TastingMode;
  study_approach: StudyApproach | null;
  category: string;
  session_name: string;
  rank_participants: boolean;
  ranking_type: string;
  is_blind_participants: boolean;
  is_blind_items: boolean;
  is_blind_attributes: boolean;
  items: TastingItem[];
  notes: string;
  use_template: boolean;
  template_id: string | null;
}

const CATEGORIES = ['coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate'];
const RANKING_TYPES = ['overall_score', 'average_score', 'weighted_score'];

const CreateTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient();

  const [form, setForm] = useState<CreateTastingForm>({
    mode: 'study',
    study_approach: null,
    category: '',
    session_name: '',
    rank_participants: false,
    ranking_type: 'overall_score',
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false,
    items: [],
    notes: '',
    use_template: false,
    template_id: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleModeChange = (mode: TastingMode) => {
    setForm(prev => ({
      ...prev,
      mode,
      // Reset study approach when switching away from study mode
      study_approach: mode === 'study' ? prev.study_approach : null,
      // Reset ranking when switching away from competition
      rank_participants: mode === 'competition' ? prev.rank_participants : false,
      // Clear items for study mode
      items: mode === 'study' ? [] : prev.items
    }));
  };

  const addItem = () => {
    const newItem: TastingItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      item_name: `Item ${form.items.length + 1}`,
      category: form.category || 'coffee',
      include_in_ranking: true
    };
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, updates: Partial<TastingItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    if (form.mode === 'competition' && form.items.length === 0) {
      toast.error('Competition mode requires at least one preloaded item');
      return;
    }

    if (form.mode === 'study' && form.study_approach === 'predefined' && form.items.length === 0) {
      toast.error('Pre-defined study mode requires at least one preloaded item');
      return;
    }

    if (form.mode === 'study' && !form.study_approach) {
      toast.error('Please select a study approach (Pre-defined or Collaborative)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tastings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          mode: form.mode,
          study_approach: form.study_approach,
          category: form.category,
          session_name: form.session_name || `${form.category.charAt(0).toUpperCase() + form.category.slice(1)} ${form.mode === 'study' ? 'Study' : form.mode === 'competition' ? 'Competition' : 'Tasting'}`,
          notes: form.notes || null,
          rank_participants: form.rank_participants,
          ranking_type: form.ranking_type,
          is_blind_participants: form.is_blind_participants,
          is_blind_items: form.is_blind_items,
          is_blind_attributes: form.is_blind_attributes,
          items: (form.mode === 'competition' || (form.mode === 'study' && form.study_approach === 'predefined')) ? form.items.map(item => ({
            item_name: item.item_name,
            correct_answers: item.correct_answers,
            include_in_ranking: item.include_in_ranking
          })) : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tasting session');
      }

      const data = await response.json();
      toast.success('Tasting session created successfully!');

      // Navigate to the tasting session
      router.push(`/tasting/${data.tasting.id}`);

    } catch (error) {
      console.error('Error creating tasting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tasting session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-app p-sm">
        <main className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light font-display text-zinc-900 min-h-screen">
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
              Create Tasting Session
            </h1>
            <p className="text-body font-body text-text-secondary">
              Set up a new tasting session with your preferred mode and settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Mode Selection */}
            <div className="card p-md">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <button
                  type="button"
                  onClick={() => router.push('/taste/create/study')}
                  className="p-md rounded-lg border-2 border-border-default hover:border-primary-400 transition-all"
                >
                  <BookOpen size={32} className="mx-auto mb-sm text-text-secondary" />
                  <h3 className="font-heading font-semibold mb-xs">Study Mode</h3>
                  <p className="text-small text-text-secondary">
                    Structured tasting sessions with custom categories and templates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('competition')}
                  className={`p-md rounded-lg border-2 transition-all ${
                    form.mode === 'competition'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-border-default hover:border-primary-400'
                  }`}
                >
                  <Trophy size={32} className={`mx-auto mb-sm ${
                    form.mode === 'competition' ? 'text-primary-600' : 'text-text-secondary'
                  }`} />
                  <h3 className="font-heading font-semibold mb-xs">Competition Mode</h3>
                  <p className="text-small text-text-secondary">
                    Preload items with correct answers. Enable participant ranking.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('quick')}
                  className={`p-md rounded-lg border-2 transition-all ${
                    form.mode === 'quick'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-border-default hover:border-primary-400'
                  }`}
                >
                  <Users size={32} className={`mx-auto mb-sm ${
                    form.mode === 'quick' ? 'text-primary-600' : 'text-text-secondary'
                  }`} />
                  <h3 className="font-heading font-semibold mb-xs">Quick Tasting</h3>
                  <p className="text-small text-text-secondary">
                    Standard quick tasting workflow for immediate use.
                  </p>
                </button>
              </div>
            </div>

            {/* Study Mode Approach Selection */}
            {form.mode === 'study' && (
              <div className="card p-md">
                <StudyModeSelector
                  selectedApproach={form.study_approach}
                  onApproachChange={(approach) =>
                    setForm(prev => ({ ...prev, study_approach: approach }))
                  }
                />
              </div>
            )}

            {/* Basic Settings */}
            <div className="card p-md">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Category *
                    {form.items.length > 0 && (
                      <span className="ml-2 text-xs text-text-secondary">(Locked after adding items)</span>
                    )}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input w-full"
                    required
                    disabled={form.items.length > 0}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Session Name
                    {form.items.length > 0 && (
                      <span className="ml-2 text-xs text-text-secondary">(Locked after adding items)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.session_name}
                    onChange={(e) => setForm(prev => ({ ...prev, session_name: e.target.value }))}
                    placeholder={`${form.category ? form.category.charAt(0).toUpperCase() + form.category.slice(1) : 'Category'} ${form.mode === 'competition' ? 'Competition' : 'Study'}`}
                    className="form-input w-full"
                    disabled={form.items.length > 0}
                  />
                </div>
              </div>
            </div>

            {/* Blind Tasting Options */}
            <div className="card p-md">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Blind Tasting</h2>
              <div className="space-y-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_blind_participants}
                    onChange={(e) => setForm(prev => ({ ...prev, is_blind_participants: e.target.checked }))}
                    className="form-checkbox mr-sm"
                  />
                  <EyeOff size={16} className="mr-xs text-text-secondary" />
                  <span className="text-body font-body">Hide participant identities</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_blind_items}
                    onChange={(e) => setForm(prev => ({ ...prev, is_blind_items: e.target.checked }))}
                    className="form-checkbox mr-sm"
                  />
                  <EyeOff size={16} className="mr-xs text-text-secondary" />
                  <span className="text-body font-body">Hide item details</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_blind_attributes}
                    onChange={(e) => setForm(prev => ({ ...prev, is_blind_attributes: e.target.checked }))}
                    className="form-checkbox mr-sm"
                  />
                  <EyeOff size={16} className="mr-xs text-text-secondary" />
                  <span className="text-body font-body">Hide flavor attributes</span>
                </label>
              </div>
            </div>

            {/* Competition Settings */}
            {form.mode === 'competition' && (
              <div className="card p-md">
                <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Competition Settings</h2>

                <label className="flex items-center mb-md">
                  <input
                    type="checkbox"
                    checked={form.rank_participants}
                    onChange={(e) => setForm(prev => ({ ...prev, rank_participants: e.target.checked }))}
                    className="form-checkbox mr-sm"
                  />
                  <Trophy size={16} className="mr-xs text-text-secondary" />
                  <span className="text-body font-body">Enable participant ranking</span>
                </label>

                {form.rank_participants && (
                  <div className="ml-md">
                    <label className="block text-small font-body font-medium text-text-primary mb-xs">
                      Ranking Method
                    </label>
                    <select
                      value={form.ranking_type}
                      onChange={(e) => setForm(prev => ({ ...prev, ranking_type: e.target.value }))}
                      className="form-input w-full max-w-xs"
                    >
                      {RANKING_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Items Management (Competition Mode and Pre-defined Study Mode) */}
            {((form.mode === 'competition') || (form.mode === 'study' && form.study_approach === 'predefined')) && (
              <div className="card p-md">
                <div className="flex items-center justify-between mb-md">
                  <h2 className="text-h3 font-heading font-semibold text-text-primary">{form.mode === 'competition' ? 'Competition Items' : 'Study Items'}</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary flex items-center"
                  >
                    <Plus size={16} className="mr-xs" />
                    Add Item
                  </button>
                </div>

                {form.items.length === 0 ? (
                  <p className="text-text-secondary text-center py-lg">
                    {form.mode === 'competition' 
                      ? 'Add items to compete on. Each item can have correct answers for scoring.'
                      : 'Add items for participants to evaluate. Items will be pre-loaded for the tasting.'
                    }
                  </p>
                ) : (
                  <div className="space-y-md">
                    {form.items.map((item, index) => (
                      <div key={item.id} className="border border-border-default rounded-lg p-md">
                        <div className="flex items-start justify-between mb-sm">
                          <span className="text-small font-body font-medium text-text-secondary">
                            Item {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-error hover:text-error-dark"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                          <div>
                            <label className="block text-small font-body font-medium text-text-primary mb-xs">
                              Item Name
                            </label>
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => updateItem(item.id, { item_name: e.target.value })}
                              className="form-input w-full"
                              placeholder="e.g., Colombian Supremo"
                            />
                          </div>

                          <div>
                            <label className="block text-small font-body font-medium text-text-primary mb-xs">
                              Include in Ranking
                            </label>
                            <input
                              type="checkbox"
                              checked={item.include_in_ranking}
                              onChange={(e) => updateItem(item.id, { include_in_ranking: e.target.checked })}
                              className="form-checkbox"
                            />
                          </div>
                        </div>

                        <div className="mt-md">
                          <label className="block text-small font-body font-medium text-text-primary mb-xs">
                            Correct Answers (JSON)
                          </label>
                          <textarea
                            value={item.correct_answers ? JSON.stringify(item.correct_answers, null, 2) : ''}
                            onChange={(e) => {
                              try {
                                const correct_answers = e.target.value ? JSON.parse(e.target.value) : undefined;
                                updateItem(item.id, { correct_answers });
                              } catch (err) {
                                // Invalid JSON, ignore for now
                              }
                            }}
                            className="form-input w-full h-24 font-mono text-small"
                            placeholder='{"overall_score": 85, "flavor_notes": "chocolate, nuts"}'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="card p-md">
              <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Additional Notes</h2>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this tasting session..."
                className="form-input w-full h-32 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Tasting Session'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
        <nav className="flex justify-around p-2">
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-primary" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-bold">Taste</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </a>
          <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default CreateTastingPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
