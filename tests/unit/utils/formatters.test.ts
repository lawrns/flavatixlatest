/**
 * Formatters Utility Tests
 */

import {
  formatTimeAgo,
  formatDate,
  formatDateTime,
  formatNumber,
  formatCompactNumber,
  formatScore,
  formatPercentage,
  capitalize,
  toTitleCase,
  truncate,
  snakeToTitle,
  camelToTitle,
  getCategoryDisplayName,
  getCategoryColor,
  getCategoryBgColor,
  getScoreColor,
  getScoreLabel,
} from '@/lib/utils/formatters';

describe('Date & Time Formatters', () => {
  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent times', () => {
      const now = new Date().toISOString();
      expect(formatTimeAgo(now)).toBe('Just now');
    });

    it('should return minutes for times less than an hour ago', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30m');
    });

    it('should return hours for times less than a day ago', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(fiveHoursAgo)).toBe('5h');
    });

    it('should return days for times less than a week ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(threeDaysAgo)).toBe('3d');
    });

    it('should return weeks for times less than a month ago', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(twoWeeksAgo)).toBe('2w');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15T12:00:00Z';
      const result = formatDate(date);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('should include time in the output', () => {
      const date = '2024-01-15T15:30:00Z';
      const result = formatDateTime(date);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });
});

describe('Number Formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('formatCompactNumber', () => {
    it('should return number as-is for values under 1000', () => {
      expect(formatCompactNumber(500)).toBe('500');
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('should format thousands with K', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(10000)).toBe('10K');
    });

    it('should format millions with M', () => {
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(10000000)).toBe('10M');
    });
  });

  describe('formatScore', () => {
    it('should format score with decimals', () => {
      expect(formatScore(85.5)).toBe('85.5');
      expect(formatScore(90, 0)).toBe('90');
      expect(formatScore(85.123, 2)).toBe('85.12');
    });

    it('should return dash for null/undefined', () => {
      expect(formatScore(null)).toBe('-');
      expect(formatScore(undefined)).toBe('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(33.333, 1)).toBe('33.3%');
    });
  });
});

describe('String Formatters', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('snakeToTitle', () => {
    it('should convert snake_case to Title Case', () => {
      expect(snakeToTitle('hello_world')).toBe('Hello World');
      expect(snakeToTitle('user_profile_settings')).toBe('User Profile Settings');
    });
  });

  describe('camelToTitle', () => {
    it('should convert camelCase to Title Case', () => {
      expect(camelToTitle('helloWorld')).toBe('Hello World');
      expect(camelToTitle('userProfileSettings')).toBe('User Profile Settings');
    });
  });
});

describe('Category Helpers', () => {
  describe('getCategoryDisplayName', () => {
    it('should return capitalized category', () => {
      expect(getCategoryDisplayName('coffee')).toBe('Coffee');
      expect(getCategoryDisplayName('wine')).toBe('Wine');
    });

    it('should return custom name for "other" category', () => {
      expect(getCategoryDisplayName('other', 'Custom Category')).toBe('Custom Category');
      expect(getCategoryDisplayName('other', null)).toBe('Other');
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct color classes', () => {
      expect(getCategoryColor('coffee')).toBe('text-amber-600');
      expect(getCategoryColor('wine')).toBe('text-red-600');
      expect(getCategoryColor('unknown')).toBe('text-primary');
    });
  });

  describe('getCategoryBgColor', () => {
    it('should return correct background color classes', () => {
      expect(getCategoryBgColor('coffee')).toBe('bg-amber-100');
      expect(getCategoryBgColor('wine')).toBe('bg-red-100');
      expect(getCategoryBgColor('unknown')).toBe('bg-primary-100');
    });
  });
});

describe('Score Helpers', () => {
  describe('getScoreColor', () => {
    it('should return correct color based on score', () => {
      expect(getScoreColor(95)).toBe('text-green-600');
      expect(getScoreColor(85)).toBe('text-lime-600');
      expect(getScoreColor(75)).toBe('text-yellow-600');
      expect(getScoreColor(65)).toBe('text-orange-600');
      expect(getScoreColor(50)).toBe('text-red-600');
      expect(getScoreColor(null)).toBe('text-gray-400');
    });
  });

  describe('getScoreLabel', () => {
    it('should return correct label based on score', () => {
      expect(getScoreLabel(96)).toBe('Exceptional');
      expect(getScoreLabel(92)).toBe('Outstanding');
      expect(getScoreLabel(87)).toBe('Excellent');
      expect(getScoreLabel(82)).toBe('Very Good');
      expect(getScoreLabel(77)).toBe('Good');
      expect(getScoreLabel(72)).toBe('Above Average');
      expect(getScoreLabel(65)).toBe('Average');
      expect(getScoreLabel(55)).toBe('Below Average');
      expect(getScoreLabel(40)).toBe('Poor');
      expect(getScoreLabel(null)).toBe('Not rated');
    });
  });
});
