/**
 * Tasting Repository
 *
 * Handles all database operations for quick tastings and tasting items.
 * Encapsulates Supabase interactions and provides clean API.
 *
 * @module lib/repository/TastingRepository
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository';
import { DatabaseError } from '../errors';
import { logger } from '../logger';

/**
 * Strongly typed interfaces (no 'any')
 */
export interface QuickTastingRow {
  id: string;
  user_id: string;
  category: string;
  custom_category_name?: string | null;
  session_name?: string | null;
  notes?: string | null;
  total_items: number;
  completed_items: number;
  average_score?: number | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

export interface TastingItemRow {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string | null;
  aroma?: string | null;
  flavor?: string | null;
  flavor_scores?: Record<string, number> | null;
  overall_score?: number | null;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
  correct_answers?: Record<string, unknown> | null;
  include_in_ranking?: boolean;
  study_category_data?: Record<string, unknown> | null;
}

export type QuickTastingInsert = Omit<
  QuickTastingRow,
  'id' | 'created_at' | 'updated_at' | 'total_items' | 'completed_items'
>;

export type QuickTastingUpdate = Partial<Omit<QuickTastingRow, 'id' | 'created_at' | 'user_id'>>;

export type TastingItemInsert = Omit<TastingItemRow, 'id' | 'created_at' | 'updated_at'>;

export type TastingItemUpdate = Partial<Omit<TastingItemRow, 'id' | 'created_at' | 'tasting_id'>>;

/**
 * Repository for quick_tastings table
 */
export class QuickTastingRepository extends BaseRepository<
  QuickTastingRow,
  QuickTastingInsert,
  QuickTastingUpdate
> {
  constructor(client: SupabaseClient) {
    super('quick_tastings', client);
  }

  /**
   * Find all tastings for a user
   */
  async findByUserId(userId: string): Promise<QuickTastingRow[]> {
    return this.findAll([{ column: 'user_id', operator: 'eq', value: userId }], {
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  /**
   * Find active (incomplete) tastings for a user
   */
  async findActiveTastings(userId: string): Promise<QuickTastingRow[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError('Failed to fetch active tastings', {
          error: error.message,
          userId,
        });
      }

      return (data || []) as QuickTastingRow[];
    } catch (error) {
      logger.error('TastingRepository', 'Error fetching active tastings', error, { userId });
      throw error;
    }
  }

  /**
   * Complete a tasting session
   */
  async complete(id: string, notes?: string): Promise<QuickTastingRow> {
    return this.update(id, {
      completed_at: new Date().toISOString(),
      notes,
    } as QuickTastingUpdate);
  }
}

/**
 * Repository for quick_tasting_items table
 */
export class TastingItemRepository extends BaseRepository<
  TastingItemRow,
  TastingItemInsert,
  TastingItemUpdate
> {
  constructor(client: SupabaseClient) {
    super('quick_tasting_items', client);
  }

  /**
   * Find all items for a tasting
   */
  async findByTastingId(tastingId: string): Promise<TastingItemRow[]> {
    return this.findAll([{ column: 'tasting_id', operator: 'eq', value: tastingId }], {
      orderBy: { column: 'created_at', ascending: true },
    });
  }

  /**
   * Count completed items in a tasting
   */
  async countCompleted(tastingId: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('tasting_id', tastingId)
        .not('overall_score', 'is', null);

      if (error) {
        throw new DatabaseError('Failed to count completed items', {
          error: error.message,
          tastingId,
        });
      }

      return count || 0;
    } catch (error) {
      logger.error('TastingRepository', 'Error counting completed items', error, { tastingId });
      throw error;
    }
  }

  /**
   * Bulk update items
   */
  async bulkUpdate(updates: Array<{ id: string; data: TastingItemUpdate }>): Promise<void> {
    try {
      const promises = updates.map(({ id, data }) => this.update(id, data));
      await Promise.all(promises);
    } catch (error) {
      logger.error('TastingRepository', 'Error bulk updating items', error);
      throw error;
    }
  }
}

/**
 * Factory to create repository instances
 */
export class TastingRepositoryFactory {
  static createQuickTastingRepository(client: SupabaseClient): QuickTastingRepository {
    return new QuickTastingRepository(client);
  }

  static createTastingItemRepository(client: SupabaseClient): TastingItemRepository {
    return new TastingItemRepository(client);
  }
}
