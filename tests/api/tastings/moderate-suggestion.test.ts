/**
 * API Route Tests: POST /api/tastings/[id]/suggestions/[suggestionId]/moderate
 * Tests for moderating tasting suggestions (approve/reject)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import moderateHandler from '@/pages/api/tastings/[id]/suggestions/[suggestionId]/moderate';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/studyModeService');

describe('POST /api/tastings/[id]/suggestions/[suggestionId]/moderate', () => {
  let mockSupabase: any;
  let mockStudyModeService: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);

    // Mock study mode service
    const { studyModeService } = require('@/lib/studyModeService');
    mockStudyModeService = studyModeService;

    mockStudyModeService.moderateSuggestion = jest.fn().mockResolvedValue({
      id: 'suggestion-123',
      tasting_id: 'tasting-123',
      participant_id: 'participant-1',
      item_name: 'Cabernet Sauvignon',
      status: 'approved',
      moderated_by: testUser.id,
      moderated_at: new Date().toISOString(),
    });

    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: {},
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });

    it('should return 401 when invalid Bearer token is provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders('invalid-user'),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when tasting ID is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: '', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when suggestion ID is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: '' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when action is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: {},
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when action is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'delete' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when action is not approve or reject', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'pending' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('Successful Moderation', () => {
    it('should approve suggestion successfully', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockStudyModeService.moderateSuggestion).toHaveBeenCalledWith(
        'suggestion-123',
        testUser.id,
        'approve',
        'tasting-123'
      );

      expectSuccess(res as NextApiResponse, {
        suggestion: expect.objectContaining({
          id: 'suggestion-123',
          status: 'approved',
          moderated_by: testUser.id,
        }),
      });
    });

    it('should reject suggestion successfully', async () => {
      mockStudyModeService.moderateSuggestion.mockResolvedValue({
        id: 'suggestion-123',
        status: 'rejected',
        moderated_by: testUser.id,
        moderated_at: new Date().toISOString(),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'reject' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockStudyModeService.moderateSuggestion).toHaveBeenCalledWith(
        'suggestion-123',
        testUser.id,
        'reject',
        'tasting-123'
      );

      expectSuccess(res as NextApiResponse, {
        suggestion: expect.objectContaining({
          status: 'rejected',
        }),
      });
    });
  });

  describe('Authorization Errors', () => {
    it('should return 403 when user does not have permission to moderate', async () => {
      mockStudyModeService.moderateSuggestion.mockRejectedValue(
        new Error('User does not have permission to moderate suggestions')
      );

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 403);
    });

    it('should return 403 when only moderators can moderate', async () => {
      mockStudyModeService.moderateSuggestion.mockRejectedValue(
        new Error('User does not have permission')
      );

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 403);
    });
  });

  describe('Conflict Errors', () => {
    it('should return 409 when suggestion not found', async () => {
      mockStudyModeService.moderateSuggestion.mockRejectedValue(
        new Error('Suggestion not found')
      );

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-999' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 409);
    });

    it('should return 409 when suggestion already moderated', async () => {
      mockStudyModeService.moderateSuggestion.mockRejectedValue(
        new Error('Suggestion has already been moderated')
      );

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 409);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for unexpected errors', async () => {
      mockStudyModeService.moderateSuggestion.mockRejectedValue(
        new Error('Unexpected database error')
      );

      req = createMockRequest({
        method: 'POST',
        query: { id: 'tasting-123', suggestionId: 'suggestion-123' },
        headers: createMockAuthHeaders(),
        body: { action: 'approve' },
      });

      await moderateHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });
  });
});
