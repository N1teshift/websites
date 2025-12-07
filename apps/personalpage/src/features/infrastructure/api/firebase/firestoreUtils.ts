import admin from "firebase-admin";

// Module-level cache for Firebase admin apps
const adminApps: { [key: string]: admin.app.App } = {};

/**
 * Retrieves a Firestore instance for the specified database name.
 * Ensures that only one instance is initialized per database name by caching.
 * 
 * @param dbName The name of the database to get the Firestore instance for.
 * @returns The initialized Firestore instance.
 * @throws {Error} If the required environment variables are not set.
 */
export const getFirestoreInstance = (dbName: string) => {
  if (!adminApps[dbName]) {
    const serviceAccountKey = process.env[`FIREBASE_SERVICE_ACCOUNT_KEY_${dbName.toUpperCase()}`];
    if (!serviceAccountKey) {
      console.error(`Error: FIREBASE_SERVICE_ACCOUNT_KEY_${dbName.toUpperCase()} is not set.`);
      throw new Error(`The FIREBASE_SERVICE_ACCOUNT_KEY_${dbName.toUpperCase()} environment variable is not set`);
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch (error) {
      console.error(`Error parsing service account key for database ${dbName}:`, error);
      throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY_${dbName.toUpperCase()} environment variable. Please check the JSON format.`);
    }

    const databaseURL = process.env[`FIREBASE_DATABASE_URL_${dbName.toUpperCase()}`];
    if (!databaseURL) {
      console.error(`Error: FIREBASE_DATABASE_URL_${dbName.toUpperCase()} is not set.`);
      throw new Error(`The FIREBASE_DATABASE_URL_${dbName.toUpperCase()} environment variable is not set`);
    }

    const existingApp = admin.apps
      .filter((app): app is admin.app.App => app !== null)
      .find((app) => app.name === dbName);

    if (!existingApp) {
      adminApps[dbName] = admin.initializeApp(
        {
          credential: admin.credential.cert(credentials),
          databaseURL,
        },
        dbName
      );
    } else {
      adminApps[dbName] = existingApp;
    }
  } else {
    console.log(`Cached Firestore app found for dbName: ${dbName}. Reusing Firestore instance.`);
  }

  const firestore = adminApps[dbName].firestore();
  return firestore;
};

/**
 * Generic interface for document data
 */
export interface FirestoreDocument {
  [key: string]: unknown;
}

/**
 * Options for document operations
 */
export interface DocumentOptions {
  merge?: boolean;
  timestamp?: admin.firestore.Timestamp;
}

/**
 * Result of a document operation
 */
export interface DocumentOperationResult {
  success: boolean;
  error?: string;
  documentId?: string;
}

/**
 * Result of a batch operation
 */
export interface BatchOperationResult {
  success: boolean;
  error?: string;
  committedCount?: number;
}

/**
 * Updates an existing document in Firestore
 * 
 * @param docRef The document reference
 * @param data The data to update
 * @param options Optional configuration
 * @returns Promise resolving to operation result
 */
export const updateDocument = async (
  docRef: admin.firestore.DocumentReference,
  data: FirestoreDocument,
  options: DocumentOptions = {}
): Promise<DocumentOperationResult> => {
  try {
    const updateData = options.timestamp ? { ...data, lastModified: options.timestamp } : data;
    await docRef.update(updateData);
    
    return {
      success: true,
      documentId: docRef.id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to update document ${docRef.id}: ${errorMessage}`
    };
  }
};

/**
 * Creates a new document in Firestore
 * 
 * @param docRef The document reference
 * @param data The data to create
 * @param options Optional configuration
 * @returns Promise resolving to operation result
 */
export const createDocument = async (
  docRef: admin.firestore.DocumentReference,
  data: FirestoreDocument,
  options: DocumentOptions = {}
): Promise<DocumentOperationResult> => {
  try {
    const createData = options.timestamp ? { ...data, createdAt: options.timestamp } : data;
    await docRef.set(createData, { merge: options.merge || false });
    
    return {
      success: true,
      documentId: docRef.id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to create document ${docRef.id}: ${errorMessage}`
    };
  }
};

/**
 * Updates an existing document or creates it if it doesn't exist
 * 
 * @param docRef The document reference
 * @param data The data to set
 * @param options Optional configuration
 * @returns Promise resolving to operation result
 */
export const updateOrCreateDocument = async (
  docRef: admin.firestore.DocumentReference,
  data: FirestoreDocument,
  options: DocumentOptions = {}
): Promise<DocumentOperationResult> => {
  try {
    const doc = await docRef.get();
    
    if (doc.exists) {
      return await updateDocument(docRef, data, options);
    } else {
      return await createDocument(docRef, data, options);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to update or create document ${docRef.id}: ${errorMessage}`
    };
  }
};

/**
 * Commits a Firestore batch with error handling
 * 
 * @param batch The Firestore write batch
 * @param chunkIndex The index of the current chunk (for logging)
 * @param totalChunks The total number of chunks (for logging)
 * @returns Promise resolving to batch operation result
 */
export const commitBatch = async (
  batch: admin.firestore.WriteBatch,
  chunkIndex?: number,
  totalChunks?: number
): Promise<BatchOperationResult> => {
  try {
    await batch.commit();
    
    if (chunkIndex !== undefined && totalChunks !== undefined) {
      console.log(`[commitBatch] Committed chunk ${chunkIndex + 1}/${totalChunks}`);
    } else {
      console.log(`[commitBatch] Committed batch successfully`);
    }
    
    return { success: true, committedCount: 1 }; // We can't access batch size directly
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle specific Firebase errors
    if (errorMessage.includes('quota') || 
        errorMessage.includes('limit') || 
        errorMessage.includes('resource') ||
        errorMessage.includes('exceeded')) {
      console.error('❌ QUOTA EXCEEDED - Firebase operation limits reached');
      return { 
        success: false, 
        error: 'Firebase quota exceeded. Please try again later or reduce the number of operations.' 
      };
    }
    
    if (errorMessage.includes('maximum') || errorMessage.includes('cannot have more than 500 field transforms')) {
      console.error('❌ BATCH SIZE EXCEEDED - Firebase batch size limits reached');
      return { 
        success: false, 
        error: 'Firebase batch size exceeded. Please reduce the number of operations per batch.' 
      };
    }
    
    return { 
      success: false, 
      error: `Error committing batch: ${errorMessage}` 
    };
  }
};

/**
 * Processes operations in chunks to avoid Firestore limits
 * 
 * @param operations Array of operations to process
 * @param chunkSize Maximum operations per chunk
 * @param processChunk Function to process each chunk
 * @returns Promise resolving to overall operation result
 */
export const processInChunks = async <T>(
  operations: T[],
  chunkSize: number,
  processChunk: (chunk: T[], chunkIndex: number) => Promise<BatchOperationResult>
): Promise<BatchOperationResult> => {
  if (operations.length === 0) {
    return { success: true, committedCount: 0 };
  }

  const chunks = [];
  for (let i = 0; i < operations.length; i += chunkSize) {
    chunks.push(operations.slice(i, i + chunkSize));
  }

  console.log(`[processInChunks] Processing ${operations.length} operations in ${chunks.length} chunks of size ${chunkSize}`);

  try {
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const currentChunk = chunks[chunkIndex];
      
      console.log(`[processInChunks] Processing chunk ${chunkIndex + 1}/${chunks.length} with ${currentChunk.length} operations`);
      
      const result = await processChunk(currentChunk, chunkIndex);
      
      if (!result.success) {
        return result; // Stop processing if a chunk fails
      }
      
      // Small pause between chunks to avoid rate limiting
      if (chunkIndex < chunks.length - 1) {
        console.log(`[processInChunks] Pausing briefly before next chunk...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`[processInChunks] Successfully processed all ${chunks.length} chunks`);
    return { success: true, committedCount: operations.length };
    
  } catch (error) {
    console.error('❌ Unhandled error during chunk processing:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during chunk processing'
    };
  }
};
