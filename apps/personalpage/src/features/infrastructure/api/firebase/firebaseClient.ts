import { apiRequest } from '../apiRequest';
import { getFirebaseConfig, validateFirebaseConfig } from './config';
import { handleFirebaseError } from './errorHandler';

/**
 * Firebase document data interface
 */
export interface FirebaseDocument {
  id: string;
  [key: string]: unknown;
}

/**
 * Firebase query interface
 */
export interface FirebaseQuery {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: unknown;
}

/**
 * Firebase user data interface
 */
export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  [key: string]: unknown;
}

/**
 * Firebase API Client
 * 
 * Provides methods to interact with Firebase services using the centralized apiRequest utility.
 */
export class FirebaseClient {
  private config: ReturnType<typeof getFirebaseConfig>;

  constructor() {
    this.config = getFirebaseConfig();
    const errors = validateFirebaseConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Firebase configuration errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Get a document from Firestore
   */
  async getDocument(collection: string, documentId: string): Promise<FirebaseDocument | null> {
    const endpoint = `/api/firestore/document/${collection}/${documentId}`;
    
    try {
      return await apiRequest<FirebaseDocument | null>(endpoint, 'GET');
    } catch (error) {
      throw handleFirebaseError(error, `getDocument:${collection}/${documentId}`);
    }
  }

  /**
   * Create or update a document in Firestore
   */
  async setDocument(collection: string, documentId: string, data: Record<string, unknown>): Promise<void> {
    const endpoint = `/api/firestore/document/${collection}/${documentId}`;
    
    try {
      await apiRequest<void>(endpoint, 'POST', { data });
    } catch (error) {
      throw handleFirebaseError(error, `setDocument:${collection}/${documentId}`);
    }
  }

  /**
   * Delete a document from Firestore
   */
  async deleteDocument(collection: string, documentId: string): Promise<void> {
    const endpoint = `/api/firestore/document/${collection}/${documentId}`;
    
    try {
      await apiRequest<void>(endpoint, 'DELETE');
    } catch (error) {
      throw handleFirebaseError(error, `deleteDocument:${collection}/${documentId}`);
    }
  }

  /**
   * Query documents from Firestore
   */
  async queryDocuments(collection: string, query: FirebaseQuery[]): Promise<FirebaseDocument[]> {
    const endpoint = `/api/firestore/query/${collection}`;
    
    try {
      return await apiRequest<FirebaseDocument[]>(endpoint, 'POST', { query });
    } catch (error) {
      throw handleFirebaseError(error, `queryDocuments:${collection}`);
    }
  }

  /**
   * Get user authentication data
   */
  async getUser(userId: string): Promise<FirebaseUser | null> {
    const endpoint = `/api/firestore/user/${userId}`;
    
    try {
      return await apiRequest<FirebaseUser | null>(endpoint, 'GET');
    } catch (error) {
      throw handleFirebaseError(error, `getUser:${userId}`);
    }
  }

  /**
   * Update user authentication data
   */
  async updateUser(userId: string, userData: Partial<FirebaseUser>): Promise<void> {
    const endpoint = `/api/firestore/user/${userId}`;
    
    try {
      await apiRequest<void>(endpoint, 'PUT', { userData });
    } catch (error) {
      throw handleFirebaseError(error, `updateUser:${userId}`);
    }
  }
}

/**
 * Create a new Firebase client instance
 */
export function createFirebaseClient(): FirebaseClient {
  return new FirebaseClient();
}



