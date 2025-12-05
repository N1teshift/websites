import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@websites/infrastructure/auth/session';
import { getUserById } from '@websites/infrastructure/auth/userService';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('AuthStatus');

/**
 * API route handler for checking authentication status
 * 
 * Returns current user information if authenticated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = getSession(req);
    
    if (!session) {
      return res.status(200).json({ 
        authenticated: false 
      });
    }
    
    const user = await getUserById(session.userId);
    
    if (!user) {
      logger.warn('Session exists but user not found', { userId: session.userId });
      return res.status(200).json({ 
        authenticated: false 
      });
    }
    
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        googleId: user.googleId,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Error checking auth status', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ message: "Server error." });
  }
}




