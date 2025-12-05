import React from 'react';
import { UnitPlanData } from '../../types/UnitPlanTypes';
import { calculateOverallProgress, getSectionProgress } from '../../utils/progressTracker';
import { isFeatureEnabled } from '@/config/features';

interface ProgressBarProps {
    unitPlan: Partial<UnitPlanData>;
    showPercentage?: boolean;
    showSectionBreakdown?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    unitPlan,
    showPercentage = true,
    showSectionBreakdown = false
}) => {
    // Hide progress UI when feature flag is disabled
    if (!isFeatureEnabled('fieldCompletion')) return null;

    const overallProgress = calculateOverallProgress(unitPlan);
    const sectionProgress = getSectionProgress(unitPlan);
    
    // Get progress color based on percentage
    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-blue-500';
        if (progress >= 40) return 'bg-yellow-500';
        if (progress >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };
    
    // Get progress text color
    const getTextColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 60) return 'text-blue-600';
        if (progress >= 40) return 'text-yellow-600';
        if (progress >= 20) return 'text-orange-600';
        return 'text-red-600';
    };
    
    // Get progress status text
    const getProgressStatus = (progress: number) => {
        if (progress >= 90) return 'Almost complete!';
        if (progress >= 75) return 'Great progress!';
        if (progress >= 50) return 'Good progress';
        if (progress >= 25) return 'Getting started';
        return 'Just beginning';
    };

    return (
        <div className="bg-surface-card border-b-2 border-border-default px-6 py-4">
            <div className="max-w-7xl mx-auto">
                {/* Main progress bar */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getProgressColor(overallProgress)} shadow-soft animate-pulse`}></div>
                            <span className={`text-sm font-semibold ${getTextColor(overallProgress)}`}>
                                {getProgressStatus(overallProgress)}
                            </span>
                        </div>
                        {showPercentage && (
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getTextColor(overallProgress)} bg-opacity-10`}
                                style={{backgroundColor: getProgressColor(overallProgress).includes('green') ? '#22c55e20' : 
                                                        getProgressColor(overallProgress).includes('blue') ? '#3b82f620' :
                                                        getProgressColor(overallProgress).includes('yellow') ? '#f59e0b20' : 
                                                        getProgressColor(overallProgress).includes('orange') ? '#f9731620' : '#ef444420'}}>
                                {overallProgress}% Complete
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-surface-button rounded-full h-3 shadow-inner-soft overflow-hidden">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(overallProgress)} shadow-soft`}
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                
                {/* Section breakdown (optional) */}
                {showSectionBreakdown && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(sectionProgress).map(([section, progress]) => (
                            <div key={section} className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getProgressColor(progress)}`}></div>
                                <span className="text-text-secondary capitalize">
                                    {section.replace('-', ' ')}: {progress}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressBar;



