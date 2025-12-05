import admin from 'firebase-admin';
import { getFirebaseConfig, validateFirebaseConfig } from './config';

/**
 * Firebase Storage service for handling images
 */
export class FirebaseStorageService {
  private storage: admin.storage.Storage;
  private bucket: any;
  private bucketName: string;
  private isConfigured: boolean;

  constructor() {
    const config = getFirebaseConfig();
    const errors = validateFirebaseConfig(config);

    // Graceful degradation: if config is missing/invalid, do NOT throw.
    // Mark service as not configured so callers can fall back to placeholders.
    if (errors.length > 0) {
      console.warn(
        `Firebase Storage is not configured. Operating in placeholder-only mode. Missing: ${errors.join(', ')}`
      );
      this.isConfigured = false;
      this.storage = ({} as unknown) as admin.storage.Storage;
      this.bucket = null;
      this.bucketName = config.storageBucket || '';
      return;
    }

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(config.serviceAccountKey)),
        storageBucket: config.storageBucket,
      });
    }

    this.storage = admin.storage();
    this.bucket = this.storage.bucket(config.storageBucket!);
    this.bucketName = config.storageBucket!;
    this.isConfigured = true;
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
      console.error(`Error getting signed URL for ${imagePath}:`, error);
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
          console.error(`Error getting URL for ${path}:`, error);
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
      console.error(`Error listing images in ${directory}:`, error);
      return [];
    }
  }

  /**
   * Upload an image to Firebase Storage
   */
  async uploadImage(filePath: string, destination: string): Promise<string> {
    try {
      await this.bucket.upload(filePath, {
        destination,
        metadata: {
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      return await this.getImageUrl(destination);
    } catch (error) {
      console.error(`Error uploading image ${filePath}:`, error);
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
