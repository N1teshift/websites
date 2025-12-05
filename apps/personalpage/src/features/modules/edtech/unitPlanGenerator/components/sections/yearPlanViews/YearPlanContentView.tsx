import React, { useState } from 'react';
import { UnitPlanDocument, SubunitData } from '../../../types/UnitPlanTypes';

interface YearPlanContentViewProps {
    unitPlans: UnitPlanDocument[];
    onUpdateSubunit: (planId: string, subunitIndex: number, field: keyof SubunitData, value: string | number) => void;
    onAddSubunit: (planId: string) => void;
    onRemoveSubunit: (planId: string, subunitIndex: number) => void;
}

const YearPlanContentView: React.FC<YearPlanContentViewProps> = ({
    unitPlans,
    onUpdateSubunit,
    onAddSubunit,
    onRemoveSubunit
}) => {
    const [editingCell, setEditingCell] = useState<{ planId: string; subunitIndex: number; field: 'subunitName' | 'lessonsPerSubunit' } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const handleStartEdit = (planId: string, subunitIndex: number, field: 'subunitName' | 'lessonsPerSubunit', currentValue: string | number) => {
        setEditingCell({ planId, subunitIndex, field });
        setEditValue(String(currentValue));
    };

    const handleFinishEdit = () => {
        if (editingCell) {
            const { planId, subunitIndex, field } = editingCell;
            if (field === 'lessonsPerSubunit') {
                const numValue = parseInt(editValue, 10);
                if (!isNaN(numValue) && numValue > 0) {
                    onUpdateSubunit(planId, subunitIndex, field, numValue);
                }
            } else {
                if (editValue.trim()) {
                    onUpdateSubunit(planId, subunitIndex, field, editValue.trim());
                }
            }
        }
        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFinishEdit();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
            setEditValue('');
        }
    };

    const getTotalLessons = (subunits: SubunitData[]): number => {
        return subunits.reduce((total, subunit) => total + subunit.lessonsPerSubunit, 0);
    };

    // Sort units by unitOrder (if defined), then by name
    const sortedUnitPlans = [...unitPlans].sort((a, b) => {
        const orderA = (a.data.unitOrder && a.data.unitOrder > 0) ? a.data.unitOrder : Infinity;
        const orderB = (b.data.unitOrder && b.data.unitOrder > 0) ? b.data.unitOrder : Infinity;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // If orders are equal (or both undefined), sort by name
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    📚 Year Plan View - Content Structure
                </h2>
                <p className="text-text-secondary mb-6">
                    View and edit all unit sections and lesson counts across your entire year plan. 
                    Click on any section name or lesson count to edit it inline.
                </p>
            </div>

            <div className="space-y-4">
                {sortedUnitPlans.map((plan) => {
                    const totalLessons = getTotalLessons(plan.data.subunits);
                    
                    return (
                        <div 
                            key={plan.id}
                            className="bg-surface-card border-2 border-border-default rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Unit Header */}
                            <div className="bg-surface-button px-6 py-4 border-b-2 border-border-default">
                                <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                {plan.data.unitOrder && (
                                    <div className="flex-shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold text-lg">
                                        {plan.data.unitOrder}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-text-primary">
                                        {plan.data.unitTitle || 'Untitled Unit'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {plan.data.subject} • {plan.data.academicYear}
                                    </p>
                                </div>
                            </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-brand">
                                            {totalLessons}
                                        </div>
                                        <div className="text-xs text-text-muted uppercase tracking-wide">
                                            Total Lessons
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subunits/Sections List */}
                            <div className="divide-y divide-border-default">
                                {plan.data.subunits.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-text-muted">
                                        <svg className="mx-auto h-12 w-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm">No sections added yet</p>
                                    </div>
                                ) : (
                                    plan.data.subunits.map((subunit, index) => {
                                        const isEditingName = editingCell?.planId === plan.id && 
                                                             editingCell?.subunitIndex === index && 
                                                             editingCell?.field === 'subunitName';
                                        const isEditingLessons = editingCell?.planId === plan.id && 
                                                                editingCell?.subunitIndex === index && 
                                                                editingCell?.field === 'lessonsPerSubunit';

                                        return (
                                            <div 
                                                key={index}
                                                className="px-6 py-4 hover:bg-surface-button-hover transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Section Number */}
                                                    <div className="flex-shrink-0 w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-brand">
                                                            {subunit.subunitNumber}
                                                        </span>
                                                    </div>

                                                    {/* Section Name - Editable */}
                                                    <div className="flex-1 min-w-0">
                                                        {isEditingName ? (
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={handleFinishEdit}
                                                                onKeyDown={handleKeyDown}
                                                                className="w-full px-4 py-2.5 text-base font-medium bg-surface-card text-text-primary border-2 border-border-default rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand transition-all duration-200"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div 
                                                                onClick={() => handleStartEdit(plan.id, index, 'subunitName', subunit.subunitName)}
                                                                className="cursor-pointer hover:bg-surface-button-hover px-3 py-1 rounded transition-colors"
                                                                title="Click to edit section name"
                                                            >
                                                                <p className="text-base font-medium text-text-primary">
                                                                    {subunit.subunitName || <span className="text-text-muted italic">Click to add section name</span>}
                                                                </p>
                                                                {subunit.content && (
                                                                    <p className="text-sm text-text-muted mt-1 truncate">
                                                                        {subunit.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Lesson Count - Editable */}
                                                    <div className="flex-shrink-0">
                                                        {isEditingLessons ? (
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={handleFinishEdit}
                                                                onKeyDown={handleKeyDown}
                                                                className="w-20 px-4 py-2.5 text-center bg-surface-card text-text-primary font-bold border-2 border-border-default rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand transition-all duration-200"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div 
                                                                onClick={() => handleStartEdit(plan.id, index, 'lessonsPerSubunit', subunit.lessonsPerSubunit)}
                                                                className="cursor-pointer hover:bg-surface-button-hover px-4 py-2 rounded transition-colors text-center min-w-[80px]"
                                                                title="Click to edit lesson count"
                                                            >
                                                                <div className="text-xl font-bold text-text-primary">
                                                                    {subunit.lessonsPerSubunit}
                                                                </div>
                                                                <div className="text-xs text-text-muted uppercase">
                                                                    {subunit.lessonsPerSubunit === 1 ? 'lesson' : 'lessons'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Remove section "${subunit.subunitName || `Section ${subunit.subunitNumber}`}"?`)) {
                                                                onRemoveSubunit(plan.id, index);
                                                            }
                                                        }}
                                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-danger-500 hover:bg-surface-button-hover rounded"
                                                        title="Remove section"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Add Section Button */}
                                <div className="px-6 py-4 bg-surface-button">
                                    <button
                                        onClick={() => onAddSubunit(plan.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border-default rounded-lg text-text-muted hover:border-brand hover:text-brand hover:bg-surface-button-hover transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="font-medium">Add Section</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="bg-surface-card border-2 border-border-default rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Year Summary</h4>
                        <p className="text-2xl font-bold text-text-primary mt-1">
                            {unitPlans.length} {unitPlans.length === 1 ? 'Unit' : 'Units'}
                        </p>
                    </div>
                    <div className="text-right">
                        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Total Lessons</h4>
                        <p className="text-2xl font-bold text-brand mt-1">
                            {unitPlans.reduce((total, plan) => total + getTotalLessons(plan.data.subunits), 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearPlanContentView;




