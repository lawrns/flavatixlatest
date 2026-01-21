/**
 * Internationalized formatting utilities using Intl APIs
 * for consistent date, number, and currency formatting across the app.
 */

// Default locale - can be made configurable
const DEFAULT_LOCALE = 'en-US';

/**
 * Format a date using Intl.DateTimeFormat
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a date with time
 * @param date - Date object or ISO string
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format a relative time (e.g., "2 days ago", "yesterday")
 * @param date - Date object or ISO string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second');
  }
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }
  if (diffDays < 7) {
    return rtf.format(-diffDays, 'day');
  }
  if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, 'week');
  }
  if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month');
  }
  return rtf.format(-diffYears, 'year');
}

/**
 * Format a number using Intl.NumberFormat
 * @param num - Number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(num);
}

/**
 * Format a number as a percentage
 * @param num - Number to format (0-100 scale)
 * @returns Formatted percentage string
 */
export function formatPercent(num: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num / 100);
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.5M)
 * @param num - Number to format
 * @returns Compact formatted number string
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format a score with one decimal place (using tabular nums for alignment)
 * @param score - Score value
 * @returns Formatted score string
 */
export function formatScore(score: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}

/**
 * Format a list of items with proper conjunction
 * @param items - Array of strings
 * @param type - Conjunction type
 * @returns Formatted list string
 */
export function formatList(
  items: string[],
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  // Fallback implementation since Intl.ListFormat may not be in TS types
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return type === 'conjunction'
      ? `${items[0]} and ${items[1]}`
      : `${items[0]} or ${items[1]}`;
  }
  const last = items[items.length - 1];
  const rest = items.slice(0, -1).join(', ');
  return type === 'conjunction'
    ? `${rest}, and ${last}`
    : `${rest}, or ${last}`;
}

/**
 * Format a currency value
 * @param value - Numeric value
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(value);
}
