import { Subject } from '../types/UnitPlanTypes';

/**
 * Get the translated display name for a subject
 * @param subjectId - The subject ID
 * @param t - Translation function
 * @returns The translated subject name for display
 */
export const getTranslatedSubjectName = (subjectId: string, t: (key: string) => string): string => {
    const translationKey = `subject_${subjectId}`;
    const translatedName = t(translationKey);
    
    // If translation exists and is not the same as the key, use it
    if (translatedName && translatedName !== translationKey) {
        return translatedName;
    }
    
    // Fallback to English name from subjects data
    return getEnglishSubjectName(subjectId);
};

/**
 * Get the English name for a subject (for Excel export)
 * @param subjectId - The subject ID
 * @returns The English subject name
 */
export const getEnglishSubjectName = (subjectId: string): string => {
    const subjectMap: Record<string, string> = {
        'arts': 'Arts',
        'design': 'Design',
        'individuals_societies': 'Individuals and Societies',
        'language_acquisition': 'Language Acquisition',
        'language_literature': 'Language and Literature',
        'mathematics': 'Mathematics',
        'physical_health_education': 'Physical and Health Education',
        'sciences': 'Sciences'
    };
    
    return subjectMap[subjectId] || subjectId;
};

/**
 * Get subjects with translated names for display
 * @param subjects - Array of subjects
 * @param t - Translation function
 * @returns Array of subjects with translated display names
 */
export const getSubjectsWithTranslations = (subjects: Subject[], t: (key: string) => string): Subject[] => {
    return subjects.map(subject => ({
        ...subject,
        displayName: getTranslatedSubjectName(subject.id, t)
    }));
};



