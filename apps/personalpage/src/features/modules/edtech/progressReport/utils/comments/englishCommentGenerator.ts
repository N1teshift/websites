import { StudentData } from '../../types/ProgressReportTypes';
import { CommentTemplate } from '../../types/CommentTemplateTypes';
import { EnglishDiagnosticData, EnglishUnit1Data } from './commentDataExtractors';
import { GeneratedComment, WeakSectionDetail } from './mathCommentGenerator';

/**
 * Generate comment for English Diagnostic TEST 1
 */
export function generateEnglishDiagnosticComment(
    student: StudentData,
    diagnosticData: EnglishDiagnosticData,
    template: CommentTemplate
): GeneratedComment {
    const { d1Paper1Percent, d1Paper2Percent, d1Paper3Percent, d1TotalPercent } = diagnosticData;
    
    // Get name
    const nameKas = student.profile?.name_cases?.kas || student.first_name;
    
    // Find weakest area
    const weakSections: WeakSectionDetail[] = [];
    const scores = [
        { section: 'Reading', percent: d1Paper1Percent! },
        { section: 'Listening', percent: d1Paper2Percent! },
        { section: 'Writing', percent: d1Paper3Percent! }
    ];
    const minScore = Math.min(d1Paper1Percent!, d1Paper2Percent!, d1Paper3Percent!);
    const weakestArea = scores.find(s => s.percent === minScore);
    if (weakestArea) {
        weakSections.push({ section: weakestArea.section, score: weakestArea.percent });
    }
    
    // Build comment
    let comment = template.sections.intro + ' ';
    comment += template.sections.context + ' ';
    comment += template.sections.assessment + ' ';
    comment += template.sections.achievement;
    
    if (weakestArea && weakestArea.percent < 70) {
        comment += ' ' + template.sections.weakIntro + ' ' + weakestArea.section.toLowerCase() + ' ' + template.sections.weakEnding;
    }
    
    // Replace variables
    comment = comment.replace(/{Name}/g, nameKas);
    comment = comment.replace(/{Paper1_Percent}/g, Math.round(d1Paper1Percent!).toString());
    comment = comment.replace(/{Paper2_Percent}/g, Math.round(d1Paper2Percent!).toString());
    comment = comment.replace(/{Paper3_Percent}/g, Math.round(d1Paper3Percent!).toString());
    comment = comment.replace(/{Total_Percent}/g, Math.round(d1TotalPercent!).toString());
    
    return {
        student,
        comment,
        mypLevel: 0, // Not applicable
        weakSections,
        sd1myp: 0,
        sd2myp: 0,
        sd3myp: 0,
        p1: null,
        mypBasedGrade: 0,
        deviation: null
    };
}

/**
 * Generate comment for English Unit 1 TEST
 */
export function generateEnglishUnit1Comment(
    student: StudentData,
    unit1Data: EnglishUnit1Data,
    template: CommentTemplate
): GeneratedComment {
    const { t1Lis, t1LisMax, t1Read, t1ReadMax, t1Voc, t1VocMax, t1Gr, t1GrMax, t1TotalScore, t1TotalPercent } = unit1Data;
    
    // Get name
    const nameKas = student.profile?.name_cases?.kas || student.first_name;
    
    // Find weakest area (by percentage) - only include components with data
    const weakSections: WeakSectionDetail[] = [];
    const scores: Array<{ section: string; percent: number }> = [];
    let weakestArea: { section: string; percent: number } | undefined;
    
    if (t1Lis !== null && t1LisMax > 0) {
        scores.push({ section: 'Listening', percent: (t1Lis / t1LisMax) * 100 });
    }
    if (t1Read !== null && t1ReadMax > 0) {
        scores.push({ section: 'Reading', percent: (t1Read / t1ReadMax) * 100 });
    }
    if (t1Voc !== null && t1VocMax > 0) {
        scores.push({ section: 'Vocabulary', percent: (t1Voc / t1VocMax) * 100 });
    }
    if (t1Gr !== null && t1GrMax > 0) {
        scores.push({ section: 'Grammar', percent: (t1Gr / t1GrMax) * 100 });
    }
    
    if (scores.length > 0) {
        const minScore = Math.min(...scores.map(s => s.percent));
        weakestArea = scores.find(s => s.percent === minScore);
        if (weakestArea) {
            weakSections.push({ section: weakestArea.section, score: weakestArea.percent });
        }
    }
    
    // Build comment
    let comment = template.sections.intro + ' ';
    comment += template.sections.context + ' ';
    comment += template.sections.assessment + ' ';
    comment += template.sections.achievement;
    
    if (weakestArea && weakestArea.percent < 70) {
        comment += ' ' + template.sections.weakIntro + ' ' + weakestArea.section.toLowerCase() + ' ' + template.sections.weakEnding;
    }
    
    // Replace variables (handle null values gracefully)
    comment = comment.replace(/{Name}/g, nameKas);
    comment = comment.replace(/{Listening_Score}/g, t1Lis !== null ? t1Lis.toString() : '—');
    comment = comment.replace(/{Listening_Max}/g, t1LisMax.toString());
    comment = comment.replace(/{Reading_Score}/g, t1Read !== null ? t1Read.toString() : '—');
    comment = comment.replace(/{Reading_Max}/g, t1ReadMax.toString());
    comment = comment.replace(/{Vocabulary_Score}/g, t1Voc !== null ? t1Voc.toString() : '—');
    comment = comment.replace(/{Vocabulary_Max}/g, t1VocMax.toString());
    comment = comment.replace(/{Grammar_Score}/g, t1Gr !== null ? t1Gr.toString() : '—');
    comment = comment.replace(/{Grammar_Max}/g, t1GrMax.toString());
    comment = comment.replace(/{Total_Score}/g, t1TotalScore !== null ? t1TotalScore.toString() : '—');
    comment = comment.replace(/{Total_Percent}/g, t1TotalPercent !== null ? Math.round(t1TotalPercent).toString() : '—');
    
    return {
        student,
        comment,
        mypLevel: 0, // Not applicable
        weakSections,
        sd1myp: 0,
        sd2myp: 0,
        sd3myp: 0,
        p1: null,
        mypBasedGrade: 0,
        deviation: null
    };
}




