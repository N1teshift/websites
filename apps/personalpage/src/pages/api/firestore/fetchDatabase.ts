import { createGetHandler } from '@websites/infrastructure/api';
import { firestoreService } from '@/features/infrastructure/api/firebase';

/**
 * API route handler for fetching data from Firestore.
 * 
 * Uses the centralized service layer pattern for clean separation of concerns.
 */
export default createGetHandler(
  async (req, _res) => {
    const { dbName, bookId, sectionId, type } = req.query;

    if (!dbName || typeof dbName !== "string") {
      throw new Error("Missing or invalid dbName parameter.");
    }

    const result = await firestoreService.fetchDatabase(
      dbName, 
      type as string, 
      bookId as string, 
      sectionId as string
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  },
  {
    logRequests: true
  }
);



