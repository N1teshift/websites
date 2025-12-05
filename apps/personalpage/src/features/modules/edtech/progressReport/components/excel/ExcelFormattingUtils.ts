import { getATLSkillById, ATLSkill } from '../../../unitPlanGenerator/data/atlSkills';
import { MATHEMATICS_COMMAND_TERMS, CommandTerm } from '../../../unitPlanGenerator/data/commandTerms';

// Helper function to parse cell address (e.g., "A1" -> {col: 1, row: 1})
export const parseCellAddress = (cellAddress: string) => {
    const match = cellAddress.match(/([A-Z]+)(\d+)/);
    if (!match) return { col: 1, row: 1 };
    
    const colStr = match[1];
    const rowNum = parseInt(match[2]);
    
    // Convert column letters to number (A=1, B=2, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    
    return { col, row: rowNum };
};

// Helper function to format array as comma-separated string
export const formatArrayAsString = (arr: string[]): string => {
    return arr.join(', ');
};

// Helper function to format array as newline-separated string
export const formatArrayAsNewlines = (arr: string[]): string => {
    return arr.join('\n');
};

// Helper function to format ATL skills array with full information
export const formatATLSkillsAsNewlines = (arr: (string | ATLSkill)[]): string => {
    return arr.map(item => {
        if (typeof item === 'string') {
            // If it's just a string (ID), try to find the full ATL skill
            const atlSkill = getATLSkillById(item);
            if (atlSkill) {
                return `${atlSkill.category} - ${atlSkill.subcategory || ''} - ${atlSkill.name}`;
            }
            return item;
        } else if (item && typeof item === 'object' && item.category && item.name) {
            // If it's already an ATL skill object
            return `${item.category} - ${item.subcategory || ''} - ${item.name}`;
        }
        return String(item);
    }).join('\n');
};

// Helper function to get command term by ID
export const getCommandTermById = (id: string): CommandTerm | undefined => {
    return MATHEMATICS_COMMAND_TERMS.find(term => term.id === id);
};

// Helper function to format command terms array with names instead of IDs
export const formatCommandTermsAsString = (arr: string[]): string => {
    return arr.map(id => {
        const term = getCommandTermById(id);
        return term ? term.name : id; // Fallback to ID if term not found
    }).join(', ');
};

// Helper function to format academic year
export const formatAcademicYear = (year: string): string => {
    return `ACADEMIC_YEAR m.m. UNIT PLAN`.replace('ACADEMIC_YEAR', year);
};



