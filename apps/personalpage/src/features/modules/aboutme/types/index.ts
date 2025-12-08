export interface SkillCategory {
  /** The title of the skill category (e.g., "Programming Languages"). */
  title: string;
  /** A list of skills within this category. */
  items: string[];
}

export interface ExperienceItem {
  /** The job title or role. */
  title: string;
  /** The name of the company (optional). */
  company?: string;
  /** The location of the job. */
  location: string;
  /** The dates of employment or involvement. */
  dates: string;
  /** A list of key responsibilities or achievements. */
  responsibilities: string[];
  /** A description of the role (optional). */
  description?: string;
}

export interface ProjectItem {
  title: string; /** The title of the project. */
  description: string; /** A brief description of the project. */
  technologies?: string; /** Technologies used in the project (optional). */
}

export interface EducationItem {
  degree: string; /** The degree or qualification obtained. */
  institution: string; /** The name of the institution. */
  dates: string; /** The dates of study. */
  description?: string; /** Additional description (optional). */
}

export interface LanguageItem {
  language: string; /** The name of the language. */
  level: string; /** The proficiency level (e.g., "Native", "Fluent", "Conversational"). */
  name?: string; /** Alternative name property for the language. */
  proficiency?: string; /** Alternative proficiency property. */
}
