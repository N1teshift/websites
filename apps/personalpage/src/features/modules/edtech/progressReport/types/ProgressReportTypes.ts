import { CambridgeMission } from "./MissionTypes";

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

export interface Assessment {
  date: string;
  column: string;
  type: AssessmentType;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;
  evaluation_details?: EvaluationDetails;
  assessment_id?: string | null;
  assessment_title?: string | null;
  context?: string;
  on_time?: number;
  completed_on_time?: number;
  max_points?: number | null;

  // English diagnostic test attributes (type: 'diagnostic')
  paper1_score?: number | null;
  paper1_max?: number | null;
  paper1_percent?: number | null;
  paper2_score?: number | null;
  paper2_max?: number | null;
  paper2_percent?: number | null;
  paper3_score?: number | null;
  paper3_max?: number | null;
  paper3_percent?: number | null;

  // English summative test attributes (type: 'summative')
  lis1?: number | null;
  lis2?: number | null;
  read?: number | null;
  voc1?: number | null;
  voc2?: number | null;
  gr1?: number | null;
  gr2?: number | null;
  gr3?: number | null;

  // Totals and percentages for English tests
  total_score?: number | null;
  total_max?: number | null;
  total_percent?: number | null;
}

export interface EvaluationDetails {
  percentage_score: number | null;
  myp_score: number | null;
  cambridge_score: number | null;
  cambridge_score_1?: number | null;
  cambridge_score_2?: number | null;
}

export type AssessmentType =
  | "summative" // KD, KD1 columns - unit summatives
  | "test" // SD columns - small topic tests
  | "homework" // ND1, ND2, ND6 - regular homework (binary: 0/1)
  | "homework_graded" // ND3 - graded homework (scored 0-10)
  | "homework_reflection" // ND5 - reflection homework (binary: 0/1, was ND4)
  | "classwork" // EXT columns (includes experimental classwork)
  | "diagnostic" // Diagnostic tests
  | "board_solving" // LNT columns (board participation)
  | "sav_darb" // Generated percentage grade from tests (P1 column)
  | "tracking" // TVARK, TAIS - tracking columns for profile attributes
  | "pd_assessment"; // PD columns - Cambridge practice/additional work

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
  test_title: string;
  stage: string;
  year: string;
  paper_title: string;
  marks: number;
  total_marks: number;
  percentage: number;
  added: string;
}

export interface StudentMissionProgress {
  student_id: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_date: string;
  started_date?: string;
  completed_date?: string;
  missing_assessments?: string[];
  notes?: string;
}

export interface Mission {
  mission_id: string;
  title: string;
  description: string;
  deadline: string;
  created_date: string;
  status: "active" | "completed" | "archived";
  check_type: "column" | "assessment-ids";
  assessment_column?: string;
  assessment_display_name?: string;
  assessment_ids?: string[];
  assessment_display_names?: string[];
  students_assigned: StudentMissionProgress[];
}

export interface ReportingCheckpoint {
  checkpoint_name: string;
  checkpoint_date: string;
  generated_at: string;
  outstanding_achievements: Array<{
    achievement: string;
    evidence: string;
    category: string;
  }>;
  areas_for_improvement: Array<{
    area: string;
    type: string;
    evidence: string;
    target: string;
    priority: string;
  }>;
  home_support_strategies: Array<{
    strategy: string;
    evidence_basis: string;
  }>;
  overall_tone: string;
  one_sentence_summary: string;
}

export interface CambridgeLearningObjective {
  code: string;
  level: number;
  subunit: string;
}

export interface CambridgeObjectiveHistory {
  score: number | null;
  date: string;
  assessment: string;
}

export interface CambridgeObjectiveProgress {
  current_score: number | null;
  last_updated: string | null;
  history: CambridgeObjectiveHistory[];
}

export interface CambridgeObjectivesSummary {
  total: number;
  mastered: number;
  partial: number;
  not_mastered: number;
  not_assessed: number;
  last_full_update: string | null;
}

export interface StudentData {
  id?: string;
  first_name: string;
  last_name: string;
  class_name: string;
  academic?: {
    year: string;
    grade: number;
    class_id: string;
    enrolled_date: null | string;
  };
  profile?: {
    learning_attributes?: {
      writing_quality?: string;
      notebook_organization?: string;
      reflective_practice?: string;
      math_communication?: string;
      seeks_tutoring?: boolean;
    };
    notes?: {
      date_of_birth?: string;
      language_profile?: string;
      strengths?: string[];
      challenges?: string[];
      interests?: string[];
    };
    name_cases?: {
      kas?: string;
      ko?: string;
      ka?: string;
      kuo?: string;
      kam?: string;
      kur?: string;
    };
  };
  assessments?: Assessment[];
  curriculum_progress?: {
    cambridge_objectives?: Record<string, CambridgeObjectiveProgress>;
    cambridge_objectives_summary?: CambridgeObjectivesSummary;
    material_completion?: MaterialCompletion;
  };
  cambridge_missions?: CambridgeMission[];
  engagement?: {
    attendance_records?: AttendanceRecord[];
    attendance_notes?: string[];
    consultations?: ConsultationRecord[];
    social_hours?: number;
  };
  cambridge_tests?: CambridgeTest[];
  communication?: {
    reporting_checkpoints?: ReportingCheckpoint[];
    parent_contacts?: Record<string, unknown>[];
    teacher_notes?: Record<string, unknown>[];
  };
  // Legacy fields (for backwards compatibility)
  social_hours?: number;
  created?: string;
  communication_log?: Record<string, unknown>[];
  attendance_notes?: string[];
  conduct_notes?: string[];
  classwork?: Record<string, unknown>[];
  assessments_evidence?: Record<string, unknown>[];
  external_resources?: Record<string, unknown>[];
  material_completion?: MaterialCompletion;
  consultation_log?: ConsultationRecord[];
  metadata?: {
    mistakes_corrected?: string;
    last_reflection_date?: string;
  };
  attendance_records?: AttendanceRecord[];
  praises_and_remarks?: Record<string, unknown>[];
  reporting_checkpoints?: ReportingCheckpoint[];
  cambridge_learning_objectives?: CambridgeLearningObjective[];
}

export interface SnapshotMetadata {
  created_at: string;
  created_date: string;
  total_students: number;
  source_data_version: string;
  source_data_last_updated: string;
  source_schema_version: string;
  snapshot_format_version: string;
  data_statistics: {
    total_assessments: number;
    total_cambridge_tests: number;
    total_reporting_checkpoints: number;
    total_cambridge_objectives: number;
    total_attendance_records: number;
    students_with_objectives: number;
    students_with_checkpoints: number;
    students_with_cambridge_tests: number;
  };
  available_fields: string[];
}

export interface OriginalMetadata {
  created: string;
  last_updated: string;
  version: string;
  schema_version: string;
  storage_type: string;
  total_students: number;
  migrated_from: string;
  migration_date: string;
  cambridge_learning_objectives: CambridgeLearningObjective[];
}

export interface ProgressReportData {
  metadata?: {
    exported_at?: string;
    schema_version?: string;
    total_students?: number;
    export_version?: string;
    teacher_type?: "main" | "A" | string;
    teacher_name?: string;
  };
  snapshot_metadata?: SnapshotMetadata;
  original_metadata?: OriginalMetadata;
  missions?: Mission[];
  students: StudentData[];
}

export type ProgressReportActiveSection =
  | "guide"
  | "student-view"
  | "class-view"
  | "all-classes"
  | "grade-generator"
  | "objectives"
  | "comments-generator"
  | "data-management";

export interface StudentStats {
  totalAssessments: number;
  averageScore: number;
  attendanceRate: number;
  completionRate: number;
  latestCambridgeTest?: CambridgeTest;
}

export interface ClassStats {
  className: string;
  studentCount: number;
  averageScore: number;
  attendanceRate: number;
  completionRate: number;
}
