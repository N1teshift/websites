import { StudentData } from '../../types/ProgressReportTypes';
import { CommentTemplate } from '../../types/CommentTemplateTypes';
import { MathTestData } from './commentDataExtractors';

export interface WeakSectionDetail {
    section: string;
    score: number;
}

export interface GeneratedComment {
    student: StudentData;
    comment: string;
    mypLevel: number;
    weakSections: WeakSectionDetail[];
    sd1myp: number;
    sd2myp: number;
    sd3myp: number;
    p1: number | null;
    mypBasedGrade: number;
    deviation: number | null;
}

/**
 * Generate comment for Math (SD1, SD2, SD3) template
 */
export function generateMathComment(
    student: StudentData,
    mathData: MathTestData,
    template: CommentTemplate
): GeneratedComment {
    const { sd1myp, sd2myp, sd3myp, sd1c1, sd1c2, sd2c, sd3c, p1 } = mathData;

    // Calculate average MYP level and round to nearest integer
    const avgMyp = ((sd1myp! + sd2myp! + sd3myp!) / 3);
    const mypLevel = Math.round(avgMyp);

    // Find sections where student didn't score 1 and track their scores
    const weakSectionsDetailed: WeakSectionDetail[] = [];
    
    // For section 1.1, take the minimum of C1 and C2
    const sd1cMin = Math.min(sd1c1!, sd1c2!);
    if (sd1cMin !== 1) {
        weakSectionsDetailed.push({ section: '1.1', score: sd1cMin });
    }
    
    if (sd2c !== 1) {
        weakSectionsDetailed.push({ section: '1.2', score: sd2c! });
    }
    
    if (sd3c !== 1) {
        weakSectionsDetailed.push({ section: '1.3', score: sd3c! });
    }

    // Get just section names for text generation
    const uniqueWeakSections = weakSectionsDetailed.map(w => w.section);

    // Get name cases
    const nameCases = student.profile?.name_cases;
    const nameKas = nameCases?.kas || student.first_name;
    const nameKo = nameCases?.ko || student.first_name;
    const nameKa = nameCases?.ka || student.first_name;
    const nameKuo = nameCases?.kuo || student.first_name;
    const nameKam = nameCases?.kam || student.first_name;
    const nameKur = nameCases?.kur || student.first_name;

    // Build the comment using template
    let comment = '';
    
    // Start with intro, context, assessment, and achievement
    comment = template.sections.intro + ' ';
    comment += template.sections.context + ' ';
    comment += template.sections.assessment + ' ';
    comment += template.sections.achievement;

    if (uniqueWeakSections.length > 0) {
        // Add weak sections text
        const sectionsText = uniqueWeakSections.join(', ');
        const topicWord = uniqueWeakSections.length === 1 
            ? template.grammarRules.singular.topic 
            : template.grammarRules.plural.topic;
        const subtopicWord = uniqueWeakSections.length === 1 
            ? template.grammarRules.singular.subtopic 
            : template.grammarRules.plural.subtopic;
        
        // Build the topic description
        let topicDescription = '';
        if (uniqueWeakSections.length === 1) {
            if (uniqueWeakSections[0] === '1.1') topicDescription = template.topicDescriptions.section_1_1;
            else if (uniqueWeakSections[0] === '1.2') topicDescription = template.topicDescriptions.section_1_2;
            else if (uniqueWeakSections[0] === '1.3') topicDescription = template.topicDescriptions.section_1_3;
        } else if (uniqueWeakSections.length === 2) {
            const topics = uniqueWeakSections.map(section => {
                const desc = section === '1.1' ? template.topicDescriptions.section_1_1 
                    : section === '1.2' ? template.topicDescriptions.section_1_2 
                    : template.topicDescriptions.section_1_3;
                // Remove "apie" prefix if present
                return desc.replace(/^apie\s+/, '');
            });
            topicDescription = `apie ${topics.join(' ir ')}`;
        } else if (uniqueWeakSections.length === 3) {
            const t1 = template.topicDescriptions.section_1_1.replace(/^apie\s+/, '');
            const t2 = template.topicDescriptions.section_1_2.replace(/^apie\s+/, '');
            const t3 = template.topicDescriptions.section_1_3.replace(/^apie\s+/, '');
            topicDescription = `apie ${t1}, ${t2} ir ${t3}`;
        }

        comment += ' ' + template.sections.weakIntro + ' ';
        comment += `${sectionsText} ${topicWord} ${topicDescription}, `;
        comment += template.sections.weakEnding;

        // Replace variables in weak sections
        comment = comment.replace(/{Subtopic_Word}/g, subtopicWord);
        comment = comment.replace(/{Topic_Word}/g, topicWord);
        comment = comment.replace(/{Sections}/g, sectionsText);
        comment = comment.replace(/{Topic_Description}/g, topicDescription);
    }

    // Replace variables
    comment = comment.replace(/{Name}/g, nameKas);
    comment = comment.replace(/{Name_Ko}/g, nameKo);
    comment = comment.replace(/{Name_Ka}/g, nameKa);
    comment = comment.replace(/{Name_Kuo}/g, nameKuo);
    comment = comment.replace(/{Name_Kam}/g, nameKam);
    comment = comment.replace(/{Name_Kur}/g, nameKur);
    comment = comment.replace(/{MYP_Level}/g, mypLevel.toString());

    // Calculate MYP-based grade and deviation
    const mypBasedGrade = mypLevel + 2;
    const deviation = p1 !== null ? p1 - mypBasedGrade : null;

    return {
        student,
        comment,
        mypLevel,
        weakSections: weakSectionsDetailed,
        sd1myp: sd1myp!,
        sd2myp: sd2myp!,
        sd3myp: sd3myp!,
        p1,
        mypBasedGrade,
        deviation
    };
}




