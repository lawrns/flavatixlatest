import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Eye,
  X,
  Package,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Combobox from '@/components/ui/Combobox';
import BottomNavigation from '@/components/navigation/BottomNavigation';

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
  'Other',
];

type ParameterType =
  | 'multiple_choice'
  | 'true_false'
  | 'contains'
  | 'exact_match'
  | 'range'
  | 'numeric';

// Shared parameter template (defined once, applied to all items)
interface ParameterTemplate {
  id: string;
  name: string;
  type: ParameterType;
  points: number;
  options?: string[]; // For multiple_choice - the available options
}

// Per-item parameter answer (the correct answer for each item)
interface ParameterAnswer {
  parameterId: string;
  correctOptions?: string[]; // For multiple_choice
  correctValueText?: string; // For exact_match, contains
  correctValueBoolean?: boolean; // For true_false
  correctValueMin?: number; // For range
  correctValueMax?: number; // For range
  correctValueNumeric?: number; // For numeric
}

// Subjective inputs for each item
interface SubjectiveInputs {
  correctAroma: string;
  correctFlavor: string;
  correctOverallScore: number;
}

interface CompetitionItem {
  id: string;
  number: number;
  name: string;
  isBlind: boolean;
  parameterAnswers: ParameterAnswer[];
  subjective: SubjectiveInputs;
}

interface CreateCompetitionForm {
  name: string;
  baseCategory: string;
  parameterTemplates: ParameterTemplate[]; // Shared parameters
  items: CompetitionItem[];
  rankParticipants: boolean;
  rankingType: 'accuracy' | 'points' | 'weighted';
  isBlindTasting: boolean;
  includeSubjectiveInputs: boolean; // Whether to include aroma/flavor/overall scoring
}

type Step = 'setup' | 'items';

const NewCompetitionPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient();

  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [form, setForm] = useState<CreateCompetitionForm>({
    name: '',
    baseCategory: '',
    parameterTemplates: [],
    items: [],
    rankParticipants: true,
    rankingType: 'points',
    isBlindTasting: false,
    includeSubjectiveInputs: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const validateSetup = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.length < 1 || form.name.length > 120) {
      newErrors.name = 'Competition name must be between 1 and 120 characters';
    }

    if (!form.baseCategory) {
      newErrors.baseCategory = 'Please select a base category';
    }

    // Validate parameter templates
    form.parameterTemplates.forEach((param, index) => {
      if (!param.name.trim()) {
        newErrors[`param-${index}-name`] = 'Parameter name is required';
      }
      if (
        param.type === 'multiple_choice' &&
        (!param.options || param.options.filter((o) => o.trim()).length < 2)
      ) {
        newErrors[`param-${index}-options`] = 'Multiple choice needs at least 2 options';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateItems = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.items.length === 0) {
      newErrors.items = 'Please add at least one item';
    }

    // Validate each item has answers for all parameters
    form.items.forEach((item, itemIndex) => {
      form.parameterTemplates.forEach((template) => {
        const answer = item.parameterAnswers.find((a) => a.parameterId === template.id);
        if (!answer) {
          newErrors[`item-${itemIndex}-param-${template.id}`] = 'Answer required';
        } else {
          // Validate answer based on type
          if (
            template.type === 'multiple_choice' &&
            (!answer.correctOptions || answer.correctOptions.length === 0)
          ) {
            newErrors[`item-${itemIndex}-param-${template.id}`] =
              'Select at least one correct answer';
          }
          if (
            (template.type === 'exact_match' || template.type === 'contains') &&
            !answer.correctValueText?.trim()
          ) {
            newErrors[`item-${itemIndex}-param-${template.id}`] = 'Provide correct text value';
          }
          if (
            template.type === 'range' &&
            (answer.correctValueMin === undefined || answer.correctValueMax === undefined)
          ) {
            newErrors[`item-${itemIndex}-param-${template.id}`] = 'Provide min and max values';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateSetup()) {
      setCurrentStep('items');
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep('setup');
  };

  // Parameter template management
  const addParameterTemplate = () => {
    if (form.parameterTemplates.length >= 20) {
      toast.error('Maximum 20 parameters allowed');
      return;
    }

    const newTemplate: ParameterTemplate = {
      id: `param-${Date.now()}`,
      name: '',
      type: 'multiple_choice',
      points: 1,
      options: ['', ''],
    };

    setForm({ ...form, parameterTemplates: [...form.parameterTemplates, newTemplate] });
  };

  const removeParameterTemplate = (paramId: string) => {
    setForm({
      ...form,
      parameterTemplates: form.parameterTemplates.filter((p) => p.id !== paramId),
      // Also remove answers for this parameter from all items
      items: form.items.map((item) => ({
        ...item,
        parameterAnswers: item.parameterAnswers.filter((a) => a.parameterId !== paramId),
      })),
    });
  };

  const updateParameterTemplate = (paramId: string, updates: Partial<ParameterTemplate>) => {
    setForm({
      ...form,
      parameterTemplates: form.parameterTemplates.map((p) =>
        p.id === paramId ? { ...p, ...updates } : p
      ),
    });
  };

  // Item management
  const addItem = () => {
    if (form.items.length >= 50) {
      toast.error('Maximum 50 items allowed');
      return;
    }

    // Create empty answers for all parameter templates
    const emptyAnswers: ParameterAnswer[] = form.parameterTemplates.map((template) => ({
      parameterId: template.id,
      correctOptions: template.type === 'multiple_choice' ? [] : undefined,
      correctValueText: undefined,
      correctValueBoolean: undefined,
      correctValueMin: undefined,
      correctValueMax: undefined,
      correctValueNumeric: undefined,
    }));

    const newItem: CompetitionItem = {
      id: `item-${Date.now()}`,
      number: form.items.length + 1,
      name: `Item ${form.items.length + 1}`,
      isBlind: false,
      parameterAnswers: emptyAnswers,
      subjective: {
        correctAroma: '',
        correctFlavor: '',
        correctOverallScore: 80,
      },
    };

    setForm({ ...form, items: [...form.items, newItem] });
    setExpandedItem(newItem.id);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = form.items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({ ...item, number: index + 1 }));

    setForm({ ...form, items: updatedItems });

    if (expandedItem === itemId) {
      setExpandedItem(null);
    }
  };

  const updateItem = (itemId: string, updates: Partial<CompetitionItem>) => {
    setForm({
      ...form,
      items: form.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    });
  };

  const updateItemAnswer = (
    itemId: string,
    parameterId: string,
    answerUpdates: Partial<ParameterAnswer>
  ) => {
    setForm({
      ...form,
      items: form.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        return {
          ...item,
          parameterAnswers: item.parameterAnswers.map((a) =>
            a.parameterId === parameterId ? { ...a, ...answerUpdates } : a
          ),
        };
      }),
    });
  };

  const updateItemSubjective = (itemId: string, updates: Partial<SubjectiveInputs>) => {
    setForm({
      ...form,
      items: form.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        return {
          ...item,
          subjective: { ...item.subjective, ...updates },
        };
      }),
    });
  };

  const handleCreate = async () => {
    if (!validateItems() || !user) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create competition session
      const { data: session, error: sessionError } = (await supabase
        .from('quick_tastings')
        .insert({
          user_id: user.id,
          category: form.baseCategory,
          session_name: form.name,
          mode: 'competition',
          rank_participants: form.rankParticipants,
          ranking_type: form.rankingType,
          total_items: form.items.length,
          completed_items: 0,
          is_blind_items: form.isBlindTasting,
        } as any)
        .select()
        .single()) as { data: { id: string } | null; error: any };

      if (sessionError) {
        throw sessionError;
      }
      if (!session) {
        throw new Error('Failed to create session');
      }

      // Create items with parameters and answer keys
      for (const item of form.items) {
        // Create tasting item with subjective correct answers
        const { data: tastingItem, error: itemError } = (await supabase
          .from('quick_tasting_items')
          .insert({
            tasting_id: session.id,
            item_name: item.name,
            item_order: item.number,
            // Store subjective correct answers in the item
            correct_answers: form.includeSubjectiveInputs
              ? {
                  aroma: item.subjective.correctAroma,
                  flavor: item.subjective.correctFlavor,
                  overall_score: item.subjective.correctOverallScore,
                }
              : null,
            include_in_ranking: true,
          } as any)
          .select()
          .single()) as { data: { id: string } | null; error: any };

        if (itemError) {
          throw itemError;
        }
        if (!tastingItem) {
          throw new Error('Failed to create tasting item');
        }

        // Create competition item metadata
        const { error: metadataError } = await supabase.from('competition_item_metadata').insert({
          item_id: tastingItem.id,
          tasting_id: session.id,
          item_order: item.number,
          is_blind: form.isBlindTasting || item.isBlind,
        } as any);

        if (metadataError) {
          throw metadataError;
        }

        // Create answer keys for each parameter
        for (const answer of item.parameterAnswers) {
          const template = form.parameterTemplates.find((t) => t.id === answer.parameterId);
          if (!template) {
            continue;
          }

          // Build correct_answer as JSONB based on parameter type
          let correctAnswer: any = {};
          let answerOptions: any = null;

          switch (template.type) {
            case 'multiple_choice':
              correctAnswer = { options: answer.correctOptions };
              answerOptions = template.options || [];
              break;
            case 'true_false':
              correctAnswer = { value: answer.correctValueBoolean };
              break;
            case 'exact_match':
            case 'contains':
              correctAnswer = { text: answer.correctValueText };
              break;
            case 'range':
              correctAnswer = { min: answer.correctValueMin, max: answer.correctValueMax };
              break;
            case 'numeric':
              correctAnswer = { value: answer.correctValueNumeric };
              break;
          }

          const answerKey: any = {
            tasting_id: session.id,
            item_id: tastingItem.id,
            parameter_name: template.name,
            parameter_type: template.type,
            correct_answer: correctAnswer,
            answer_options: answerOptions,
            points: template.points || 1,
          };

          const { error: answerError } = await supabase
            .from('competition_answer_keys')
            .insert(answerKey);

          if (answerError) {
            throw answerError;
          }
        }
      }

      toast.success('Competition created successfully!');
      router.push(`/competition/${session.id}/host`);
    } catch (error: any) {
      console.error('Error creating competition:', error);
      toast.error(error.message || 'Failed to create competition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light pb-40">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-display font-bold text-text-primary">Create Competition</h1>
          <p className="text-text-secondary font-body mt-1">
            Design a competition with parameters, items, and scoring
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${currentStep === 'setup' ? 'text-primary' : 'text-text-secondary'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 'setup' ? 'bg-primary text-white' : 'bg-green-500 text-white'
              }`}
            >
              {currentStep === 'items' ? <Check size={16} /> : '1'}
            </div>
            <span className="font-medium">Setup & Parameters</span>
          </div>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700"></div>
          <div
            className={`flex items-center gap-2 ${currentStep === 'items' ? 'text-primary' : 'text-text-secondary'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 'items' ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              2
            </div>
            <span className="font-medium">Items & Answers</span>
          </div>
        </div>

        {/* Step 1: Setup & Parameters */}
        {currentStep === 'setup' && (
          <>
            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-xl font-semibold">Basic Information</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Competition Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Coffee Cupping Competition 2025"
                      maxLength={120}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      {form.name.length}/120 characters
                    </p>
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Base Category *</label>
                    <Combobox
                      value={form.baseCategory}
                      onChange={(value) => setForm({ ...form, baseCategory: value })}
                      options={BASE_CATEGORIES}
                      placeholder="Select or type a category"
                    />
                    {errors.baseCategory && (
                      <p className="text-xs text-red-600 mt-1">{errors.baseCategory}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.rankParticipants}
                          onChange={(e) => setForm({ ...form, rankParticipants: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Rank Participants</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.isBlindTasting}
                          onChange={(e) => setForm({ ...form, isBlindTasting: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Blind Tasting</span>
                      </label>
                    </div>
                  </div>

                  {form.rankParticipants && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Ranking Method</label>
                      <select
                        value={form.rankingType}
                        onChange={(e) => setForm({ ...form, rankingType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        <option value="points">Total Points</option>
                        <option value="accuracy">Accuracy Percentage</option>
                        <option value="weighted">Weighted Score</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.includeSubjectiveInputs}
                        onChange={(e) =>
                          setForm({ ...form, includeSubjectiveInputs: e.target.checked })
                        }
                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium block">
                          Include Subjective Scoring
                        </span>
                        <span className="text-xs text-text-secondary">
                          Allow participants to enter aroma, flavor notes, and overall score
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parameter Templates */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Parameters</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Define parameters that will be the same across all items
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {form.parameterTemplates.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <p className="text-text-secondary mb-4">
                      No parameters yet. Add parameters that participants will evaluate.
                    </p>
                    <Button onClick={addParameterTemplate} variant="secondary">
                      <Plus size={16} className="mr-2" />
                      Add Parameter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.parameterTemplates.map((template, index) => (
                      <ParameterTemplateCard
                        key={template.id}
                        template={template}
                        index={index}
                        onUpdate={(updates) => updateParameterTemplate(template.id, updates)}
                        onRemove={() => removeParameterTemplate(template.id)}
                        errors={errors}
                      />
                    ))}
                    <Button
                      onClick={addParameterTemplate}
                      variant="secondary"
                      className="w-full"
                      disabled={form.parameterTemplates.length >= 20}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Parameter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Step Button */}
            <div className="flex justify-end">
              <Button onClick={handleNextStep}>
                Next: Add Items
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Items & Answers */}
        {currentStep === 'items' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Competition Items</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Add items and set the correct answers for each
                    </p>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {form.parameterTemplates.length} parameters per item
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {form.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <p className="text-text-secondary mb-4">
                      No items yet. Add items for participants to evaluate.
                    </p>
                    <Button onClick={addItem} variant="secondary">
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.items.map((item) => (
                      <CompetitionItemCard
                        key={item.id}
                        item={item}
                        parameterTemplates={form.parameterTemplates}
                        expanded={expandedItem === item.id}
                        onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        onUpdate={(updates) => updateItem(item.id, updates)}
                        onRemove={() => removeItem(item.id)}
                        onUpdateAnswer={(paramId, updates) =>
                          updateItemAnswer(item.id, paramId, updates)
                        }
                        onUpdateSubjective={(updates) => updateItemSubjective(item.id, updates)}
                        errors={errors}
                        sessionIsBlind={form.isBlindTasting}
                        includeSubjective={form.includeSubjectiveInputs}
                      />
                    ))}
                  </div>
                )}

                <Button
                  onClick={addItem}
                  variant="secondary"
                  className="w-full mt-4"
                  disabled={form.items.length >= 50}
                >
                  <Plus size={20} className="mr-2" />
                  Add Item
                </Button>

                {errors.items && <p className="text-xs text-red-600 mt-2">{errors.items}</p>}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-between">
              <Button onClick={handlePrevStep} variant="secondary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Setup
              </Button>

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="secondary"
                  disabled={form.items.length === 0}
                >
                  <Eye size={20} className="mr-2" />
                  Preview
                </Button>

                <Button onClick={handleCreate} disabled={isSubmitting || form.items.length === 0}>
                  {isSubmitting ? 'Creating...' : 'Create & Start'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNavigation />

      {/* Preview Modal */}
      {showPreview && <PreviewModal form={form} onClose={() => setShowPreview(false)} />}
    </div>
  );
};

// Parameter Template Card Component
interface ParameterTemplateCardProps {
  template: ParameterTemplate;
  index: number;
  onUpdate: (updates: Partial<ParameterTemplate>) => void;
  onRemove: () => void;
  errors: Record<string, string>;
}

const ParameterTemplateCard: React.FC<ParameterTemplateCardProps> = ({
  template,
  index,
  onUpdate,
  onRemove,
  errors,
}) => {
  const addOption = () => {
    onUpdate({ options: [...(template.options || []), ''] });
  };

  const removeOption = (optIndex: number) => {
    const newOptions = (template.options || []).filter((_, i) => i !== optIndex);
    onUpdate({ options: newOptions });
  };

  const updateOption = (optIndex: number, value: string) => {
    const newOptions = [...(template.options || [])];
    newOptions[optIndex] = value;
    onUpdate({ options: newOptions });
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">Parameter {index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          aria-label="Remove parameter"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Parameter Name *</label>
          <Input
            value={template.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Origin Country, Roast Level"
          />
          {errors[`param-${index}-name`] && (
            <p className="text-xs text-red-600 mt-1">{errors[`param-${index}-name`]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={template.type}
              onChange={(e) => onUpdate({ type: e.target.value as ParameterType })}
              className="w-full px-2 py-1.5 border rounded-md text-sm dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="exact_match">Exact Match</option>
              <option value="contains">Contains Text</option>
              <option value="range">Numeric Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Points</label>
            <Input
              type="number"
              value={template.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              min={1}
              max={100}
            />
          </div>
        </div>

        {/* Multiple choice options */}
        {template.type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium mb-2">Options *</label>
            <div className="space-y-2">
              {(template.options || []).map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  {(template.options || []).length > 2 && (
                    <button
                      onClick={() => removeOption(optIndex)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      aria-label="Remove option"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={addOption}
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={(template.options || []).length >= 10}
            >
              <Plus size={14} className="mr-1" />
              Add Option
            </Button>
            {errors[`param-${index}-options`] && (
              <p className="text-xs text-red-600 mt-1">{errors[`param-${index}-options`]}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Competition Item Card Component
interface CompetitionItemCardProps {
  item: CompetitionItem;
  parameterTemplates: ParameterTemplate[];
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<CompetitionItem>) => void;
  onRemove: () => void;
  onUpdateAnswer: (parameterId: string, updates: Partial<ParameterAnswer>) => void;
  onUpdateSubjective: (updates: Partial<SubjectiveInputs>) => void;
  errors: Record<string, string>;
  sessionIsBlind: boolean;
  includeSubjective: boolean;
}

const CompetitionItemCard: React.FC<CompetitionItemCardProps> = ({
  item,
  parameterTemplates,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onUpdateAnswer,
  onUpdateSubjective,
  errors,
  sessionIsBlind,
  includeSubjective,
}) => {
  return (
    <div className="border rounded-lg p-4 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-lg font-display font-semibold hover:text-primary transition-colors"
        >
          {sessionIsBlind || item.isBlind ? (
            <EyeOff size={20} className="text-amber-600" />
          ) : (
            <Package size={20} className="text-primary" />
          )}
          <span>{item.name}</span>
        </button>

        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <Input
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g., Ethiopian Yirgacheffe"
            />
          </div>

          {!sessionIsBlind && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.isBlind}
                onChange={(e) => onUpdate({ isBlind: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Blind for this item</span>
            </label>
          )}

          {/* Subjective Inputs */}
          {includeSubjective && (
            <div className="border-t pt-4 dark:border-zinc-700">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                  Subjective
                </span>
                Correct Aroma, Flavor & Score
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Correct Aroma Notes</label>
                  <textarea
                    value={item.subjective.correctAroma}
                    onChange={(e) => onUpdateSubjective({ correctAroma: e.target.value })}
                    placeholder="e.g., Bright citrus, floral jasmine, honey sweetness"
                    className="form-input w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Correct Flavor Notes</label>
                  <textarea
                    value={item.subjective.correctFlavor}
                    onChange={(e) => onUpdateSubjective({ correctFlavor: e.target.value })}
                    placeholder="e.g., Lemon zest, bergamot, brown sugar finish"
                    className="form-input w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Correct Overall Score: {item.subjective.correctOverallScore}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={item.subjective.correctOverallScore}
                    onChange={(e) =>
                      onUpdateSubjective({ correctOverallScore: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Poor (1)</span>
                    <span>Excellent (100)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Answers */}
          {parameterTemplates.length > 0 && (
            <div className="border-t pt-4 dark:border-zinc-700">
              <h4 className="font-semibold mb-3">Parameter Answers</h4>
              <div className="space-y-4">
                {parameterTemplates.map((template) => {
                  const answer = item.parameterAnswers.find((a) => a.parameterId === template.id);
                  return (
                    <ParameterAnswerInput
                      key={template.id}
                      template={template}
                      answer={answer}
                      onUpdate={(updates) => onUpdateAnswer(template.id, updates)}
                      itemIndex={item.number - 1}
                      errors={errors}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Parameter Answer Input Component
interface ParameterAnswerInputProps {
  template: ParameterTemplate;
  answer?: ParameterAnswer;
  onUpdate: (updates: Partial<ParameterAnswer>) => void;
  itemIndex: number;
  errors: Record<string, string>;
}

const ParameterAnswerInput: React.FC<ParameterAnswerInputProps> = ({
  template,
  answer,
  onUpdate,
  itemIndex,
  errors,
}) => {
  const errorKey = `item-${itemIndex}-param-${template.id}`;

  return (
    <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{template.name}</span>
        <span className="text-xs text-text-secondary">{template.points} pts</span>
      </div>

      {template.type === 'multiple_choice' && (
        <div className="space-y-1">
          {(template.options || []).map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(answer?.correctOptions || []).includes(option)}
                onChange={(e) => {
                  const current = answer?.correctOptions || [];
                  if (e.target.checked) {
                    onUpdate({ correctOptions: [...current, option] });
                  } else {
                    onUpdate({ correctOptions: current.filter((o) => o !== option) });
                  }
                }}
                disabled={!option.trim()}
                className="rounded"
              />
              <span className="text-sm">{option || `Option ${index + 1}`}</span>
            </label>
          ))}
          <p className="text-xs text-text-secondary mt-1">Check correct answer(s)</p>
        </div>
      )}

      {template.type === 'true_false' && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={answer?.correctValueBoolean === true}
              onChange={() => onUpdate({ correctValueBoolean: true })}
            />
            <span className="text-sm">True</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={answer?.correctValueBoolean === false}
              onChange={() => onUpdate({ correctValueBoolean: false })}
            />
            <span className="text-sm">False</span>
          </label>
        </div>
      )}

      {(template.type === 'exact_match' || template.type === 'contains') && (
        <Input
          value={answer?.correctValueText || ''}
          onChange={(e) => onUpdate({ correctValueText: e.target.value })}
          placeholder={
            template.type === 'contains' ? 'Text that must be present' : 'Exact correct answer'
          }
        />
      )}

      {template.type === 'range' && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={answer?.correctValueMin ?? ''}
            onChange={(e) => onUpdate({ correctValueMin: parseFloat(e.target.value) })}
            placeholder="Min"
          />
          <Input
            type="number"
            value={answer?.correctValueMax ?? ''}
            onChange={(e) => onUpdate({ correctValueMax: parseFloat(e.target.value) })}
            placeholder="Max"
          />
        </div>
      )}

      {template.type === 'numeric' && (
        <Input
          type="number"
          value={answer?.correctValueNumeric ?? ''}
          onChange={(e) => onUpdate({ correctValueNumeric: parseFloat(e.target.value) })}
          placeholder="Correct numeric value"
        />
      )}

      {errors[errorKey] && <p className="text-xs text-red-600 mt-1">{errors[errorKey]}</p>}
    </div>
  );
};

// Preview Modal Component
interface PreviewModalProps {
  form: CreateCompetitionForm;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ form, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 id="preview-modal-title" className="text-2xl font-bold">
              Preview
            </h3>
            <button
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-1">Competition Name</h4>
              <p className="text-text-secondary">{form.name || 'Untitled Competition'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-1">Category</h4>
              <p className="text-text-secondary">{form.baseCategory || 'Not selected'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">
                Parameters ({form.parameterTemplates.length})
              </h4>
              <div className="space-y-2">
                {form.parameterTemplates.map((param) => (
                  <div key={param.id} className="bg-gray-50 dark:bg-zinc-800 p-2 rounded text-sm">
                    <span className="font-medium">{param.name}</span>
                    <span className="text-text-secondary ml-2">
                      ({param.type} - {param.points} pts)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Items ({form.items.length})</h4>
              <div className="space-y-4">
                {form.items.map((item) => (
                  <div key={item.id} className="border dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {item.number}. {item.name}
                      </span>
                      {(form.isBlindTasting || item.isBlind) && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Blind
                        </span>
                      )}
                    </div>

                    {form.includeSubjectiveInputs && (
                      <div className="text-sm text-text-secondary mb-2">
                        <p>Aroma: {item.subjective.correctAroma || 'Not set'}</p>
                        <p>Flavor: {item.subjective.correctFlavor || 'Not set'}</p>
                        <p>Score: {item.subjective.correctOverallScore}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCompetitionPage;

export async function getServerSideProps() {
  return { props: {} };
}
