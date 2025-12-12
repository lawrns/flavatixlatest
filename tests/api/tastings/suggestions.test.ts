/**
 * API Route Tests: /api/tastings/[id]/suggestions
 * Tests for submitting and retrieving tasting suggestions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import suggestionsHandler from '@/pages/api/tastings/[id]/suggestions';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/studyModeService');

describe('API: /api/tastings/[id]/suggestions', () => {
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

    mockStudyModeService.getSuggestions = jest.fn().mockResolvedValue([
      {
        id: 'suggestion-1',
        tasting_id: 'tasting-123',
        participant_id: 'participant-1',
        item_name: 'Cabernet Sauvignon',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 'suggestion-2',
        tasting_id: 'tasting-123',
        participant_id: 'participant-2',
        item_name: 'Merlot',
        status: 'approved',
        created_at: new Date().toISOString(),
      },
    ]);

    mockStudyModeService.submitSuggestion = jest.fn().mockResolvedValue({
      id: 'suggestion-new',
      tasting_id: 'tasting-123',
      participant_id: 'participant-1',
      item_name: 'Pinot Noir',
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    res = createMockResponse();
  });

  describe('GET /api/tastings/[id]/suggestions', () => {
    describe('Validation', () => {
      it('should return 400 when tasting ID is invalid', async () => {
        req = createMockRequest({
          method: 'GET',
          query: { id: '' },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });
    });

    describe('Successful Retrieval', () => {
      it('should retrieve all suggestions without authentication', async () => {
        req = createMockRequest({
          method: 'GET',
          query: { id: 'tasting-123' },
          headers: {},
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.getSuggestions).toHaveBeenCalledWith(
          'tasting-123',
          undefined,
          undefined
        );

        expectSuccess(res as NextApiResponse, expect.any(Array));
      });

      it('should retrieve suggestions with authentication', async () => {
        req = createMockRequest({
          method: 'GET',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.getSuggestions).toHaveBeenCalledWith(
          'tasting-123',
          testUser.id,
          undefined
        );
      });

      it('should filter suggestions by status', async () => {
        req = createMockRequest({
          method: 'GET',
          query: { id: 'tasting-123', status: 'pending' },
          headers: createMockAuthHeaders(),
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.getSuggestions).toHaveBeenCalledWith(
          'tasting-123',
          testUser.id,
          'pending'
        );
      });

      it('should filter suggestions by approved status', async () => {
        req = createMockRequest({
          method: 'GET',
          query: { id: 'tasting-123', status: 'approved' },
          headers: createMockAuthHeaders(),
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.getSuggestions).toHaveBeenCalledWith(
          'tasting-123',
          testUser.id,
          'approved'
        );
      });
    });

    describe('Error Handling', () => {
      it('should return 500 when service fails', async () => {
        mockStudyModeService.getSuggestions.mockRejectedValue(
          new Error('Database error')
        );

        req = createMockRequest({
          method: 'GET',
          query: { id: 'tasting-123' },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 500);
      });
    });
  });

  describe('POST /api/tastings/[id]/suggestions', () => {
    beforeEach(() => {
      // Mock participant verification
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'participant-1',
          user_id: testUser.id,
          tasting_id: 'tasting-123',
        },
        error: null,
      });
    });

    describe('Authentication', () => {
      it('should return 401 when no Bearer token is provided', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: {},
          body: {
            participant_id: 'participant-1',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 401);
      });

      it('should return 401 when invalid Bearer token is provided', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: new Error('Invalid token'),
        });

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders('invalid-user'),
          body: {
            participant_id: 'participant-1',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 401);
      });
    });

    describe('Validation', () => {
      it('should return 400 when tasting ID is invalid', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: '' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'participant-1',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });

      it('should return 400 when participant_id is missing', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });

      it('should return 400 when participant_id is not a valid UUID', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'invalid-uuid',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });

      it('should return 400 when item_name is missing', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });

      it('should return 400 when item_name is empty', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: '',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });

      it('should return 400 when item_name exceeds 100 characters', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'a'.repeat(101),
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 400);
      });
    });

    describe('Authorization', () => {
      it('should return 404 when participant not found', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        });

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 404);
      });

      it('should return 403 when participant belongs to different user', async () => {
        mockSupabase.single.mockResolvedValue({
          data: {
            id: 'participant-1',
            user_id: testUser2.id,
            tasting_id: 'tasting-123',
          },
          error: null,
        });

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 403);
      });
    });

    describe('Successful Submission', () => {
      it('should submit suggestion successfully', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.submitSuggestion).toHaveBeenCalledWith(
          'tasting-123',
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          'Cabernet Sauvignon'
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expectSuccess(res as NextApiResponse, {
          suggestion: expect.objectContaining({
            item_name: 'Pinot Noir',
            status: 'pending',
          }),
        });
      });

      it('should trim item_name before submitting', async () => {
        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: '  Cabernet Sauvignon  ',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expect(mockStudyModeService.submitSuggestion).toHaveBeenCalledWith(
          'tasting-123',
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          'Cabernet Sauvignon'
        );
      });
    });

    describe('Business Logic Errors', () => {
      it('should return 404 when suggestions not allowed for tasting', async () => {
        mockStudyModeService.submitSuggestion.mockRejectedValue(
          new Error('Suggestions only allowed for blind tastings')
        );

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 404);
      });

      it('should return 403 when user does not have permission', async () => {
        mockStudyModeService.submitSuggestion.mockRejectedValue(
          new Error('User does not have permission to submit suggestions')
        );

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 403);
      });

      it('should return 500 for unexpected errors', async () => {
        mockStudyModeService.submitSuggestion.mockRejectedValue(
          new Error('Unexpected database error')
        );

        req = createMockRequest({
          method: 'POST',
          query: { id: 'tasting-123' },
          headers: createMockAuthHeaders(),
          body: {
            participant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            item_name: 'Cabernet Sauvignon',
          },
        });

        await suggestionsHandler(req as NextApiRequest, res as NextApiResponse);

        expectError(res as NextApiResponse, 500);
      });
    });
  });
});
