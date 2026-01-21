import { getSupabaseClient } from './supabase';
import { studyModeRealtime } from './studyModeRealtime';
import { Database } from './supabase';

type TastingParticipant = Database['public']['Tables']['tasting_participants']['Row'];
type TastingParticipantInsert = Database['public']['Tables']['tasting_participants']['Insert'];
type TastingParticipantUpdate = Database['public']['Tables']['tasting_participants']['Update'];

export type ParticipantRole = 'host' | 'participant' | 'both';

export interface RolePermissions {
  role: ParticipantRole;
  canModerate: boolean;
  canAddItems: boolean;
  canManageSession: boolean;
  canViewAllSuggestions: boolean;
  canParticipateInTasting: boolean;
}

export interface ParticipantWithRole extends TastingParticipant {
  permissions: RolePermissions;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

/**
 * Service for managing participant roles and permissions in Study Mode
 */
export class RoleService {
  private supabase = getSupabaseClient();

  /**
   * Default permission mappings for each role
   */
  private roleDefaults: Record<ParticipantRole, RolePermissions> = {
    host: {
      role: 'host',
      canModerate: true,
      canAddItems: false, // Host manages items directly in pre-defined mode
      canManageSession: true,
      canViewAllSuggestions: true,
      canParticipateInTasting: false, // Host focuses on moderation
    },
    participant: {
      role: 'participant',
      canModerate: false,
      canAddItems: true, // Can suggest items in collaborative mode
      canManageSession: false,
      canViewAllSuggestions: false,
      canParticipateInTasting: true,
    },
    both: {
      role: 'both',
      canModerate: true,
      canAddItems: true, // Can both moderate and suggest
      canManageSession: true,
      canViewAllSuggestions: true,
      canParticipateInTasting: true, // Can both moderate and participate
    },
  };

  /**
   * Add a participant to a tasting session with appropriate role
   */
  async addParticipant(
    tastingId: string,
    userId: string,
    requestedRole?: ParticipantRole
  ): Promise<ParticipantWithRole> {
    // Check if tasting exists and get its mode
    const { data: tasting, error: tastingError } = await this.supabase
      .from('quick_tastings')
      .select('mode, study_approach, user_id')
      .eq('id', tastingId)
      .single();

    if (tastingError || !tasting) {
      throw new Error('Tasting session not found');
    }

    // Quick tasting doesn't need participant records
    if ((tasting as any).mode === 'quick') {
      // For quick tasting, return mock participant data with full permissions for creator
      if (userId === (tasting as any).user_id) {
        const mockParticipant: TastingParticipant = {
          id: 'quick-tasting-creator',
          tasting_id: tastingId,
          user_id: userId,
          role: 'host',
          score: null,
          rank: null,
          can_moderate: true,
          can_add_items: true,
          created_at: new Date().toISOString(),
        };
        return this.enrichParticipantWithPermissions(mockParticipant);
      } else {
        throw new Error('Only the creator can access quick tasting sessions');
      }
    }

    // Study mode: use full participant logic
    // Check if user is already a participant
    const { data: existing } = await this.supabase
      .from('tasting_participants')
      .select('*')
      .eq('tasting_id', tastingId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return this.enrichParticipantWithPermissions(existing as TastingParticipant);
    }

    // Determine role based on context
    let role: ParticipantRole;

    if (userId === (tasting as any).user_id) {
      // Creator of the session gets 'both' role in study mode
      role = (tasting as any).mode === 'study' ? 'both' : 'host';
    } else {
      // Other participants get default role
      role = requestedRole || 'participant';
    }

    // Validate role assignment
    await this.validateRoleAssignment(tastingId, role);

    // Get permissions for the role
    const permissions = this.getPermissionsForRole(role, tasting as any);

    const participantData: TastingParticipantInsert = {
      tasting_id: tastingId,
      user_id: userId,
      role,
      can_moderate: permissions.canModerate,
      can_add_items: permissions.canAddItems,
    };

    const { data, error } = await this.supabase
      .from('tasting_participants')
      .insert(participantData as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add participant: ${error.message}`);
    }

    return this.enrichParticipantWithPermissions(data);
  }

  /**
   * Update a participant's role
   */
  async updateParticipantRole(
    tastingId: string,
    participantId: string,
    newRole: ParticipantRole,
    requestingUserId: string
  ): Promise<ParticipantWithRole> {
    // Validate requesting user has permission to change roles
    const requesterPermissions = await this.getUserPermissions(tastingId, requestingUserId);
    if (!requesterPermissions.canManageSession) {
      throw new Error('User does not have permission to manage participant roles');
    }

    // Get current participant data
    const { data: currentParticipant, error: fetchError } = await this.supabase
      .from('tasting_participants')
      .select('*')
      .eq('id', participantId)
      .eq('tasting_id', tastingId)
      .single();

    if (fetchError || !currentParticipant) {
      throw new Error('Participant not found');
    }

    // Validate role change
    await this.validateRoleAssignment(tastingId, newRole, participantId);

    // Get tasting info for permission calculation
    const { data: tasting } = await this.supabase
      .from('quick_tastings')
      .select('mode, study_approach')
      .eq('id', tastingId)
      .single();

    // Update role and permissions
    const permissions = this.getPermissionsForRole(newRole, tasting as any);

    const updateData: TastingParticipantUpdate = {
      role: newRole,
      can_moderate: permissions.canModerate,
      can_add_items: permissions.canAddItems,
    };

    const { data, error: _error } = await this.supabase
      .from('tasting_participants')
      // @ts-ignore - Supabase type inference issue with complex queries
      .update(updateData as any)
      .eq('id', participantId)
      .eq('tasting_id', tastingId)
      .select()
      .single();

    // @ts-ignore - Supabase type inference issue
    const updatedParticipant = this.enrichParticipantWithPermissions(data as TastingParticipant);

    // Broadcast the role change in real-time
    this.broadcastRoleChange(tastingId, participantId, newRole);

    return updatedParticipant;
  }

  /**
   * Get all participants for a tasting with their roles and permissions
   */
  async getParticipants(tastingId: string): Promise<ParticipantWithRole[]> {
    const { data, error } = await this.supabase
      .from('tasting_participants')
      .select(`
        *,
        profiles:user_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('tasting_id', tastingId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get participants: ${error.message}`);
    }

    return (data || []).map(participant => this.enrichParticipantWithPermissions(participant));
  }

  /**
   * Get permissions for a specific user in a tasting
   */
  async getUserPermissions(tastingId: string, userId: string): Promise<RolePermissions> {
    // First check if this is a quick tasting session
    const { data: tasting } = await this.supabase
      .from('quick_tastings')
      .select('mode, user_id')
      .eq('id', tastingId)
      .single();

    // For quick tasting, creator has full permissions
    if (tasting && (tasting as any).mode === 'quick') {
      if ((tasting as any).user_id === userId) {
        return {
          role: 'host',
          canModerate: true,
          canAddItems: true,
          canManageSession: true,
          canViewAllSuggestions: true,
          canParticipateInTasting: true,
        };
      } else {
        throw new Error('User is not the creator of this quick tasting session');
      }
    }

    // For study mode, use participant logic
    const { data, error } = await this.supabase
      .from('tasting_participants')
      .select('role, can_moderate, can_add_items')
      .eq('tasting_id', tastingId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('User is not a participant in this tasting');
    }

    return {
      role: (data as any).role as ParticipantRole,
      canModerate: (data as any).can_moderate,
      canAddItems: (data as any).can_add_items,
      canManageSession: (data as any).role === 'host' || (data as any).role === 'both',
      canViewAllSuggestions: (data as any).can_moderate,
      canParticipateInTasting: (data as any).role === 'participant' || (data as any).role === 'both',
    };
  }

  /**
   * Check if a user can perform a specific action
   */
  async canUserPerformAction(
    tastingId: string,
    userId: string,
    action: keyof RolePermissions
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(tastingId, userId);
      return Boolean(permissions[action]);
    } catch {
      return false;
    }
  }

  /**
   * Validate role assignment rules
   */
  private async validateRoleAssignment(
    tastingId: string,
    role: ParticipantRole,
    excludeParticipantId?: string
  ): Promise<void> {
    if (role === 'host') {
      // Only one host allowed per session
      const { count } = await this.supabase
        .from('tasting_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tasting_id', tastingId)
        .eq('role', 'host')
        .neq('id', excludeParticipantId || '');

      if (count && count > 0) {
        throw new Error('Only one host allowed per tasting session');
      }
    }
  }

  /**
   * Get permissions for a role, considering tasting mode
   */
  private getPermissionsForRole(
    role: ParticipantRole,
    tasting?: { mode: string; study_approach?: string | null }
  ): RolePermissions {
    const basePermissions = this.roleDefaults[role];

    // Adjust permissions based on tasting mode
    if (tasting?.mode === 'study') {
      if (tasting.study_approach === 'collaborative') {
        // In collaborative mode, participants can suggest items
        if (role === 'participant') {
          basePermissions.canAddItems = true;
        }
      } else if (tasting.study_approach === 'predefined') {
        // In pre-defined mode, only host manages items
        if (role === 'participant') {
          basePermissions.canAddItems = false;
        }
      }
    }

    return basePermissions;
  }

  /**
   * Enrich participant data with calculated permissions
   */
  private enrichParticipantWithPermissions(participant: TastingParticipant): ParticipantWithRole {
    const permissions = {
      role: participant.role as ParticipantRole,
      canModerate: participant.can_moderate,
      canAddItems: participant.can_add_items,
      canManageSession: participant.role === 'host' || participant.role === 'both',
      canViewAllSuggestions: participant.can_moderate,
      canParticipateInTasting: participant.role === 'participant' || participant.role === 'both',
    };

    return {
      ...participant,
      permissions,
    };
  }

  /**
   * Check if tasting has a host present
   */
  async hasActiveHost(tastingId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .in('role', ['host', 'both'])
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Transfer host role to another participant
   */
  async   transferHostRole(
    tastingId: string,
    newHostUserId: string,
    currentHostUserId: string
  ): Promise<void> {
    // Verify current user is host
    const currentHostPermissions = await this.getUserPermissions(tastingId, currentHostUserId);
    if (!currentHostPermissions.canManageSession) {
      throw new Error('Current user does not have permission to transfer host role');
    }

    // Update current host to participant
    const { data: currentHost } = await this.supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .eq('user_id', currentHostUserId)
      .single();

    if (currentHost) {
      await this.updateParticipantRole(tastingId, (currentHost as any).id, 'participant', currentHostUserId);
    }

    // Update new host to host role
    const { data: newHost } = await this.supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .eq('user_id', newHostUserId)
      .single();

    if (newHost) {
      await this.updateParticipantRole(tastingId, (newHost as any).id, 'host', currentHostUserId);
    }
  }

  /**
   * Subscribe to real-time role and participant updates for a tasting session
   */
  subscribeToRoleUpdates(
    tastingId: string,
    callbacks: {
      onRoleUpdate?: (update: { participant_id: string; role: ParticipantRole; can_moderate: boolean; can_add_items: boolean }) => void;
      onParticipantJoined?: (participantId: string) => void;
      onParticipantLeft?: (participantId: string) => void;
    }
  ): () => void {
    return studyModeRealtime.subscribeToTasting(tastingId, {
      onRoleUpdate: callbacks.onRoleUpdate,
      onParticipantJoined: callbacks.onParticipantJoined,
    });
  }

  /**
   * Broadcast a role change event
   */
  broadcastRoleChange(tastingId: string, participantId: string, newRole: ParticipantRole): void {
    studyModeRealtime.broadcastEvent(tastingId, 'role_change', {
      participant_id: participantId,
      role: newRole,
    });
  }
}

export const roleService = new RoleService();
