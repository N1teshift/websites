import { BookDocumentData, ExerciseDocumentData } from "../types";
import { fetchData, saveData } from "@/lib/api-client";

export type UpdatedData = Partial<ExerciseDocumentData>;

interface FetchResponse<T> {
    data: T | null;
    error: string | null;
}

/**
 * Fetches metadata (list of books) from the specified database.
 * @param dbName The name of the database to fetch metadata from.
 * @returns A promise that resolves to the fetch response containing the metadata.
 */
export const fetchMetadata = async (dbName: string): Promise<FetchResponse<{ metadata: BookDocumentData[] }>> => {
    return fetchData<{ metadata: BookDocumentData[] }>(`/api/fetchDatabase?dbName=${dbName}&type=metadata`);
};

/**
 * Fetches exercises for a specific book and section from the database.
 * @param dbName The name of the database.
 * @param selectedBook The selected book document data.
 * @param selectedSection The selected section ID.
 * @returns A promise that resolves to the fetch response containing the exercises. Returns an error if book or section is missing.
 */
export const fetchExercises = async (
    dbName: string,
    selectedBook: BookDocumentData,
    selectedSection: string
): Promise<FetchResponse<{ exercises: ExerciseDocumentData[] }>> => {
    if (!selectedBook || !selectedSection) {
        return { data: null, error: "Missing book or section" };
    }
    return fetchData<{ exercises: ExerciseDocumentData[] }>(
        `/api/fetchDatabase?dbName=${dbName}&type=exercises&bookId=${selectedBook.id}&sectionId=${selectedSection}`
    );
};

/**
 * Fetches a batch of exercises based on their indices, skipping cached ones.
 * @param dbName The name of the database.
 * @param selectedBook The selected book document data.
 * @param selectedSection The selected section ID.
 * @param indices An array of exercise indices to fetch.
 * @param cache A record mapping indices to cached exercise data.
 * @returns A promise that resolves to the fetch response containing the fetched exercises. Skips fetch if all requested indices are cached.
 */
export const fetchExerciseBatch = async (
    dbName: string,
    selectedBook: BookDocumentData,
    selectedSection: string,
    indices: number[],
    cache: Record<number, ExerciseDocumentData>
): Promise<FetchResponse<{ exercises: ExerciseDocumentData[] }>> => {
    if (!selectedBook || !selectedSection) {
        return { data: null, error: "Missing book or section" };
    }
    const indicesToFetch = indices.filter((index) => !cache[index]);
    if (indicesToFetch.length === 0) {
        return { data: null, error: null };
    }
    return fetchData<{ exercises: ExerciseDocumentData[] }>(
        `/api/fetchDatabase?dbName=${dbName}&type=exercises&bookId=${selectedBook.id}&sectionId=${selectedSection}&indices=${indicesToFetch.join(",")}`
    );
};

/**
 * Saves updated exercise data to the database.
 * @param exerciseId The ID of the exercise to update.
 * @param updatedData An object containing the partial data to update.
 * @param dbName The name of the database.
 * @param bookId The ID of the book containing the exercise.
 * @param sectionId The ID of the section containing the exercise.
 * @returns A promise that resolves to the save response (void on success).
 */
export const saveExerciseData = async (
    exerciseId: string,
    updatedData: UpdatedData,
    dbName: string,
    bookId: string,
    sectionId: string
): Promise<{ success: boolean; error: string | null }> => {
    const payload = { dbName, bookId, sectionId, exerciseId, updatedData };
    const result = await saveData<void>('/api/saveExercise', payload);
    return { success: result.success, error: result.error };
};



