import { getStorageAdmin, getStorageBucketName, initializeFirebaseAdmin } from '../admin';
import { createComponentLogger } from '../../logging';

const logger = createComponentLogger('firebase.storage');

/**
 * Firebase Storage service for handling images
 */
export class FirebaseStorageService {
  private storage: ReturnType<typeof getStorageAdmin>;
  private bucket: any;
  private bucketName: string;
  private isConfigured: boolean;

  constructor() {
    try {
      // Initialize Firebase Admin if not already initialized
      initializeFirebaseAdmin();
      
      this.storage = getStorageAdmin();
      this.bucketName = getStorageBucketName() || '';
      
      if (!this.bucketName) {
        logger.warn('Firebase Storage bucket not configured. Operating in placeholder-only mode.');
        this.isConfigured = false;
        this.storage = ({} as unknown) as ReturnType<typeof getStorageAdmin>;
        this.bucket = null;
        return;
      }

      this.bucket = this.storage.bucket(this.bucketName);
      this.isConfigured = true;
    } catch (error) {
      logger.warn('Firebase Storage initialization failed. Operating in placeholder-only mode.', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.isConfigured = false;
      this.storage = ({} as unknown) as ReturnType<typeof getStorageAdmin>;
      this.bucket = null;
      this.bucketName = '';
    }
  }

  /**
   * Get a signed URL for an image in Firebase Storage
   */
  async getImageUrl(imagePath: string): Promise<string> {
    try {
      if (!this.isConfigured) {
        throw new Error('Firebase Storage not configured');
      }
      // Public read: construct a stable, tokenless URL
      // Using the Firebase v0 endpoint ensures compatibility with Firebase Storage rules
      const encodedPath = encodeURIComponent(imagePath);
      return `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedPath}?alt=media`;
    } catch (error) {
      logger.error(`Error getting signed URL for ${imagePath}`, error instanceof Error ? error : new Error(String(error)));
      throw new Error(`Failed to get image URL for ${imagePath}`);
    }
  }

  /**
   * Get multiple image URLs
   */
  async getImageUrls(imagePaths: string[]): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};
    
    if (!this.isConfigured) {
      // Not configured: return empty map so caller can use placeholders
      return urls;
    }

    await Promise.all(
      imagePaths.map(async (path) => {
        try {
          urls[path] = await this.getImageUrl(path);
        } catch (error) {
          logger.error(`Error getting URL for ${path}`, error instanceof Error ? error : new Error(String(error)));
          urls[path] = ''; // Fallback to empty string
        }
      })
    );

    return urls;
  }

  /**
   * List all images in a directory
   */
  async listImages(directory: string): Promise<string[]> {
    try {
      if (!this.isConfigured || !this.bucket) {
        return [];
      }
      const [files] = await this.bucket.getFiles({
        prefix: directory,
        delimiter: '/',
      });

      return files
        .map((file: any) => file.name)
        .filter((name: string) => name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp'));
    } catch (error) {
      logger.error(`Error listing images in ${directory}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Upload an image to Firebase Storage
   */
  async uploadImage(filePath: string, destination: string): Promise<string> {
    try {
      if (!this.isConfigured || !this.bucket) {
        throw new Error('Firebase Storage not configured');
      }
      await this.bucket.upload(filePath, {
        destination,
        metadata: {
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      return await this.getImageUrl(destination);
    } catch (error) {
      logger.error(`Error uploading image ${filePath}`, error instanceof Error ? error : new Error(String(error)));
      throw new Error(`Failed to upload image ${filePath}`);
    }
  }
}

/**
 * Create a new Firebase Storage service instance
 */
export function createFirebaseStorageService(): FirebaseStorageService {
  return new FirebaseStorageService();
}
