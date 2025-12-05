import React, { useState, useMemo } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { StudentData } from '../../types/ProgressReportTypes';
import { getUniqueAssessments } from '../../utils/assessmentColumnUtils';

export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    tooltip?: {
        fullTitle: string;
        date?: string;
        description?: string;
    };
}

interface ColumnCustomizerProps {
    columns: ColumnConfig[];
    onChange: (columns: ColumnConfig[]) => void;
}

interface ColumnCategoryShortcutsProps {
    columns: ColumnConfig[];
    onChange: (columns: ColumnConfig[]) => void;
    students: StudentData[];
}

// Helper function to extract base assessment ID from column ID
const getBaseAssessmentId = (columnId: string): string => {
    // English test sub-columns (must be checked first as they're more specific)
    // Diagnostic test components: -paper1, -paper2, -paper3, -paper1-percent, etc.
    // Unit test components: -lis1, -lis2, -read, -voc1, -voc2, -gr1, -gr2, -gr3, -total, -percent
    const englishTestPatterns = [
        '-paper1-percent', '-paper2-percent', '-paper3-percent',
        '-paper1', '-paper2', '-paper3',
        '-lis1', '-lis2', '-read', 
        '-voc1', '-voc2', 
        '-gr1', '-gr2', '-gr3',
        '-total', '-percent'
    ];
    
    for (const pattern of englishTestPatterns) {
        if (columnId.endsWith(pattern)) {
            return columnId.slice(0, -pattern.length);
        }
    }
    
    // Multi-score columns have suffixes like: -percentage, -myp, -cambridge-1, -cambridge-2, -cambridge
    if (columnId.endsWith('-percentage')) {
        return columnId.slice(0, -11);
    } else if (columnId.endsWith('-cambridge-1')) {
        return columnId.slice(0, -12);
    } else if (columnId.endsWith('-cambridge-2')) {
        return columnId.slice(0, -12);
    } else if (columnId.endsWith('-cambridge')) {
        return columnId.slice(0, -10);
    } else if (columnId.endsWith('-myp')) {
        return columnId.slice(0, -4);
    }
    return columnId;
};

const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
    columns,
    onChange
}) => {
    const { t } = useFallbackTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (columnId: string) => {
        const updated = columns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        );
        onChange(updated);
    };

    const visibleCount = columns.filter(c => c.visible).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {t('columns').charAt(0).toUpperCase() + t('columns').slice(1)} ({visibleCount}/{columns.length})
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="p-3 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">
                                {t('customize_columns').charAt(0).toUpperCase() + t('customize_columns').slice(1)}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{t('show_or_hide_table_columns')}</p>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto p-2">
                            {columns.map(column => (
                                <label
                                    key={column.id}
                                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={column.visible}
                                        onChange={() => handleToggle(column.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{column.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="p-3 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={() => {
                                    const allVisible = columns.map(c => ({ ...c, visible: true }));
                                    onChange(allVisible);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                {t('show_all').charAt(0).toUpperCase() + t('show_all').slice(1)}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-gray-600 hover:text-gray-800"
                            >
                                {t('close').charAt(0).toUpperCase() + t('close').slice(1)}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export const ColumnCategoryShortcuts: React.FC<ColumnCategoryShortcutsProps> = ({
    columns,
    onChange,
    students
}) => {
    // Get assessment type mappings
    const assessmentTypeMap = useMemo(() => {
        const assessments = getUniqueAssessments(students, ['summative', 'homework', 'homework_graded', 'homework_reflection', 'test', 'classwork', 'board_solving', 'consultation', 'diagnostic']);
        const map = new Map<string, string>();
        
        assessments.forEach(assessment => {
            map.set(assessment.id, assessment.type);
        });
        
        return map;
    }, [students]);

    // Categorize columns by assessment type
    const categorizedColumns = useMemo(() => {
        const homework: string[] = [];
        const classwork: string[] = [];
        const summative: string[] = [];
        const test: string[] = [];
        const boardSolving: string[] = [];
        const consultation: string[] = [];
        const diagnostic: string[] = [];
        
        columns.forEach(col => {
            // Skip name and assessments columns
            if (col.id === 'name' || col.id === 'assessments') return;
            
            // Extract base assessment ID (remove score type suffixes)
            const baseId = getBaseAssessmentId(col.id);
            const assessmentType = assessmentTypeMap.get(baseId);
            
            if (assessmentType === 'homework' || assessmentType === 'homework_graded' || assessmentType === 'homework_reflection') {
                homework.push(col.id);
            } else if (assessmentType === 'classwork') {
                classwork.push(col.id);
            } else if (assessmentType === 'summative') {
                summative.push(col.id);
            } else if (assessmentType === 'test') {
                test.push(col.id);
            } else if (assessmentType === 'board_solving') {
                boardSolving.push(col.id);
            } else if (assessmentType === 'consultation') {
                consultation.push(col.id);
            } else if (assessmentType === 'diagnostic') {
                diagnostic.push(col.id);
            }
        });
        
        return { homework, classwork, summative, test, boardSolving, consultation, diagnostic };
    }, [columns, assessmentTypeMap]);

    // Check if categories are visible
    const categoryVisibility = useMemo(() => {
        const getVisibilityState = (categoryColumns: string[]) => {
            if (categoryColumns.length === 0) return 'none';
            const visibleCount = categoryColumns.filter(colId => 
                columns.find(col => col.id === colId)?.visible
            ).length;
            if (visibleCount === 0) return 'hidden';
            if (visibleCount === categoryColumns.length) return 'visible';
            return 'partial';
        };

        return {
            homework: getVisibilityState(categorizedColumns.homework),
            classwork: getVisibilityState(categorizedColumns.classwork),
            summative: getVisibilityState(categorizedColumns.summative),
            test: getVisibilityState(categorizedColumns.test),
            boardSolving: getVisibilityState(categorizedColumns.boardSolving),
            consultation: getVisibilityState(categorizedColumns.consultation),
            diagnostic: getVisibilityState(categorizedColumns.diagnostic)
        };
    }, [columns, categorizedColumns]);

    const handleToggleCategory = (category: 'homework' | 'classwork' | 'summative' | 'test' | 'boardSolving' | 'consultation' | 'diagnostic') => {
        const categoryColumns = categorizedColumns[category];
        const currentState = categoryVisibility[category];
        
        // Toggle: if all visible or partial -> hide all, if hidden -> show all
        const shouldShow = currentState === 'hidden';
        
        const updated = columns.map(col =>
            categoryColumns.includes(col.id) ? { ...col, visible: shouldShow } : col
        );
        onChange(updated);
    };

    // Don't render if no categories have columns
    if (categorizedColumns.homework.length === 0 && 
        categorizedColumns.classwork.length === 0 && 
        categorizedColumns.summative.length === 0 &&
        categorizedColumns.test.length === 0 &&
        categorizedColumns.boardSolving.length === 0 &&
        categorizedColumns.consultation.length === 0 &&
        categorizedColumns.diagnostic.length === 0) {
        return null;
    }

    const getCategoryStyle = (state: string) => {
        switch (state) {
            case 'visible':
                return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-md hover:shadow-lg';
            case 'partial':
                return 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500 shadow-md hover:shadow-lg';
            case 'hidden':
                return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
            default:
                return '';
        }
    };

    const getCategoryIcon = (state: string) => {
        switch (state) {
            case 'visible':
                return '👁️';
            case 'partial':
                return '◐';
            case 'hidden':
                return '○';
            default:
                return '';
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {categorizedColumns.homework.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('homework')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.homework)}
                    `}
                    title={`${categoryVisibility.homework === 'hidden' ? 'Show' : 'Hide'} all homework columns (${categorizedColumns.homework.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.homework)}</span>
                    <span>HW</span>
                </button>
            )}
            {categorizedColumns.classwork.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('classwork')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.classwork)}
                    `}
                    title={`${categoryVisibility.classwork === 'hidden' ? 'Show' : 'Hide'} all classwork columns (${categorizedColumns.classwork.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.classwork)}</span>
                    <span>CW</span>
                </button>
            )}
            {categorizedColumns.summative.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('summative')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.summative)}
                    `}
                    title={`${categoryVisibility.summative === 'hidden' ? 'Show' : 'Hide'} all summative columns (${categorizedColumns.summative.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.summative)}</span>
                    <span>Sum</span>
                </button>
            )}
            {categorizedColumns.test.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('test')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.test)}
                    `}
                    title={`${categoryVisibility.test === 'hidden' ? 'Show' : 'Hide'} all test columns (${categorizedColumns.test.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.test)}</span>
                    <span>Test</span>
                </button>
            )}
            {categorizedColumns.diagnostic.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('diagnostic')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.diagnostic)}
                    `}
                    title={`${categoryVisibility.diagnostic === 'hidden' ? 'Show' : 'Hide'} all diagnostic columns (${categorizedColumns.diagnostic.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.diagnostic)}</span>
                    <span>Diag</span>
                </button>
            )}
            {categorizedColumns.boardSolving.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('boardSolving')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.boardSolving)}
                    `}
                    title={`${categoryVisibility.boardSolving === 'hidden' ? 'Show' : 'Hide'} all board solving columns (${categorizedColumns.boardSolving.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.boardSolving)}</span>
                    <span>Board</span>
                </button>
            )}
            {categorizedColumns.consultation.length > 0 && (
                <button
                    onClick={() => handleToggleCategory('consultation')}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 
                        text-xs font-semibold rounded-lg border-2 
                        transition-all duration-200 transform hover:scale-105
                        ${getCategoryStyle(categoryVisibility.consultation)}
                    `}
                    title={`${categoryVisibility.consultation === 'hidden' ? 'Show' : 'Hide'} all consultation columns (${categorizedColumns.consultation.length})`}
                >
                    <span>{getCategoryIcon(categoryVisibility.consultation)}</span>
                    <span>Cons</span>
                </button>
            )}
        </div>
    );
};

export default ColumnCustomizer;




