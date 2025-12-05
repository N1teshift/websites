import { UnitPlanData } from '../../../unitPlanGenerator/types/UnitPlanTypes';

export interface ExcelMapping {
    field: keyof UnitPlanData;
    cell: string;
    label: string;
    type: 'string' | 'array' | 'number';
}

export type ExcelFormatConfig = 'kmm-myp-unit';

export interface ExcelFormatOption {
    value: ExcelFormatConfig;
    label: string;
    description: string;
}

// KMM MYP Unit form mapping
export const excelMappings: ExcelMapping[] = [
    // Basic Information
    { field: 'schoolName', cell: 'D2', label: 'School Name', type: 'string' },
    { field: 'academicYear', cell: 'D4', label: 'Academic Year', type: 'string' },
    { field: 'specifiedConcepts', cell: 'B15', label: 'Specified Concepts', type: 'array' },
    { field: 'keyConcepts', cell: 'B16', label: 'Key Concepts', type: 'array' },
    { field: 'relatedConcepts', cell: 'B17', label: 'Related Concepts', type: 'array' },
    { field: 'conceptualUnderstandings', cell: 'D15', label: 'Conceptual Understandings', type: 'string' },
    { field: 'globalContext', cell: 'E15', label: 'Enhanced Global Context', type: 'string' },
    { field: 'globalContextExplanation', cell: 'G15', label: 'Global Context Explanation', type: 'string' },
    { field: 'inquiryStatement', cell: 'D17', label: 'Inquiry Statement/Question', type: 'string' },
    { field: 'factualQuestions', cell: 'D20', label: 'Factual Knowledge Questions', type: 'array' },
    { field: 'conceptualQuestions', cell: 'E20', label: 'Conceptual Questions', type: 'array' },
    { field: 'debatableQuestions', cell: 'F20', label: 'Debatable Questions', type: 'array' },
    { field: 'individualContext', cell: 'D23', label: 'Individual Context', type: 'string' },
    { field: 'localContext', cell: 'E23', label: 'Local Context', type: 'string' },
    { field: 'globalContextLens', cell: 'F23', label: 'Global Context Lens', type: 'string' },
    { field: 'summativeAssessment', cell: 'D25', label: 'Assessment Title', type: 'string' },
    { field: 'assessmentType', cell: 'D26', label: 'Assessment Type', type: 'string' },
    { field: 'commandTerms', cell: 'D27', label: 'Command Terms', type: 'array' },
    { field: 'summativeAssessment', cell: 'D28', label: 'Summative Assessment', type: 'string' },
    { field: 'atlSkills', cell: 'G25', label: 'ATL Skills', type: 'array' },
    { field: 'atlStrategies', cell: 'G26', label: 'ATL Strategies', type: 'string' }
];

// Available Excel format configurations
export const formatOptions: ExcelFormatOption[] = [
    {
        value: 'kmm-myp-unit',
        label: 'KMM MYP Unit Form',
        description: 'Complete KMM MYP Unit Plan template with proper structure, headers, merged cells, exact column/row dimensions, and professional dark blue header styling'
    }
];



