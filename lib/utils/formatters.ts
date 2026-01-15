/**
 * Formatting Utilities
 *
 * Common formatting functions used across the application.
 */

// ============================================================================
// DATE & TIME FORMATTERS
// ============================================================================

/**
 * Format a date string to a relative time (e.g., "2h ago", "3d ago")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y`;
}

/**
 * Format a date to a readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date to include time (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Format a number with commas (e.g., 1000 -> "1,000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format a number as a compact string (e.g., 1500 -> "1.5K")
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 1000000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
}

/**
 * Format a score (0-100) with optional decimal places
 */
export function formatScore(score: number | null | undefined, decimals: number = 1): string {
  if (score === null || score === undefined) {
    return '-';
  }
  return score.toFixed(decimals);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// STRING FORMATTERS
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) {
    return '';
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  if (!str) {
    return '';
  }
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  if (!str) {
    return '';
  }
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

/**
 * Get display name for a category
 */
export function getCategoryDisplayName(category: string, customName?: string | null): string {
  if (category === 'other' && customName) {
    return customName;
  }
  return capitalize(category);
}

/**
 * Get color class for a category
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    coffee: 'text-amber-600',
    wine: 'text-red-600',
    whiskey: 'text-orange-600',
    beer: 'text-yellow-600',
    spirits: 'text-purple-600',
    tea: 'text-green-600',
    chocolate: 'text-pink-600',
    cheese: 'text-yellow-500',
    olive_oil: 'text-lime-600',
    honey: 'text-amber-500',
  };
  return colors[category.toLowerCase()] || 'text-primary';
}

/**
 * Get background color class for a category
 */
export function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    coffee: 'bg-amber-100',
    wine: 'bg-red-100',
    whiskey: 'bg-orange-100',
    beer: 'bg-yellow-100',
    spirits: 'bg-purple-100',
    tea: 'bg-green-100',
    chocolate: 'bg-pink-100',
    cheese: 'bg-yellow-50',
    olive_oil: 'bg-lime-100',
    honey: 'bg-amber-50',
  };
  return colors[category.toLowerCase()] || 'bg-primary-100';
}

// ============================================================================
// SCORE HELPERS
// ============================================================================

/**
 * Get color class based on score value
 */
export function getScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'text-gray-400';
  }
  if (score >= 90) {
    return 'text-green-600';
  }
  if (score >= 80) {
    return 'text-lime-600';
  }
  if (score >= 70) {
    return 'text-yellow-600';
  }
  if (score >= 60) {
    return 'text-orange-600';
  }
  return 'text-red-600';
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'Not rated';
  }
  if (score >= 95) {
    return 'Exceptional';
  }
  if (score >= 90) {
    return 'Outstanding';
  }
  if (score >= 85) {
    return 'Excellent';
  }
  if (score >= 80) {
    return 'Very Good';
  }
  if (score >= 75) {
    return 'Good';
  }
  if (score >= 70) {
    return 'Above Average';
  }
  if (score >= 60) {
    return 'Average';
  }
  if (score >= 50) {
    return 'Below Average';
  }
  return 'Poor';
}
