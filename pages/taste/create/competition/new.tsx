import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft, Plus, Trash2, Eye, Save, ArrowRight, CheckCircle, X, Package, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
  'Other'
];

type ParameterType = 'multiple_choice' | 'true_false' | 'contains' | 'exact_match' | 'range' | 'numeric';

interface Parameter {
  id: string;
  name: string;
  type: ParameterType;
  points: number;
  // Answer key fields
  correctAnswer?: any;
  options?: string[]; // For multiple_choice
  correctOptions?: string[]; // For multiple_choice
  correctValueText?: string; // For exact_match, contains
  correctValueBoolean?: boolean; // For true_false
  correctValueMin?: number; // For range
  correctValueMax?: number; // For range
  correctValueNumeric?: number; // For numeric
}

interface CompetitionItem {
  id: string;
  number: number;
  name: string;
  isBlind: boolean;
  parameters: Parameter[];
}

interface CreateCompetitionForm {
  name: string;
  baseCategory: string;
  items: CompetitionItem[];
  rankParticipants: boolean;
  rankingType: 'accuracy' | 'points' | 'weighted';
  /** Session-level blind setting - applies to all items */
  isBlindTasting: boolean;
}

const NewCompetitionPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient();

  const [form, setForm] = useState<CreateCompetitionForm>({
    name: '',
    baseCategory: '',
    items: [],
    rankParticipants: true,
    rankingType: 'points',
    isBlindTasting: false
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.length < 1 || form.name.length > 120) {
      newErrors.name = 'Competition name must be between 1 and 120 characters';
    }

    if (!form.baseCategory) {
      newErrors.baseCategory = 'Please select a base category';
    }

    if (form.items.length === 0) {
      newErrors.items = 'Please add at least one item';
    }

    // Validate each item has at least one parameter
    form.items.forEach((item, index) => {
      if (item.parameters.length === 0) {
        newErrors[`item-${index}`] = `Item ${item.number} must have at least one parameter`;
      }

      // Validate parameters have correct answer keys
      item.parameters.forEach((param, pIndex) => {
        if (param.type === 'multiple_choice' && (!param.options || param.options.length < 2)) {
          newErrors[`item-${index}-param-${pIndex}`] = 'Multiple choice must have at least 2 options';
        }
        if (param.type === 'multiple_choice' && (!param.correctOptions || param.correctOptions.length === 0)) {
          newErrors[`item-${index}-param-${pIndex}`] = 'Select at least one correct answer';
        }
        if (param.type === 'exact_match' && !param.correctValueText) {
          newErrors[`item-${index}-param-${pIndex}`] = 'Provide correct exact match value';
        }
        if (param.type === 'contains' && !param.correctValueText) {
          newErrors[`item-${index}-param-${pIndex}`] = 'Provide text that must be contained';
        }
        if (param.type === 'range' && (param.correctValueMin === undefined || param.correctValueMax === undefined)) {
          newErrors[`item-${index}-param-${pIndex}`] = 'Provide min and max for range';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (form.items.length >= 50) {
      toast.error('Maximum 50 items allowed');
      return;
    }

    const newItem: CompetitionItem = {
      id: `item-${Date.now()}`,
      number: form.items.length + 1,
      name: `Item ${form.items.length + 1}`,
      isBlind: false,
      parameters: []
    };

    setForm({ ...form, items: [...form.items, newItem] });
    setExpandedItem(newItem.id);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = form.items
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, number: index + 1, name: `Item ${index + 1}` }));
    
    setForm({ ...form, items: updatedItems });
    
    if (expandedItem === itemId) {
      setExpandedItem(null);
    }
  };

  const updateItem = (itemId: string, updates: Partial<CompetitionItem>) => {
    setForm({
      ...form,
      items: form.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  const addParameter = (itemId: string) => {
    const item = form.items.find(i => i.id === itemId);
    if (!item) return;

    if (item.parameters.length >= 20) {
      toast.error('Maximum 20 parameters per item');
      return;
    }

    const newParameter: Parameter = {
      id: `param-${Date.now()}`,
      name: '',
      type: 'multiple_choice',
      points: 1,
      options: ['', ''],
      correctOptions: []
    };

    updateItem(itemId, {
      parameters: [...item.parameters, newParameter]
    });
  };

  const removeParameter = (itemId: string, paramId: string) => {
    const item = form.items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      parameters: item.parameters.filter(p => p.id !== paramId)
    });
  };

  const updateParameter = (itemId: string, paramId: string, updates: Partial<Parameter>) => {
    const item = form.items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      parameters: item.parameters.map(p => 
        p.id === paramId ? { ...p, ...updates } : p
      )
    });
  };

  const handleCreate = async () => {
    if (!validateForm() || !user) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create competition session with session-level settings
      const { data: session, error: sessionError } = await supabase
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
          // Session-level blind setting (applies to all items by default)
          is_blind_items: form.isBlindTasting
        } as any)
        .select()
        .single() as { data: { id: string } | null, error: any };

      if (sessionError) throw sessionError;
      if (!session) throw new Error('Failed to create session');

      // Create items with parameters and answer keys
      for (const item of form.items) {
        // Create tasting item
        const { data: tastingItem, error: itemError } = await supabase
          .from('quick_tasting_items')
          .insert({
            tasting_id: session.id,
            item_name: item.name,
            item_order: item.number
          } as any)
          .select()
          .single() as { data: { id: string } | null, error: any };

        if (itemError) throw itemError;
        if (!tastingItem) throw new Error('Failed to create tasting item');

        // Create competition item metadata
        // Per-item is_blind uses session setting by default, with optional per-item override
        const { error: metadataError } = await supabase
          .from('competition_item_metadata')
          .insert({
            item_id: tastingItem.id,
            tasting_id: session.id,
            item_order: item.number,
            is_blind: form.isBlindTasting || item.isBlind  // Session-level OR per-item override
          } as any);

        if (metadataError) throw metadataError;

        // Create answer keys for each parameter
        for (const param of item.parameters) {
          // Build correct_answer as JSONB based on parameter type
          let correctAnswer: any = {};
          let answerOptions: any = null;
          
          switch (param.type) {
            case 'multiple_choice':
              correctAnswer = { options: param.correctOptions };
              answerOptions = param.options || [];
              break;
            case 'true_false':
              correctAnswer = { value: param.correctValueBoolean };
              break;
            case 'exact_match':
            case 'contains':
              correctAnswer = { text: param.correctValueText };
              break;
            case 'range':
              correctAnswer = { min: param.correctValueMin, max: param.correctValueMax };
              break;
            case 'numeric':
              correctAnswer = { value: param.correctValueNumeric };
              break;
          }

          const answerKey: any = {
            tasting_id: session.id,
            item_id: tastingItem.id,
            parameter_name: param.name,
            parameter_type: param.type,
            correct_answer: correctAnswer,
            answer_options: answerOptions,
            points: param.points || 1
          };

          const { error: answerError } = await supabase
            .from('competition_answer_keys')
            .insert(answerKey);

          if (answerError) throw answerError;
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back
            </button>
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Create Competition
            </h1>
            <p className="text-text-secondary font-body">
              Design a competition with answer keys and scoring
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold">Basic Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Competition Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Coffee Cupping Competition 2025"
                  maxLength={120}
                />
                <p className="text-xs text-text-secondary mt-1">
                  {form.name.length}/120 characters
                </p>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Base Category *
                </label>
                <Combobox
                  value={form.baseCategory}
                  onChange={(value) => setForm({ ...form, baseCategory: value })}
                  options={BASE_CATEGORIES}
                  placeholder="Select or type a category"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Select from the list or type your own custom category
                </p>
                {errors.baseCategory && (
                  <p className="text-xs text-red-600 mt-1">{errors.baseCategory}</p>
                )}
              </div>

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

              {form.rankParticipants && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ranking Method
                  </label>
                  <select
                    value={form.rankingType}
                    onChange={(e) => setForm({ ...form, rankingType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="points">Total Points</option>
                    <option value="accuracy">Accuracy Percentage</option>
                    <option value="weighted">Weighted Score</option>
                  </select>
                </div>
              )}

              {/* Session-level Blind Tasting Toggle */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isBlindTasting}
                    onChange={(e) => setForm({ ...form, isBlindTasting: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium block">Blind Tasting</span>
                    <span className="text-xs text-text-secondary">Hide all item names from participants during the competition</span>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Competition Items</h2>
              <p className="text-text-secondary">
                Add items and define parameters with correct answers
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {form.items.length === 0 ? (
              <p className="text-center text-text-secondary py-8">
                No items yet. Click "Add Item" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {form.items.map((item) => (
                  <CompetitionItemCard
                    key={item.id}
                    item={item}
                    expanded={expandedItem === item.id}
                    onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    onUpdate={(updates) => updateItem(item.id, updates)}
                    onRemove={() => removeItem(item.id)}
                    onAddParameter={() => addParameter(item.id)}
                    onRemoveParameter={(paramId) => removeParameter(item.id, paramId)}
                    onUpdateParameter={(paramId, updates) => updateParameter(item.id, paramId, updates)}
                    errors={errors}
                    sessionIsBlind={form.isBlindTasting}
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

            {errors.items && (
              <p className="text-xs text-red-600 mt-2">{errors.items}</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={() => router.back()}
            variant="secondary"
          >
            Cancel
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

            <Button
              onClick={handleCreate}
              disabled={isSubmitting || form.items.length === 0}
            >
              {isSubmitting ? 'Creating...' : 'Create & Start'}
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          form={form}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// Competition Item Card Component
interface CompetitionItemCardProps {
  item: CompetitionItem;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<CompetitionItem>) => void;
  onRemove: () => void;
  onAddParameter: () => void;
  onRemoveParameter: (paramId: string) => void;
  onUpdateParameter: (paramId: string, updates: Partial<Parameter>) => void;
  errors: Record<string, string>;
  /** Session-level blind setting - when true, all items are blind */
  sessionIsBlind?: boolean;
}

const CompetitionItemCard: React.FC<CompetitionItemCardProps> = ({
  item,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onAddParameter,
  onRemoveParameter,
  onUpdateParameter,
  errors,
  sessionIsBlind = false
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-lg font-display font-semibold hover:text-primary transition-colors"
        >
          {(sessionIsBlind || item.isBlind) ? <EyeOff size={20} className="text-amber-600" /> : <Package size={20} className="text-primary" />}
          <span>{item.name}</span>
          <span className="text-sm font-body text-text-secondary">
            ({item.parameters.length} parameters)
          </span>
        </button>

        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Item Name
            </label>
            <Input
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g., Ethiopian Yirgacheffe"
            />
          </div>

          {/* Per-item blind override - hidden when session-level blind is enabled */}
          {!sessionIsBlind && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.isBlind}
                  onChange={(e) => onUpdate({ isBlind: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Blind for this item</span>
                <span className="text-xs text-text-secondary">(Override session setting)</span>
              </label>
            </div>
          )}
          {sessionIsBlind && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
              <span className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <EyeOff size={16} />
                This item is blind (session-level setting)
              </span>
            </div>
          )}

          {/* Parameters */}
          <div className="border-t pt-4">
            <h4 className="font-display font-semibold mb-3">Parameters & Answer Keys</h4>
            
            {item.parameters.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">
                No parameters yet. Add one to define what participants will evaluate.
              </p>
            ) : (
              <div className="space-y-4">
                {item.parameters.map((param, index) => (
                  <ParameterCard
                    key={param.id}
                    parameter={param}
                    index={index}
                    onUpdate={(updates) => onUpdateParameter(param.id, updates)}
                    onRemove={() => onRemoveParameter(param.id)}
                  />
                ))}
              </div>
            )}

            <Button
              onClick={onAddParameter}
              variant="secondary"
              size="sm"
              className="w-full mt-3"
              disabled={item.parameters.length >= 20}
            >
              <Plus size={16} className="mr-1" />
              Add Parameter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Parameter Card Component
interface ParameterCardProps {
  parameter: Parameter;
  index: number;
  onUpdate: (updates: Partial<Parameter>) => void;
  onRemove: () => void;
}

const ParameterCard: React.FC<ParameterCardProps> = ({
  parameter,
  index,
  onUpdate,
  onRemove
}) => {
  return (
    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">
          Parameter {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Parameter Name *
          </label>
          <Input
            value={parameter.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Origin Country, Roast Level"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Type *
            </label>
            <select
              value={parameter.type}
              onChange={(e) => onUpdate({ type: e.target.value as ParameterType })}
              className="w-full px-2 py-1.5 border rounded-md text-sm"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="exact_match">Exact Match</option>
              <option value="contains">Contains Text</option>
              <option value="range">Numeric Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Points
            </label>
            <Input
              type="number"
              value={parameter.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              min={1}
              max={100}
            />
          </div>
        </div>

        {/* Answer Key Fields */}
        {parameter.type === 'multiple_choice' && (
          <MultipleChoiceAnswerKey
            options={parameter.options || []}
            correctOptions={parameter.correctOptions || []}
            onUpdateOptions={(options) => onUpdate({ options })}
            onUpdateCorrectOptions={(correctOptions) => onUpdate({ correctOptions })}
          />
        )}

        {parameter.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={parameter.correctValueBoolean === true}
                  onChange={() => onUpdate({ correctValueBoolean: true })}
                />
                <span className="text-sm">True</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={parameter.correctValueBoolean === false}
                  onChange={() => onUpdate({ correctValueBoolean: false })}
                />
                <span className="text-sm">False</span>
              </label>
            </div>
          </div>
        )}

        {(parameter.type === 'exact_match' || parameter.type === 'contains') && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Correct Answer * ({parameter.type === 'contains' ? 'Text to contain' : 'Exact text'})
            </label>
            <Input
              value={parameter.correctValueText || ''}
              onChange={(e) => onUpdate({ correctValueText: e.target.value })}
              placeholder={parameter.type === 'contains' ? 'e.g., Ethiopia' : 'e.g., Ethiopian Yirgacheffe'}
            />
          </div>
        )}

        {parameter.type === 'range' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min Value *</label>
              <Input
                type="number"
                value={parameter.correctValueMin || ''}
                onChange={(e) => onUpdate({ correctValueMin: parseFloat(e.target.value) })}
                placeholder="e.g., 80"
                              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Value *</label>
              <Input
                type="number"
                value={parameter.correctValueMax || ''}
                onChange={(e) => onUpdate({ correctValueMax: parseFloat(e.target.value) })}
                placeholder="e.g., 85"
                              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Multiple Choice Answer Key Component
interface MultipleChoiceAnswerKeyProps {
  options: string[];
  correctOptions: string[];
  onUpdateOptions: (options: string[]) => void;
  onUpdateCorrectOptions: (correctOptions: string[]) => void;
}

const MultipleChoiceAnswerKey: React.FC<MultipleChoiceAnswerKeyProps> = ({
  options,
  correctOptions,
  onUpdateOptions,
  onUpdateCorrectOptions
}) => {
  const addOption = () => {
    onUpdateOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdateOptions(newOptions);
    
    // Remove from correct options if it was selected
    const removedOption = options[index];
    if (correctOptions.includes(removedOption)) {
      onUpdateCorrectOptions(correctOptions.filter(o => o !== removedOption));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    const oldValue = newOptions[index];
    newOptions[index] = value;
    onUpdateOptions(newOptions);

    // Update correct options if this option was selected
    if (correctOptions.includes(oldValue)) {
      onUpdateCorrectOptions(correctOptions.map(o => o === oldValue ? value : o));
    }
  };

  const toggleCorrectOption = (option: string) => {
    if (correctOptions.includes(option)) {
      onUpdateCorrectOptions(correctOptions.filter(o => o !== option));
    } else {
      onUpdateCorrectOptions([...correctOptions, option]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Options & Correct Answers *</label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={correctOptions.includes(option)}
              onChange={() => toggleCorrectOption(option)}
              disabled={!option}
              className="rounded"
            />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
                          />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                className="mt-2"
        disabled={options.length >= 10}
      >
        <Plus size={14} className="mr-1" />
        Add Option
      </Button>

      <p className="text-xs text-text-secondary mt-2">
        Check the box next to correct answers. Multiple selections allowed.
      </p>
    </div>
  );
};

// Preview Modal Component
interface PreviewModalProps {
  form: CreateCompetitionForm;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ form, onClose }) => {
  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
            <h3 id="preview-modal-title" className="text-2xl font-bold">Preview</h3>
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
              <h4 className="font-display font-semibold text-lg mb-1">Competition Name</h4>
              <p className="font-body text-text-secondary">{form.name || 'Untitled Competition'}</p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-lg mb-1">Base Category</h4>
              <p className="font-body text-text-secondary">{form.baseCategory || 'Not selected'}</p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-lg mb-1">Ranking</h4>
              <p className="font-body text-text-secondary">
                {form.rankParticipants ? `Yes - ${form.rankingType}` : 'No ranking'}
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-lg mb-2">Items ({form.items.length})</h4>
              <div className="space-y-4">
                {form.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display font-semibold">{item.number}. {item.name}</span>
                      {item.isBlind && (
                        <span className="text-xs font-body bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Blind
                        </span>
                      )}
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {item.parameters.map((param, idx) => (
                        <div key={param.id} className="text-sm font-body">
                          <span className="font-display font-medium">{param.name}</span>
                          <span className="text-text-secondary ml-2">
                            ({param.type} - {param.points} pts)
                          </span>
                          
                          {/* Show answer key */}
                          <div className="ml-4 text-xs text-green-700 dark:text-green-400">
                            Answer: {renderAnswerKey(param)}
                          </div>
                        </div>
                      ))}
                    </div>
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

// Helper to render answer key in preview
const renderAnswerKey = (param: Parameter): string => {
  switch (param.type) {
    case 'multiple_choice':
      return param.correctOptions?.join(', ') || 'Not set';
    case 'true_false':
      return param.correctValueBoolean !== undefined ? String(param.correctValueBoolean) : 'Not set';
    case 'exact_match':
    case 'contains':
      return param.correctValueText || 'Not set';
    case 'range':
      return `${param.correctValueMin} - ${param.correctValueMax}`;
    default:
      return 'Unknown';
  }
};

export default NewCompetitionPage;

export async function getServerSideProps() {
  return { props: {} };
}

