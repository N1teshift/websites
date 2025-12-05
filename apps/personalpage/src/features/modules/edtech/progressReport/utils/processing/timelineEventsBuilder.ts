import { StudentData } from '../../types/ProgressReportTypes';

export interface TimelineEvent {
    date: string;
    displayDate: string;
    type: string;
    category: 'assessment' | 'consultation' | 'cambridge_test' | 'communication';
    score?: number;
    details: {
        title: string;
        description: string;
        column?: string;
        taskName?: string;
        comment?: string;
        score?: string;
    };
}

export interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

export function formatEventDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function isExperimentalClasswork(assessment: {
    column?: string;
    type: string;
    date: string;
    task_name?: string;
    assessment_id?: string | null;
}): boolean {
    // Don't filter out Exercise Progress Tracking assessments
    if (assessment.assessment_id?.startsWith('exercise-progress-ext')) {
        return false;
    }
    
    return !!(
        assessment.column?.startsWith('EXT') &&
        assessment.type === 'classwork' &&
        (assessment.date.startsWith('2025-09') || 
         assessment.date.startsWith('2025-10') ||
         assessment.task_name?.toLowerCase().includes('experimental'))
    );
}

export function isCumulativeRecord(assessment: { task_name?: string }): boolean {
    return assessment.task_name?.toLowerCase().includes('cumulative') ?? false;
}

export function buildAssessmentEvents(
    student: StudentData,
    selectedTypes: string[],
    dateRange?: DateRange
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    (student.assessments || []).forEach(assessment => {
        // Apply filters
        if (selectedTypes.length > 0 && !selectedTypes.includes(assessment.type)) {
            return;
        }

        if (isExperimentalClasswork(assessment)) {
            return;
        }

        // Filter out LNT0 for board_solving
        if (selectedTypes.length === 1 && selectedTypes[0] === 'board_solving') {
            if (assessment.column === 'LNT0') {
                return;
            }
        }

        if (isCumulativeRecord(assessment)) {
            return;
        }

        if (dateRange?.startDate && assessment.date < dateRange.startDate) return;
        if (dateRange?.endDate && assessment.date > dateRange.endDate) return;

        const score = parseFloat(assessment.score);

        events.push({
            date: assessment.date,
            displayDate: formatEventDate(assessment.date),
            type: assessment.type,
            category: 'assessment',
            score: !isNaN(score) ? score : undefined,
            details: {
                title: assessment.task_name || assessment.column || 'Assessment',
                description: `${assessment.type} - ${assessment.column}`,
                column: assessment.column,
                taskName: assessment.task_name,
                comment: assessment.comment,
                score: assessment.score
            }
        });
    });

    return events;
}

export function buildConsultationEvents(
    student: StudentData,
    dateRange?: DateRange
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    student.consultation_log?.forEach(consultation => {
        if (!consultation.date_attended) return;
        
        if (dateRange?.startDate && consultation.date_attended < dateRange.startDate) return;
        if (dateRange?.endDate && consultation.date_attended > dateRange.endDate) return;

        events.push({
            date: consultation.date_attended,
            displayDate: formatEventDate(consultation.date_attended),
            type: 'consultation',
            category: 'consultation',
            details: {
                title: 'Consultation Attended',
                description: `Reason: ${consultation.reason || 'N/A'}`,
                comment: consultation.actions_taken
            }
        });
    });

    return events;
}

export function buildCambridgeTestEvents(
    student: StudentData,
    dateRange?: DateRange
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    student.cambridge_tests?.forEach(test => {
        const testDate = test.added;
        if (!testDate) return;
        
        if (dateRange?.startDate && testDate < dateRange.startDate) return;
        if (dateRange?.endDate && testDate > dateRange.endDate) return;

        events.push({
            date: testDate,
            displayDate: formatEventDate(testDate),
            type: 'cambridge_test',
            category: 'cambridge_test',
            score: test.percentage,
            details: {
                title: test.test_title || 'Cambridge Test',
                description: `${test.paper_title} - ${test.stage} ${test.year}`,
                score: `${test.marks}/${test.total_marks} (${test.percentage}%)`
            }
        });
    });

    return events;
}

export function buildAllTimelineEvents(
    student: StudentData,
    selectedTypes: string[],
    dateRange?: DateRange
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Add assessment events
    events.push(...buildAssessmentEvents(student, selectedTypes, dateRange));

    // Only add consultations and Cambridge tests if no specific type filter
    if (selectedTypes.length === 0) {
        events.push(...buildConsultationEvents(student, dateRange));
        events.push(...buildCambridgeTestEvents(student, dateRange));
    }

    return events.sort((a, b) => a.date.localeCompare(b.date));
}




