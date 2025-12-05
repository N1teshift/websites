import { NextApiRequest, NextApiResponse } from 'next';
import { generateLoginAuthUrl, OAuthState } from '@websites/infrastructure/auth/oauth';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('UserLogin');

/**
 * API route handler for initiating user authentication with Google
 * 
 * Redirects user to Google OAuth login page
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const returnUrl = (req.query.returnUrl as string) || req.headers.referer || '/';
    
    // Use explicit redirect URI or derive from base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = process.env.GOOGLE_USER_AUTH_REDIRECT_URI || 
      `${baseUrl}/api/auth/user/callback`;
    
    const state: OAuthState = {
      returnUrl,
      purpose: 'user-auth'
    };
    
    const scopes = ['profile', 'email'];
    
    logger.info('Generating OAuth URL', { 
      redirectUri, 
      baseUrl, 
      returnUrl,
      hasExplicitRedirectUri: !!process.env.GOOGLE_USER_AUTH_REDIRECT_URI
    });
    
    const authUrl = generateLoginAuthUrl(redirectUri, scopes, state);
    
    logger.info('Redirecting to Google OAuth', { returnUrl, redirectUri });
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error during login initiation', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ message: "Server error during login." });
  }
}




