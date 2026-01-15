/**
 * Base Repository Pattern for Supabase
 *
 * Provides a clean abstraction over Supabase database operations.
 * Enables:
 * - Dependency injection (testability)
 * - Consistent error handling
 * - Type safety
 * - DRY principles
 *
 * @module lib/repository/BaseRepository
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, NotFoundError } from '../errors';
import { logger } from '../logger';

export interface QueryOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface FilterCondition {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: unknown;
}

/**
 * Base repository providing CRUD operations
 */
export abstract class BaseRepository<TRow, TInsert = Partial<TRow>, TUpdate = Partial<TRow>> {
  protected readonly tableName: string;
  protected readonly client: SupabaseClient;

  constructor(tableName: string, client: SupabaseClient) {
    this.tableName = tableName;
    this.client = client;
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<TRow | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw new DatabaseError(`Failed to find ${this.tableName} by ID`, {
          id,
          error: error.message,
        });
      }

      return data as TRow;
    } catch (error) {
      logger.error('Repository', `Error finding ${this.tableName} by ID`, error, { id });
      throw error;
    }
  }

  /**
   * Find all records with optional filters
   */
  async findAll(filters?: FilterCondition[], options?: QueryOptions): Promise<TRow[]> {
    try {
      let query = this.client.from(this.tableName).select('*');

      // Apply filters
      if (filters) {
        filters.forEach((filter) => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value as number);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value as number);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value as number);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value as number);
              break;
            case 'like':
              query = query.like(filter.column, filter.value as string);
              break;
            case 'ilike':
              query = query.ilike(filter.column, filter.value as string);
              break;
            case 'in':
              query = query.in(filter.column, filter.value as unknown[]);
              break;
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(`Failed to fetch ${this.tableName}`, {
          error: error.message,
          filters,
          options,
        });
      }

      return (data || []) as TRow[];
    } catch (error) {
      logger.error('Repository', `Error fetching ${this.tableName}`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<TRow> {
    try {
      const { data: created, error } = await this.client
        .from(this.tableName)
        .insert(data as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create ${this.tableName}`, {
          error: error.message,
          data,
        });
      }

      logger.debug('Repository', `Created ${this.tableName}`, { id: (created as any).id });
      return created as TRow;
    } catch (error) {
      logger.error('Repository', `Error creating ${this.tableName}`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, updates: TUpdate): Promise<TRow> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError(this.tableName, id);
        }
        throw new DatabaseError(`Failed to update ${this.tableName}`, {
          error: error.message,
          id,
          updates,
        });
      }

      logger.debug('Repository', `Updated ${this.tableName}`, { id });
      return data as TRow;
    } catch (error) {
      logger.error('Repository', `Error updating ${this.tableName}`, error, { id });
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from(this.tableName).delete().eq('id', id);

      if (error) {
        throw new DatabaseError(`Failed to delete ${this.tableName}`, { error: error.message, id });
      }

      logger.debug('Repository', `Deleted ${this.tableName}`, { id });
    } catch (error) {
      logger.error('Repository', `Error deleting ${this.tableName}`, error, { id });
      throw error;
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: FilterCondition[]): Promise<number> {
    try {
      let query = this.client.from(this.tableName).select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        filters.forEach((filter) => {
          query = query.eq(filter.column, filter.value);
        });
      }

      const { count, error } = await query;

      if (error) {
        throw new DatabaseError(`Failed to count ${this.tableName}`, {
          error: error.message,
          filters,
        });
      }

      return count || 0;
    } catch (error) {
      logger.error('Repository', `Error counting ${this.tableName}`, error);
      throw error;
    }
  }
}
