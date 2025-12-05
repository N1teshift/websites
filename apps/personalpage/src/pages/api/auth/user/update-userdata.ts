import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@websites/infrastructure/auth/session';
import { updateUserPreferences } from '@websites/infrastructure/auth/userService';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('UpdatePreferences');

/**
 * API route handler for updating user preferences (nickname, language, theme)
 * 
 * Requires authentication
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = getSession(req);
    
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { nickname, language, theme } = req.body;

    const preferences: { nickname?: string; language?: string; theme?: string } = {};

    if (nickname !== undefined) {
      if (typeof nickname !== 'string') {
        return res.status(400).json({ message: 'Nickname must be a string' });
      }
      const trimmedNickname = nickname.trim();
      if (trimmedNickname.length > 50) {
        return res.status(400).json({ message: 'Nickname must be 50 characters or less' });
      }
      preferences.nickname = trimmedNickname;
    }

    if (language !== undefined) {
      if (typeof language !== 'string' || !['lt', 'en', 'ru'].includes(language)) {
        return res.status(400).json({ message: 'Language must be one of: lt, en, ru' });
      }
      preferences.language = language;
    }

    if (theme !== undefined) {
      if (typeof theme !== 'string' || !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: 'Theme must be one of: light, dark' });
      }
      preferences.theme = theme;
    }

    await updateUserPreferences(session.userId, preferences);
    
    logger.info('Preferences updated', { userId: session.userId, preferences });
    
    return res.status(200).json({ 
      success: true,
      preferences
    });
  } catch (error) {
    logger.error('Error updating preferences', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ message: "Server error." });
  }
}







