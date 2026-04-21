/**
 * Test Data Generator
 * Uses deterministic local factories so test data stays reproducible without
 * relying on ESM-only generator libraries in Jest.
 */

import { User } from '@supabase/supabase-js';

const ADJECTIVES = ['Bright', 'Layered', 'Bold', 'Silky', 'Lively', 'Crisp'];
const CATEGORIES = ['Wine', 'Coffee', 'Tea', 'Whisky', 'Beer', 'Chocolate'];
const DESCRIPTORS = [
  'fruity', 'floral', 'spicy', 'oaky', 'nutty', 'earthy',
  'sweet', 'sour', 'bitter', 'umami', 'crisp', 'smooth',
];
const DESCRIPTOR_NAMES = [
  'Apple', 'Banana', 'Cherry', 'Lemon', 'Orange',
  'Rose', 'Lavender', 'Jasmine', 'Vanilla',
  'Cinnamon', 'Pepper', 'Clove', 'Nutmeg',
  'Oak', 'Cedar', 'Pine', 'Tobacco',
];

let sequence = 0;

function nextSequence() {
  sequence += 1;
  return sequence;
}

function pickFrom<T>(values: T[], seed: number) {
  return values[seed % values.length];
}

function pickMany<T>(values: T[], count: number, seed: number) {
  return Array.from({ length: count }, (_, index) => values[(seed + index) % values.length]);
}

function deterministicHex(seed: number, length: number) {
  let value = (seed * 2654435761) >>> 0;
  let hex = '';

  while (hex.length < length) {
    value = (value * 1664525 + 1013904223) >>> 0;
    hex += value.toString(16).padStart(8, '0');
  }

  return hex.slice(0, length);
}

function deterministicTimestamp(seed: number, offsetMinutes = 0) {
  return new Date(Date.UTC(2024, 0, 1 + (seed % 28), 8, offsetMinutes, seed % 60)).toISOString();
}

function deterministicSentence(seed: number, length = 2) {
  return Array.from({ length }, (_, index) => {
    const descriptor = pickFrom(DESCRIPTORS, seed + index);
    const adjective = pickFrom(ADJECTIVES, seed + index);
    return `${adjective} ${descriptor} note`;
  }).join('. ') + '.';
}

function deterministicParagraph(seed: number, sentences = 3) {
  return Array.from({ length: sentences }, (_, index) =>
    deterministicSentence(seed + index, 2)
  ).join(' ');
}

/**
 * Generate a valid UUID v4
 */
export function generateUUID(): string {
  const seed = nextSequence();
  const value = deterministicHex(seed, 32);
  const variant = ['8', '9', 'a', 'b'][seed % 4];

  return [
    value.slice(0, 8),
    value.slice(8, 12),
    `4${value.slice(13, 16)}`,
    `${variant}${value.slice(17, 20)}`,
    value.slice(20, 32),
  ].join('-');
}

/**
 * Generate a test user with valid UUID
 */
export function generateTestUser(overrides?: Partial<User>): Partial<User> {
  const seed = nextSequence();
  const userId = overrides?.id || generateUUID();
  return {
    id: userId,
    email: overrides?.email || `user-${seed}@example.test`,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    updated_at: overrides?.updated_at || deterministicTimestamp(seed, 15),
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: deterministicTimestamp(seed, 5),
    ...overrides,
  };
}

/**
 * Generate a test tasting session
 */
export function generateTestTasting(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const tastingId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();
  const category = overrides?.category || pickFrom(CATEGORIES, seed);

  return {
    id: tastingId,
    user_id: userId,
    category,
    session_name: overrides?.session_name || `${category} Tasting - ${pickFrom(ADJECTIVES, seed)}`,
    notes: overrides?.notes || deterministicSentence(seed, 2),
    total_items: overrides?.total_items ?? ((seed % 8) + 3),
    completed_items: overrides?.completed_items || 0,
    average_score: overrides?.average_score || null,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    updated_at: overrides?.updated_at || deterministicTimestamp(seed, 30),
    completed_at: overrides?.completed_at || null,
    mode: overrides?.mode || pickFrom(['quick', 'study', 'competition'], seed),
    rank_participants: overrides?.rank_participants !== undefined ? overrides.rank_participants : false,
    ranking_type: overrides?.ranking_type || null,
    is_blind_participants: overrides?.is_blind_participants !== undefined ? overrides.is_blind_participants : false,
    is_blind_items: overrides?.is_blind_items !== undefined ? overrides.is_blind_items : false,
    is_blind_attributes: overrides?.is_blind_attributes !== undefined ? overrides.is_blind_attributes : false,
    study_approach: overrides?.study_approach || null,
    ...overrides,
  };
}

/**
 * Generate a test tasting item with valid scores and descriptors
 */
export function generateTestTastingItem(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const itemId = overrides?.id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  const flavorScores: Record<string, number> = {};
  const selectedDescriptors = pickMany(DESCRIPTORS, 4, seed);
  selectedDescriptors.forEach(desc => {
    flavorScores[desc] = (seed + desc.length) % 11;
  });

  return {
    id: itemId,
    tasting_id: tastingId,
    item_name: overrides?.item_name || `Sample ${seed}`,
    notes: overrides?.notes || deterministicSentence(seed),
    aroma: overrides?.aroma || pickMany(DESCRIPTORS, 3, seed).join(', '),
    flavor: overrides?.flavor || pickMany(DESCRIPTORS, 3, seed + 3).join(', '),
    flavor_scores: overrides?.flavor_scores || flavorScores,
    overall_score: overrides?.overall_score !== undefined
      ? overrides.overall_score
      : ((seed * 7) % 101) / 10,
    photo_url: overrides?.photo_url || null,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    updated_at: overrides?.updated_at || deterministicTimestamp(seed, 10),
    include_in_ranking: overrides?.include_in_ranking !== undefined ? overrides.include_in_ranking : true,
    ...overrides,
  };
}

/**
 * Generate a descriptor with category
 */
export function generateTestDescriptor(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const descriptorId = overrides?.id || generateUUID();
  const categoryId = overrides?.category_id || generateUUID();

  return {
    id: descriptorId,
    category_id: categoryId,
    name: overrides?.name || pickFrom(DESCRIPTOR_NAMES, seed),
    description: overrides?.description || deterministicSentence(seed),
    is_active: overrides?.is_active !== undefined ? overrides.is_active : true,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    ...overrides,
  };
}

/**
 * Generate a social comment
 */
export function generateTestComment(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const commentId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  return {
    id: commentId,
    user_id: userId,
    tasting_id: tastingId,
    content: overrides?.content || deterministicParagraph(seed, 2),
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    updated_at: overrides?.updated_at || deterministicTimestamp(seed, 12),
    ...overrides,
  };
}

/**
 * Generate a social like
 */
export function generateTestLike(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const likeId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  return {
    id: likeId,
    user_id: userId,
    tasting_id: tastingId,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    ...overrides,
  };
}

/**
 * Generate a social follow relationship
 */
export function generateTestFollow(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const followId = overrides?.id || generateUUID();
  const followerId = overrides?.follower_id || generateUUID();
  const followingId = overrides?.following_id || generateUUID();

  return {
    id: followId,
    follower_id: followerId,
    following_id: followingId,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    ...overrides,
  };
}

/**
 * Generate a study session
 */
export function generateTestStudySession(overrides?: Record<string, any>) {
  const seed = nextSequence();
  const sessionId = overrides?.id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();
  const hostId = overrides?.host_id || generateUUID();
  const code = overrides?.code || `CODE${(seed % 100).toString().padStart(2, '0')}`;
  const status = overrides?.status || pickFrom(['waiting', 'active', 'finished'], seed);

  return {
    id: sessionId,
    tasting_id: tastingId,
    host_id: hostId,
    code,
    status,
    started_at: status !== 'waiting' ? deterministicTimestamp(seed, 20) : null,
    finished_at: status === 'finished' ? deterministicTimestamp(seed, 40) : null,
    created_at: overrides?.created_at || deterministicTimestamp(seed),
    ...overrides,
  };
}

/**
 * Generate boundary value test cases for scores
 */
export function generateBoundaryScores() {
  return {
    minimum: 0,
    maximum: 10,
    negative: -1,
    aboveMaximum: 11,
    decimal: 5.5,
    zero: 0,
    ten: 10,
  };
}

/**
 * Generate test data with field length at boundaries
 */
export function generateLongStrings() {
  return {
    shortName: 'Short',
    normalName: 'A'.repeat(50),
    maxName: 'B'.repeat(255),
    exceedsMaxName: 'C'.repeat(300),
    shortNotes: deterministicParagraph(10, 2),
    longNotes: deterministicParagraph(20, 10),
    veryLongNotes: deterministicParagraph(30, 50),
  };
}

/**
 * Generate duplicate descriptor test data
 */
export function generateDuplicateDescriptors(count: number = 5) {
  const baseDescriptor = generateTestDescriptor();
  const duplicates = Array.from({ length: count }, () => ({
    ...baseDescriptor,
    id: generateUUID(), // Different ID, same name
  }));
  return { baseDescriptor, duplicates };
}

/**
 * Generate orphaned record test data
 */
export function generateOrphanedRecords() {
  const orphanedItem = generateTestTastingItem({
    tasting_id: generateUUID(), // Non-existent tasting
  });

  const orphanedComment = generateTestComment({
    tasting_id: generateUUID(), // Non-existent tasting
    user_id: generateUUID(), // Non-existent user
  });

  return { orphanedItem, orphanedComment };
}

/**
 * Generate concurrent operation test data
 */
export function generateConcurrentOperationData() {
  const tastingId = generateUUID();
  const userId = generateUUID();

  const simultaneousLikes = Array.from({ length: 5 }, () =>
    generateTestLike({ tasting_id: tastingId, user_id: userId })
  );

  return { tastingId, userId, simultaneousLikes };
}
