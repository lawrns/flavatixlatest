import React, { useState, useEffect } from 'react';
import { studyModeService, SuggestionWithParticipant } from '@/lib/studyModeService';
import { roleService } from '@/lib/roleService';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-toastify';

interface ItemSuggestionsProps {
  tastingId: string;
  userId: string;
  canAddItems: boolean;
  canModerate: boolean;
}

export const ItemSuggestions: React.FC<ItemSuggestionsProps> = ({
  tastingId,
  userId,
  canAddItems,
  canModerate,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionWithParticipant[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [tastingId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await studyModeService.getSuggestions(tastingId, userId);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSuggestion.trim()) return;

    try {
      setSubmitting(true);

      // Get participant ID for current user
      const supabase = getSupabaseClient();
      const { data: participant } = await supabase
        .from('tasting_participants')
        .select('id')
        .eq('tasting_id', tastingId)
        .eq('user_id', userId)
        .single();

      if (!participant) {
        toast.error('You are not a participant in this tasting');
        return;
      }

      await studyModeService.submitSuggestion(tastingId, (participant as any).id, newSuggestion.trim());
      setNewSuggestion('');
      toast.success('Suggestion submitted!');
      loadSuggestions(); // Refresh list
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast.error(error.message || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModerateSuggestion = async (suggestionId: string, action: 'approve' | 'reject') => {
    try {
      await studyModeService.moderateSuggestion(suggestionId, userId, action, tastingId);

      toast.success(
        action === 'approve'
          ? 'Suggestion approved and added to tasting!'
          : 'Suggestion rejected'
      );

      loadSuggestions(); // Refresh list
    } catch (error: any) {
      console.error('Error moderating suggestion:', error);
      toast.error(error.message || 'Failed to moderate suggestion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <span className="material-symbols-outlined text-sm align-middle">hourglass_empty</span>;
      case 'approved': return <span className="material-symbols-outlined text-sm align-middle text-green-600">check_circle</span>;
      case 'rejected': return <span className="material-symbols-outlined text-sm align-middle text-red-600">cancel</span>;
      default: return <span className="material-symbols-outlined text-sm align-middle">help</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          Item Suggestions
        </h3>
        <p className="text-sm text-text-secondary">
          {canModerate
            ? 'Review and moderate participant suggestions'
            : 'Suggest items for the group tasting'
          }
        </p>
      </div>

      {/* Add Suggestion Form (for participants) */}
      {canAddItems && !canModerate && (
        <div className="bg-background-secondary p-4 rounded-lg">
          <form onSubmit={handleSubmitSuggestion} className="space-y-3">
            <div>
              <label htmlFor="suggestion" className="block text-sm font-medium text-text-primary mb-1">
                Suggest an Item
              </label>
              <input
                type="text"
                id="suggestion"
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="e.g., Blue Bottle Coffee, Ethiopian Yirgacheffe"
                className="w-full px-3 py-2 border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={submitting}
                maxLength={100}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newSuggestion.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>
        </div>
      )}

      {/* Suggestions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <span className="material-symbols-outlined text-4xl text-yellow-500 mb-2 block">lightbulb</span>
            <p>No suggestions yet</p>
            {canAddItems && !canModerate && (
              <p className="text-sm mt-1">Be the first to suggest an item!</p>
            )}
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white dark:bg-zinc-800 border border-border-primary rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text-primary">
                      {suggestion.suggested_item_name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(suggestion.status)}`}>
                      {getStatusIcon(suggestion.status)} {suggestion.status}
                    </span>
                  </div>

                  <div className="text-sm text-text-secondary">
                    Suggested by {suggestion.participant?.profiles?.full_name ||
                                 suggestion.participant?.profiles?.username ||
                                 'Anonymous'}
                  </div>

                  {suggestion.moderated_at && (
                    <div className="text-xs text-text-secondary mt-1">
                      Moderated {new Date(suggestion.moderated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Moderation Actions (for moderators) */}
                {canModerate && suggestion.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleModerateSuggestion(suggestion.id, 'approve')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerateSuggestion(suggestion.id, 'reject')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Moderation Stats (for moderators) */}
      {canModerate && suggestions.length > 0 && (
        <div className="bg-background-secondary p-4 rounded-lg">
          <h4 className="font-medium text-text-primary mb-2">Moderation Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {suggestions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-text-secondary">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {suggestions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-sm text-text-secondary">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {suggestions.filter(s => s.status === 'rejected').length}
              </div>
              <div className="text-sm text-text-secondary">Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


