import { createPostHandler } from '@websites/infrastructure/api/routeHandlers';
import { firestoreService } from '@websites/infrastructure/api/firebase';

/**
 * API endpoint to clear all test data from the Firestore database.
 * 
 * Uses the centralized service layer pattern for clean separation of concerns.
 */
export default createPostHandler(
  async (_req, _res) => {
    const result = await firestoreService.clearTestDatabase();
    return result;
  },
  {
    logRequests: true
  }
); 



