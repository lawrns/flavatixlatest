/**
 * Test Helper Utilities
 * Common testing utilities and assertion helpers
 */

import { NextApiRequest, NextApiResponse } from 'next';

export const expectStatusCode = (res: NextApiResponse, expectedStatus: number) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
};

export const expectSuccess = (res: NextApiResponse, expectedData?: any) => {
  expect(res.status).toHaveBeenCalledWith(expect.any(Number));
  const statusCall = (res.status as jest.Mock).mock.calls[0][0];
  expect(statusCall).toBeGreaterThanOrEqual(200);
  expect(statusCall).toBeLessThan(300);

  if (expectedData !== undefined) {
    const isPlainObject =
      expectedData !== null &&
      typeof expectedData === 'object' &&
      !Array.isArray(expectedData) &&
      !(expectedData as any).asymmetricMatch; // Jest asymmetric matcher

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: isPlainObject ? expect.objectContaining(expectedData) : expectedData,
      })
    );
  }
};

export const expectError = (res: NextApiResponse, expectedStatus: number, expectedErrorCode?: string) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);

  if (expectedErrorCode) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: expectedErrorCode,
        }),
      })
    );
  }
};

export const createMockRequest = (options: {
  method?: string;
  body?: any;
  query?: any;
  headers?: any;
  url?: string;
}): Partial<NextApiRequest> => {
  // Unique IP per request to avoid rate-limit collisions across tests.
  const randomIp = `127.0.0.${Math.floor(Math.random() * 250) + 1}`;

  return {
    method: options.method || 'GET',
    body: options.body || {},
    query: options.query || {},
    headers: options.headers || {},
    url: options.url || '/api/test',
    // Some middleware (e.g. rate limiting) reads req.socket.remoteAddress
    socket: { remoteAddress: randomIp } as any,
  };
};

export const createMockResponse = (): Partial<NextApiResponse> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const expectToContainObject = (array: any[], object: any) => {
  const found = array.some((item) =>
    Object.keys(object).every((key) => item[key] === object[key])
  );
  expect(found).toBe(true);
};




