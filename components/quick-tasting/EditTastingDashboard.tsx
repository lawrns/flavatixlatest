import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  custom_category_name?: string | null;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

interface EditTastingDashboardProps {
  session: QuickTasting;
  onSessionUpdate?: (session: QuickTasting) => void;
}

const categories = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'wine', name: 'Wine' },
  { id: 'spirits', name: 'Spirits' },
  { id: 'beer', name: 'Beer' },
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'other', name: 'Other' },
];

const tastingPresets = [
  {
    id: 'basic',
    name: 'Basic Tasting',
    description: 'Standard tasting with all information visible',
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false
  },
  {
    id: 'blind-items',
    name: 'Blind Items',
    description: 'Item names are hidden during tasting',
    is_blind_participants: false,
    is_blind_items: true,
    is_blind_attributes: false
  },
  {
    id: 'full-blind',
    name: 'Full Blind Tasting',
    description: 'All information is hidden - participants, items, and attributes',
    is_blind_participants: true,
    is_blind_items: true,
    is_blind_attributes: true
  },
];

export const EditTastingDashboard: React.FC<EditTastingDashboardProps> = ({
  session,
  onSessionUpdate,
}) => {
  const [sessionName, setSessionName] = useState(session.session_name || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isBlindTasting, setIsBlindTasting] = useState(
    session.is_blind_participants || session.is_blind_items || session.is_blind_attributes
  );
  const [customCategoryName, setCustomCategoryName] = useState(session.custom_category_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient() as any;

  useEffect(() => {
    setSessionName(session.session_name || '');
    setIsBlindTasting(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes);
    setCustomCategoryName(session.custom_category_name || '');
  }, [session]);

  const updateSession = async (updates: Partial<QuickTasting>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quick_tastings')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tasting settings updated!');
      if (onSessionUpdate) {
        onSessionUpdate(data);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update tasting settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = () => {
    if (sessionName !== session.session_name) {
      updateSession({ session_name: sessionName });
    }
  };

  const handlePresetChange = (presetId: string) => {
    const preset = tastingPresets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      updateSession({
        is_blind_participants: preset.is_blind_participants,
        is_blind_items: preset.is_blind_items,
        is_blind_attributes: preset.is_blind_attributes,
      });
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    try {
      setIsLoading(true);
      const updates: Partial<QuickTasting> = { category: newCategory };

      // If changing to "other", clear custom category name
      // If changing away from "other", also clear custom category name and update session name
      if (newCategory === 'other') {
        updates.custom_category_name = customCategoryName || null;
      } else {
        updates.custom_category_name = null;
        setCustomCategoryName('');
        updates.session_name = `${newCategory.charAt(0).toUpperCase() + newCategory.slice(1)} Tasting`;
      }

      const { data, error } = await supabase
        .from('quick_tastings')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Category updated!');
      if (onSessionUpdate) {
        onSessionUpdate(data);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomCategoryNameChange = async () => {
    if (session.category === 'other' && customCategoryName.trim()) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('quick_tastings')
          .update({
            custom_category_name: customCategoryName.trim(),
            session_name: `${customCategoryName.trim()} Tasting`
          })
          .eq('id', session.id)
          .select()
          .single();

        if (error) throw error;

        toast.success('Custom category name updated!');
        if (onSessionUpdate) {
          onSessionUpdate(data);
        }
      } catch (error) {
        console.error('Error updating custom category name:', error);
        toast.error('Failed to update custom category name');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBlindTastingToggle = () => {
    const newBlindState = !isBlindTasting;
    setIsBlindTasting(newBlindState);
    updateSession({
      is_blind_participants: newBlindState,
      is_blind_items: newBlindState,
      is_blind_attributes: newBlindState,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 border border-border-primary rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div>
          <h2 className="text-xl font-heading font-semibold text-text-primary">
            Edit Tasting
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Customize your tasting session settings
          </p>
        </div>

        {/* Blind Tasting Toggle - Only show for non-quick modes */}
        {session.mode !== 'quick' && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">Blind Tasting</h3>
              <p className="text-sm text-text-secondary">Hide information during tasting</p>
            </div>
            <button
              onClick={handleBlindTastingToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isBlindTasting
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isBlindTasting ? '🕶️ On' : '👁️ Off'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Session Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tasting Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onBlur={handleNameChange}
            onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter tasting name"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category
          </label>
          <select
            value={session.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Category Name - Only show when "Other" is selected */}
        {session.category === 'other' && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Custom Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              onBlur={handleCustomCategoryNameChange}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomCategoryNameChange()}
              className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter custom category name"
              disabled={isLoading}
              required
            />
            {session.category === 'other' && !customCategoryName.trim() && (
              <p className="text-sm text-red-500 mt-1">Custom category name is required when "Other" is selected</p>
            )}
          </div>
        )}

        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Preset Configuration
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a preset...</option>
            {tastingPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          {selectedPreset && (
            <p className="text-sm text-text-secondary mt-1">
              {tastingPresets.find(p => p.id === selectedPreset)?.description}
            </p>
          )}
        </div>

        {/* Current Settings Summary */}
        <div className="p-4 bg-background-secondary rounded-lg">
          <h4 className="font-medium text-text-primary mb-2">Current Settings</h4>
          <div className="text-sm text-text-secondary space-y-1">
            <div>Blind Participants: {session.is_blind_participants ? 'Yes' : 'No'}</div>
            <div>Blind Items: {session.is_blind_items ? 'Yes' : 'No'}</div>
            <div>Blind Attributes: {session.is_blind_attributes ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};