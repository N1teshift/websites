import { createPostHandler } from '@websites/infrastructure/api';
import { firestoreService } from '@websites/infrastructure/api/firebase';

/**
 * API route handler for saving test results to Firestore.
 * 
 * This route uses the centralized API pattern with route handlers and service layers
 * to separate HTTP handling from business logic.
 */
export default createPostHandler(
  async (req, _res) => {
    const { summary, results } = req.body;
    
    // Business logic is handled by the service layer
    const result = await firestoreService.saveTestResults(summary, results);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return { success: true, runId: result.runId };
  },
  {
    validateBody: firestoreService.validateTestResultsRequest.bind(firestoreService),
    logRequests: true
  }
);

// Next.js API configuration for body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Increased limit to allow large test result batches
    },
  },
}; 



