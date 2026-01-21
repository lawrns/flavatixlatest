/**
 * Tastings Repository
 *
 * Encapsulates all database operations related to quick tastings.
 * Components should use these functions instead of calling supabase directly.
 */
import { getSupabaseClient } from '../supabase';
import { databaseLogger } from '../loggers';

// Type alias for supabase client with any to work around type inference issues
type _SupabaseAny = ReturnType<typeof getSupabaseClient> & { from: (table: string) => any };

/**
 * Helper to log database query duration
 */
async function withQueryLogging<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await queryFn();
    const duration = Math.round(performance.now() - startTime);
    databaseLogger.query(operation, table, duration);
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    databaseLogger.query(operation, table, duration);
    throw error;
  }
}

// Types for tastings (matches schema)
export interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  session_name: string | null;
  notes: string | null;
  total_items: number;
  completed_items: number;
  average_score: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  mode: string;
  rank_participants: boolean;
  ranking_type: string | null;
  is_blind_participants: boolean;
  is_blind_items: boolean;
  is_blind_attributes: boolean;
  study_approach: string | null;
}

export type QuickTastingInsert = Partial<QuickTasting> & {
  user_id: string;
  category: string;
};

export type QuickTastingUpdate = Partial<QuickTasting>;

export interface TastingItem {
  id: string;
  tasting_id: string;
  item_name: string;
  notes: string | null;
  aroma: string | null;
  flavor: string | null;
  flavor_scores: Record<string, number> | null;
  overall_score: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  include_in_ranking: boolean;
}

export type TastingItemInsert = Partial<TastingItem> & {
  tasting_id: string;
  item_name: string;
};

export type TastingItemUpdate = Partial<TastingItem>;

export interface TastingWithItems extends QuickTasting {
  items?: TastingItem[];
}

/**
 * Get a single tasting by ID
 */
export async function getTastingById(id: string): Promise<QuickTasting | null> {
  return withQueryLogging('SELECT', 'quick_tastings', async () => {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase
      .from('quick_tastings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      databaseLogger.connectionError(error);
      return null;
    }
    return data;
  });
}

/**
 * Get a tasting with its items
 */
export async function getTastingWithItems(id: string): Promise<TastingWithItems | null> {
  const supabase = getSupabaseClient() as any;

  const [tastingResult, itemsResult] = await Promise.all([
    supabase.from('quick_tastings').select('*').eq('id', id).single(),
    supabase.from('quick_tasting_items').select('*').eq('tasting_id', id).order('created_at', { ascending: true })
  ]);

  if (tastingResult.error) {
    databaseLogger.connectionError(tastingResult.error);
    return null;
  }

  return {
    ...tastingResult.data,
    items: itemsResult.data || []
  };
}

/**
 * Get all tastings for a user
 */
export async function getUserTastings(
  userId: string,
  options?: {
    limit?: number;
    completed?: boolean;
    category?: string;
  }
): Promise<QuickTasting[]> {
  const supabase = getSupabaseClient() as any;
  let query = supabase
    .from('quick_tastings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.completed !== undefined) {
    if (options.completed) {
      query = query.not('completed_at', 'is', null);
    } else {
      query = query.is('completed_at', null);
    }
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { data, error } = await query;

  if (error) {
    databaseLogger.connectionError(error);
    return [];
  }
  return data || [];
}

/**
 * Create a new tasting
 */
export async function createTasting(tasting: QuickTastingInsert): Promise<QuickTasting | null> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('quick_tastings')
    .insert(tasting)
    .select()
    .single();

  const duration = Math.round(performance.now() - startTime);

  if (error) {
    databaseLogger.mutation('create', 'quick_tastings', '', duration);
    throw error;
  }

  databaseLogger.mutation('create', 'quick_tastings', data.id, duration, {
    userId: tasting.user_id,
  });

  return data;
}

/**
 * Update a tasting
 */
export async function updateTasting(
  id: string,
  updates: QuickTastingUpdate
): Promise<QuickTasting | null> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('quick_tastings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  const duration = Math.round(performance.now() - startTime);

  if (error) {
    databaseLogger.mutation('update', 'quick_tastings', id, duration);
    throw error;
  }

  databaseLogger.mutation('update', 'quick_tastings', id, duration);
  return data;
}

/**
 * Complete a tasting session
 */
export async function completeTasting(id: string, notes?: string): Promise<QuickTasting | null> {
  return updateTasting(id, {
    completed_at: new Date().toISOString(),
    notes
  });
}

/**
 * Delete a tasting (and its items via cascade)
 */
export async function deleteTasting(id: string): Promise<boolean> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from('quick_tastings')
    .delete()
    .eq('id', id);

  const duration = Math.round(performance.now() - startTime);
  databaseLogger.mutation('delete', 'quick_tastings', id, duration);

  if (error) {
    databaseLogger.connectionError(error);
    return false;
  }
  return true;
}

// ============================================================================
// Tasting Items
// ============================================================================

/**
 * Get items for a tasting
 */
export async function getTastingItems(tastingId: string): Promise<TastingItem[]> {
  return withQueryLogging('SELECT', 'quick_tasting_items', async () => {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .eq('tasting_id', tastingId)
      .order('created_at', { ascending: true });

    if (error) {
      databaseLogger.connectionError(error);
      return [];
    }
    return data || [];
  });
}

/**
 * Add an item to a tasting
 */
export async function addTastingItem(item: TastingItemInsert): Promise<TastingItem | null> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('quick_tasting_items')
    .insert(item)
    .select()
    .single();

  const duration = Math.round(performance.now() - startTime);

  if (error) {
    databaseLogger.mutation('create', 'quick_tasting_items', '', duration);
    throw error;
  }

  databaseLogger.mutation('create', 'quick_tasting_items', data.id, duration);
  return data;
}

/**
 * Update a tasting item
 */
export async function updateTastingItem(
  id: string,
  updates: TastingItemUpdate
): Promise<TastingItem | null> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('quick_tasting_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  const duration = Math.round(performance.now() - startTime);

  if (error) {
    databaseLogger.mutation('update', 'quick_tasting_items', id, duration);
    throw error;
  }

  databaseLogger.mutation('update', 'quick_tasting_items', id, duration);
  return data;
}

/**
 * Delete a tasting item
 */
export async function deleteTastingItem(id: string): Promise<boolean> {
  const startTime = performance.now();
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from('quick_tasting_items')
    .delete()
    .eq('id', id);

  const duration = Math.round(performance.now() - startTime);
  databaseLogger.mutation('delete', 'quick_tasting_items', id, duration);

  if (error) {
    databaseLogger.connectionError(error);
    return false;
  }
  return true;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get tasting statistics for a user
 */
export async function getUserTastingStats(userId: string) {
  const supabase = getSupabaseClient() as any;

  const { data, error } = await supabase
    .from('quick_tastings')
    .select('id, category, average_score, completed_at, total_items')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  if (error) {
    databaseLogger.connectionError(error);
    return null;
  }

  type StatRow = { id: string; category: string; average_score: number | null; total_items: number };
  const rows: StatRow[] = data || [];

  const stats = {
    totalTastings: rows.length,
    totalItems: rows.reduce((sum: number, t: StatRow) => sum + (t.total_items || 0), 0),
    averageScore: rows.length
      ? rows.reduce((sum: number, t: StatRow) => sum + (t.average_score || 0), 0) / rows.length
      : 0,
    byCategory: {} as Record<string, number>,
  };

  rows.forEach((t: StatRow) => {
    stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
  });

  return stats;
}
