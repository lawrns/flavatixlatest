/**
 * PermissionsGuard Component
 *
 * Handles authentication and authorization logic for tasting sessions.
 * Manages user roles and permissions.
 *
 * @module components/quick-tasting/PermissionsGuard
 */

import { useState, useEffect, useCallback } from 'react';
import { QuickTasting, UserPermissions } from './types';
import { roleService } from '../../lib/roleService';
import { logger } from '../../lib/logger';

export interface PermissionsGuardProps {
  session: QuickTasting | null;
  userId: string;
  onPermissionsLoaded: (
    permissions: UserPermissions,
    role: 'host' | 'participant' | 'both'
  ) => void;
}

/**
 * Hook for managing user permissions
 */
export function usePermissionsGuard(session: QuickTasting | null, userId: string) {
  const [userRole, setUserRole] = useState<'host' | 'participant' | 'both' | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    role: 'participant',
    canModerate: false,
    canAddItems: true,
    canManageSession: false,
    canViewAllSuggestions: false,
    canParticipateInTasting: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user role and permissions based on session mode
   */
  const loadPermissions = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Quick tasting and predefined study mode: creator has full permissions
      if (
        session.mode === 'quick' ||
        (session.mode === 'study' && session.study_approach === 'predefined')
      ) {
        const hostPermissions: UserPermissions = {
          role: 'host',
          canModerate: true,
          canAddItems: true,
          canManageSession: true,
          canViewAllSuggestions: true,
          canParticipateInTasting: true,
        };

        setUserPermissions(hostPermissions);
        setUserRole('host');
        setIsLoading(false);
        return;
      }

      // Collaborative study mode: load participant roles from database
      try {
        const permissions = await roleService.getUserPermissions(session.id, userId);
        setUserPermissions(permissions);
        setUserRole(permissions.role);
      } catch (error) {
        logger.error('PermissionsGuard', 'Error loading user role', error);

        // Try to add user as participant
        try {
          await roleService.addParticipant(session.id, userId);

          // Retry loading permissions after adding
          setTimeout(async () => {
            try {
              const permissions = await roleService.getUserPermissions(session.id, userId);
              setUserPermissions(permissions);
              setUserRole(permissions.role);
            } catch (retryError) {
              logger.error(
                'PermissionsGuard',
                'Error loading permissions after adding participant',
                retryError
              );
            }
          }, 500);
        } catch (addError) {
          logger.error('PermissionsGuard', 'Error adding user as participant', addError);

          // Set default participant permissions
          const defaultPermissions: UserPermissions = {
            role: 'participant',
            canModerate: false,
            canAddItems: true,
            canManageSession: false,
            canViewAllSuggestions: false,
            canParticipateInTasting: true,
          };

          setUserPermissions(defaultPermissions);
          setUserRole('participant');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [session, userId]);

  /**
   * Load permissions on mount or when session changes
   */
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    (permission: keyof UserPermissions): boolean => {
      if (permission === 'role') {
        return false;
      } // role is not a boolean permission
      return userPermissions[permission] === true;
    },
    [userPermissions]
  );

  /**
   * Check if user is host
   */
  const isHost = useCallback((): boolean => {
    return userRole === 'host' || userRole === 'both';
  }, [userRole]);

  /**
   * Check if user can perform action based on session mode
   */
  const canPerformAction = useCallback(
    (action: 'add_item' | 'moderate' | 'manage_session'): boolean => {
      if (!session) {
        return false;
      }

      switch (action) {
        case 'add_item':
          // Cannot add items in competition mode
          if (session.mode === 'competition') {
            return false;
          }
          // In collaborative study mode, users suggest instead of add
          if (session.mode === 'study' && session.study_approach === 'collaborative') {
            return false;
          }
          return userPermissions.canAddItems;

        case 'moderate':
          return userPermissions.canModerate;

        case 'manage_session':
          return userPermissions.canManageSession;

        default:
          return false;
      }
    },
    [session, userPermissions]
  );

  return {
    userRole,
    userPermissions,
    isLoading,
    hasPermission,
    isHost,
    canPerformAction,
  };
}
