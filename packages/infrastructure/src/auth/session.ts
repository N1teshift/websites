import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createComponentLogger } from '../logging';

const logger = createComponentLogger('Session');

export interface SessionData {
  userId: string;
  email?: string;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth-token';
const SESSION_MAX_AGE = process.env.SESSION_MAX_AGE 
  ? parseInt(process.env.SESSION_MAX_AGE, 10)
  : 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Creates a JWT token for the user session
 */
export function createSession(data: SessionData, expiresIn: string | number = SESSION_MAX_AGE): string {
  if (!JWT_SECRET || JWT_SECRET === 'change-me-in-production') {
    throw new Error('JWT_SECRET must be configured');
  }

  // Convert number to string format (e.g., 2592000 -> "30d")
  const expiresInValue: string = typeof expiresIn === 'string' 
    ? expiresIn 
    : `${Math.floor(expiresIn / 86400)}d`; // Convert seconds to days
    
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: expiresInValue } as jwt.SignOptions);
  logger.debug('Session token created', { userId: data.userId });
  return token;
}

/**
 * Verifies and decodes a JWT token
 */
export function verifySession(token: string): SessionData | null {
  if (!JWT_SECRET || JWT_SECRET === 'change-me-in-production') {
    throw new Error('JWT_SECRET must be configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    logger.debug('Session token verified', { userId: decoded.userId });
    return decoded;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('Session token verification failed', { error: err.message });
    return null;
  }
}

/**
 * Gets the current session from the request
 */
export function getSession(req: NextApiRequest): SessionData | null {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }
  return verifySession(token);
}

/**
 * Sets the session cookie with the JWT token
 */
export function setSessionCookie(
  res: NextApiResponse,
  token: string,
  maxAge: number = SESSION_MAX_AGE
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure=${isProduction}; SameSite=Lax; Max-Age=${maxAge}; Path=/`
  );
  
  logger.debug('Session cookie set');
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

