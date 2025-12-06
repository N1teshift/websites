import { createFirebaseStorageService, FirebaseStorageService } from './storageService';
import { handleFirebaseError } from './errorHandler';
import { ApiError } from '@websites/infrastructure/logging';

/**
 * Interface for image metadata
 */
export interface ImageMetadata {
  path: string;
  url: string;
  available: boolean;
  size?: number;
  lastModified?: Date;
}

/**
 * Interface for image collection response
 */
export interface ImageCollectionResponse {
  images: Record<string, string>;
  availableImages: string[];
  requiredImagePaths: string[];
  placeholderCount: number;
  metadata: Record<string, ImageMetadata>;
}

/**
 * Image service for managing Firebase Storage images
 */
export class ImageService {
  private storageService: FirebaseStorageService;

  constructor() {
    this.storageService = createFirebaseStorageService();
  }

  /**
   * Get all available images from a directory (or root if empty string)
   */
  async getAvailableImages(directory: string = ''): Promise<string[]> {
    try {
      return await this.storageService.listImages(directory);
    } catch (error) {
      const apiError = handleFirebaseError(error, 'getAvailableImages');
      console.error('Error getting available images:', apiError);
      return [];
    }
  }

  /**
   * Get image URLs for a list of paths with fallback to placeholders
   */
  async getImageUrlsWithPlaceholders(
    requiredPaths: string[],
    placeholderBaseUrl: string = 'https://via.placeholder.com'
  ): Promise<Record<string, string>> {
    try {
      // Get available images from root (empty string for root directory)
      const availableImages = await this.getAvailableImages('');
      
      // Create placeholder URLs for all required paths
      const placeholderUrls: Record<string, string> = {};
      requiredPaths.forEach((path, index) => {
        const fileName = path.split('/').pop() || `image-${index + 1}`;
        placeholderUrls[path] = `${placeholderBaseUrl}/800x600/f3f4f6/6b7280?text=${encodeURIComponent(fileName)}`;
      });

      // Only try to get Firebase URLs if we have available images
      if (availableImages.length > 0) {
        try {
          const availableImageUrls = await this.storageService.getImageUrls(availableImages);
          // Merge available images with placeholders
          return { ...placeholderUrls, ...availableImageUrls };
        } catch (firebaseError) {
          console.warn('Firebase URLs failed, using placeholders only:', firebaseError);
          // If Firebase URLs fail, just return placeholders
          return placeholderUrls;
        }
      }
      
      // If no available images or Firebase failed, return placeholders
      return placeholderUrls;
    } catch (error) {
      const apiError = handleFirebaseError(error, 'getImageUrlsWithPlaceholders');
      console.error('Error getting image URLs with placeholders:', apiError);
      
      // Return placeholders only if everything fails
      const fallbackUrls: Record<string, string> = {};
      requiredPaths.forEach((path, index) => {
        fallbackUrls[path] = `${placeholderBaseUrl}/800x600/f3f4f6/6b7280?text=${encodeURIComponent(path.split('/').pop() || `image-${index + 1}`)}`;
      });
      return fallbackUrls;
    }
  }

  /**
   * Get comprehensive image collection information
   */
  async getImageCollection(
    requiredPaths: string[],
    placeholderBaseUrl: string = 'https://via.placeholder.com'
  ): Promise<ImageCollectionResponse> {
    try {
      // Get available images from root
      const availableImages = await this.getAvailableImages('');
      const imageUrls = await this.getImageUrlsWithPlaceholders(requiredPaths, placeholderBaseUrl);
      
      // Create metadata for each image
      const metadata: Record<string, ImageMetadata> = {};
      requiredPaths.forEach(path => {
        const isAvailable = availableImages.includes(path);
        metadata[path] = {
          path,
          url: imageUrls[path] || '',
          available: isAvailable,
        };
      });

      return {
        images: imageUrls,
        availableImages,
        requiredImagePaths: requiredPaths,
        placeholderCount: requiredPaths.length - availableImages.length,
        metadata
      };
    } catch (error) {
      const apiError = handleFirebaseError(error, 'getImageCollection');
      console.error('Error getting image collection:', apiError);
      
      // Return fallback response
      const fallbackUrls: Record<string, string> = {};
      const fallbackMetadata: Record<string, ImageMetadata> = {};
      
      requiredPaths.forEach((path, index) => {
        const fileName = path.split('/').pop() || `image-${index + 1}`;
        const fallbackUrl = `${placeholderBaseUrl}/800x600/f3f4f6/6b7280?text=${encodeURIComponent(fileName)}`;
        fallbackUrls[path] = fallbackUrl;
        fallbackMetadata[path] = {
          path,
          url: fallbackUrl,
          available: false,
        };
      });

      return {
        images: fallbackUrls,
        availableImages: [],
        requiredImagePaths: requiredPaths,
        placeholderCount: requiredPaths.length,
        metadata: fallbackMetadata
      };
    }
  }

  /**
   * Check if a specific image exists
   */
  async imageExists(imagePath: string): Promise<boolean> {
    try {
      const availableImages = await this.getAvailableImages('');
      return availableImages.includes(imagePath);
    } catch (error) {
      const apiError = handleFirebaseError(error, 'imageExists');
      console.error('Error checking if image exists:', apiError);
      return false;
    }
  }

  /**
   * Get image metadata for a specific path
   */
  async getImageMetadata(imagePath: string): Promise<ImageMetadata | null> {
    try {
      const exists = await this.imageExists(imagePath);
      if (!exists) {
        return null;
      }

      const url = await this.storageService.getImageUrl(imagePath);
      return {
        path: imagePath,
        url,
        available: true,
      };
    } catch (error) {
      const apiError = handleFirebaseError(error, 'getImageMetadata');
      console.error('Error getting image metadata:', apiError);
      return null;
    }
  }
}

/**
 * Create a new Image service instance
 */
export function createImageService(): ImageService {
  return new ImageService();
}
