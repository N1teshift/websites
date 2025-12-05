/**
 * Fuzzy name matching utility using Levenshtein distance
 * Helps match student names even when there are minor spelling variations
 */

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits (insertions, deletions, or substitutions)
 * needed to change one string into the other
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0 to 1, where 1 is exact match)
 */
function similarityScore(str1: string, str2: string): number {
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
}

/**
 * Check if two names are similar enough to be considered a match
 * Uses both first and last name for matching
 * 
 * @param firstName1 First student's first name
 * @param lastName1 First student's last name
 * @param firstName2 Second student's first name
 * @param lastName2 Second student's last name
 * @param threshold Minimum similarity score (0-1). Default is 0.9 (90% similar)
 * @returns true if names are similar enough
 */
export function areNamesSimilar(
    firstName1: string,
    lastName1: string,
    firstName2: string,
    lastName2: string,
    threshold: number = 0.9
): boolean {
    const firstNameScore = similarityScore(firstName1, firstName2);
    const lastNameScore = similarityScore(lastName1, lastName2);
    
    // Both names must be above threshold
    // First name must be exact or very close (threshold)
    // Last name can have more tolerance if first name is exact
    if (firstNameScore === 1.0) {
        // If first name is exact match, allow more tolerance for last name
        // This handles cases like "Krungelevičiūtė" vs "Krunglevičiūtė"
        return lastNameScore >= (threshold - 0.05);
    }
    
    // If first name is not exact, both must be very similar
    return firstNameScore >= threshold && lastNameScore >= threshold;
}

/**
 * Find the best matching student from a list
 * Returns the student and the match score
 */
export interface NameMatchResult<T> {
    match: T | null;
    score: number;
    isExactMatch: boolean;
    isFuzzyMatch: boolean;
}

export function findBestNameMatch<T extends { first_name: string; last_name: string }>(
    students: T[],
    firstName: string,
    lastName: string,
    threshold: number = 0.9
): NameMatchResult<T> {
    let bestMatch: T | null = null;
    let bestScore = 0;

    for (const student of students) {
        // Check for exact match first
        if (student.first_name === firstName && student.last_name === lastName) {
            return {
                match: student,
                score: 1.0,
                isExactMatch: true,
                isFuzzyMatch: false
            };
        }

        // Calculate fuzzy match score
        const firstNameScore = similarityScore(student.first_name, firstName);
        const lastNameScore = similarityScore(student.last_name, lastName);
        
        // Combined score: weighted average (first name is more important)
        const combinedScore = (firstNameScore * 0.4 + lastNameScore * 0.6);

        if (combinedScore > bestScore) {
            bestScore = combinedScore;
            bestMatch = student;
        }
    }

    // Only return match if it's above threshold
    const isFuzzyMatch = bestScore >= threshold && bestMatch !== null;

    return {
        match: isFuzzyMatch ? bestMatch : null,
        score: bestScore,
        isExactMatch: false,
        isFuzzyMatch
    };
}




