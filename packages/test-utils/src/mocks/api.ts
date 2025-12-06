/**
 * API mocks for testing
 */

import { NextApiRequest, NextApiResponse } from 'next';

export function createMockRequest(
  overrides?: Partial<NextApiRequest>
): NextApiRequest {
  return {
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as NextApiRequest;
}

export function createMockResponse(): NextApiResponse {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
}


