import { NextApiRequest, NextApiResponse } from 'next';
import { exchangeLoginCodeForTokens, getUserInfo } from '@websites/infrastructure/auth/oauth';
import { getOrCreateUser } from '@websites/infrastructure/auth/userService';
import { createSession, setSessionCookie } from '@websites/infrastructure/auth/session';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('UserAuthCallback');

/**
 * API route handler for Google OAuth callback
 * 
 * Handles the OAuth callback, creates/updates user, and sets session
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { code, state } = req.query;

  if (!code || typeof code !== 'string') {
    logger.warn('Missing or invalid authorization code');
    return res.status(400).json({ message: "Invalid or missing authorization code." });
  }

  try {
    // Use explicit redirect URI or derive from base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = process.env.GOOGLE_USER_AUTH_REDIRECT_URI || 
      `${baseUrl}/api/auth/user/callback`;
    
    // Exchange code for tokens using login-specific credentials
    const { oauth2Client } = await exchangeLoginCodeForTokens(redirectUri, code);
    
    // Get user info from Google
    const googleUserInfo = await getUserInfo(oauth2Client);
    
    if (!googleUserInfo.googleId) {
      logger.error('Google user ID not found');
      return res.status(400).json({ message: "Failed to get user information from Google." });
    }
    
    // Get or create user in Firestore
    const user = await getOrCreateUser(googleUserInfo.googleId);
    
    // Create session token
    const sessionToken = createSession({
      userId: user.id,
      googleId: user.googleId
    });
    
    // Set session cookie
    setSessionCookie(res, sessionToken);
    
    // Parse return URL from state
    let returnUrl = '/';
    if (state && typeof state === 'string') {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        if (stateData.returnUrl && typeof stateData.returnUrl === 'string') {
          returnUrl = stateData.returnUrl;
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        logger.warn('Failed to parse state', { error: error.message, stack: error.stack });
      }
    }
    
    logger.info('User authenticated successfully', { userId: user.id });
    
    // Redirect to return URL
    res.redirect(returnUrl);
  } catch (error) {
    logger.error('Error during authentication callback', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ message: "Authentication error." });
  }
}




