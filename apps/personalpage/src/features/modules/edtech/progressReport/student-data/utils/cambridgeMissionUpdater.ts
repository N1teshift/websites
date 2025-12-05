/**
 * Cambridge Mission Updater
 * Handles updating Cambridge objectives and missions when new assessment data is imported
 */

import { StudentData } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import { getObjectivesForPD } from '../config/pdKdMappings';
import { 
    updateMissionWithAssessment,
    updateMissionInStudent
} from '@/features/modules/edtech/progressReport/utils/missionUtils';
import { Logger } from '@websites/infrastructure/logging';

/**
 * Update Cambridge objective with new assessment data
 */
export function updateCambridgeObjective(
    student: StudentData,
    objectiveCode: string,
    score: number | null,
    date: string,
    assessmentColumn: string
): StudentData {
    if (!student.curriculum_progress) {
        student.curriculum_progress = {};
    }
    
    if (!student.curriculum_progress.cambridge_objectives) {
        student.curriculum_progress.cambridge_objectives = {};
    }
    
    const objectives = student.curriculum_progress.cambridge_objectives;
    
    // Initialize objective if it doesn't exist
    if (!objectives[objectiveCode]) {
        objectives[objectiveCode] = {
            current_score: null,
            last_updated: null,
            history: []
        };
    }
    
    const objective = objectives[objectiveCode];
    
    // Add to history
    objective.history.push({
        score,
        date,
        assessment: assessmentColumn
    });
    
    // Update current score and date
    objective.current_score = score;
    objective.last_updated = date;
    
    Logger.debug('Updated Cambridge objective', {
        student: `${student.first_name} ${student.last_name}`,
        objective: objectiveCode,
        score,
        assessment: assessmentColumn
    });
    
    return student;
}

/**
 * Update all missions for a student when a new Cambridge objective score is recorded
 */
export function updateStudentMissionsWithAssessment(
    student: StudentData,
    objectiveCode: string,
    score: number | null,
    date: string,
    assessmentColumn: string,
    points?: number,
    mypLevel?: number
): StudentData {
    if (!student.cambridge_missions || student.cambridge_missions.length === 0) {
        return student;
    }
    
    let updatedStudent = { ...student };
    let missionsUpdated = 0;
    
    // Find all active missions that include this objective
    for (const mission of student.cambridge_missions) {
        if (mission.status !== 'in_progress') continue;
        
        // Check if mission includes this objective
        if (!mission.objectives[objectiveCode]) continue;
        
        // Update the mission
        const updatedMission = updateMissionWithAssessment(
            mission,
            objectiveCode,
            score,
            date,
            assessmentColumn,
            points,
            mypLevel
        );
        
        // Update in student data
        updatedStudent = updateMissionInStudent(updatedStudent, updatedMission);
        missionsUpdated++;
        
        Logger.info('Updated mission with assessment', {
            student: `${student.first_name} ${student.last_name}`,
            mission: mission.title,
            objective: objectiveCode,
            newStatus: updatedMission.status
        });
    }
    
    if (missionsUpdated > 0) {
        Logger.info(`Updated ${missionsUpdated} mission(s) for student`, {
            student: `${student.first_name} ${student.last_name}`,
            objective: objectiveCode
        });
    }
    
    return updatedStudent;
}

/**
 * Process a PD assessment and update all relevant Cambridge objectives and missions
 */
export function processPDAssessment(
    student: StudentData,
    pdNumber: string,
    cambridgeScore: number | null,
    date: string,
    assessmentColumn: string,
    points?: number,
    mypLevel?: number
): StudentData {
    // Get objectives tested by this PD
    const objectives = getObjectivesForPD(pdNumber);
    
    if (objectives.length === 0) {
        Logger.warn('No objectives found for PD assessment', { pdNumber });
        return student;
    }
    
    let updatedStudent = { ...student };
    
    // Update each objective
    for (const objectiveCode of objectives) {
        // Update the Cambridge objective
        updatedStudent = updateCambridgeObjective(
            updatedStudent,
            objectiveCode,
            cambridgeScore,
            date,
            assessmentColumn
        );
        
        // Update any missions that include this objective
        updatedStudent = updateStudentMissionsWithAssessment(
            updatedStudent,
            objectiveCode,
            cambridgeScore,
            date,
            assessmentColumn,
            points,
            mypLevel
        );
    }
    
    Logger.info('Processed PD assessment', {
        student: `${student.first_name} ${student.last_name}`,
        pdNumber,
        objectives: objectives.join(', '),
        score: cambridgeScore
    });
    
    return updatedStudent;
}

/**
 * Recalculate Cambridge objectives summary after updates
 */
export function recalculateCambridgeObjectivesSummary(student: StudentData): StudentData {
    const objectives = student.curriculum_progress?.cambridge_objectives;
    
    if (!objectives || Object.keys(objectives).length === 0) {
        return student;
    }
    
    let mastered = 0;
    let partial = 0;
    let notMastered = 0;
    let notAssessed = 0;
    let lastUpdate: string | null = null;
    
    for (const objective of Object.values(objectives)) {
        if (objective.current_score === null) {
            notAssessed++;
        } else if (objective.current_score === 1) {
            mastered++;
        } else if (objective.current_score > 0) {
            partial++;
        } else {
            notMastered++;
        }
        
        // Track most recent update
        if (objective.last_updated) {
            if (!lastUpdate || objective.last_updated > lastUpdate) {
                lastUpdate = objective.last_updated;
            }
        }
    }
    
    const total = Object.keys(objectives).length;
    
    if (!student.curriculum_progress) {
        student.curriculum_progress = {};
    }
    
    student.curriculum_progress.cambridge_objectives_summary = {
        total,
        mastered,
        partial,
        not_mastered: notMastered,
        not_assessed: notAssessed,
        last_full_update: lastUpdate
    };
    
    return student;
}




