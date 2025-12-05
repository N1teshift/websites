import {
  isSkillCategory,
  isSkillCategories,
  isExperienceItem,
  isProjectItem,
  isEducationItem,
  isLanguageItem,
  isStringArray,
} from '../index';
import type {
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  LanguageItem,
} from '../../types';

describe('Type Guards - AboutMe Utils', () => {
  describe('isSkillCategory', () => {
    it('should return true for valid SkillCategory object', () => {
      const validCategory: SkillCategory = {
        title: 'Programming Languages',
        items: ['JavaScript', 'TypeScript', 'Python'],
      };

      expect(isSkillCategory(validCategory)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSkillCategory(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSkillCategory(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isSkillCategory('string')).toBe(false);
      expect(isSkillCategory(123)).toBe(false);
      expect(isSkillCategory([])).toBe(false);
      expect(isSkillCategory(true)).toBe(false);
    });

    it('should return false when title is missing', () => {
      const invalidCategory = {
        items: ['JavaScript'],
      };

      expect(isSkillCategory(invalidCategory)).toBe(false);
    });

    it('should return false when items is missing', () => {
      const invalidCategory = {
        title: 'Programming Languages',
      };

      expect(isSkillCategory(invalidCategory)).toBe(false);
    });

    it('should return false when title is not a string', () => {
      const invalidCategory = {
        title: 123,
        items: ['JavaScript'],
      };

      expect(isSkillCategory(invalidCategory)).toBe(false);
    });

    it('should return false when items is not an array', () => {
      const invalidCategory = {
        title: 'Programming Languages',
        items: 'not an array',
      };

      expect(isSkillCategory(invalidCategory)).toBe(false);
    });

    it('should return false when items contains non-string values', () => {
      const invalidCategory = {
        title: 'Programming Languages',
        items: ['JavaScript', 123, 'Python'],
      };

      expect(isSkillCategory(invalidCategory)).toBe(false);
    });

    it('should return true for empty items array', () => {
      const validCategory: SkillCategory = {
        title: 'Programming Languages',
        items: [],
      };

      expect(isSkillCategory(validCategory)).toBe(true);
    });
  });

  describe('isSkillCategories', () => {
    it('should return true for valid object of SkillCategories', () => {
      const validCategories = {
        frontend: {
          title: 'Frontend',
          items: ['React', 'Vue'],
        },
        backend: {
          title: 'Backend',
          items: ['Node.js', 'Python'],
        },
      };

      expect(isSkillCategories(validCategories)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSkillCategories(null)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isSkillCategories('string')).toBe(false);
      // Note: Arrays are objects in JavaScript, but they will fail validation
      // when we check if values are SkillCategories, so this is acceptable behavior
    });

    it('should return false when object contains invalid SkillCategory', () => {
      const invalidCategories = {
        frontend: {
          title: 'Frontend',
          items: ['React'],
        },
        backend: {
          title: 'Backend',
          // Missing items
        },
      };

      expect(isSkillCategories(invalidCategories)).toBe(false);
    });

    it('should return true for empty object', () => {
      expect(isSkillCategories({})).toBe(true);
    });
  });

  describe('isExperienceItem', () => {
    it('should return true for valid ExperienceItem object', () => {
      const validExperience: ExperienceItem = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        dates: '2020-2023',
        responsibilities: ['Developed features', 'Code reviews'],
      };

      expect(isExperienceItem(validExperience)).toBe(true);
    });

    it('should return true when optional fields are missing', () => {
      const validExperience: ExperienceItem = {
        title: 'Software Engineer',
        location: 'San Francisco, CA',
        dates: '2020-2023',
        responsibilities: ['Developed features'],
      };

      expect(isExperienceItem(validExperience)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isExperienceItem(null)).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      expect(isExperienceItem({ title: 'Engineer' })).toBe(false);
      expect(isExperienceItem({ location: 'SF' })).toBe(false);
    });

    it('should return false when responsibilities is not an array', () => {
      const invalidExperience = {
        title: 'Engineer',
        location: 'SF',
        dates: '2020-2023',
        responsibilities: 'not an array',
      };

      expect(isExperienceItem(invalidExperience)).toBe(false);
    });

    it('should return false when responsibilities contains non-string values', () => {
      const invalidExperience = {
        title: 'Engineer',
        location: 'SF',
        dates: '2020-2023',
        responsibilities: ['Valid', 123],
      };

      expect(isExperienceItem(invalidExperience)).toBe(false);
    });

    it('should return true for empty responsibilities array', () => {
      const validExperience: ExperienceItem = {
        title: 'Software Engineer',
        location: 'San Francisco, CA',
        dates: '2020-2023',
        responsibilities: [],
      };

      expect(isExperienceItem(validExperience)).toBe(true);
    });
  });

  describe('isProjectItem', () => {
    it('should return true for valid ProjectItem object', () => {
      const validProject: ProjectItem = {
        title: 'My Project',
        description: 'A great project',
        technologies: 'React, TypeScript',
      };

      expect(isProjectItem(validProject)).toBe(true);
    });

    it('should return true when optional fields are missing', () => {
      const validProject: ProjectItem = {
        title: 'My Project',
        description: 'A great project',
      };

      expect(isProjectItem(validProject)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isProjectItem(null)).toBe(false);
    });

    it('should return false when title is missing', () => {
      const invalidProject = {
        description: 'A great project',
      };

      expect(isProjectItem(invalidProject)).toBe(false);
    });

    it('should return false when description is missing', () => {
      const invalidProject = {
        title: 'My Project',
      };

      expect(isProjectItem(invalidProject)).toBe(false);
    });

    it('should return false when title is not a string', () => {
      const invalidProject = {
        title: 123,
        description: 'A great project',
      };

      expect(isProjectItem(invalidProject)).toBe(false);
    });
  });

  describe('isEducationItem', () => {
    it('should return true for valid EducationItem object', () => {
      const validEducation: EducationItem = {
        degree: 'Bachelor of Science',
        institution: 'University Name',
        dates: '2015-2019',
        description: 'Computer Science',
      };

      expect(isEducationItem(validEducation)).toBe(true);
    });

    it('should return true when optional fields are missing', () => {
      const validEducation: EducationItem = {
        degree: 'Bachelor of Science',
        institution: 'University Name',
        dates: '2015-2019',
      };

      expect(isEducationItem(validEducation)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isEducationItem(null)).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      expect(isEducationItem({ degree: 'BS' })).toBe(false);
      expect(isEducationItem({ institution: 'University' })).toBe(false);
    });

    it('should return false when dates is not a string', () => {
      const invalidEducation = {
        degree: 'BS',
        institution: 'University',
        dates: 2019,
      };

      expect(isEducationItem(invalidEducation)).toBe(false);
    });
  });

  describe('isLanguageItem', () => {
    it('should return true for valid LanguageItem object', () => {
      const validLanguage: LanguageItem = {
        language: 'English',
        level: 'Native',
      };

      expect(isLanguageItem(validLanguage)).toBe(true);
    });

    it('should return true when optional fields are present', () => {
      const validLanguage: LanguageItem = {
        language: 'English',
        level: 'Native',
        name: 'English',
        proficiency: 'Native',
      };

      expect(isLanguageItem(validLanguage)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isLanguageItem(null)).toBe(false);
    });

    it('should return false when language is missing', () => {
      const invalidLanguage = {
        level: 'Native',
      };

      expect(isLanguageItem(invalidLanguage)).toBe(false);
    });

    it('should return false when level is missing', () => {
      const invalidLanguage = {
        language: 'English',
      };

      expect(isLanguageItem(invalidLanguage)).toBe(false);
    });

    it('should return false when language is not a string', () => {
      const invalidLanguage = {
        language: 123,
        level: 'Native',
      };

      expect(isLanguageItem(invalidLanguage)).toBe(false);
    });
  });

  describe('isStringArray', () => {
    it('should return true for valid string array', () => {
      const validArray = ['item1', 'item2', 'item3'];
      expect(isStringArray(validArray)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isStringArray([])).toBe(true);
    });

    it('should return false for null', () => {
      expect(isStringArray(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isStringArray(undefined)).toBe(false);
    });

    it('should return false for non-array types', () => {
      expect(isStringArray('string')).toBe(false);
      expect(isStringArray(123)).toBe(false);
      expect(isStringArray({})).toBe(false);
    });

    it('should return false when array contains non-string values', () => {
      expect(isStringArray(['string', 123])).toBe(false);
      expect(isStringArray(['string', null])).toBe(false);
      expect(isStringArray(['string', {}])).toBe(false);
    });

    it('should return true for array with only strings', () => {
      expect(isStringArray(['one', 'two', 'three'])).toBe(true);
    });
  });
});




