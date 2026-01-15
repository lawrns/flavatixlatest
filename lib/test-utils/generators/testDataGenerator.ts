/**
 * Test Data Generator
 * Uses faker.js to generate realistic test data with proper validation
 */

import { faker } from '@faker-js/faker';
import { User } from '@supabase/supabase-js';

// Set seed for reproducible tests
faker.seed(123);

/**
 * Generate a valid UUID v4
 */
export function generateUUID(): string {
  return faker.string.uuid();
}

/**
 * Generate a test user with valid UUID
 */
export function generateTestUser(overrides?: Partial<User>): Partial<User> {
  const userId = overrides?.id || generateUUID();
  return {
    id: userId,
    email: overrides?.email || faker.internet.email(),
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    updated_at: overrides?.updated_at || faker.date.recent().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a test tasting session
 */
export function generateTestTasting(overrides?: Record<string, any>) {
  const tastingId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();

  const categories = ['Wine', 'Coffee', 'Tea', 'Whisky', 'Beer', 'Chocolate'];
  const category = overrides?.category || faker.helpers.arrayElement(categories);

  return {
    id: tastingId,
    user_id: userId,
    category,
    session_name: overrides?.session_name || `${category} Tasting - ${faker.word.adjective()}`,
    notes: overrides?.notes || faker.lorem.sentences(2),
    total_items: overrides?.total_items || faker.number.int({ min: 3, max: 10 }),
    completed_items: overrides?.completed_items || 0,
    average_score: overrides?.average_score || null,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    updated_at: overrides?.updated_at || faker.date.recent().toISOString(),
    completed_at: overrides?.completed_at || null,
    mode: overrides?.mode || faker.helpers.arrayElement(['quick', 'study', 'competition']),
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
  const itemId = overrides?.id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  const descriptors = [
    'fruity', 'floral', 'spicy', 'oaky', 'nutty', 'earthy',
    'sweet', 'sour', 'bitter', 'umami', 'crisp', 'smooth'
  ];

  const flavorScores: Record<string, number> = {};
  const selectedDescriptors = faker.helpers.arrayElements(descriptors, { min: 2, max: 5 });
  selectedDescriptors.forEach(desc => {
    flavorScores[desc] = faker.number.int({ min: 0, max: 10 });
  });

  return {
    id: itemId,
    tasting_id: tastingId,
    item_name: overrides?.item_name || `Sample ${faker.number.int({ min: 1, max: 100 })}`,
    notes: overrides?.notes || faker.lorem.sentence(),
    aroma: overrides?.aroma || faker.helpers.arrayElements(descriptors, 3).join(', '),
    flavor: overrides?.flavor || faker.helpers.arrayElements(descriptors, 3).join(', '),
    flavor_scores: overrides?.flavor_scores || flavorScores,
    overall_score: overrides?.overall_score !== undefined
      ? overrides.overall_score
      : faker.number.float({ min: 0, max: 10, multipleOf: 0.1 }),
    photo_url: overrides?.photo_url || null,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    updated_at: overrides?.updated_at || faker.date.recent().toISOString(),
    include_in_ranking: overrides?.include_in_ranking !== undefined ? overrides.include_in_ranking : true,
    ...overrides,
  };
}

/**
 * Generate a descriptor with category
 */
export function generateTestDescriptor(overrides?: Record<string, any>) {
  const descriptorId = overrides?.id || generateUUID();
  const categoryId = overrides?.category_id || generateUUID();

  const descriptors = [
    'Apple', 'Banana', 'Cherry', 'Lemon', 'Orange',
    'Rose', 'Lavender', 'Jasmine', 'Vanilla',
    'Cinnamon', 'Pepper', 'Clove', 'Nutmeg',
    'Oak', 'Cedar', 'Pine', 'Tobacco'
  ];

  return {
    id: descriptorId,
    category_id: categoryId,
    name: overrides?.name || faker.helpers.arrayElement(descriptors),
    description: overrides?.description || faker.lorem.sentence(),
    is_active: overrides?.is_active !== undefined ? overrides.is_active : true,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a social comment
 */
export function generateTestComment(overrides?: Record<string, any>) {
  const commentId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  return {
    id: commentId,
    user_id: userId,
    tasting_id: tastingId,
    content: overrides?.content || faker.lorem.paragraph(),
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    updated_at: overrides?.updated_at || faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a social like
 */
export function generateTestLike(overrides?: Record<string, any>) {
  const likeId = overrides?.id || generateUUID();
  const userId = overrides?.user_id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();

  return {
    id: likeId,
    user_id: userId,
    tasting_id: tastingId,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a social follow relationship
 */
export function generateTestFollow(overrides?: Record<string, any>) {
  const followId = overrides?.id || generateUUID();
  const followerId = overrides?.follower_id || generateUUID();
  const followingId = overrides?.following_id || generateUUID();

  return {
    id: followId,
    follower_id: followerId,
    following_id: followingId,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a study session
 */
export function generateTestStudySession(overrides?: Record<string, any>) {
  const sessionId = overrides?.id || generateUUID();
  const tastingId = overrides?.tasting_id || generateUUID();
  const hostId = overrides?.host_id || generateUUID();

  const code = overrides?.code || faker.string.alphanumeric(6).toUpperCase();
  const status = overrides?.status || faker.helpers.arrayElement(['waiting', 'active', 'finished']);

  return {
    id: sessionId,
    tasting_id: tastingId,
    host_id: hostId,
    code,
    status,
    started_at: status !== 'waiting' ? faker.date.recent().toISOString() : null,
    finished_at: status === 'finished' ? faker.date.recent().toISOString() : null,
    created_at: overrides?.created_at || faker.date.past().toISOString(),
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
    shortName: faker.string.alpha(5),
    normalName: faker.string.alpha(50),
    maxName: faker.string.alpha(255),
    exceedsMaxName: faker.string.alpha(300),
    shortNotes: faker.lorem.words(10),
    longNotes: faker.lorem.paragraphs(10),
    veryLongNotes: faker.lorem.paragraphs(50),
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
