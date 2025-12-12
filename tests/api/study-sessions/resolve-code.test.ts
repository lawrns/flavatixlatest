/**
 * API Route Tests: POST /api/tastings/study/resolve-code
 * Tests for resolving study session codes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import resolveCodeHandler from '@/pages/api/tastings/study/resolve-code';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';

// Mock dependencies
jest.mock('@/lib/logger');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('POST /api/tastings/study/resolve-code', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase service client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue(mockSupabase);

    res = createMockResponse();
  });

  describe('Validation', () => {
    it('should return 400 when code is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        body: {},
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when code is too short', async () => {
      req = createMockRequest({
        method: 'POST',
        body: { code: 'ABC' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when code is too long', async () => {
      req = createMockRequest({
        method: 'POST',
        body: { code: 'ABCDEFGHIJK' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('Successful Resolution', () => {
    it('should resolve valid session code', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Wine Tasting Study',
          status: 'waiting',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'WINE2024' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.eq).toHaveBeenCalledWith('session_code', 'WINE2024');

      expectSuccess(res as NextApiResponse, {
        sessionId: 'session-123',
        sessionName: 'Wine Tasting Study',
        requiresAuth: false,
      });
    });

    it('should convert code to uppercase', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Wine Tasting Study',
          status: 'waiting',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'wine2024' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.eq).toHaveBeenCalledWith('session_code', 'WINE2024');
    });

    it('should work without authentication', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Public Tasting',
          status: 'active',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: { code: 'PUBLIC' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectSuccess(res as NextApiResponse, {
        sessionId: 'session-123',
      });
    });
  });

  describe('Session Not Found', () => {
    it('should return 404 when session code not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'INVALID' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 404);
    });
  });

  describe('Session Status Validation', () => {
    it('should return 400 when session has finished', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Finished Tasting',
          status: 'finished',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'FINISHED' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should allow active sessions', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Active Tasting',
          status: 'active',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'ACTIVE' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should allow waiting sessions', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'session-123',
          name: 'Waiting Tasting',
          status: 'waiting',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        body: { code: 'WAITING' },
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Method Routing', () => {
    it('should return 405 for GET requests', async () => {
      req = createMockRequest({
        method: 'GET',
      });

      await resolveCodeHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });
  });
});
