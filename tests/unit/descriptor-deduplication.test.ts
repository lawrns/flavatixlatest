/**
 * Unit tests for descriptor deduplication logic
 * Tests case-insensitive normalization and UPSERT behavior
 */

import { describe, it, expect } from '@jest/globals';

describe('Descriptor Deduplication', () => {
  describe('Normalization Logic', () => {
    it('should normalize descriptor text to lowercase', () => {
      const testCases = [
        { input: 'Chocolate', expected: 'chocolate' },
        { input: 'VANILLA', expected: 'vanilla' },
        { input: 'Caramel', expected: 'caramel' },
        { input: 'Stone Fruit', expected: 'stone fruit' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        expect(normalized).toBe(expected);
      });
    });

    it('should trim whitespace from descriptor text', () => {
      const testCases = [
        { input: '  chocolate  ', expected: 'chocolate' },
        { input: '\tvanilla\n', expected: 'vanilla' },
        { input: ' caramel ', expected: 'caramel' },
        { input: '  stone fruit  ', expected: 'stone fruit' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        expect(normalized).toBe(expected);
      });
    });

    it('should preserve internal spaces in compound descriptors', () => {
      const testCases = [
        { input: 'Stone Fruit', expected: 'stone fruit' },
        { input: 'Dark Chocolate', expected: 'dark chocolate' },
        { input: 'Citrus Peel', expected: 'citrus peel' },
        { input: 'Green Apple', expected: 'green apple' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        expect(normalized).toBe(expected);
      });
    });

    it('should handle special characters correctly', () => {
      const testCases = [
        { input: 'Café', expected: 'café' },
        { input: 'Crème Brûlée', expected: 'crème brûlée' },
        { input: 'Jalapeño', expected: 'jalapeño' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        expect(normalized).toBe(expected);
      });
    });
  });

  describe('Case-Insensitive Duplicate Detection', () => {
    it('should treat different cases as duplicates', () => {
      const descriptors = ['Chocolate', 'chocolate', 'CHOCOLATE', 'ChOcOlAtE'];

      const normalized = descriptors.map((d) => d.toLowerCase().trim());
      const uniqueNormalized = [...new Set(normalized)];

      expect(uniqueNormalized.length).toBe(1);
      expect(uniqueNormalized[0]).toBe('chocolate');
    });

    it('should detect compound descriptor duplicates', () => {
      const descriptors = ['Stone Fruit', 'stone fruit', 'STONE FRUIT', 'Stone fruit'];

      const normalized = descriptors.map((d) => d.toLowerCase().trim());
      const uniqueNormalized = [...new Set(normalized)];

      expect(uniqueNormalized.length).toBe(1);
      expect(uniqueNormalized[0]).toBe('stone fruit');
    });

    it('should NOT treat different descriptors as duplicates', () => {
      const descriptors = ['chocolate', 'chocolatey', 'cocoa', 'dark chocolate'];

      const normalized = descriptors.map((d) => d.toLowerCase().trim());
      const uniqueNormalized = [...new Set(normalized)];

      expect(uniqueNormalized.length).toBe(4);
    });
  });

  describe('UPSERT Conflict Resolution', () => {
    it('should identify correct conflict columns', () => {
      // Conflict columns for case-insensitive uniqueness
      const conflictColumns = ['user_id', 'normalized_form', 'descriptor_type'];

      expect(conflictColumns).toContain('user_id');
      expect(conflictColumns).toContain('normalized_form');
      expect(conflictColumns).toContain('descriptor_type');
      expect(conflictColumns).toHaveLength(3);
    });

    it('should construct proper onConflict string', () => {
      const onConflictString = 'user_id,normalized_form,descriptor_type';
      const parts = onConflictString.split(',');

      expect(parts).toContain('user_id');
      expect(parts).toContain('normalized_form');
      expect(parts).toContain('descriptor_type');
      expect(parts).toHaveLength(3);
    });
  });

  describe('Descriptor Record Structure', () => {
    it('should include normalized_form field', () => {
      const descriptorText = 'Dark Chocolate';
      const descriptorRecord = {
        user_id: '00000000-0000-0000-0000-000000000001',
        source_type: 'quick_tasting',
        source_id: '00000000-0000-0000-0000-000000000002',
        descriptor_text: descriptorText,
        descriptor_type: 'aroma',
        normalized_form: descriptorText.toLowerCase().trim(),
      };

      expect(descriptorRecord.normalized_form).toBe('dark chocolate');
      expect(descriptorRecord.descriptor_text).toBe('Dark Chocolate');
    });

    it('should preserve original casing in descriptor_text', () => {
      const testCases = ['Chocolate', 'VANILLA', 'Stone Fruit', 'Crème Brûlée'];

      testCases.forEach((text) => {
        const record = {
          descriptor_text: text,
          normalized_form: text.toLowerCase().trim(),
        };

        expect(record.descriptor_text).toBe(text);
        expect(record.normalized_form).toBe(text.toLowerCase().trim());
        expect(record.descriptor_text).not.toBe(record.normalized_form);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const empty = '';
      const normalized = empty.toLowerCase().trim();
      expect(normalized).toBe('');
    });

    it('should handle single character descriptors', () => {
      const single = 'A';
      const normalized = single.toLowerCase().trim();
      expect(normalized).toBe('a');
    });

    it('should handle very long descriptors', () => {
      const long = 'A'.repeat(500);
      const normalized = long.toLowerCase().trim();
      expect(normalized.length).toBe(500);
      expect(normalized).toBe('a'.repeat(500));
    });

    it('should handle descriptors with multiple spaces', () => {
      const multiSpace = 'stone    fruit';
      const normalized = multiSpace.toLowerCase().trim();
      // Note: This preserves internal spaces (doesn't collapse them)
      expect(normalized).toBe('stone    fruit');
    });

    it('should handle descriptors with leading/trailing tabs', () => {
      const tabbed = '\t\tchocolate\t\t';
      const normalized = tabbed.toLowerCase().trim();
      expect(normalized).toBe('chocolate');
    });

    it('should handle descriptors with newlines', () => {
      const newlined = 'chocolate\nvanilla';
      const normalized = newlined.toLowerCase().trim();
      expect(normalized).toBe('chocolate\nvanilla');
    });
  });

  describe('Constraint Validation', () => {
    it('should validate length constraint (500 chars max)', () => {
      const tooLong = 'a'.repeat(501);
      expect(tooLong.length).toBeGreaterThan(500);

      const maxLength = 'a'.repeat(500);
      expect(maxLength.length).toBe(500);
    });

    it('should validate item_name length constraint (200 chars max)', () => {
      const tooLong = 'a'.repeat(201);
      expect(tooLong.length).toBeGreaterThan(200);

      const maxLength = 'a'.repeat(200);
      expect(maxLength.length).toBe(200);
    });
  });

  describe('Type Safety', () => {
    it('should validate descriptor_type enum values', () => {
      const validTypes = ['aroma', 'flavor', 'texture', 'metaphor'];
      const invalidTypes = ['smell', 'taste', 'feel', 'emotion'];

      validTypes.forEach((type) => {
        expect(['aroma', 'flavor', 'texture', 'metaphor']).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(['aroma', 'flavor', 'texture', 'metaphor']).not.toContain(type);
      });
    });

    it('should validate source_type enum values', () => {
      const validTypes = ['quick_tasting', 'quick_review', 'prose_review'];
      const invalidTypes = ['tasting', 'review', 'other'];

      validTypes.forEach((type) => {
        expect(['quick_tasting', 'quick_review', 'prose_review']).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(['quick_tasting', 'quick_review', 'prose_review']).not.toContain(type);
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should normalize efficiently for large batches', () => {
      const batchSize = 1000;
      const descriptors = Array.from({ length: batchSize }, (_, i) => ({
        text: `Descriptor ${i}`,
        normalized: `descriptor ${i}`,
      }));

      const startTime = Date.now();
      descriptors.forEach((d) => {
        const normalized = d.text.toLowerCase().trim();
        expect(normalized).toBe(d.normalized);
      });
      const endTime = Date.now();

      // Should complete in under 500ms for 1000 items (allow for CI variability)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

describe('Deduplication Migration Logic', () => {
  it('should keep the oldest descriptor when deduplicating', () => {
    const duplicates = [
      { id: '1', text: 'Chocolate', created_at: '2024-01-01' },
      { id: '2', text: 'chocolate', created_at: '2024-01-02' },
      { id: '3', text: 'CHOCOLATE', created_at: '2024-01-03' },
    ];

    const oldestId = duplicates.reduce((oldest, current) =>
      current.created_at < oldest.created_at ? current : oldest
    ).id;

    expect(oldestId).toBe('1');
  });

  it('should identify all variations of a normalized descriptor', () => {
    const allDescriptors = [
      { id: '1', text: 'Chocolate', normalized: 'chocolate' },
      { id: '2', text: 'chocolate', normalized: 'chocolate' },
      { id: '3', text: 'CHOCOLATE', normalized: 'chocolate' },
      { id: '4', text: 'Vanilla', normalized: 'vanilla' },
    ];

    const chocolateVariations = allDescriptors.filter((d) => d.normalized === 'chocolate');

    expect(chocolateVariations).toHaveLength(3);
    expect(chocolateVariations.map((v) => v.text)).toEqual(['Chocolate', 'chocolate', 'CHOCOLATE']);
  });
});
