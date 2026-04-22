import React from 'react';
import { ParticipantRole } from '@/lib/roleService';

/**
 * RoleIndicator Component
 *
 * Displays a user's role in a tasting session with appropriate visual styling.
 * Shows different indicators for host, participant, and dual roles.
 *
 * Features:
 * - Visual role badges with icons and colors
 * - Support for dual roles (host + participant)
 * - Optional descriptions and current user indicators
 * - Multiple size variants
 */
interface RoleIndicatorProps {
  role: ParticipantRole;
  userId?: string;
  currentUserId?: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  role,
  userId,
  currentUserId,
  showDescription = false,
  size = 'md',
  className = '',
}) => {
  const isCurrentUser = userId && currentUserId && userId === currentUserId;

  const getRoleConfig = (role: ParticipantRole) => {
    switch (role) {
      case 'host':
        return {
          label: 'Host',
          icon: '👑',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Manages the tasting session',
          badge: 'purple',
        };
      case 'participant':
        return {
          label: 'Participant',
          icon: '👤',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Evaluates tasting items',
          badge: 'blue',
        };
      case 'both':
        return {
          label: 'Host + Participant',
          icon: '👑👤',
          color: 'bg-bg-inset text-purple-800 border-purple-200',
          description: 'Hosts and participates in tasting',
          badge: 'dual',
        };
      default:
        return {
          label: 'Unknown',
          icon: '❓',
          color: 'bg-bg-inset text-fg border-line',
          description: 'Role not assigned',
          badge: 'gray',
        };
    }
  };

  const config = getRoleConfig(role);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Role Badge */}
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]} ${
          isCurrentUser ? 'ring-2 ring-offset-1 ring-primary/50' : ''
        }`}
      >
        <span className="text-sm">{config.icon}</span>
        <span>{config.label}</span>
        {isCurrentUser && (
          <span className="text-xs opacity-75">(You)</span>
        )}
      </span>

      {/* Optional Description */}
      {showDescription && (
        <span className="text-sm text-fg-muted">
          {config.description}
        </span>
      )}

      {/* Current User Indicator */}
      {isCurrentUser && !showDescription && (
        <span className="text-xs text-fg-muted font-medium">
          (You)
        </span>
      )}
    </div>
  );
};

// Compact version for lists/tables
interface RoleBadgeProps {
  role: ParticipantRole;
  isCurrentUser?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  isCurrentUser = false,
  className = '',
}) => {
  const config = getRoleConfig(role);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.color} ${
        isCurrentUser ? 'ring-1 ring-primary/50' : ''
      } ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {isCurrentUser && <span className="opacity-75">(You)</span>}
    </span>
  );
};

// Helper function for role configuration (used by both components)
function getRoleConfig(role: ParticipantRole) {
  switch (role) {
    case 'host':
      return {
        label: 'Host',
        icon: '👑',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Manages the tasting session',
        badge: 'purple',
      };
    case 'participant':
      return {
        label: 'Participant',
        icon: '👤',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Evaluates tasting items',
        badge: 'blue',
      };
    case 'both':
      return {
        label: 'Host + Participant',
        icon: '👑👤',
        color: 'bg-bg-inset text-purple-800 border-purple-200',
        description: 'Hosts and participates in tasting',
        badge: 'dual',
      };
    default:
      return {
        label: 'Unknown',
        icon: '❓',
        color: 'bg-bg-inset text-fg border-line',
        description: 'Role not assigned',
        badge: 'gray',
      };
  }
}
