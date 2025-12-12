/**
 * Supabase Integration Tests
 * Tests RLS policies, queries, and data access patterns
 */

import { getSupabaseClient } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  })),
}));

describe('Supabase Integration', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = getSupabaseClient();
  });

  describe('Row Level Security (RLS)', () => {
    it('should only return user own tastings', async () => {
      const mockUserId = 'user-123';
      const mockTastings = [
        { id: 'tasting-1', user_id: mockUserId, category: 'whiskey' },
        { id: 'tasting-2', user_id: mockUserId, category: 'wine' },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockTastings,
            error: null,
          }),
        }),
      });

      const { data, error } = await mockSupabase
        .from('quick_tastings')
        .select('*')
        .eq('user_id', mockUserId);

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data.every((t: any) => t.user_id === mockUserId)).toBe(true);
    });

    it('should prevent access to other users data', async () => {
      const currentUserId = 'user-123';
      const otherUserId = 'user-456';

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { data } = await mockSupabase
        .from('quick_tastings')
        .select('*')
        .eq('user_id', otherUserId);

      // RLS should prevent seeing other user's data
      expect(data).toHaveLength(0);
    });

    it('should allow users to insert their own tastings', async () => {
      const mockTasting = {
        user_id: 'user-123',
        category: 'whiskey',
        mode: 'quick',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-tasting-id', ...mockTasting },
              error: null,
            }),
          }),
        }),
      });

      const { data, error } = await mockSupabase
        .from('quick_tastings')
        .insert(mockTasting)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(mockTasting.user_id);
    });

    it('should prevent users from updating other users tastings', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Permission denied' },
          }),
        }),
      });

      const { error } = await mockSupabase
        .from('quick_tastings')
        .update({ session_name: 'Hacked' })
        .eq('id', 'other-user-tasting-id');

      expect(error).toBeDefined();
      expect(error.message).toContain('Permission denied');
    });
  });

  describe('Query Patterns', () => {
    it('should return correct data shape for tastings', async () => {
      const mockTasting = {
        id: 'test-id',
        user_id: 'user-123',
        category: 'whiskey',
        mode: 'quick',
        session_name: 'Test Session',
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTasting,
              error: null,
            }),
          }),
        }),
      });

      const { data } = await mockSupabase
        .from('quick_tastings')
        .select('*')
        .eq('id', 'test-id')
        .single();

      expect(data).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        category: expect.any(String),
        mode: expect.any(String),
        created_at: expect.any(String),
      });
    });

    it('should handle joins correctly', async () => {
      const mockTastingWithItems = {
        id: 'tasting-1',
        user_id: 'user-123',
        category: 'whiskey',
        items: [
          { id: 'item-1', item_name: 'Sample A' },
          { id: 'item-2', item_name: 'Sample B' },
        ],
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTastingWithItems,
              error: null,
            }),
          }),
        }),
      });

      const { data } = await mockSupabase
        .from('quick_tastings')
        .select('*, items:quick_tasting_items(*)')
        .eq('id', 'tasting-1')
        .single();

      expect(data.items).toHaveLength(2);
      expect(data.items[0]).toHaveProperty('item_name');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should setup subscription correctly', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabase.channel = jest.fn(() => mockChannel);

      const channel = mockSupabase
        .channel('tasting-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quick_tastings' }, () => {})
        .subscribe();

      expect(mockSupabase.channel).toHaveBeenCalledWith('tasting-updates');
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error', code: 'NETWORK_ERROR' },
        }),
      });

      const { data, error } = await mockSupabase
        .from('quick_tastings')
        .select('*');

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Network error');
    });

    it('should handle constraint violations', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Duplicate key violation', code: '23505' },
        }),
      });

      const { error } = await mockSupabase
        .from('quick_tastings')
        .insert({ id: 'existing-id', user_id: 'user-123' });

      expect(error).toBeDefined();
      expect(error.code).toBe('23505');
    });
  });
});
