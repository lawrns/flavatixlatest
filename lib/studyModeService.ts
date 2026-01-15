import { getSupabaseClient } from './supabase';
import { studyModeRealtime } from './studyModeRealtime';
import { Database } from './supabase';

type TastingItemSuggestion = Database['public']['Tables']['tasting_item_suggestions']['Row'];
type TastingItemSuggestionInsert =
  Database['public']['Tables']['tasting_item_suggestions']['Insert'];
type TastingItemSuggestionUpdate =
  Database['public']['Tables']['tasting_item_suggestions']['Update'];
type TastingItemData = Database['public']['Tables']['quick_tasting_items']['Row'];

type TastingParticipant = Database['public']['Tables']['tasting_participants']['Row'];
type QuickTasting = Database['public']['Tables']['quick_tastings']['Row'];

export interface SuggestionUpdate {
  id: string;
  status: string;
  moderated_by?: string;
  moderated_at?: string;
}

export interface SuggestionWithParticipant extends TastingItemSuggestion {
  participant?: {
    profiles?: {
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  };
}

export interface StudyModePermissions {
  canAddItems: boolean;
  canModerate: boolean;
  role: 'host' | 'participant' | 'both';
}

/**
 * Service for managing Study Mode collaborative features
 */
export class StudyModeService {
  private supabase = getSupabaseClient();

  /**
   * Submit a new item suggestion for collaborative tasting
   */
  async submitSuggestion(
    tastingId: string,
    participantId: string,
    itemName: string
  ): Promise<TastingItemSuggestion> {
    // Validate tasting is collaborative study mode
    const tasting = await this.getTastingWithValidation(tastingId);
    if (tasting.mode !== 'study' || tasting.study_approach !== 'collaborative') {
      throw new Error('Suggestions only allowed in collaborative study mode');
    }

    // Validate participant permissions
    const permissions = await this.getParticipantPermissions(participantId, tastingId);
    if (!permissions.canAddItems) {
      throw new Error('Participant does not have permission to add items');
    }

    const suggestion: TastingItemSuggestionInsert = {
      participant_id: participantId,
      suggested_item_name: itemName,
      status: 'pending',
    };

    const { data, error } = await this.supabase
      .from('tasting_item_suggestions')
      .insert(suggestion as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit suggestion: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all suggestions for a tasting session
   */
  async getSuggestions(
    tastingId: string,
    userId?: string,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<SuggestionWithParticipant[]> {
    // Validate user has access to this tasting
    await this.validateTastingAccess(tastingId, userId);

    let query = this.supabase
      .from('tasting_item_suggestions')
      .select(
        `
        *,
        participant:tasting_participants(
          user_id,
          profiles(
            full_name,
            username,
            avatar_url
          )
        )
      `
      )
      .eq('tasting_id', tastingId);

    if (status) {
      query = query.eq('status', status);
    }

    // If user is not a moderator, only show their own suggestions
    if (userId) {
      const permissions = await this.getUserPermissions(userId, tastingId);
      if (!permissions.canModerate) {
        // Find participant's suggestions
        const { data: participant } = await this.supabase
          .from('tasting_participants')
          .select('id')
          .eq('tasting_id', tastingId)
          .eq('user_id', userId)
          .single();

        if (participant) {
          query = query.eq('participant_id', (participant as any).id);
        }
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get suggestions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Moderate a suggestion (approve or reject)
   */
  async moderateSuggestion(
    suggestionId: string,
    moderatorId: string,
    action: 'approve' | 'reject',
    tastingId: string
  ): Promise<TastingItemSuggestion> {
    // Validate moderator permissions
    const permissions = await this.getUserPermissions(moderatorId, tastingId);
    if (!permissions.canModerate) {
      throw new Error('User does not have permission to moderate suggestions');
    }

    // Get the suggestion
    const { data: suggestion, error: fetchError } = await this.supabase
      .from('tasting_item_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      throw new Error('Suggestion not found');
    }

    if ((suggestion as any).status !== 'pending') {
      throw new Error('Suggestion has already been moderated');
    }

    // Update suggestion status
    const updateData: TastingItemSuggestionUpdate = {
      status: action,
      moderated_by: moderatorId,
      moderated_at: new Date().toISOString(),
    };

    const { data: updatedSuggestion, error: updateError } = await this.supabase
      .from('tasting_item_suggestions')
      // @ts-ignore - Supabase type inference issue with complex queries
      .update(updateData as any)
      .eq('id', suggestionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to moderate suggestion: ${updateError.message}`);
    }

    // If approved, create a tasting item
    if (action === 'approve') {
      await this.createTastingItemFromSuggestion(updatedSuggestion, tastingId);
    }

    // Broadcast the suggestion update in real-time
    studyModeRealtime.broadcastEvent(tastingId, 'suggestion_update', {
      id: (updatedSuggestion as any).id,
      status: (updatedSuggestion as any).status,
      moderated_by: (updatedSuggestion as any).moderated_by,
      moderated_at: (updatedSuggestion as any).moderated_at,
    });

    return updatedSuggestion;
  }

  /**
   * Get participant permissions for a tasting
   */
  async getParticipantPermissions(
    participantId: string,
    tastingId: string
  ): Promise<StudyModePermissions> {
    const { data, error } = await this.supabase
      .from('tasting_participants')
      .select('role, can_moderate, can_add_items')
      .eq('id', participantId)
      .eq('tasting_id', tastingId)
      .single();

    if (error || !data) {
      throw new Error('Participant not found in this tasting');
    }

    return {
      role: (data as any).role as 'host' | 'participant' | 'both',
      canModerate: (data as any).can_moderate,
      canAddItems: (data as any).can_add_items,
    };
  }

  /**
   * Get user permissions for a tasting
   */
  async getUserPermissions(userId: string, tastingId: string): Promise<StudyModePermissions> {
    const { data, error } = await this.supabase
      .from('tasting_participants')
      .select('role, can_moderate, can_add_items')
      .eq('user_id', userId)
      .eq('tasting_id', tastingId)
      .single();

    if (error || !data) {
      throw new Error('User is not a participant in this tasting');
    }

    return {
      role: (data as any).role as 'host' | 'participant' | 'both',
      canModerate: (data as any).can_moderate,
      canAddItems: (data as any).can_add_items,
    };
  }

  /**
   * Validate that a tasting exists and is in study mode
   */
  private async getTastingWithValidation(tastingId: string): Promise<QuickTasting> {
    const { data, error } = await this.supabase
      .from('quick_tastings')
      .select('*')
      .eq('id', tastingId)
      .single();

    if (error || !data) {
      throw new Error('Tasting session not found');
    }

    return data;
  }

  /**
   * Validate user has access to tasting
   */
  private async validateTastingAccess(tastingId: string, userId?: string): Promise<void> {
    if (!userId) {
      return;
    } // Allow anonymous access for some operations

    const { data, error } = await this.supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('User does not have access to this tasting session');
    }
  }

  /**
   * Create a tasting item from an approved suggestion
   */
  private async createTastingItemFromSuggestion(
    suggestion: TastingItemSuggestion,
    tastingId: string
  ): Promise<TastingItemData> {
    const { data, error } = await this.supabase
      .from('quick_tasting_items')
      .insert({
        tasting_id: tastingId,
        item_name: suggestion.suggested_item_name,
        include_in_ranking: true, // Approved suggestions are included in ranking
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tasting item: ${error.message}`);
    }

    // Broadcast that a new item was approved and created
    studyModeRealtime.broadcastEvent(tastingId, 'item_approved', {
      item_id: (data as any).id,
      item_name: (data as any).item_name,
      suggestion_id: suggestion.id,
    });

    return data;
  }

  /**
   * Check if a tasting is in collaborative study mode
   */
  async isCollaborativeStudyMode(tastingId: string): Promise<boolean> {
    const tasting = await this.getTastingWithValidation(tastingId);
    return tasting.mode === 'study' && tasting.study_approach === 'collaborative';
  }

  /**
   * Check if a tasting is in pre-defined study mode
   */
  async isPredefinedStudyMode(tastingId: string): Promise<boolean> {
    const tasting = await this.getTastingWithValidation(tastingId);
    return tasting.mode === 'study' && tasting.study_approach === 'predefined';
  }

  /**
   * Subscribe to real-time suggestion updates for a tasting session
   */
  subscribeToSuggestionUpdates(
    tastingId: string,
    callbacks: {
      onSuggestionUpdate?: (update: SuggestionUpdate) => void;
      onItemApproved?: (itemId: string, itemName: string) => void;
    }
  ): () => void {
    return studyModeRealtime.subscribeToTasting(tastingId, {
      onSuggestionUpdate: callbacks.onSuggestionUpdate,
      onItemApproved: callbacks.onItemApproved,
    });
  }
}

export const studyModeService = new StudyModeService();
