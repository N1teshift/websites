/**
 * Type definitions for student data processing
 */

export interface Assessment {
  date: string;
  column: string;
  type: "homework" | "classwork" | "summative" | "diagnostic" | "participation" | "consultation";
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;

  // For summative assessments (SD columns)
  summative_details?: {
    percentage_score?: number; // SD P - points earned
    max_points?: number; // Maximum points possible (placeholder for future)
    myp_score?: number; // SD MYP - MYP criteria points (0-8)
    cambridge_score?: number; // SD C - Cambridge points (0-1)
  };
}

export interface StudentProfile {
  date_of_birth: string;
  language_profile: string;
  strengths: string[];
  challenges: string[];
  motivation_and_interests: string[];
  writing_quality: string;
  notebook_quality: string;
  is_reflective: string;
  math_communication: string;
  has_corepetitor: string;
}

export interface MaterialCompletion {
  [unit: string]: {
    percentage: number;
    last_updated: string;
  };
}

export interface ConsultationRecord {
  date_invited: string;
  date_attended: string | null;
  reason: string;
  actions_taken: string;
  future_plans: string;
  added: string;
}

export interface AttendanceRecord {
  month: string;
  absent_lessons: number;
  authorized_absences: number;
  report_date: string;
}

export interface CambridgeTest {
  date: string;
  stage: string;
  year: string;
  paper: string;
  marks: string;
  percentage: string;
}

export interface CambridgeLearningObjective {
  code: string;
  level: number;
  subunit: string;
}

export interface ReportingCheckpoint {
  checkpoint_name: string;
  date: string;
  outstanding_achievements: string[];
  areas_for_improvement: string[];
  home_support_strategies: string[];
  overall_assessment: string;
  one_sentence_summary: string;
}

export interface StudentData {
  first_name: string;
  last_name: string;
  class_name: string;
  created?: string;
  profile: StudentProfile;
  material_completion: MaterialCompletion;
  consultation_log: ConsultationRecord[];
  assessments: Assessment[];
  social_hours: number;
  communication_log: Record<string, unknown>[];
  attendance_records: AttendanceRecord[];
  attendance_notes: string[];
  conduct_notes: string[];
  praises_and_remarks: Record<string, unknown>[];
  cambridge_tests: CambridgeTest[];
  reporting_checkpoints: ReportingCheckpoint[];
  cambridge_learning_objectives: CambridgeLearningObjective[];
  classwork: Record<string, unknown>[];
  assessments_evidence: Record<string, unknown>[];
  external_resources: Record<string, unknown>[];
  metadata: {
    mistakes_corrected: string;
    last_reflection_date: string;
  };
}

export interface StudentDataCollection {
  students: StudentData[];
  metadata?: {
    created: string;
    last_updated: string;
    version: string;
    schema_version: string;
    total_students: number;
  };
}

export interface ColumnMapping {
  [columnName: string]: {
    type:
      | "homework"
      | "classwork"
      | "summative"
      | "diagnostic"
      | "participation"
      | "consultation"
      | "social_hours"
      | "comment"
      | "homework_score"
      | "tracking"
      | "pd_assessment";
    task_name?: string;
    description?: string;
    parent_column?: string; // For comment columns and homework_score columns
    summative_subtype?: "percentage" | "myp" | "cambridge"; // For SD columns
    tracking_attribute?: string; // For tracking columns (TVARK, TAIS)
    pd_subtype?: "P" | "MYP" | "C"; // For PD columns
  };
}

export interface ExcelRowData {
  [key: string]: string | number | Date | null | undefined;
}

export interface ProcessingResult {
  success: boolean;
  studentsProcessed: number;
  assessmentsAdded: number;
  errors: string[];
  warnings: string[];
}
