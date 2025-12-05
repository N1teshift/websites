import { NextApiRequest, NextApiResponse } from 'next';
import { createFirebaseStorageService } from '../../../features/api/firebase/storageService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path } = req.query;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Image path is required' });
  }

  try {
    const storageService = createFirebaseStorageService();
    const imageUrl = await storageService.getImageUrl(path);
    
    // Redirect to the signed URL
    res.redirect(imageUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}
