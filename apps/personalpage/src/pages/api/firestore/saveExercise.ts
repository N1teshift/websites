import { createPostHandler } from "@websites/infrastructure/api";
import { firestoreService } from "@/features/infrastructure/api/firebase";

/**
 * API route handler for updating an exercise document in Firestore.
 *
 * Uses the centralized service layer pattern for clean separation of concerns.
 */
export default createPostHandler(
  async (req, _res) => {
    const { dbName, bookId, sectionId, exerciseId, updatedData } = req.body;

    const result = await firestoreService.saveExerciseData(
      dbName,
      bookId,
      sectionId,
      exerciseId,
      updatedData
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  },
  {
    validateBody: firestoreService.validateExerciseSaveRequest,
    logRequests: true,
  }
);
