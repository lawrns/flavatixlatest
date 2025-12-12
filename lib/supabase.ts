/**
 * Supabase Client Configuration
 * 
 * This module provides the primary interface for all Supabase interactions in Flavatix.
 * 
 * ## Architecture
 * - Uses singleton pattern for client-side to prevent multiple GoTrue instances
 * - Server-side API routes get fresh clients with auth context from headers/cookies
 * - All database operations respect Row Level Security (RLS) policies
 * 
 * ## Auth Flow
 * - Client-side: Uses persistent session with auto-refresh
 * - Server-side: Extracts JWT from Authorization header or cookies
 * 
 * ## RLS Expectations
 * - All tables have RLS enabled
 * - Users can only access their own data (profiles, tastings, reviews)
 * - Some tables allow public read (e.g., profiles for social features)
 * 
 * ## Usage
 * ```ts
 * // Client-side (components, hooks)
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('profiles').select('*');
 * 
 * // Server-side (API routes)
 * import { getSupabaseClient } from '@/lib/supabase';
 * const supabase = getSupabaseClient(req, res);
 * ```
 * 
 * @module lib/supabase
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Supabase project URL from environment.
 *
 * NOTE: We intentionally do NOT throw at import-time if these are missing, because:
 * - Jest/unit tests often mock Supabase and don't set env vars
 * - Builds (CI) may run without real Supabase credentials
 *
 * In production, you should set real values via environment variables.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';

/**
 * Supabase anonymous key - safe to expose client-side, RLS handles security.
 *
 * IMPORTANT: This is a placeholder fallback (NOT a real JWT) to avoid crashing tests/builds.
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set; using localhost fallback (likely misconfigured production env)');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set; using placeholder key (likely misconfigured production env)');
  }
}

type PublicSchema = 'public';

/**
 * Singleton class for managing the Supabase client instance.
 * Prevents multiple GoTrue (auth) instances which can cause session conflicts.
 */
class SupabaseClientSingleton {
  // NOTE: This project does not use fully generated Supabase types (with Relationships, etc.)
  // Using SupabaseClient<any> avoids "never" inference issues in postgrest-js typings.
  private static instance: SupabaseClient<any> | null = null;

  public static getInstance(): SupabaseClient<any> {
    if (!SupabaseClientSingleton.instance) {
      // Explicitly specify schema to avoid supabase-js generic inference issues
      SupabaseClientSingleton.instance = createClient<Database, PublicSchema>(
        supabaseUrl as string,
        supabaseAnonKey as string,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      ) as unknown as SupabaseClient<any>;
    }
    return SupabaseClientSingleton.instance!;
  }

  // Method to reset the instance (useful for testing or logout)
  public static resetInstance(): void {
    SupabaseClientSingleton.instance = null;
  }
}

/**
 * Default Supabase client instance for client-side usage.
 * Uses singleton pattern - safe to import in multiple components.
 */
export const supabase = SupabaseClientSingleton.getInstance();

/** Export singleton class for testing or advanced use cases */
export { SupabaseClientSingleton };

/**
 * Get a Supabase client with proper auth context for API routes.
 * 
 * @param req - Next.js API request (optional for client-side)
 * @param res - Next.js API response (optional for client-side)
 * @returns Supabase client with auth context from headers/cookies
 * 
 * @example
 * // In an API route
 * export default async function handler(req, res) {
 *   const supabase = getSupabaseClient(req, res);
 *   const { data } = await supabase.from('quick_tastings').select('*');
 * }
 */
export const getSupabaseClient = (req?: NextApiRequest, res?: NextApiResponse): SupabaseClient<any> => {
  if (req && res) {
    // Server-side: Create client with cookies for auth context
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      return createClient<Database, PublicSchema>(supabaseUrl as string, supabaseAnonKey as string, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }) as unknown as SupabaseClient<any>;
    }

    // Try to get token from cookies
    const cookies = req.cookies;
    const accessToken = cookies['sb-access-token'] || cookies['supabase-auth-token'];

    if (accessToken) {
      return createClient<Database, PublicSchema>(supabaseUrl as string, supabaseAnonKey as string, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }) as unknown as SupabaseClient<any>;
    }
  }

  // Client-side or no auth context
  return SupabaseClientSingleton.getInstance();
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          username: string | null;
          bio: string | null;
          posts_count: number;
          followers_count: number;
          following_count: number;
          preferred_category: string | null;
          last_tasted_at: string | null;
          email_confirmed: boolean;
          tastings_count: number;
          reviews_count: number;
          total_tastings: number;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
          posts_count?: number;
          followers_count?: number;
          following_count?: number;
          preferred_category?: string | null;
          last_tasted_at?: string | null;
          email_confirmed?: boolean;
          tastings_count?: number;
          reviews_count?: number;
          total_tastings?: number;
        };
        Update: {
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
          posts_count?: number;
          followers_count?: number;
          following_count?: number;
          preferred_category?: string | null;
          last_tasted_at?: string | null;
          email_confirmed?: boolean;
          tastings_count?: number;
          reviews_count?: number;
          total_tastings?: number;
        };
      };
      quick_tastings: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          session_name?: string | null;
          notes?: string | null;
          total_items?: number;
          completed_items?: number;
          average_score?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          mode?: string;
          rank_participants?: boolean;
          ranking_type?: string | null;
          is_blind_participants?: boolean;
          is_blind_items?: boolean;
          is_blind_attributes?: boolean;
          study_approach?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          session_name?: string | null;
          notes?: string | null;
          total_items?: number;
          completed_items?: number;
          average_score?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          mode?: string;
          rank_participants?: boolean;
          ranking_type?: string | null;
          is_blind_participants?: boolean;
          is_blind_items?: boolean;
          is_blind_attributes?: boolean;
          study_approach?: string | null;
        };
      };
      quick_tasting_items: {
        Row: {
          id: string;
          tasting_id: string;
          item_name: string;
          notes: string | null;
          aroma: string | null;
          flavor: string | null;
          flavor_scores: any | null;
          overall_score: number | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
          correct_answers: any | null;
          include_in_ranking: boolean;
        };
        Insert: {
          id?: string;
          tasting_id: string;
          item_name: string;
          notes?: string | null;
          aroma?: string | null;
          flavor?: string | null;
          flavor_scores?: any | null;
          overall_score?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          correct_answers?: any | null;
          include_in_ranking?: boolean;
        };
        Update: {
          id?: string;
          tasting_id?: string;
          item_name?: string;
          notes?: string | null;
          aroma?: string | null;
          flavor?: string | null;
          flavor_scores?: any | null;
          overall_score?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          correct_answers?: any | null;
          include_in_ranking?: boolean;
        };
      };
      tasting_participants: {
        Row: {
          id: string;
          tasting_id: string;
          user_id: string;
          role: string;
          score: number | null;
          rank: number | null;
          can_moderate: boolean;
          can_add_items: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tasting_id: string;
          user_id: string;
          role?: string;
          score?: number | null;
          rank?: number | null;
          can_moderate?: boolean;
          can_add_items?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tasting_id?: string;
          user_id?: string;
          role?: string;
          score?: number | null;
          rank?: number | null;
          can_moderate?: boolean;
          can_add_items?: boolean;
          created_at?: string;
        };
      };
      tasting_item_suggestions: {
        Row: {
          id: string;
          participant_id: string;
          suggested_item_name: string;
          status: string;
          moderated_by: string | null;
          moderated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          suggested_item_name: string;
          status?: string;
          moderated_by?: string | null;
          moderated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          suggested_item_name?: string;
          status?: string;
          moderated_by?: string | null;
          moderated_at?: string | null;
          created_at?: string;
        };
      };
      flavor_descriptors: {
        Row: {
          id: string;
          user_id: string;
          source_type: string;
          source_id: string;
          descriptor_text: string;
          descriptor_type: string;
          category: string | null;
          subcategory: string | null;
          confidence_score: number | null;
          intensity: number | null;
          item_name: string | null;
          item_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_type: string;
          source_id: string;
          descriptor_text: string;
          descriptor_type: string;
          category?: string | null;
          subcategory?: string | null;
          confidence_score?: number | null;
          intensity?: number | null;
          item_name?: string | null;
          item_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_type?: string;
          source_id?: string;
          descriptor_text?: string;
          descriptor_type?: string;
          category?: string | null;
          subcategory?: string | null;
          confidence_score?: number | null;
          intensity?: number | null;
          item_name?: string | null;
          item_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flavor_wheels: {
        Row: {
          id: string;
          user_id: string | null;
          wheel_type: string;
          scope_type: string;
          scope_filter: any;
          wheel_data: any;
          total_descriptors: number;
          unique_descriptors: number;
          data_sources_count: number;
          generated_at: string;
          expires_at: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          wheel_type: string;
          scope_type: string;
          scope_filter?: any;
          wheel_data: any;
          total_descriptors?: number;
          unique_descriptors?: number;
          data_sources_count?: number;
          generated_at?: string;
          expires_at?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          wheel_type?: string;
          scope_type?: string;
          scope_filter?: any;
          wheel_data?: any;
          total_descriptors?: number;
          unique_descriptors?: number;
          data_sources_count?: number;
          generated_at?: string;
          expires_at?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      aroma_molecules: {
        Row: {
          id: string;
          descriptor: string;
          descriptor_normalized: string;
          molecules: any;
          source: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          descriptor: string;
          descriptor_normalized: string;
          molecules: any;
          source?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          descriptor?: string;
          descriptor_normalized?: string;
          molecules?: any;
          source?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          name: string;
          base_category: string;
          host_id: string;
          status: string;
          session_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          base_category: string;
          host_id: string;
          status?: string;
          session_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          base_category?: string;
          host_id?: string;
          status?: string;
          session_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_categories: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          has_text: boolean;
          has_scale: boolean;
          has_boolean: boolean;
          scale_max: number | null;
          rank_in_summary: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          has_text?: boolean;
          has_scale?: boolean;
          has_boolean?: boolean;
          scale_max?: number | null;
          rank_in_summary?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          has_text?: boolean;
          has_scale?: boolean;
          has_boolean?: boolean;
          scale_max?: number | null;
          rank_in_summary?: boolean;
          sort_order?: number;
        };
      };
      study_items: {
        Row: {
          id: string;
          session_id: string;
          label: string;
          sort_order: number;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          label: string;
          sort_order?: number;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          label?: string;
          sort_order?: number;
          created_by?: string | null;
        };
      };
      study_participants: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          display_name: string | null;
          role: string;
          joined_at: string;
          progress: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          display_name?: string | null;
          role?: string;
          joined_at?: string;
          progress?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          display_name?: string | null;
          role?: string;
          joined_at?: string;
          progress?: number;
        };
      };
      study_responses: {
        Row: {
          id: string;
          session_id: string;
          item_id: string;
          participant_id: string;
          category_id: string;
          text_value: string | null;
          scale_value: number | null;
          bool_value: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          item_id: string;
          participant_id: string;
          category_id: string;
          text_value?: string | null;
          scale_value?: number | null;
          bool_value?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          item_id?: string;
          participant_id?: string;
          category_id?: string;
          text_value?: string | null;
          scale_value?: number | null;
          bool_value?: boolean | null;
          created_at?: string;
        };
      };
      study_ai_cache: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string | null;
          item_id: string | null;
          input_text: string;
          input_hash: string | null;
          extracted_descriptors: any;
          method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id?: string | null;
          item_id?: string | null;
          input_text: string;
          input_hash?: string | null;
          extracted_descriptors: any;
          method?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string | null;
          item_id?: string | null;
          input_text?: string;
          input_hash?: string | null;
          extracted_descriptors?: any;
          method?: string;
          created_at?: string;
        };
      };
      study_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_category: string;
          categories: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          base_category: string;
          categories: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          base_category?: string;
          categories?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    // supabase-js type helpers expect these schema keys to exist
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};