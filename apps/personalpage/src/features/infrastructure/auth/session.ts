import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('Session');

export interface SessionPayload {
  userId: string;
  googleId: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Creates a JWT token for the user session
 */
export function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: SESSION_MAX_AGE }
  );
  logger.debug('Session token created', { userId: payload.userId });
  return token;
}

/**
 * Verifies and decodes a JWT token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    logger.debug('Session token verified', { userId: decoded.userId });
    return decoded;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('Session token verification failed', { error: err.message });
    return null;
  }
}

/**
 * Sets the session cookie with the JWT token
 */
export function setSessionCookie(res: NextApiResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure=${isProduction}; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}; Path=/`
  );
  
  logger.debug('Session cookie set');
}

/**
 * Gets the session token from the request cookies
 */
export function getSessionToken(req: NextApiRequest): string | null {
  const cookies = req.cookies;
  const token = cookies[SESSION_COOKIE_NAME] || null;
  
  if (token) {
    logger.debug('Session token found in cookies');
  }
  
  return token;
}

/**
 * Clears the session cookie
 */
export function clearSessionCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
  );
  
  logger.debug('Session cookie cleared');
}

/**
 * Gets the current session from the request
 */
export function getSession(req: NextApiRequest): SessionPayload | null {
  const token = getSessionToken(req);
  if (!token) {
    return null;
  }
  
  return verifySessionToken(token);
}




