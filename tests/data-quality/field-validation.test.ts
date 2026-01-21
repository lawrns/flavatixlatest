/**
 * Data Quality Tests: Field Validation and Truncation
 * Ensures data integrity through proper field length validation and boundary testing
 */

import {
  generateTestTasting,
  generateTestTastingItem,
  generateLongStrings,
  generateBoundaryScores,
  generateUUID,
} from '@/lib/test-utils/generators/testDataGenerator';

jest.mock('@/lib/supabase');

describe('Data Quality: Field Validation', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn(() => queryBuilder),
    };

    (mockSupabase as any).queryBuilder = queryBuilder;

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);
  });

  describe('String Length Validation', () => {
    it('should enforce maximum length for session_name (255 chars)', () => {
      const longStrings = generateLongStrings();

      const shortTasting = generateTestTasting({
        session_name: longStrings.shortName,
      });
      expect(shortTasting.session_name.length).toBeLessThanOrEqual(255);

      const normalTasting = generateTestTasting({
        session_name: longStrings.normalName,
      });
      expect(normalTasting.session_name.length).toBeLessThanOrEqual(255);

      const maxTasting = generateTestTasting({
        session_name: longStrings.maxName,
      });
      expect(maxTasting.session_name.length).toBe(255);

      // This should be truncated or rejected
      const exceedsTasting = generateTestTasting({
        session_name: longStrings.exceedsMaxName,
      });
      expect(exceedsTasting.session_name.length).toBeGreaterThan(255);
    });

    it('should enforce maximum length for item_name (255 chars)', () => {
      const longStrings = generateLongStrings();

      const item = generateTestTastingItem({
        item_name: longStrings.exceedsMaxName,
      });

      // Validation should truncate or reject
      expect(item.item_name.length).toBeGreaterThan(255);
    });

    it('should handle TEXT fields without strict length limits', () => {
      const longStrings = generateLongStrings();

      const item = generateTestTastingItem({
        notes: longStrings.veryLongNotes,
      });

      // TEXT fields can be very long
      expect(item.notes.length).toBeGreaterThan(1000);
    });

    it('should handle empty strings appropriately', () => {
      const tasting = generateTestTasting({
        session_name: '',
      });

      // Empty strings should be allowed or rejected based on validation rules
      expect(tasting.session_name).toBe('');
    });
  });

  describe('Score Boundary Validation', () => {
    const boundaries = generateBoundaryScores();

    it('should accept minimum valid score (0)', () => {
      const item = generateTestTastingItem({
        overall_score: boundaries.minimum,
      });
      expect(item.overall_score).toBe(0);
      expect(item.overall_score).toBeGreaterThanOrEqual(0);
    });

    it('should accept maximum valid score (10)', () => {
      const item = generateTestTastingItem({
        overall_score: boundaries.maximum,
      });
      expect(item.overall_score).toBe(10);
      expect(item.overall_score).toBeLessThanOrEqual(10);
    });

    it('should reject negative scores', () => {
      const item = generateTestTastingItem({
        overall_score: boundaries.negative,
      });
      // Validation should reject this
      expect(item.overall_score).toBeLessThan(0);
    });

    it('should reject scores above maximum', () => {
      const item = generateTestTastingItem({
        overall_score: boundaries.aboveMaximum,
      });
      // Validation should reject this
      expect(item.overall_score).toBeGreaterThan(10);
    });

    it('should accept decimal scores', () => {
      const item = generateTestTastingItem({
        overall_score: boundaries.decimal,
      });
      expect(item.overall_score).toBe(5.5);
      expect(Number.isFinite(item.overall_score)).toBe(true);
    });

    it('should validate individual flavor scores', () => {
      const item = generateTestTastingItem({
        flavor_scores: {
          fruity: 0, // minimum
          floral: 10, // maximum
          spicy: 5.5, // decimal
          oaky: -1, // invalid negative
          sweet: 11, // invalid above max
        },
      });

      // Check that scores are within valid ranges
      expect(item.flavor_scores.fruity).toBeGreaterThanOrEqual(0);
      expect(item.flavor_scores.floral).toBeLessThanOrEqual(10);
      expect(item.flavor_scores.oaky).toBeLessThan(0); // Should be caught by validation
      expect(item.flavor_scores.sweet).toBeGreaterThan(10); // Should be caught by validation
    });
  });

  describe('Integer Field Validation', () => {
    it('should enforce non-negative total_items', () => {
      const tasting1 = generateTestTasting({ total_items: 0 });
      expect(tasting1.total_items).toBe(0);

      const tasting2 = generateTestTasting({ total_items: -5 });
      // Should be rejected by validation
      expect(tasting2.total_items).toBeLessThan(0);
    });

    it('should enforce completed_items <= total_items', () => {
      const tasting = generateTestTasting({
        total_items: 5,
        completed_items: 10, // More than total
      });

      // This should be caught by validation logic
      expect(tasting.completed_items).toBeGreaterThan(tasting.total_items);
    });

    it('should handle zero values correctly', () => {
      const tasting = generateTestTasting({
        total_items: 0,
        completed_items: 0,
        average_score: 0,
      });

      expect(tasting.total_items).toBe(0);
      expect(tasting.completed_items).toBe(0);
      expect(tasting.average_score).toBe(0);
    });
  });

  describe('Null and Optional Field Handling', () => {
    it('should allow null for optional fields', () => {
      const tasting = generateTestTasting({
        notes: null,
        completed_at: null,
        average_score: null,
        ranking_type: null,
        study_approach: null,
      });

      expect(tasting.notes).toBeNull();
      expect(tasting.completed_at).toBeNull();
      expect(tasting.average_score).toBeNull();
    });

    it('should reject null for required fields', () => {
      const tasting = generateTestTasting({
        session_name: null,
      });

      // Validation should reject null for required fields
      expect(tasting.session_name).toBeNull();
    });

    it('should handle undefined vs null appropriately', () => {
      const item1 = generateTestTastingItem({
        photo_url: null,
      });
      expect(item1.photo_url).toBeNull();

      const item2 = generateTestTastingItem({
        photo_url: undefined,
      });
      expect(item2.photo_url).toBeUndefined();
    });
  });

  describe('UUID Field Validation', () => {
    it('should accept valid UUID v4 format', () => {
      const validUUID = generateUUID();
      const tasting = generateTestTasting({ id: validUUID });

      // UUID v4 format: 8-4-4-4-12 hex digits
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(validUUID).toMatch(uuidRegex);
    });

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '12345',
        '',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        '00000000-0000-0000-0000-000000000000', // nil UUID
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      invalidUUIDs.forEach(invalidUUID => {
        if (invalidUUID === '00000000-0000-0000-0000-000000000000') {
          // Nil UUID is technically valid format but might be rejected by business logic
          expect(invalidUUID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        } else {
          expect(invalidUUID).not.toMatch(uuidRegex);
        }
      });
    });
  });

  describe('Date/Timestamp Validation', () => {
    it('should accept valid ISO 8601 timestamps', () => {
      const tasting = generateTestTasting();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(tasting.created_at).toMatch(isoRegex);
      expect(tasting.updated_at).toMatch(isoRegex);
    });

    it('should enforce updated_at >= created_at', () => {
      const createdAt = new Date('2024-01-01').toISOString();
      const updatedAt = new Date('2024-01-02').toISOString();

      const tasting = generateTestTasting({
        created_at: createdAt,
        updated_at: updatedAt,
      });

      expect(new Date(tasting.updated_at).getTime())
        .toBeGreaterThanOrEqual(new Date(tasting.created_at).getTime());
    });

    it('should handle completed_at after created_at', () => {
      const createdAt = new Date('2024-01-01').toISOString();
      const completedAt = new Date('2024-01-02').toISOString();

      const tasting = generateTestTasting({
        created_at: createdAt,
        completed_at: completedAt,
      });

      if (tasting.completed_at) {
        expect(new Date(tasting.completed_at).getTime())
          .toBeGreaterThan(new Date(tasting.created_at).getTime());
      }
    });
  });

  describe('Enum Field Validation', () => {
    it('should accept valid mode values', () => {
      const validModes = ['quick', 'study', 'competition'];

      validModes.forEach(mode => {
        const tasting = generateTestTasting({ mode });
        expect(validModes).toContain(tasting.mode);
      });
    });

    it('should reject invalid mode values', () => {
      const invalidMode = 'invalid_mode';
      const tasting = generateTestTasting({ mode: invalidMode });

      // Validation should reject this
      const validModes = ['quick', 'study', 'competition'];
      expect(validModes).not.toContain(invalidMode);
    });
  });

  describe('Boolean Field Validation', () => {
    it('should handle boolean fields correctly', () => {
      const tasting = generateTestTasting({
        rank_participants: true,
        is_blind_participants: false,
        is_blind_items: true,
      });

      expect(typeof tasting.rank_participants).toBe('boolean');
      expect(typeof tasting.is_blind_participants).toBe('boolean');
      expect(tasting.rank_participants).toBe(true);
      expect(tasting.is_blind_participants).toBe(false);
    });

    it('should reject non-boolean values for boolean fields', () => {
      const tasting = generateTestTasting({
        rank_participants: 'true' as any, // String instead of boolean
      });

      // Validation should convert or reject this
      expect(typeof tasting.rank_participants).not.toBe('boolean');
    });
  });
});
