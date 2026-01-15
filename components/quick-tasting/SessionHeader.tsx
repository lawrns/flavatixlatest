/**
 * SessionHeader Component
 *
 * Displays and manages the header section of a tasting session including:
 * - Editable session name
 * - Category selector
 * - Role indicator (for study mode)
 * - Session statistics
 * - Action buttons (Edit, Suggestions)
 */
import React, { useState } from 'react';
import { Settings, Edit } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';
import { RoleIndicator } from './RoleIndicator';
import { QuickTasting, UserPermissions } from './types';

interface SessionHeaderProps {
  session: QuickTasting;
  userRole: 'host' | 'participant' | 'both' | null;
  userPermissions: UserPermissions;
  userId: string;
  itemsCount: number;
  completedItems: number;
  phase: 'setup' | 'tasting';
  isChangingCategory: boolean;
  showEditDashboard: boolean;
  showSuggestions: boolean;
  onSessionNameChange: (name: string) => Promise<void>;
  onCategoryChange: (category: string) => Promise<void>;
  onToggleEditDashboard: () => void;
  onToggleSuggestions: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  userRole,
  userPermissions,
  userId,
  itemsCount,
  completedItems,
  phase,
  isChangingCategory,
  showEditDashboard,
  showSuggestions,
  onSessionNameChange,
  onCategoryChange,
  onToggleEditDashboard,
  onToggleSuggestions,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(session.session_name || '');

  const canEditName = itemsCount <= 1;

  const startEditing = () => {
    if (!canEditName) {
      return;
    }
    setIsEditingName(true);
    setEditingName(session.session_name || '');
  };

  const saveName = async () => {
    if (editingName.trim() && editingName.trim() !== session.session_name) {
      await onSessionNameChange(editingName.trim());
    }
    setIsEditingName(false);
  };

  const cancelEditing = () => {
    setEditingName(session.session_name || '');
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName();
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800/80 border border-gemini-border dark:border-zinc-700 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Session Name */}
          {isEditingName ? (
            <div className="mb-2">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gemini-border dark:border-zinc-600">
                <div className="text-xs font-medium text-gemini-text-muted uppercase tracking-wider mb-1">
                  Editing Session Name
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={handleKeyPress}
                    className="text-xl font-semibold text-gemini-text-dark dark:text-white bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-0"
                    placeholder="Enter session name..."
                    autoFocus
                  />
                  <span className="text-xs text-gemini-text-muted flex-shrink-0">
                    Enter to save
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <div
                className={`flex items-center gap-2 p-2 -m-2 rounded-lg ${
                  canEditName
                    ? 'hover:bg-white dark:hover:bg-zinc-700/50 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                } transition-colors group`}
                onClick={canEditName ? startEditing : undefined}
                title={
                  canEditName ? 'Click to edit session name' : 'Cannot edit after adding items'
                }
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gemini-text-muted uppercase tracking-wider mb-0.5">
                    Session Name
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gemini-text-dark dark:text-white truncate">
                      {session.session_name || 'Quick Tasting'}
                    </h2>
                    {canEditName && (
                      <Edit
                        size={14}
                        className="text-gemini-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category & Mode Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 text-text-secondary">
            <span className="text-sm font-medium">Category:</span>
            {phase === 'setup' ? (
              <CategoryDropdown
                category={session.category}
                onCategoryChange={onCategoryChange}
                className="text-sm w-full sm:w-auto"
                isLoading={isChangingCategory}
                disabled={itemsCount > 1}
              />
            ) : (
              <span className="text-sm font-semibold text-text-primary capitalize">
                {session.custom_category_name || session.category.replace(/_/g, ' ')}
              </span>
            )}
            <div className="flex flex-wrap items-center space-x-2 text-xs">
              {session.mode === 'study' && session.study_approach && (
                <span>
                  •{' '}
                  {session.study_approach.charAt(0).toUpperCase() + session.study_approach.slice(1)}
                </span>
              )}
              {session.rank_participants && <span>• Ranked Competition</span>}
              {(session.is_blind_participants ||
                session.is_blind_items ||
                session.is_blind_attributes) && <span>• Blind Tasting</span>}
            </div>
          </div>

          {/* Role Indicator */}
          {userRole && session.mode !== 'quick' && (
            <div className="mt-2">
              <RoleIndicator role={userRole} userId={userId} currentUserId={userId} size="sm" />
            </div>
          )}
        </div>

        {/* Right Side: Actions & Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Edit Tasting Button - Setup phase only */}
          {phase === 'setup' && (
            <button
              onClick={onToggleEditDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-sm font-medium text-gemini-text-gray hover:bg-white dark:hover:bg-zinc-700 transition-colors"
            >
              <Settings size={14} />
              Edit
            </button>
          )}

          {/* Suggestions Button - Collaborative study mode only */}
          {session.mode === 'study' &&
            session.study_approach === 'collaborative' &&
            phase === 'setup' && (
              <button
                onClick={onToggleSuggestions}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-sm font-medium transition-colors ${
                  showSuggestions
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-gemini-text-gray hover:bg-white dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">lightbulb</span>
                Tips
              </button>
            )}

          {/* Stats */}
          <div className="flex items-center gap-3 pl-2 border-l border-gemini-border dark:border-zinc-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-gemini-text-dark dark:text-white tabular-nums">
                {itemsCount}
              </div>
              <div className="text-xs text-gemini-text-muted">Total items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary tabular-nums">{completedItems}</div>
              <div className="text-xs text-gemini-text-muted">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;
