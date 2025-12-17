/**
 * Test Social Post Fixtures
 * Sample social post data for testing
 */

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  tasting_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export const testPost: SocialPost = {
  id: 'test-post-id-123',
  user_id: 'test-user-id-123',
  content: 'Just completed an amazing wine tasting session!',
  image_url: undefined,
  tasting_id: 'test-tasting-id-123',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  likes_count: 5,
  comments_count: 2,
};

export const testPosts: SocialPost[] = [
  testPost,
  {
    id: 'test-post-id-456',
    user_id: 'test-user-id-456',
    content: 'Discovered a new favorite whisky today!',
    image_url: 'https://example.com/whisky.jpg',
    tasting_id: undefined,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
    likes_count: 12,
    comments_count: 4,
  },
  {
    id: 'test-post-id-789',
    user_id: 'test-user-id-123',
    content: 'Coffee tasting notes: chocolatey with hints of caramel',
    image_url: undefined,
    tasting_id: 'test-tasting-id-456',
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-03T00:00:00.000Z',
    likes_count: 8,
    comments_count: 1,
  },
];

export const createTestPost = (overrides?: Partial<SocialPost>): SocialPost => ({
  ...testPost,
  ...overrides,
});





