/**
 * Mission Types for Cambridge Learning Objectives
 *
 * Missions track student progress on mastering specific Cambridge learning objectives
 * through targeted PD (Papildomas Darbas) assessments.
 */

/**
 * Mission status states
 */
export type MissionStatus = "not_started" | "in_progress" | "completed" | "cancelled";

/**
 * Mission type categories
 */
export type MissionType = "cambridge_objectives" | "general";

/**
 * Individual objective within a mission
 */
export interface MissionObjective {
  objective_code: string;
  initial_score: number | null;
  current_score: number | null;
  target_score: number;
  pd_assessment: string;
  last_updated: string | null;
  attempts: MissionAttempt[];
}

/**
 * Single assessment attempt for an objective
 */
export interface MissionAttempt {
  date: string;
  score: number | null;
  assessment_column: string;
  points?: number;
  myp_level?: number;
}

/**
 * Cambridge Objectives Mission object
 */
export interface CambridgeMission {
  mission_id: string;
  title: string;
  type: MissionType;
  status: MissionStatus;

  created_date: string;
  started_date: string | null;
  completed_date: string | null;
  deadline: string | null;

  objectives: { [objectiveCode: string]: MissionObjective };

  missing_points_initial: number;
  missing_points_current: number;

  notes?: string;
}

/**
 * Summary statistics for a mission
 */
export interface MissionSummary {
  total_objectives: number;
  mastered: number;
  improved: number;
  no_change: number;
  not_assessed: number;
  completion_percentage: number;
}

/**
 * Mission creation request
 */
export interface CreateMissionRequest {
  student_id: string;
  title?: string;
  objective_codes: string[];
  deadline?: string;
  notes?: string;
}

/**
 * Bulk mission creation request
 */
export interface BulkCreateMissionRequest {
  student_ids: string[];
  title: string;
  objective_codes: string[];
  deadline?: string;
  notes?: string;
}

/**
 * Mission filter options
 */
export interface MissionFilters {
  status?: MissionStatus[];
  type?: MissionType[];
  has_deadline?: boolean;
  overdue?: boolean;
  student_id?: string;
  class_name?: string;
}

/**
 * Student with unmastered objectives (for Mission Creator)
 */
export interface StudentMissionCandidate {
  student_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  missing_points: number;
  unmastered_objectives: UnmasteredObjective[];
  last_assessed: string | null;
}

/**
 * Unmastered objective details
 */
export interface UnmasteredObjective {
  code: string;
  current_score: number | null;
  missing_points: number;
  last_updated: string | null;
  strand: string;
  unit: string | string[];
  pd_assessment: string;
}

/**
 * Mission grouped by severity
 */
export interface MissionCandidatesByPriority {
  critical: StudentMissionCandidate[];
  moderate: StudentMissionCandidate[];
  minor: StudentMissionCandidate[];
}
