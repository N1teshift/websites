import { AllScoreTypes } from '../components/common/ClassPerformanceChartEnhanced';

export interface ScaleConfig {
    min: number;
    max: number;
    interval: number;
    label: string;
    fieldName?: string; // Actual field name in the data (if different from score type)
}

/**
 * Get the appropriate scale configuration for a given score type
 */
export function getScaleConfig(scoreType: AllScoreTypes): ScaleConfig {
    const configs: Record<string, ScaleConfig> = {
        // Diagnostic test raw scores (papers)
        'paper1': { min: 0, max: 50, interval: 5, label: 'Score (0-50)', fieldName: 'paper1_score' },
        'paper2': { min: 0, max: 50, interval: 5, label: 'Score (0-50)', fieldName: 'paper2_score' },
        'paper3': { min: 0, max: 50, interval: 5, label: 'Score (0-50)', fieldName: 'paper3_score' },
        
        // Diagnostic test percentages
        'paper1_percent': { min: 0, max: 100, interval: 10, label: 'Percentage (0-100)' },
        'paper2_percent': { min: 0, max: 100, interval: 10, label: 'Percentage (0-100)' },
        'paper3_percent': { min: 0, max: 100, interval: 10, label: 'Percentage (0-100)' },
        
        // Unit test components (listening, reading, vocabulary, grammar)
        'lis1': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'lis2': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'read': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'voc1': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'voc2': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'gr1': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'gr2': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        'gr3': { min: 0, max: 10, interval: 1, label: 'Score (0-10)' },
        
        // Total scores
        'total_percent': { min: 0, max: 100, interval: 10, label: 'Percentage (0-100)' },
        
        // Default (regular assessments)
        'percentage': { min: 1, max: 10, interval: 1, label: 'Score (1-10)' },
        'myp': { min: 0, max: 8, interval: 1, label: 'MYP Score (0-8)' },
        'cambridge': { min: 0, max: 1, interval: 0.5, label: 'Cambridge (0, 0.5, 1)' },
        'cambridge_1': { min: 0, max: 1, interval: 0.5, label: 'Cambridge 1 (0, 0.5, 1)' },
        'cambridge_2': { min: 0, max: 1, interval: 0.5, label: 'Cambridge 2 (0, 0.5, 1)' }
    };
    
    return configs[scoreType] || { min: 1, max: 10, interval: 1, label: 'Score (1-10)' };
}

/**
 * Get total score scale configuration based on assessment type
 * Used when scoreType is not specified but we need to determine scale from assessment data
 */
export function getTotalScoreScale(assessmentType: string, isDiagnostic: boolean, isUnitTest: boolean): ScaleConfig {
    if (isDiagnostic) {
        // Diagnostic test total: 0-150 in intervals of 10
        return { min: 0, max: 150, interval: 10, label: 'Total Score (0-150)' };
    }
    
    if (isUnitTest) {
        // Unit test total: 0-50
        return { min: 0, max: 50, interval: 5, label: 'Total Score (0-50)' };
    }
    
    // Default
    return { min: 1, max: 10, interval: 1, label: 'Score (1-10)' };
}

/**
 * Generate chart bars based on scale configuration
 */
export function generateChartBars(config: ScaleConfig): Array<{ range: string; score: number; count: number; color: string }> {
    const bars: Array<{ range: string; score: number; count: number; color: string }> = [];
    
    // Loop until we've covered the full range (don't include config.max as a start point)
    for (let i = config.min; i < config.max; i += config.interval) {
        const rangeStart = i;
        const rangeEnd = Math.min(i + config.interval - 1, config.max);
        
        // Format the range label
        let rangeLabel: string;
        if (config.interval === 1) {
            rangeLabel = rangeStart.toString();
        } else if (config.interval === 0.5) {
            rangeLabel = rangeStart.toString();
        } else {
            rangeLabel = `${rangeStart}-${rangeEnd}`;
        }
        
        bars.push({
            range: rangeLabel,
            score: rangeStart,
            count: 0,
            color: getScoreColor(rangeStart, config.max)
        });
    }
    
    return bars;
}

/**
 * Assign a score to the appropriate bar based on scale configuration
 */
export function assignScoreToBar(
    score: number, 
    bars: Array<{ range: string; score: number; count: number; color: string }>,
    config: ScaleConfig
): void {
    // Find the appropriate bar for this score
    const barIndex = bars.findIndex((bar, index) => {
        const barStart = bar.score;
        const barEnd = barStart + config.interval;
        const isLastBar = index === bars.length - 1;
        
        // For the last bar, include the max value
        if (isLastBar) {
            return score >= barStart && score <= config.max;
        }
        
        return score >= barStart && score < barEnd;
    });
    
    if (barIndex !== -1) {
        bars[barIndex].count++;
    } else {
        console.warn(`⚠️ Score ${score} could not be assigned to any bar. Config:`, config);
    }
}

/**
 * Get color for a score based on its position in the scale
 */
function getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 20) return '#EF4444';  // Red
    if (percentage < 40) return '#F97316';  // Orange
    if (percentage < 60) return '#EAB308';  // Yellow
    if (percentage < 80) return '#84CC16';  // Light green
    return '#22C55E';  // Green
}




