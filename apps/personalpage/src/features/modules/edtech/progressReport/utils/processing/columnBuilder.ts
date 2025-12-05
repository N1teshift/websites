import { StudentData, Assessment } from '../../types/ProgressReportTypes';
import { getLatestAssessmentById, getUniqueAssessments } from '../assessmentColumnUtils';
import { ColumnConfig } from '../../hooks/useColumnVisibility';

export interface AssessmentInfo {
    id: string;
    title: string;
    type: string;
}

export function shortenColumnTitle(title: string, assessmentId?: string): string {
    // For standardized titles that are already short codes, return as-is
    if (title.match(/^[A-Z]+\d*$/)) {
        return title;
    }
    
    // Remove "HOMEWORK " prefix
    let shortened = title.replace(/^HOMEWORK\s+/i, '');
    
    // Shorten Experimental Classwork Data
    if (shortened === 'Experimental Classwork Data') {
        return 'EXT*1';
    }
    
    // Shorten EXT2 - classwork
    if (shortened === 'EXT2 - classwork') {
        return 'EXT*2';
    }
    
    // Shorten Exercise Progress Tracking columns
    if (shortened === 'Exercise Progress Tracking - EXT1') {
        return 'EXT1';
    }
    if (shortened === 'Exercise Progress Tracking - EXT2') {
        return 'EXT2';
    }
    if (shortened === 'Exercise Progress Tracking - EXT3') {
        return 'EXT3';
    }
    if (shortened === 'Exercise Progress Tracking - EXT4') {
        return 'EXT4';
    }
    if (shortened === 'Exercise Progress Tracking - EXT5') {
        return 'EXT5';
    }
    if (shortened === 'Exercise Progress Tracking - EXT6') {
        return 'EXT6';
    }
    if (shortened === 'Exercise Progress Tracking - EXT7') {
        return 'EXT7';
    }
    if (shortened === 'Exercise Progress Tracking - EXT8') {
        return 'EXT8';
    }
    if (shortened === 'Exercise Progress Tracking - EXT9') {
        return 'EXT9';
    }
    if (shortened === 'Exercise Progress Tracking - EXT10') {
        return 'EXT10';
    }
    if (shortened === 'Exercise Progress Tracking - EXT11') {
        return 'EXT11';
    }
    if (shortened === 'Exercise Progress Tracking - EXT12') {
        return 'EXT12';
    }
    
    // Shorten Classwork columns - extract from assessment_id if title doesn't contain EXT
    if (shortened === 'Classwork') {
        // Try to extract from title first
        const titleMatch = title.match(/EXT(\d+)/i);
        if (titleMatch) return `EXT${titleMatch[1]}`;
        
        // If not in title, try assessment_id (handles both "classwork-ext9" and "ext9" formats)
        if (assessmentId) {
            const idMatch = assessmentId.match(/ext(\d+)/i);
            if (idMatch) return `EXT${idMatch[1]}`;
        }
    }
    
    // Shorten Board solving columns  
    if (shortened === 'Board solving' || shortened.includes('Board solving')) {
        const match = title.match(/LNT(\d+)/);
        if (match) return `LNT${match[1]}`;
    }
    
    // Shorten Summative assessment columns
    if (shortened.match(/^Summative assessment \d+$/)) {
        const match = shortened.match(/^Summative assessment (\d+)$/);
        if (match) return `SD${match[1]}`;
    }
    
    // Shorten Cambridge Unit summatives (e.g., "Cambridge Unit 1 Summative" → "KD1")
    shortened = shortened.replace(/^Cambridge Unit\s+(\d+)\s+Summative/i, 'KD$1');
    
    // Shorten Unit tests (e.g., "Unit 1.1 Test - Irrational Numbers" → "SD1")
    // Capture the decimal part (e.g., 1.1 → 1, 1.2 → 2, 1.3 → 3)
    const unitTestMatch = shortened.match(/^Unit\s+\d+\.(\d+)\s+Test\s+-\s+.+$/i);
    if (unitTestMatch) {
        shortened = `SD${unitTestMatch[1]}`;
    }
    
    // Shorten simple Test titles (e.g., "Test 6" → "SD6", "Test 7" → "SD7")
    const simpleTestMatch = shortened.match(/^Test\s+(\d+)$/i);
    if (simpleTestMatch) {
        return `SD${simpleTestMatch[1]}`;
    }
    
    // Shorten Diagnostic assessments (e.g., "Diagnostic Assessment 1" → "D1")
    const diagnosticMatch = shortened.match(/^Diagnostic\s+[Aa]ssessment\s+(\d+)$/i);
    if (diagnosticMatch) {
        return `D${diagnosticMatch[1]}`;
    }
    
    return shortened;
}

export function columnHasData(
    students: StudentData[],
    assessmentId: string,
    scoreType?: 'percentage' | 'myp' | 'cambridge' | 'cambridge_1' | 'cambridge_2'
): boolean {
    return students.some(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return false;
        
        if (scoreType) {
            if (scoreType === 'percentage') {
                if (assessment.evaluation_details?.percentage_score !== undefined && 
                    assessment.evaluation_details?.percentage_score !== null) {
                    return true;
                }
                return assessment.score !== null && assessment.score !== undefined && assessment.score !== '';
            }
            
            if (!assessment.evaluation_details) return false;
            const scoreValue = 
                scoreType === 'myp' ? assessment.evaluation_details.myp_score :
                scoreType === 'cambridge_1' ? assessment.evaluation_details.cambridge_score_1 :
                scoreType === 'cambridge_2' ? assessment.evaluation_details.cambridge_score_2 :
                assessment.evaluation_details.cambridge_score;
            return scoreValue !== undefined && scoreValue !== null;
        }
        
        return assessment.score !== null && assessment.score !== undefined && assessment.score !== '';
    });
}

export function getAssessmentMetadata(students: StudentData[], assessmentId: string) {
    for (const student of students) {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (assessment) {
            return {
                fullTitle: assessment.assessment_title || assessment.task_name || 'Unknown',
                date: assessment.date,
                description: assessment.task_name
            };
        }
    }
    return null;
}

// Helper to check if assessment has English test fields
function hasEnglishTestFields(students: StudentData[], assessmentId: string): { isDiagnostic: boolean; isSummative: boolean } {
    for (const student of students) {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (assessment) {
            // Check for diagnostic fields
            if (assessment.paper1_score !== undefined || assessment.paper2_score !== undefined || assessment.paper3_score !== undefined) {
                return { isDiagnostic: true, isSummative: false };
            }
            // Check for summative (unit test) fields
            if (assessment.lis1 !== undefined || assessment.lis2 !== undefined || 
                assessment.read !== undefined || assessment.voc1 !== undefined || 
                assessment.voc2 !== undefined || assessment.gr1 !== undefined || 
                assessment.gr2 !== undefined || assessment.gr3 !== undefined) {
                return { isDiagnostic: false, isSummative: true };
            }
        }
    }
    return { isDiagnostic: false, isSummative: false };
}

// Helper to check if a specific English field has data
function hasEnglishFieldData(students: StudentData[], assessmentId: string, field: keyof Assessment): boolean {
    return students.some(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        return assessment && assessment[field] !== null && assessment[field] !== undefined;
    });
}

export function buildAssessmentColumns(
    students: StudentData[],
    assessmentTypes: string[]
): ColumnConfig[] {
    const assessments = getUniqueAssessments(students, assessmentTypes);
    
    // Sort by date
    assessments.sort((a, b) => {
        const getEarliestDate = (id: string) => {
            let earliestDate = '';
            students.forEach(student => {
                const assessment = getLatestAssessmentById(student, id);
                if (assessment && assessment.date) {
                    if (!earliestDate || assessment.date < earliestDate) {
                        earliestDate = assessment.date;
                    }
                }
            });
            return earliestDate;
        };
        
        const dateA = getEarliestDate(a.id);
        const dateB = getEarliestDate(b.id);
        
        return dateA.localeCompare(dateB);
    });
    
    const cols: ColumnConfig[] = [];
    
    assessments.forEach(assessment => {
        const shortTitle = assessment.type === 'sav_darb' ? 'P1' : shortenColumnTitle(assessment.title, assessment.id);
        const metadata = getAssessmentMetadata(students, assessment.id);
        
        // Check if this is an English test (diagnostic or unit test with special fields)
        const englishTest = hasEnglishTestFields(students, assessment.id);
        
        if (englishTest.isDiagnostic && assessment.type === 'diagnostic') {
            // Diagnostic test - create columns for Paper 1, Paper 2, Paper 3, Total, %
            const hasPaper1 = hasEnglishFieldData(students, assessment.id, 'paper1_score');
            const hasPaper1Percent = hasEnglishFieldData(students, assessment.id, 'paper1_percent');
            const hasPaper2 = hasEnglishFieldData(students, assessment.id, 'paper2_score');
            const hasPaper2Percent = hasEnglishFieldData(students, assessment.id, 'paper2_percent');
            const hasPaper3 = hasEnglishFieldData(students, assessment.id, 'paper3_score');
            const hasPaper3Percent = hasEnglishFieldData(students, assessment.id, 'paper3_percent');
            const hasTotal = hasEnglishFieldData(students, assessment.id, 'total_score');
            const hasPercent = hasEnglishFieldData(students, assessment.id, 'total_percent');
            
            if (hasPaper1) {
                cols.push({
                    id: `${assessment.id}-paper1`,
                    label: `${shortTitle}P1`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Reading & Use of English`,
                        date: metadata.date,
                        description: 'Paper 1: Reading and Use of English (Raw Score)'
                    } : undefined
                });
                
                if (hasPaper1Percent) {
                    cols.push({
                        id: `${assessment.id}-paper1-percent`,
                        label: `${shortTitle}P1%`,
                        visible: true,
                        tooltip: metadata ? {
                            fullTitle: `${metadata.fullTitle} - Reading & Use of English %`,
                            date: metadata.date,
                            description: 'Paper 1: Reading and Use of English (Percentage)'
                        } : undefined
                    });
                }
            }
            
            if (hasPaper2) {
                cols.push({
                    id: `${assessment.id}-paper2`,
                    label: `${shortTitle}P2`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Listening`,
                        date: metadata.date,
                        description: 'Paper 2: Listening (Raw Score)'
                    } : undefined
                });
                
                if (hasPaper2Percent) {
                    cols.push({
                        id: `${assessment.id}-paper2-percent`,
                        label: `${shortTitle}P2%`,
                        visible: true,
                        tooltip: metadata ? {
                            fullTitle: `${metadata.fullTitle} - Listening %`,
                            date: metadata.date,
                            description: 'Paper 2: Listening (Percentage)'
                        } : undefined
                    });
                }
            }
            
            if (hasPaper3) {
                cols.push({
                    id: `${assessment.id}-paper3`,
                    label: `${shortTitle}P3`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Writing`,
                        date: metadata.date,
                        description: 'Paper 3: Writing (Raw Score)'
                    } : undefined
                });
                
                if (hasPaper3Percent) {
                    cols.push({
                        id: `${assessment.id}-paper3-percent`,
                        label: `${shortTitle}P3%`,
                        visible: true,
                        tooltip: metadata ? {
                            fullTitle: `${metadata.fullTitle} - Writing %`,
                            date: metadata.date,
                            description: 'Paper 3: Writing (Percentage)'
                        } : undefined
                    });
                }
            }
            
            if (hasTotal) {
                cols.push({
                    id: `${assessment.id}-total`,
                    label: `${shortTitle}Tot`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Total Score`,
                        date: metadata.date,
                        description: 'Total Score'
                    } : undefined
                });
            }
            
            if (hasPercent) {
                cols.push({
                    id: `${assessment.id}-percent`,
                    label: `${shortTitle}%`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Overall Percentage`,
                        date: metadata.date,
                        description: 'Overall Percentage'
                    } : undefined
                });
            }
        } else if (englishTest.isSummative && assessment.type === 'summative') {
            // Unit test - create columns for lis1, lis2, read, voc1, voc2, gr1, gr2, gr3, total, %
            const hasLis1 = hasEnglishFieldData(students, assessment.id, 'lis1');
            const hasLis2 = hasEnglishFieldData(students, assessment.id, 'lis2');
            const hasRead = hasEnglishFieldData(students, assessment.id, 'read');
            const hasVoc1 = hasEnglishFieldData(students, assessment.id, 'voc1');
            const hasVoc2 = hasEnglishFieldData(students, assessment.id, 'voc2');
            const hasGr1 = hasEnglishFieldData(students, assessment.id, 'gr1');
            const hasGr2 = hasEnglishFieldData(students, assessment.id, 'gr2');
            const hasGr3 = hasEnglishFieldData(students, assessment.id, 'gr3');
            const hasTotal = hasEnglishFieldData(students, assessment.id, 'total_score');
            const hasPercent = hasEnglishFieldData(students, assessment.id, 'total_percent');
            
            if (hasLis1) {
                cols.push({
                    id: `${assessment.id}-lis1`,
                    label: `${shortTitle}L1`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Listening 1`,
                        date: metadata.date,
                        description: 'Listening 1'
                    } : undefined
                });
            }
            
            if (hasLis2) {
                cols.push({
                    id: `${assessment.id}-lis2`,
                    label: `${shortTitle}L2`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Listening 2`,
                        date: metadata.date,
                        description: 'Listening 2'
                    } : undefined
                });
            }
            
            if (hasRead) {
                cols.push({
                    id: `${assessment.id}-read`,
                    label: `${shortTitle}R`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Reading`,
                        date: metadata.date,
                        description: 'Reading'
                    } : undefined
                });
            }
            
            if (hasVoc1) {
                cols.push({
                    id: `${assessment.id}-voc1`,
                    label: `${shortTitle}V1`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Vocabulary 1`,
                        date: metadata.date,
                        description: 'Vocabulary 1'
                    } : undefined
                });
            }
            
            if (hasVoc2) {
                cols.push({
                    id: `${assessment.id}-voc2`,
                    label: `${shortTitle}V2`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Vocabulary 2`,
                        date: metadata.date,
                        description: 'Vocabulary 2'
                    } : undefined
                });
            }
            
            if (hasGr1) {
                cols.push({
                    id: `${assessment.id}-gr1`,
                    label: `${shortTitle}G1`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Grammar 1`,
                        date: metadata.date,
                        description: 'Grammar 1'
                    } : undefined
                });
            }
            
            if (hasGr2) {
                cols.push({
                    id: `${assessment.id}-gr2`,
                    label: `${shortTitle}G2`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Grammar 2`,
                        date: metadata.date,
                        description: 'Grammar 2'
                    } : undefined
                });
            }
            
            if (hasGr3) {
                cols.push({
                    id: `${assessment.id}-gr3`,
                    label: `${shortTitle}G3`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Grammar 3`,
                        date: metadata.date,
                        description: 'Grammar 3'
                    } : undefined
                });
            }
            
            if (hasTotal) {
                cols.push({
                    id: `${assessment.id}-total`,
                    label: `${shortTitle}Tot`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Total Score`,
                        date: metadata.date,
                        description: 'Total Score'
                    } : undefined
                });
            }
            
            if (hasPercent) {
                cols.push({
                    id: `${assessment.id}-percent`,
                    label: `${shortTitle}%`,
                    visible: true,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} - Percentage`,
                        date: metadata.date,
                        description: 'Overall Percentage'
                    } : undefined
                });
            }
        } else if (assessment.type === 'test' || assessment.type === 'summative') {
            // Regular math test/summative - existing logic
            const hasPercentageData = columnHasData(students, assessment.id, 'percentage');
            const hasMypData = columnHasData(students, assessment.id, 'myp');
            const hasCambridge1Data = columnHasData(students, assessment.id, 'cambridge_1');
            const hasCambridge2Data = columnHasData(students, assessment.id, 'cambridge_2');
            const hasCambridgeData = columnHasData(students, assessment.id, 'cambridge');
            
            const isKD = shortTitle.match(/^KD\d+$/);
            
            cols.push({
                id: `${assessment.id}-percentage`,
                label: isKD ? shortTitle : `${shortTitle}P`,
                visible: hasPercentageData,
                tooltip: metadata ? {
                    fullTitle: `${metadata.fullTitle} (Percentage 0-10)`,
                    date: metadata.date,
                    description: metadata.description
                } : undefined
            });
            
            cols.push({
                id: `${assessment.id}-myp`,
                label: `${shortTitle}MYP`,
                visible: hasMypData,
                tooltip: metadata ? {
                    fullTitle: `${metadata.fullTitle} (MYP 0-8)`,
                    date: metadata.date,
                    description: metadata.description
                } : undefined
            });
            
            // Only create C1 and C2 columns if those fields have data
            if (hasCambridge1Data || hasCambridge2Data) {
                cols.push({
                    id: `${assessment.id}-cambridge-1`,
                    label: `${shortTitle}C1`,
                    visible: hasCambridge1Data,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} (Cambridge 1: 0-1)`,
                        date: metadata.date,
                        description: metadata.description
                    } : undefined
                });
                
                cols.push({
                    id: `${assessment.id}-cambridge-2`,
                    label: `${shortTitle}C2`,
                    visible: hasCambridge2Data,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} (Cambridge 2: 0-1)`,
                        date: metadata.date,
                        description: metadata.description
                    } : undefined
                });
            } else {
                // Default to single C column
                cols.push({
                    id: `${assessment.id}-cambridge`,
                    label: `${shortTitle}C`,
                    visible: hasCambridgeData,
                    tooltip: metadata ? {
                        fullTitle: `${metadata.fullTitle} (Cambridge 0-1)`,
                        date: metadata.date,
                        description: metadata.description
                    } : undefined
                });
            }
        } else {
            const hasData = columnHasData(students, assessment.id);
            // Hide EXT*1 and EXT*2 columns by default, but show Exercise Progress Tracking
            const isHiddenExtColumn = assessment.title === 'Experimental Classwork Data' || 
                                     assessment.title === 'EXT2 - classwork';
            const isExerciseProgress = assessment.title.startsWith('Exercise Progress Tracking - EXT');
            
            const shouldBeVisible = isHiddenExtColumn ? false : (isExerciseProgress ? true : hasData);
            
            cols.push({
                id: assessment.id,
                label: shortTitle,
                visible: shouldBeVisible,
                tooltip: metadata ? {
                    fullTitle: metadata.fullTitle,
                    date: metadata.date,
                    description: metadata.description
                } : undefined
            });
        }
    });
    
    return cols;
}




