import { supabase } from './supabase';
import type { Database } from './supabase';

// Types for the history service
export type TastingHistory = {
  id: string;
  user_id: string;
  category: string;
  created_at: string;
  notes: string | null;
  session_name: string | null;
  total_items: number;
  completed_items: number;
  average_score: number | null;
  completed_at: string | null;
  mode: string;
  rank_participants: boolean;
  items: TastingHistoryItem[];
};

export type TastingHistoryItem = {
  id: string;
  item_name: string;
  notes: string | null;
  flavor_scores: any | null;
  overall_score: number | null;
  photo_url: string | null;
  created_at: string;
};

export type HistoryFilters = {
  category?: string | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  sortBy?: 'date' | 'rating' | 'category';
  sortOrder?: 'asc' | 'desc';
};

export type TastingStats = {
  totalTastings: number;
  averageRating: number;
  mostTastedCategory: string | null;
  currentStreak: number;
  categoriesCount: Record<string, number>;
};

/**
 * Get all tasting sessions for a user with optional filtering
 */
export async function getUserTastingHistory(
  userId: string,
  filters?: HistoryFilters,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: TastingHistory[] | null; error: any }> {
  try {
    let query = supabase
      .from('quick_tastings')
      .select(`
        *,
        quick_tasting_items (
          id,
          item_name,
          notes,
          flavor_scores,
          overall_score,
          photo_url,
          created_at
        )
      `)
      .eq('user_id', userId);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'desc';
    
    switch (sortBy) {
      case 'date':
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
        break;
      case 'rating':
        query = query.order('average_score', { ascending: sortOrder === 'asc' });
        break;
      case 'category':
        query = query.order('category', { ascending: sortOrder === 'asc' });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasting history:', error);
      return { data: null, error };
    }

    // Transform data to match our TastingHistory type
    const transformedData: TastingHistory[] = (data || []).map((tasting: any) => ({
      id: tasting.id,
      user_id: tasting.user_id,
      category: tasting.category,
      created_at: tasting.created_at,
      notes: tasting.notes,
      session_name: tasting.session_name,
      total_items: tasting.total_items,
      completed_items: tasting.completed_items,
      average_score: tasting.average_score,
      completed_at: tasting.completed_at,
      mode: tasting.mode || 'quick',
      rank_participants: tasting.rank_participants || false,
      items: (tasting.quick_tasting_items || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        notes: item.notes,
        flavor_scores: item.flavor_scores,
        overall_score: item.overall_score,
        photo_url: item.photo_url,
        created_at: item.created_at
      }))
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserTastingHistory:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific tasting session by ID with all its items
 */
export async function getTastingById(
  tastingId: string,
  userId: string
): Promise<{ data: TastingHistory | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select(`
        *,
        quick_tasting_items (
          id,
          item_name,
          notes,
          flavor_scores,
          overall_score,
          photo_url,
          created_at
        )
      `)
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching tasting by ID:', error);
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: { message: 'Tasting not found' } };
    }

    // Transform data to match our TastingHistory type
    const transformedData: TastingHistory = {
      id: (data as any).id,
      user_id: (data as any).user_id,
      category: (data as any).category,
      created_at: (data as any).created_at,
      notes: (data as any).notes,
      session_name: (data as any).session_name,
      total_items: (data as any).total_items,
      completed_items: (data as any).completed_items,
      average_score: (data as any).average_score,
      completed_at: (data as any).completed_at,
      mode: (data as any).mode || 'quick',
      rank_participants: (data as any).rank_participants || false,
      items: ((data as any).quick_tasting_items || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        notes: item.notes,
        flavor_scores: item.flavor_scores,
        overall_score: item.overall_score,
        photo_url: item.photo_url,
        created_at: item.created_at
      }))
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Unexpected error in getTastingById:', error);
    return { data: null, error };
  }
}

/**
 * Calculate user statistics from their tasting history
 */
export async function getUserTastingStats(
  userId: string
): Promise<{ data: TastingStats | null; error: any }> {
  try {
    // Get all tastings for the user
    const { data: tastings, error: tastingsError } = await supabase
      .from('quick_tastings')
      .select('category, average_score, created_at, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (tastingsError) {
      console.error('Error fetching tastings for stats:', tastingsError);
      return { data: null, error: tastingsError };
    }

    if (!tastings || tastings.length === 0) {
      return {
        data: {
          totalTastings: 0,
          averageRating: 0,
          mostTastedCategory: null,
          currentStreak: 0,
          categoriesCount: {}
        },
        error: null
      };
    }

    // Calculate total tastings
    const totalTastings = tastings.length;

    // Calculate average rating
    const validRatings = tastings.filter((t: any) => t.average_score !== null);
    const averageRating = validRatings.length > 0 
      ? validRatings.reduce((sum: number, t: any) => sum + (t.average_score || 0), 0) / validRatings.length
      : 0;

    // Calculate categories count and find most tasted
    const categoriesCount: Record<string, number> = {};
    tastings.forEach((tasting: any) => {
      categoriesCount[tasting.category] = (categoriesCount[tasting.category] || 0) + 1;
    });

    const mostTastedCategory = Object.keys(categoriesCount).length > 0
      ? Object.entries(categoriesCount).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : null;

    // Calculate current streak (consecutive days with tastings)
    const sortedDates = tastings
      .map((t: any) => new Date(t.completed_at!).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (sortedDates.length > 0) {
      // Check if user tasted today or yesterday to start counting streak
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        
        // Count consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i-1]);
          const previousDate = new Date(sortedDates[i]);
          const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
          
          if (dayDifference === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    const stats: TastingStats = {
      totalTastings,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      mostTastedCategory,
      currentStreak,
      categoriesCount
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserTastingStats:', error);
    return { data: null, error };
  }
}

/**
 * Filter tastings by category
 */
export async function filterTastingsByCategory(
  userId: string,
  category: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: TastingHistory[] | null; error: any }> {
  return getUserTastingHistory(userId, { category }, limit, offset);
}

/**
 * Filter tastings by date range
 */
export async function filterTastingsByDateRange(
  userId: string,
  dateFrom: Date,
  dateTo: Date,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: TastingHistory[] | null; error: any }> {
  return getUserTastingHistory(userId, { dateFrom, dateTo }, limit, offset);
}

/**
 * Get available categories for a user
 */
export async function getUserCategories(
  userId: string
): Promise<{ data: string[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user categories:', error);
      return { data: null, error };
    }

    const categories = Array.from(new Set((data || []).map((item: any) => item.category)));
    return { data: categories, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserCategories:', error);
    return { data: null, error };
  }
}

/**
 * Get the most recent tasting session for a user
 */
export async function getRecentTastings(
  userId: string,
  limit: number = 5
): Promise<{ data: TastingHistory[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select(`
        *,
        quick_tasting_items (
          id,
          item_name,
          notes,
          flavor_scores,
          overall_score,
          photo_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent tastings:', error);
      return { data: null, error };
    }

    return { data: data as TastingHistory[], error: null };
  } catch (error) {
    console.error('Unexpected error in getRecentTastings:', error);
    return { data: null, error };
  }
}

export async function getLatestTasting(
  userId: string
): Promise<{ data: TastingHistory | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select(`
        *,
        quick_tasting_items!inner (
          id,
          item_name,
          notes,
          flavor_scores,
          overall_score,
          photo_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return { data: null, error: null };
      }
      console.error('Error fetching latest tasting:', error);
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: null };
    }

    // Transform data to match our TastingHistory type
    const transformedData: TastingHistory = {
      id: (data as any).id,
      user_id: (data as any).user_id,
      category: (data as any).category,
      created_at: (data as any).created_at,
      notes: (data as any).notes,
      session_name: (data as any).session_name,
      total_items: (data as any).total_items,
      completed_items: (data as any).completed_items,
      average_score: (data as any).average_score,
      completed_at: (data as any).completed_at,
      mode: (data as any).mode || 'quick',
      rank_participants: (data as any).rank_participants || false,
      items: ((data as any).quick_tasting_items || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        notes: item.notes,
        flavor_scores: item.flavor_scores,
        overall_score: item.overall_score,
        photo_url: item.photo_url,
        created_at: item.created_at
      }))
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Unexpected error in getLatestTasting:', error);
    return { data: null, error };
  }
}

/**
 * Elimina una cata y todos sus elementos relacionados
 * @param tastingId - ID único de la cata a eliminar
 * @param userId - ID del usuario propietario
 * @returns Promise con resultado de la operación
 */
export async function deleteTasting(
  tastingId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    // Verificar que la cata existe y pertenece al usuario
    const { data: tasting, error: fetchError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching tasting for deletion:', fetchError);
      return { success: false, error: fetchError };
    }

    if (!tasting) {
      return { 
        success: false, 
        error: { message: 'La cata no existe o no tienes permisos para eliminarla' } 
      };
    }

    // Eliminar elementos relacionados primero (quick_tasting_items)
    const { error: itemsError } = await supabase
      .from('quick_tasting_items')
      .delete()
      .eq('tasting_id', tastingId);

    if (itemsError) {
      console.error('Error deleting tasting items:', itemsError);
      return { success: false, error: itemsError };
    }

    // Eliminar la cata principal
    const { error: tastingError } = await supabase
      .from('quick_tastings')
      .delete()
      .eq('id', tastingId)
      .eq('user_id', userId);

    if (tastingError) {
      console.error('Error deleting tasting:', tastingError);
      return { success: false, error: tastingError };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error in deleteTasting:', error);
    return { success: false, error };
  }
}