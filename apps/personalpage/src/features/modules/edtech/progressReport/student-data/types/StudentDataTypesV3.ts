/**
 * Type definitions for student data v3.0
 * Major improvements:
 * - Structured hierarchy (identity, academic, profile, engagement)
 * - Typed enums instead of string booleans
 * - Curriculum linking in assessments
 * - Computed metrics cache
 * - Multi-year support
 */

// Enums for type safety
export type LearningLevel = "needs_support" | "developing" | "proficient" | "advanced";
export type ObjectiveLevel = 0 | 1 | 2 | 3;
export type TrendDirection = "declining" | "stable" | "improving" | "excelling";
export type AssessmentType =
  | "homework"
  | "classwork"
  | "summative"
  | "diagnostic"
  | "participation"
  | "consultation";

// Academic context
export interface AcademicContext {
  year: string; // "2024-2025"
  grade: number; // 8, 9, 10
  class_id: string; // "8-vydūnas"
  enrolled_date: string; // ISO date
  expected_graduation?: string; // ISO date
}

// Learning attributes with proper types
export interface LearningAttributes {
  writing_quality: LearningLevel;
  notebook_organization: LearningLevel;
  reflective_practice: LearningLevel;
  math_communication: LearningLevel;
  seeks_tutoring: boolean;
}

// Profile notes
export interface ProfileNotes {
  date_of_birth?: string;
  language_profile?: string;
  strengths: string[];
  challenges: string[];
  interests: string[];
}

// Student profile
export interface StudentProfileV3 {
  learning_attributes: LearningAttributes;
  notes: ProfileNotes;
}

// Objective progress tracking
export interface ObjectiveProgress {
  level: ObjectiveLevel;
  last_assessed: string; // ISO date
  assessment_count?: number;
}

// Material unit completion
export interface MaterialUnitCompletion {
  percentage: number;
  completed_date?: string; // ISO date when 100% reached
  last_updated: string; // ISO date
}

// Curriculum progress
export interface CurriculumProgress {
  cambridge_objectives: {
    [objectiveId: string]: ObjectiveProgress;
  };
  material_completion: {
    [unitId: string]: MaterialUnitCompletion;
  };
}

// Curriculum mapping for assessments
export interface CurriculumMapping {
  objectives_tested?: string[]; // Cambridge objective IDs
  material_units?: string[]; // Material unit IDs
  myp_criterion?: string; // A, B, C, D
  cambridge_strand?: string; // "Algebra", "Geometry", etc.
}

// Enhanced assessment with curriculum linking
export interface AssessmentV3 {
  date: string; // ISO date
  column: string;
  type: AssessmentType;
  task_name: string;
  score: string;
  comment: string;
  added: string; // ISO date
  updated?: string; // ISO date

  // Curriculum mapping
  curriculum_mapping?: CurriculumMapping;

  // For summative assessments (SD columns)
  summative_details?: {
    percentage_score?: number;
    max_points?: number;
    myp_score?: number;
    cambridge_score?: number;
  };
}

// Consultation record
export interface ConsultationRecordV3 {
  date_invited: string;
  date_attended: string | null;
  reason: string;
  actions_taken: string;
  future_plans: string;
  added: string;
}

// Attendance record
export interface AttendanceRecordV3 {
  month: string;
  absent_lessons: number;
  authorized_absences: number;
  report_date: string;
}

// Cambridge test
export interface CambridgeTestV3 {
  date: string;
  stage: string;
  year: string;
  paper: string;
  marks: string;
  percentage: string;
}

// Reporting checkpoint
export interface ReportingCheckpointV3 {
  checkpoint_name: string;
  date: string;
  outstanding_achievements: string[];
  areas_for_improvement: string[];
  home_support_strategies: string[];
  overall_assessment: string;
  one_sentence_summary: string;
}

// Communication records
export interface CommunicationRecord {
  date: string;
  type: "parent_contact" | "teacher_note" | "other";
  subject: string;
  content: string;
  follow_up_needed: boolean;
}

// Engagement metrics
export interface EngagementMetrics {
  attendance_records: AttendanceRecordV3[];
  attendance_notes: string[];
  consultations: ConsultationRecordV3[];
  social_hours: number;
  participation_score?: number;
}

// Computed metrics cache
export interface ComputedMetrics {
  last_computed: string; // ISO timestamp
  averages: {
    homework: number;
    classwork: number;
    summative: number;
    participation: number;
    overall: number;
  };
  completion_rates: {
    homework: number;
    material: number;
  };
  trends: {
    period: string; // "last_month", "last_quarter"
    direction: TrendDirection;
    momentum: number; // -1 to 1
  };
  objective_mastery: {
    mastered: number; // Level 3
    proficient: number; // Level 2
    developing: number; // Level 1
    not_started: number; // Level 0
  };
}

// System metadata
export interface SystemMetadata {
  schema_version: string; // "3.0"
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_processed?: string; // ISO timestamp
  migrations_applied?: string[]; // ["v2_to_v3"]
}

// Main student data structure v3.0
export interface StudentDataV3 {
  // IDENTITY
  id: string; // Unique: "VYD-MON-001"
  first_name: string;
  last_name: string;
  class_name: string;

  // ACADEMIC CONTEXT
  academic: AcademicContext;

  // PROFILE
  profile: StudentProfileV3;

  // ASSESSMENTS
  assessments: AssessmentV3[];

  // CURRICULUM PROGRESS
  curriculum_progress: CurriculumProgress;

  // ENGAGEMENT
  engagement: EngagementMetrics;

  // CAMBRIDGE TESTS
  cambridge_tests: CambridgeTestV3[];

  // COMMUNICATION (optional, only if used)
  communication?: {
    parent_contacts: CommunicationRecord[];
    teacher_notes: CommunicationRecord[];
    reporting_checkpoints: ReportingCheckpointV3[];
  };

  // COMPUTED METRICS (optional, cached)
  computed_metrics?: ComputedMetrics;

  // CONDUCT (if tracked)
  conduct?: {
    notes: string[];
    praises: string[];
    concerns: string[];
  };

  // SYSTEM METADATA
  metadata: SystemMetadata;
}

// Cambridge objective definition
export interface CambridgeObjective {
  id: string; // "obj_001"
  code: string; // "9Ae.01"
  strand: string; // "Algebra"
  description: string;
  subunit: string; // "2.1"
  myp_criterion?: string; // "A", "B", etc.
}

// Cambridge objectives reference file
export interface CambridgeObjectivesReference {
  version: string; // "2024-2025"
  grade: number; // 9
  curriculum: string; // "Cambridge Lower Secondary"
  objectives: CambridgeObjective[];
}

// Archive metadata for past years
export interface YearArchive {
  year: string; // "2023-2024"
  final_grade: number;
  class_name: string;
  summary_url?: string;
  archived_at: string;
}

// Student data collection v3
export interface StudentDataCollectionV3 {
  students: StudentDataV3[];
  metadata: {
    schema_version: string;
    created: string;
    last_updated: string;
    total_students: number;
    academic_year: string;
    grade: number;
  };
}
