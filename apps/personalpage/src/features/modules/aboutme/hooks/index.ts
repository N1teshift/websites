import { useFallbackTranslation } from '@/features/infrastructure/i18n';
import {
  isSkillCategories,
  isExperienceItem,
  isProjectItem,
  isEducationItem,
  isLanguageItem,
  isStringArray,
  useTranslatedObject
} from '../utils';
import type {
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  LanguageItem
} from '../types';

export interface UseAboutMeDataReturn {
  t: ReturnType<typeof useFallbackTranslation>['t'];
  techSkills: { [key: string]: SkillCategory };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  interests: string[];
  softSkills: string[];
}

export function useAboutMeData(): UseAboutMeDataReturn {
  const { t } = useFallbackTranslation();

  const techSkills = useTranslatedObject('techSkills', isSkillCategories, {});
  const experience = useTranslatedObject(
    'experience',
    (obj): obj is ExperienceItem[] => Array.isArray(obj) && obj.every(isExperienceItem),
    []
  );
  const projects = useTranslatedObject(
    'projects',
    (obj): obj is ProjectItem[] => Array.isArray(obj) && obj.every(isProjectItem),
    []
  );
  const education = useTranslatedObject(
    'education',
    (obj): obj is EducationItem[] => Array.isArray(obj) && obj.every(isEducationItem),
    []
  );
  const languages = useTranslatedObject(
    'languages',
    (obj): obj is LanguageItem[] => Array.isArray(obj) && obj.every(isLanguageItem),
    []
  );
  const interests = useTranslatedObject('interests', isStringArray, []);
  const softSkills = useTranslatedObject('softSkills', isStringArray, []);

  return {
    t,
    techSkills,
    experience,
    projects,
    education,
    languages,
    interests,
    softSkills
  };
}



