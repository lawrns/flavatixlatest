import React from 'react';

/**
 * Study Approach Types
 * - predefined: Host enters all items upfront, participants evaluate only those items
 * - collaborative: Participants suggest items, host moderates suggestions dynamically
 */
export type StudyApproach = 'predefined' | 'collaborative';

interface StudyModeSelectorProps {
  /** Currently selected study approach or null if none selected */
  selectedApproach: StudyApproach | null;
  /** Callback when user selects a different approach */
  onApproachChange: (approach: StudyApproach) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * StudyModeSelector Component
 *
 * Allows users to choose between Pre-defined and Collaborative study approaches
 * in Study Mode tastings. Provides clear descriptions and benefits of each approach.
 *
 * @param props - Component props
 * @returns React component for study approach selection
 */
export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  selectedApproach,
  onApproachChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          Study Mode Approach
        </h3>
        <p className="text-sm text-text-secondary">
          Choose how participants will contribute to the tasting
        </p>
      </div>

      <div className="grid gap-3">
        {/* Pre-defined Items Approach */}
        <div
          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedApproach === 'predefined'
              ? 'border-primary bg-primary/5'
              : 'border-border-primary hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onApproachChange('predefined')}
        >
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
              selectedApproach === 'predefined'
                ? 'border-primary bg-primary'
                : 'border-border-primary'
            }`}>
              {selectedApproach === 'predefined' && (
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 scale-50"></div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-text-primary mb-1">
                Pre-defined Items
              </h4>
              <p className="text-sm text-text-secondary mb-2">
                You add all items and categories upfront. Participants evaluate only the items you provide.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Structured
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Controlled
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Quick Setup
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collaborative Approach */}
        <div
          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedApproach === 'collaborative'
              ? 'border-primary bg-primary/5'
              : 'border-border-primary hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onApproachChange('collaborative')}
        >
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
              selectedApproach === 'collaborative'
                ? 'border-primary bg-primary'
                : 'border-border-primary'
            }`}>
              {selectedApproach === 'collaborative' && (
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 scale-50"></div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-text-primary mb-1">
                Collaborative
              </h4>
              <p className="text-sm text-text-secondary mb-2">
                Participants suggest items dynamically. You moderate suggestions to build the tasting together.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Interactive
                </span>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                  Community-driven
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  Flexible
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approach Details */}
      {selectedApproach && (
        <div className="mt-6 p-4 bg-background-secondary rounded-lg">
          <h5 className="font-medium text-text-primary mb-3">
            {selectedApproach === 'predefined' ? 'Pre-defined Items' : 'Collaborative'} Details
          </h5>

          <div className="space-y-2 text-sm text-text-secondary">
            {selectedApproach === 'predefined' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>You control all items and evaluation criteria</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Participants focus purely on evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ideal for structured, educational tastings</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Participants contribute item suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>You approve/reject suggestions as moderator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Great for group exploration and discovery</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
