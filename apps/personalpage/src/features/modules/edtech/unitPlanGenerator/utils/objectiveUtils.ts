import { Objective, getObjectiveById } from '../data/objectives';

/**
 * Utility functions for working with MYP objectives
 */

/**
 * Get a formatted string of selected objectives for display
 */
export const formatSelectedObjectives = (objectiveIds: string[]): string => {
    if (objectiveIds.length === 0) return 'No objectives selected';
    
    const objectiveNames = objectiveIds
        .map(id => getObjectiveById(id))
        .filter(Boolean)
        .map(obj => obj!.name.split(' - ')[1]); // Remove the "A - " prefix
    
    return objectiveNames.join(', ');
};

/**
 * Get a detailed summary of selected objectives
 */
export const getSelectedObjectivesSummary = (objectiveIds: string[]): {
    count: number;
    names: string[];
    descriptions: string[];
    strands: Array<{ objectiveId: string; strands: string[] }>;
} => {
    const objectives = objectiveIds
        .map(id => getObjectiveById(id))
        .filter(Boolean) as Objective[];
    
    const names = objectives.map(obj => obj.name);
    const descriptions = objectives.map(obj => obj.description);
    
    const strands = objectives.map(obj => ({
        objectiveId: obj.id,
        strands: obj.strands.map(strand => `${strand.id}. ${strand.description}`)
    }));
    
    return {
        count: objectives.length,
        names,
        descriptions,
        strands
    };
};

/**
 * Validate objective selection based on MYP requirements
 */
export const validateObjectiveSelection = (objectiveIds: string[]): {
    isValid: boolean;
    message: string;
    recommendations: string[];
} => {
    const recommendations: string[] = [];
    
    // Check if at least 2 objectives are selected (minimum requirement)
    if (objectiveIds.length < 2) {
        recommendations.push('Select at least 2 objectives to meet MYP requirements');
    }
    
    // Check if all 4 objectives are covered (recommended for comprehensive coverage)
    if (objectiveIds.length < 4) {
        recommendations.push('Consider selecting all 4 objectives for comprehensive coverage');
    }
    
    // Check for specific objective combinations
    const hasA = objectiveIds.includes('A');
    const hasC = objectiveIds.includes('C');
    
    if (!hasA) {
        recommendations.push('Objective A (Knowing and Understanding) is fundamental and recommended');
    }
    
    if (!hasC) {
        recommendations.push('Objective C (Communicating) is essential for mathematical literacy');
    }
    
    const isValid = objectiveIds.length >= 2;
    const message = isValid 
        ? `Valid selection: ${objectiveIds.length} objectives selected`
        : `Invalid selection: Need at least 2 objectives (currently ${objectiveIds.length})`;
    
    return {
        isValid,
        message,
        recommendations
    };
};

/**
 * Get assessment guidance for selected objectives
 */
export const getAssessmentGuidance = (objectiveIds: string[]): {
    generalGuidance: string;
    specificGuidance: Record<string, string>;
} => {
    const objectives = objectiveIds
        .map(id => getObjectiveById(id))
        .filter(Boolean) as Objective[];
    
    const generalGuidance = `When assessing ${objectiveIds.length} objectives, ensure that:
• Each objective is addressed at least twice in the unit
• Assessment tasks allow students to demonstrate all selected strands
• Clear criteria are provided for each objective
• Assessment methods align with the nature of each objective`;
    
    const specificGuidance: Record<string, string> = {};
    
    objectives.forEach(obj => {
        if (obj.assessmentNotes) {
            specificGuidance[obj.id] = obj.assessmentNotes;
        } else {
            specificGuidance[obj.id] = `Focus on the ${obj.strands.length} strands for this objective and ensure assessment tasks provide opportunities for students to demonstrate each strand.`;
        }
    });
    
    return {
        generalGuidance,
        specificGuidance
    };
};

/**
 * Generate learning outcomes based on selected objectives
 */
export const generateLearningOutcomes = (objectiveIds: string[]): string[] => {
    const objectives = objectiveIds
        .map(id => getObjectiveById(id))
        .filter(Boolean) as Objective[];
    
    const outcomes: string[] = [];
    
    objectives.forEach(obj => {
        obj.keyLearningExpectations.forEach(expectation => {
            outcomes.push(`Students will ${expectation.toLowerCase()}`);
        });
    });
    
    return outcomes;
};

/**
 * Check if objectives are suitable for a specific MYP year
 */
export const checkYearAppropriateness = (objectiveIds: string[], mypYear: number): {
    isAppropriate: boolean;
    considerations: string[];
} => {
    const considerations: string[] = [];
    
    // Year-specific considerations
    if (mypYear <= 2) {
        if (objectiveIds.includes('B')) {
            considerations.push('Objective B investigations should be appropriately scaffolded for younger students');
        }
    }
    
    if (mypYear >= 3) {
        if (objectiveIds.includes('B')) {
            considerations.push('Objective B can include more complex pattern recognition and rule formulation');
        }
        if (objectiveIds.includes('D')) {
            considerations.push('Objective D can involve more sophisticated real-world applications');
        }
    }
    
    if (mypYear >= 4) {
        considerations.push('All objectives can be assessed at higher levels of complexity');
    }
    
    return {
        isAppropriate: true, // All objectives are appropriate for all years
        considerations
    };
};

/**
 * Export objectives data for external use (e.g., Excel, Word)
 */
export const exportObjectivesData = (objectiveIds: string[]): {
    summary: string;
    detailed: Array<{
        id: string;
        name: string;
        description: string;
        strands: string[];
    }>;
} => {
    const objectives = objectiveIds
        .map(id => getObjectiveById(id))
        .filter(Boolean) as Objective[];
    
    const summary = `Selected Objectives: ${objectives.map(obj => obj.id).join(', ')}`;
    
    const detailed = objectives.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        strands: obj.strands.map(strand => `${strand.id}. ${strand.description}`)
    }));
    
    return {
        summary,
        detailed
    };
};



