/**
 * Mission Utility Functions
 * Helper functions for creating, managing, and analyzing Cambridge objectives missions
 */

import {
  CambridgeMission,
  MissionObjective,
  MissionStatus,
  MissionSummary,
  StudentMissionCandidate,
  UnmasteredObjective,
  MissionCandidatesByPriority,
} from "../types/MissionTypes";
import { StudentData, CambridgeObjectiveProgress } from "../types/ProgressReportTypes";
import { getPDForObjective } from "@progressReport/student-data/config/pdKdMappings";
import {
  getStrandForObjective,
  getUnitsForObjective,
} from "@progressReport/student-data/config/cambridgeObjectiveMapping";

/**
 * Generate unique mission ID
 */
export function generateMissionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `mission_${timestamp}_${random}`;
}

/**
 * Calculate missing points for an objective
 */
export function calculateMissingPoints(score: number | null): number {
  if (score === null) return 0; // Not assessed yet, don't count
  return Math.max(0, 1 - score);
}

/**
 * Calculate total missing points from objectives
 */
export function calculateTotalMissingPoints(
  objectives: Record<string, CambridgeObjectiveProgress>
): number {
  return Object.values(objectives).reduce((total, obj) => {
    return total + calculateMissingPoints(obj.current_score);
  }, 0);
}

/**
 * Get unmastered objectives for a student
 * @param student Student data
 * @param includeUnassessed If true, includes objectives with null scores
 */
export function getUnmasteredObjectives(
  student: StudentData,
  includeUnassessed: boolean = false
): UnmasteredObjective[] {
  const objectives = student.curriculum_progress?.cambridge_objectives;
  if (!objectives) return [];

  return Object.entries(objectives)
    .filter(([_, obj]) => {
      if (obj.current_score === null) return includeUnassessed;
      return obj.current_score < 1;
    })
    .map(([code, obj]) => ({
      code,
      current_score: obj.current_score,
      missing_points: calculateMissingPoints(obj.current_score),
      last_updated: obj.last_updated,
      strand: getStrandForObjective(code) || "Unknown",
      unit: getUnitsForObjective(code),
      pd_assessment: getPDForObjective(code) || "N/A",
    }))
    .sort((a, b) => b.missing_points - a.missing_points);
}

/**
 * Create mission candidate from student data
 */
export function createMissionCandidate(student: StudentData): StudentMissionCandidate | null {
  const unmasteredObjectives = getUnmasteredObjectives(student, false);

  if (unmasteredObjectives.length === 0) return null;

  const missingPoints = unmasteredObjectives.reduce((sum, obj) => sum + obj.missing_points, 0);

  const lastAssessed =
    unmasteredObjectives
      .map((obj) => obj.last_updated)
      .filter((date) => date !== null)
      .sort()
      .reverse()[0] || null;

  return {
    student_id: student.id || "",
    first_name: student.first_name,
    last_name: student.last_name,
    class_name: student.class_name,
    missing_points: missingPoints,
    unmastered_objectives: unmasteredObjectives,
    last_assessed: lastAssessed,
  };
}

/**
 * Group mission candidates by priority level
 */
export function groupCandidatesByPriority(
  candidates: StudentMissionCandidate[]
): MissionCandidatesByPriority {
  return {
    critical: candidates
      .filter((c) => c.missing_points >= 5)
      .sort((a, b) => b.missing_points - a.missing_points),
    moderate: candidates
      .filter((c) => c.missing_points >= 3 && c.missing_points < 5)
      .sort((a, b) => b.missing_points - a.missing_points),
    minor: candidates
      .filter((c) => c.missing_points < 3)
      .sort((a, b) => b.missing_points - a.missing_points),
  };
}

/**
 * Create a new mission
 */
export function createMission(
  studentId: string,
  objectiveCodes: string[],
  objectives: Record<string, CambridgeObjectiveProgress>,
  title?: string,
  deadline?: string
): CambridgeMission {
  const missionObjectives: { [code: string]: MissionObjective } = {};
  let totalMissing = 0;

  objectiveCodes.forEach((code) => {
    const obj = objectives[code];
    if (!obj) return;

    const missing = calculateMissingPoints(obj.current_score);
    totalMissing += missing;

    missionObjectives[code] = {
      objective_code: code,
      initial_score: obj.current_score,
      current_score: obj.current_score,
      target_score: 1,
      pd_assessment: getPDForObjective(code) || "N/A",
      last_updated: obj.last_updated,
      attempts: [],
    };
  });

  const createdDate = new Date().toISOString().split("T")[0];

  return {
    mission_id: generateMissionId(),
    title: title || `Custom Mission`,
    type: "cambridge_objectives",
    status: "not_started",
    created_date: createdDate,
    started_date: null,
    completed_date: null,
    deadline: deadline || null,
    objectives: missionObjectives,
    missing_points_initial: totalMissing,
    missing_points_current: totalMissing,
  };
}

/**
 * Start a mission (change status to in_progress)
 */
export function startMission(mission: CambridgeMission): CambridgeMission {
  return {
    ...mission,
    status: "in_progress",
    started_date: new Date().toISOString().split("T")[0],
  };
}

/**
 * Complete a mission
 */
export function completeMission(mission: CambridgeMission): CambridgeMission {
  return {
    ...mission,
    status: "completed",
    completed_date: new Date().toISOString().split("T")[0],
  };
}

/**
 * Cancel a mission
 */
export function cancelMission(mission: CambridgeMission): CambridgeMission {
  return {
    ...mission,
    status: "cancelled",
  };
}

/**
 * Check if a mission should be auto-completed
 * (All objectives have been assessed)
 */
export function shouldAutoComplete(mission: CambridgeMission): boolean {
  if (mission.status !== "in_progress") return false;

  return Object.values(mission.objectives).every((obj) => obj.attempts.length > 0);
}

/**
 * Calculate mission summary statistics
 */
export function calculateMissionSummary(mission: CambridgeMission): MissionSummary {
  const objectives = Object.values(mission.objectives);
  const total = objectives.length;

  let mastered = 0;
  let improved = 0;
  let noChange = 0;
  let notAssessed = 0;

  objectives.forEach((obj) => {
    if (obj.attempts.length === 0) {
      notAssessed++;
    } else if (obj.current_score === 1) {
      mastered++;
    } else if (obj.current_score !== null && obj.initial_score !== null) {
      if (obj.current_score > obj.initial_score) {
        improved++;
      } else {
        noChange++;
      }
    }
  });

  const assessed = total - notAssessed;
  const completionPercentage = total > 0 ? Math.round((assessed / total) * 100) : 0;

  return {
    total_objectives: total,
    mastered,
    improved,
    no_change: noChange,
    not_assessed: notAssessed,
    completion_percentage: completionPercentage,
  };
}

/**
 * Update mission with new assessment data
 * Called when new PD assessment data is imported
 */
export function updateMissionWithAssessment(
  mission: CambridgeMission,
  objectiveCode: string,
  score: number | null,
  date: string,
  assessmentColumn: string,
  points?: number,
  mypLevel?: number
): CambridgeMission {
  if (!mission.objectives[objectiveCode]) return mission;

  const updatedObjective: MissionObjective = {
    ...mission.objectives[objectiveCode],
    current_score: score,
    last_updated: date,
    attempts: [
      ...mission.objectives[objectiveCode].attempts,
      {
        date,
        score,
        assessment_column: assessmentColumn,
        points,
        myp_level: mypLevel,
      },
    ],
  };

  const updatedObjectives = {
    ...mission.objectives,
    [objectiveCode]: updatedObjective,
  };

  // Recalculate missing points
  const missingCurrent = Object.values(updatedObjectives).reduce(
    (sum, obj) => sum + calculateMissingPoints(obj.current_score),
    0
  );

  const updatedMission: CambridgeMission = {
    ...mission,
    objectives: updatedObjectives,
    missing_points_current: missingCurrent,
  };

  // Auto-complete if all objectives assessed
  if (shouldAutoComplete(updatedMission)) {
    return completeMission(updatedMission);
  }

  return updatedMission;
}

/**
 * Filter missions by status
 */
export function filterMissionsByStatus(
  missions: CambridgeMission[],
  statuses: MissionStatus[]
): CambridgeMission[] {
  return missions.filter((m) => statuses.includes(m.status));
}

/**
 * Check if mission is overdue
 */
export function isMissionOverdue(mission: CambridgeMission): boolean {
  if (!mission.deadline || mission.status === "completed" || mission.status === "cancelled") {
    return false;
  }

  const today = new Date().toISOString().split("T")[0];
  return mission.deadline < today;
}

/**
 * Get missions for a specific student
 */
export function getStudentMissions(student: StudentData): CambridgeMission[] {
  return student.cambridge_missions || [];
}

/**
 * Get active missions (in_progress) for a student
 */
export function getActiveMissions(student: StudentData): CambridgeMission[] {
  return filterMissionsByStatus(getStudentMissions(student), ["in_progress"]);
}

/**
 * Find mission by ID in student data
 */
export function findMissionById(student: StudentData, missionId: string): CambridgeMission | null {
  const missions = student.cambridge_missions || [];
  return missions.find((m) => m.mission_id === missionId) || null;
}

/**
 * Update a mission in student data
 */
export function updateMissionInStudent(
  student: StudentData,
  updatedMission: CambridgeMission
): StudentData {
  const missions = student.cambridge_missions || [];
  const index = missions.findIndex((m) => m.mission_id === updatedMission.mission_id);

  if (index === -1) {
    // Mission not found, add it
    return {
      ...student,
      cambridge_missions: [...missions, updatedMission],
    };
  }

  // Update existing mission
  const updatedMissions = [...missions];
  updatedMissions[index] = updatedMission;

  return {
    ...student,
    cambridge_missions: updatedMissions,
  };
}

/**
 * Add a new mission to student data
 */
export function addMissionToStudent(student: StudentData, mission: CambridgeMission): StudentData {
  return {
    ...student,
    cambridge_missions: [...(student.cambridge_missions || []), mission],
  };
}

/**
 * Generate default mission title from objectives
 */
export function generateMissionTitle(objectiveCodes: string[]): string {
  if (objectiveCodes.length === 0) return "Custom Mission";

  // Group by strand
  const strandCounts: Record<string, number> = {};
  objectiveCodes.forEach((code) => {
    const strand = getStrandForObjective(code);
    if (strand) {
      strandCounts[strand] = (strandCounts[strand] || 0) + 1;
    }
  });

  const strands = Object.keys(strandCounts);

  if (strands.length === 1) {
    return `Master ${strands[0]}`;
  } else if (strands.length === 2) {
    return `Master ${strands.join(" & ")}`;
  } else {
    return `Master ${objectiveCodes.length} Objectives`;
  }
}
