import { useFallbackTranslation } from '@websites/infrastructure/i18n';
import type {
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  LanguageItem
} from '../types';

/**
 * Type guards and helper functions for safely handling i18next translation objects
 * in the AboutMe page component.
 */

export type {
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  LanguageItem
};

// Type guards for validation
export function isSkillCategory(obj: unknown): obj is SkillCategory {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  return (
    'title' in candidate &&
    'items' in candidate &&
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.items) &&
    candidate.items.every((item: unknown) => typeof item === 'string')
  );
}

export function isSkillCategories(obj: unknown): obj is { [key: string]: SkillCategory } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.values(obj).every(isSkillCategory)
  );
}

export function isExperienceItem(obj: unknown): obj is ExperienceItem {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  return (
    'title' in candidate &&
    'location' in candidate &&
    'dates' in candidate &&
    'responsibilities' in candidate &&
    typeof candidate.title === 'string' &&
    typeof candidate.location === 'string' &&
    typeof candidate.dates === 'string' &&
    Array.isArray(candidate.responsibilities) &&
    candidate.responsibilities.every((resp: unknown) => typeof resp === 'string')
  );
}

export function isProjectItem(obj: unknown): obj is ProjectItem {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  return (
    'title' in candidate &&
    'description' in candidate &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string'
  );
}

export function isEducationItem(obj: unknown): obj is EducationItem {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  return (
    'degree' in candidate &&
    'institution' in candidate &&
    'dates' in candidate &&
    typeof candidate.degree === 'string' &&
    typeof candidate.institution === 'string' &&
    typeof candidate.dates === 'string'
  );
}

export function isLanguageItem(obj: unknown): obj is LanguageItem {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  return (
    'language' in candidate &&
    'level' in candidate &&
    typeof candidate.language === 'string' &&
    typeof candidate.level === 'string'
  );
}

export function isStringArray(obj: unknown): obj is string[] {
  return Array.isArray(obj) && obj.every(item => typeof item === 'string');
}

// Hook to safely get translated objects with fallbacks
export function useTranslatedObject<T>(
  key: string,
  validator: (obj: unknown) => obj is T,
  fallback: T
): T {
  const { t } = useFallbackTranslation();
  
  try {
    const result = t(key, { returnObjects: true });
    if (validator(result)) {
      return result;
    }
    console.warn(`Invalid translation structure for key: ${key}`);
    return fallback;
  } catch (error) {
    console.error(`Error getting translation for key: ${key}`, error);
    return fallback;
  }
}


