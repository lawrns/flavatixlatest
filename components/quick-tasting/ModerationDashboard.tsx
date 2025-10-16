import React, { useState, useEffect } from 'react';
import { studyModeService, SuggestionWithParticipant } from '@/lib/studyModeService';
import { roleService, ParticipantWithRole, ParticipantRole } from '@/lib/roleService';
import { studyModeRealtime } from '@/lib/studyModeRealtime';
import { RoleIndicator } from './RoleIndicator';
import toast from 'react-hot-toast';

/**
 * ModerationDashboard Component
 *
 * Comprehensive dashboard for hosts to manage Study Mode collaborative features.
 * Provides tools for moderating item suggestions, managing participants, and
 * overseeing the tasting session.
 *
 * Features:
 * - Real-time suggestion moderation (approve/reject)
 * - Participant role management
 * - Session statistics and progress tracking
 * - Host unresponsiveness controls
 * - Role switching between moderating and participating
 *
 * Only visible to users with canModerate permissions.
 */
interface ModerationDashboardProps {
  tastingId: string;
  userId: string;
  onRoleSwitch?: (newRole: 'moderating' | 'participating') => void;
}

type DashboardView = 'suggestions' | 'participants' | 'settings';

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  tastingId,
  userId,
  onRoleSwitch,
}) => {
  const [activeView, setActiveView] = useState<DashboardView>('suggestions');
  const [suggestions, setSuggestions] = useState<SuggestionWithParticipant[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'moderating' | 'participating'>('moderating');

  useEffect(() => {
    loadData();
    setupRealtimeUpdates();
  }, [tastingId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suggestionsData, participantsData] = await Promise.all([
        studyModeService.getSuggestions(tastingId, userId),
        roleService.getParticipants(tastingId),
      ]);

      setSuggestions(suggestionsData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    // Subscribe to suggestion updates
    const unsubscribe = studyModeRealtime.subscribeToTasting(tastingId, {
      onSuggestionUpdate: (update) => {
        loadData(); // Refresh data when suggestions change
        toast.success(`Suggestion ${update.status}`);
      },
      onRoleUpdate: () => {
        loadData(); // Refresh participants when roles change
      },
      onParticipantJoined: () => {
        loadData(); // Refresh participant list
      },
    });

    return unsubscribe;
  };

  const handleModerateSuggestion = async (suggestionId: string, action: 'approve' | 'reject') => {
    try {
      await studyModeService.moderateSuggestion(suggestionId, userId, action, tastingId);
      toast.success(
        action === 'approve'
          ? 'Suggestion approved and added to tasting!'
          : 'Suggestion rejected'
      );
    } catch (error: any) {
      console.error('Error moderating suggestion:', error);
      toast.error(error.message || 'Failed to moderate suggestion');
    }
  };

  const handleRoleChange = async (participantId: string, newRole: 'host' | 'participant' | 'both') => {
    try {
      await roleService.updateParticipantRole(tastingId, participantId, newRole, userId);
      toast.success('Role updated successfully');
      loadData();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const toggleUserRole = () => {
    const newRole = currentUserRole === 'moderating' ? 'participating' : 'moderating';
    setCurrentUserRole(newRole);
    onRoleSwitch?.(newRole);
  };

  const getSuggestionsStats = () => {
    const pending = suggestions.filter(s => s.status === 'pending').length;
    const approved = suggestions.filter(s => s.status === 'approved').length;
    const rejected = suggestions.filter(s => s.status === 'rejected').length;

    return { pending, approved, rejected, total: suggestions.length };
  };

  const stats = getSuggestionsStats();

  return (
    <div className="bg-white dark:bg-zinc-800 border border-border-primary rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              Moderation Dashboard
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage participants, suggestions, and session settings
            </p>
          </div>

          {/* Role Toggle */}
          <button
            onClick={toggleUserRole}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentUserRole === 'moderating'
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {currentUserRole === 'moderating' ? '🔧 Moderating' : '👤 Participating'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-text-secondary">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-text-secondary">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
            <div className="text-sm text-text-secondary">Participants</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border-primary">
        {[
          { id: 'suggestions', label: 'Suggestions', count: stats.pending },
          { id: 'participants', label: 'Participants', count: participants.length },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as DashboardView)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'suggestions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Pending Suggestions</h3>

            {stats.pending === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <div className="text-4xl mb-2">✅</div>
                <p>All caught up! No pending suggestions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions
                  .filter(s => s.status === 'pending')
                  .map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">
                          {suggestion.suggested_item_name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          by {suggestion.participant?.profiles?.full_name ||
                             suggestion.participant?.profiles?.username ||
                             'Anonymous'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleModerateSuggestion(suggestion.id, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateSuggestion(suggestion.id, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'participants' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Session Participants</h3>

            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {(participant.profile?.full_name || participant.profile?.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="font-medium text-text-primary">
                        {participant.profile?.full_name || participant.profile?.username || 'Anonymous'}
                      </div>
                      <RoleIndicator
                        role={participant.role as ParticipantRole}
                        userId={participant.user_id}
                        currentUserId={userId}
                        size="sm"
                      />
                    </div>
                  </div>

                  {participant.user_id !== userId && (
                    <select
                      value={participant.role}
                      onChange={(e) => handleRoleChange(participant.id, e.target.value as any)}
                      className="px-3 py-1 border border-border-primary rounded text-sm"
                    >
                      <option value="participant">Participant</option>
                      <option value="both">Host + Participant</option>
                      <option value="host">Host Only</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-text-primary">Session Settings</h3>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <h4 className="font-medium text-yellow-800">Host Unresponsiveness</h4>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  If you become unresponsive, participants can continue evaluating existing items.
                  New suggestions will be queued for your review when you return.
                </p>
                <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
                  Mark as Away
                </button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Transfer Host Role</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Transfer moderation responsibilities to another participant.
                </p>
                <select className="px-3 py-2 border border-border-primary rounded text-sm mr-2">
                  <option>Select participant...</option>
                  {participants
                    .filter(p => p.user_id !== userId)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.profile?.full_name || p.profile?.username || 'Anonymous'}
                      </option>
                    ))}
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
