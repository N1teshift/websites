import React from 'react';
import { TestResultData } from '@math/types/testsTypes';
import MathItemsDisplay from '@/features/infrastructure/shared/components/ui/MathItemsDisplay';

export interface MathDisplayProps {
    result: TestResultData<Record<string, unknown>> | undefined;
    isCurrentRunningTest?: boolean;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ 
    result, 
    isCurrentRunningTest = false 
}) => {
    // Handle when there's no result yet
    if (!result) {
        return (
            <span className="text-gray-400 text-sm">
                {isCurrentRunningTest ? "Generating..." : ""}
            </span>
        );
    }
    
    // For failed tests, show error message above the math items (if any)
    if (!result.passed && result.error) {
        return (
            <div>
                <div className="text-red-600 mb-2">
                    <span className="font-medium">Error:</span> {result.error}
                </div>
                {result.mathItems && result.mathItems.length > 0 ? (
                    <MathItemsDisplay 
                        mathItems={result.mathItems}
                        fallbackMessage="No math items available"
                    />
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </div>
        );
    }
    
    // No math items to display
    if (!result.mathItems || result.mathItems.length === 0) {
        return <span className="text-gray-400">-</span>;
    }
    
    // Display math items
    return (
        <MathItemsDisplay 
            mathItems={result.mathItems}
            fallbackMessage="No math items available"
        />
    );
};

export default MathDisplay; 



