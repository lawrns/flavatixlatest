/**
 * API Route Tests: POST /api/tastings/study/[id]/start
 * Tests for starting a study session
 */

import { NextApiRequest, NextApiResponse } from 'next';
import startSessionHandler from '@/pages/api/tastings/study/[id]/start';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('POST /api/tastings/study/[id]/start', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
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

    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: {},
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });

    it('should return 401 when invalid Bearer token is provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: createMockAuthHeaders('invalid-user'),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when session ID is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: '' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('Authorization', () => {
    it('should return 404 when session not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-999' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 404);
    });

    it('should return 404 when user is not the host', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.eq).toHaveBeenCalledWith('host_id', testUser.id);
      expectError(res as NextApiResponse, 404);
    });
  });

  describe('Successful Start', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          host_id: testUser.id,
          status: 'waiting',
        },
        error: null,
      });

      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'session-123', status: 'active' },
          error: null,
        }),
      });
    });

    it('should start session successfully', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
        })
      );

      expectSuccess(res as NextApiResponse, {
        status: 'active',
      });
    });

    it('should verify user is host before starting', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('study_sessions');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'session-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('host_id', testUser.id);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when update fails', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          host_id: testUser.id,
          status: 'waiting',
        },
        error: null,
      });

      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: 'session-123' },
        headers: createMockAuthHeaders(),
      });

      await startSessionHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });
  });
});
