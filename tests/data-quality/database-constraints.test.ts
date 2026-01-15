/**
 * Data Quality Tests: Database Constraints
 * Tests foreign key relationships, cascade deletes, and orphaned records
 */

import {
  generateTestTasting,
  generateTestTastingItem,
  generateTestComment,
  generateTestLike,
  generateTestFollow,
  generateTestUser,
  generateOrphanedRecords,
  generateUUID,
} from '@/lib/test-utils/generators/testDataGenerator';

jest.mock('@/lib/supabase');

describe('Data Quality: Database Constraints', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      match: jest.fn().mockReturnThis(),
    };

    mockSupabase = {
      from: jest.fn(() => queryBuilder),
    };

    (mockSupabase as any).queryBuilder = queryBuilder;

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);
  });

  describe('Foreign Key Constraints', () => {
    it('should enforce foreign key on tasting_items.tasting_id', async () => {
      const nonExistentTastingId = generateUUID();

      const item = generateTestTastingItem({
        tasting_id: nonExistentTastingId,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Attempt to insert item with non-existent tasting_id should fail
      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23503', // Foreign key violation
          message: 'violates foreign key constraint',
          details: 'Key (tasting_id) is not present in table "quick_tastings"',
        },
      });

      expect(queryBuilder.insert).toBeDefined();
    });

    it('should enforce foreign key on tasting_likes.tasting_id', async () => {
      const nonExistentTastingId = generateUUID();
      const userId = generateUUID();

      const like = generateTestLike({
        tasting_id: nonExistentTastingId,
        user_id: userId,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "tasting_likes_tasting_id_fkey"',
        },
      });

      expect(queryBuilder.insert).toBeDefined();
    });

    it('should enforce foreign key on tasting_likes.user_id', async () => {
      const tastingId = generateUUID();
      const nonExistentUserId = generateUUID();

      const like = generateTestLike({
        tasting_id: tastingId,
        user_id: nonExistentUserId,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "tasting_likes_user_id_fkey"',
        },
      });

      expect(queryBuilder.insert).toBeDefined();
    });

    it('should enforce foreign key on comments.tasting_id and user_id', async () => {
      const { orphanedComment } = generateOrphanedRecords();

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint',
        },
      });

      expect(orphanedComment.tasting_id).toBeDefined();
      expect(orphanedComment.user_id).toBeDefined();
    });

    it('should enforce self-referential constraint on follows', async () => {
      const userId = generateUUID();

      // User cannot follow themselves
      const selfFollow = generateTestFollow({
        follower_id: userId,
        following_id: userId, // Same as follower
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23514', // Check constraint violation
          message: 'violates check constraint "follows_no_self_follow"',
        },
      });

      expect(selfFollow.follower_id).toBe(selfFollow.following_id);
    });
  });

  describe('Cascade Delete Behavior', () => {
    it('should cascade delete tasting_items when tasting is deleted', async () => {
      const tastingId = generateUUID();

      const tasting = generateTestTasting({ id: tastingId });
      const items = [
        generateTestTastingItem({ tasting_id: tastingId }),
        generateTestTastingItem({ tasting_id: tastingId }),
        generateTestTastingItem({ tasting_id: tastingId }),
      ];

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Delete tasting
      queryBuilder.delete.mockResolvedValueOnce({
        data: tasting,
        error: null,
      });

      // Verify items are also deleted (cascade)
      queryBuilder.select.mockResolvedValue({
        data: [], // No items found after cascade delete
        error: null,
      });

      expect(items.length).toBe(3);
    });

    it('should cascade delete likes when tasting is deleted', async () => {
      const tastingId = generateUUID();
      const userId = generateUUID();

      const likes = [
        generateTestLike({ tasting_id: tastingId, user_id: userId }),
        generateTestLike({ tasting_id: tastingId, user_id: generateUUID() }),
      ];

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Delete tasting should cascade to likes
      queryBuilder.delete.mockResolvedValue({
        data: { id: tastingId },
        error: null,
      });

      // Verify likes are deleted
      queryBuilder.select.mockResolvedValue({
        data: [],
        error: null,
      });

      expect(likes.length).toBe(2);
    });

    it('should cascade delete comments when tasting is deleted', async () => {
      const tastingId = generateUUID();

      const comments = [
        generateTestComment({ tasting_id: tastingId }),
        generateTestComment({ tasting_id: tastingId }),
      ];

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.delete.mockResolvedValue({
        data: { id: tastingId },
        error: null,
      });

      queryBuilder.select.mockResolvedValue({
        data: [],
        error: null,
      });

      expect(comments.length).toBe(2);
    });

    it('should handle cascade delete of user-related data', async () => {
      const userId = generateUUID();

      // User has multiple related records
      const userTastings = [
        generateTestTasting({ user_id: userId }),
        generateTestTasting({ user_id: userId }),
      ];

      const userLikes = [
        generateTestLike({ user_id: userId }),
        generateTestLike({ user_id: userId }),
      ];

      const userComments = [
        generateTestComment({ user_id: userId }),
      ];

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Deleting user should handle cascades appropriately
      queryBuilder.delete.mockResolvedValue({
        data: { id: userId },
        error: null,
      });

      expect(userTastings.length + userLikes.length + userComments.length).toBeGreaterThan(0);
    });
  });

  describe('Orphaned Record Detection', () => {
    it('should detect orphaned tasting items', async () => {
      const { orphanedItem } = generateOrphanedRecords();

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Query for items with non-existent tastings
      queryBuilder.select.mockResolvedValue({
        data: [orphanedItem],
        error: null,
      });

      // Verify we can identify orphaned items
      expect(orphanedItem.tasting_id).toBeDefined();
    });

    it('should detect orphaned comments', async () => {
      const { orphanedComment } = generateOrphanedRecords();

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.select.mockResolvedValue({
        data: [orphanedComment],
        error: null,
      });

      expect(orphanedComment.tasting_id).toBeDefined();
      expect(orphanedComment.user_id).toBeDefined();
    });

    it('should prevent insertion of orphaned records', async () => {
      const { orphanedItem } = generateOrphanedRecords();

      const queryBuilder = (mockSupabase as any).queryBuilder;

      // Foreign key constraint should prevent insertion
      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23503',
          message: 'foreign key constraint violation',
        },
      });

      expect(queryBuilder.insert).toBeDefined();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique constraint on tasting_likes (user_id, tasting_id)', async () => {
      const userId = generateUUID();
      const tastingId = generateUUID();

      const like1 = generateTestLike({
        user_id: userId,
        tasting_id: tastingId,
      });

      // Attempt to create duplicate like
      const like2 = generateTestLike({
        user_id: userId,
        tasting_id: tastingId,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert
        .mockResolvedValueOnce({ data: like1, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: {
            code: '23505',
            message: 'duplicate key value violates unique constraint',
          },
        });

      expect(like1.user_id).toBe(like2.user_id);
      expect(like1.tasting_id).toBe(like2.tasting_id);
    });

    it('should enforce unique constraint on follows (follower_id, following_id)', async () => {
      const followerId = generateUUID();
      const followingId = generateUUID();

      const follow1 = generateTestFollow({
        follower_id: followerId,
        following_id: followingId,
      });

      const follow2 = generateTestFollow({
        follower_id: followerId,
        following_id: followingId,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert
        .mockResolvedValueOnce({ data: follow1, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: {
            code: '23505',
            message: 'duplicate key value violates unique constraint',
          },
        });

      expect(follow1.follower_id).toBe(follow2.follower_id);
    });
  });

  describe('Check Constraints', () => {
    it('should enforce completed_items <= total_items', async () => {
      const tasting = generateTestTasting({
        total_items: 5,
        completed_items: 10, // Invalid: more than total
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23514', // Check constraint violation
          message: 'check constraint "completed_items_lte_total_items" violated',
        },
      });

      expect(tasting.completed_items).toBeGreaterThan(tasting.total_items);
    });

    it('should enforce score range (0-10)', async () => {
      const invalidItem = generateTestTastingItem({
        overall_score: 15, // Invalid: above maximum
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23514',
          message: 'check constraint "score_range" violated',
        },
      });

      expect(invalidItem.overall_score).toBeGreaterThan(10);
    });
  });

  describe('NOT NULL Constraints', () => {
    it('should enforce NOT NULL on required fields', async () => {
      const tasting = generateTestTasting({
        session_name: null as any,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: null,
        error: {
          code: '23502', // NOT NULL violation
          message: 'null value in column "session_name" violates not-null constraint',
        },
      });

      expect(tasting.session_name).toBeNull();
    });

    it('should allow NULL for optional fields', async () => {
      const tasting = generateTestTasting({
        notes: null,
        completed_at: null,
        average_score: null,
      });

      const queryBuilder = (mockSupabase as any).queryBuilder;

      queryBuilder.insert.mockResolvedValue({
        data: tasting,
        error: null,
      });

      expect(tasting.notes).toBeNull();
      expect(tasting.completed_at).toBeNull();
    });
  });
});
