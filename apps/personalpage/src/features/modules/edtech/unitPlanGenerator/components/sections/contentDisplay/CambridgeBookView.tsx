import React, { useState } from 'react';
import { BookStage, BookUnit } from '../../../data/cambridgeLearnerBook';

interface CambridgeBookViewProps {
    title: string;
    description: string;
    book: BookStage;
}

const CambridgeBookView: React.FC<CambridgeBookViewProps> = ({ 
    title, 
    description, 
    book 
}) => {
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    // Get strand color and icon
    const getStrandColor = (strand: string) => {
        switch (strand) {
            case 'Number':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-300',
                    text: 'text-blue-700',
                    badge: 'bg-blue-100 text-blue-700',
                    icon: '🔢'
                };
            case 'Algebra':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-300',
                    text: 'text-purple-700',
                    badge: 'bg-purple-100 text-purple-700',
                    icon: '📐'
                };
            case 'Geometry and measure':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-300',
                    text: 'text-green-700',
                    badge: 'bg-green-100 text-green-700',
                    icon: '📏'
                };
            case 'Statistics and probability':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-300',
                    text: 'text-orange-700',
                    badge: 'bg-orange-100 text-orange-700',
                    icon: '📊'
                };
            case 'Project':
                return {
                    bg: 'bg-pink-50',
                    border: 'border-pink-300',
                    text: 'text-pink-700',
                    badge: 'bg-pink-100 text-pink-700',
                    icon: '🎯'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-300',
                    text: 'text-gray-700',
                    badge: 'bg-gray-100 text-gray-700',
                    icon: '📖'
                };
        }
    };

    // Filter out non-content units (intro, acknowledgements)
    const contentUnits = book.units.filter(unit => unit.unitNumber > 0);

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-700 mt-1">{description}</p>
                <p className="text-xs text-gray-600 mt-1">
                    {book.title} • {contentUnits.length} units
                </p>
            </div>

            <div className="p-4 space-y-3">
                {contentUnits.map((unit: BookUnit) => {
                    const isExpanded = expandedUnits.has(unit.id);
                    const strandStyle = getStrandColor(unit.strand);
                    const hasSubsections = unit.subsections.length > 0;

                    return (
                        <div
                            key={unit.id}
                            className={`border-2 ${strandStyle.border} ${strandStyle.bg} rounded-lg overflow-hidden transition-all`}
                        >
                            {/* Unit Header */}
                            <button
                                onClick={() => hasSubsections && toggleUnit(unit.id)}
                                className={`w-full px-4 py-3 flex items-start justify-between text-left hover:opacity-80 transition-opacity ${
                                    !hasSubsections ? 'cursor-default' : ''
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${strandStyle.badge}`}>
                                            Unit {unit.unitNumber}
                                        </span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${strandStyle.badge}`}>
                                            {strandStyle.icon} {unit.strand}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            pp. {unit.pages}
                                        </span>
                                    </div>
                                    <h4 className={`text-base font-bold ${strandStyle.text}`}>
                                        {unit.title}
                                    </h4>
                                    {hasSubsections && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            {unit.subsections.length} {unit.subsections.length === 1 ? 'section' : 'sections'}
                                        </p>
                                    )}
                                </div>
                                {hasSubsections && (
                                    <div className="ml-2 flex-shrink-0">
                                        <svg
                                            className={`w-5 h-5 transition-transform ${
                                                isExpanded ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            {/* Subsections */}
                            {isExpanded && hasSubsections && (
                                <div className="border-t-2 border-white bg-white bg-opacity-60">
                                    <div className="px-4 py-3 space-y-2">
                                        {unit.subsections.map((subsection) => (
                                            <div
                                                key={subsection.id}
                                                className="flex items-start gap-3 p-2 bg-white rounded border border-gray-200 hover:shadow-sm transition-shadow"
                                            >
                                                <span className="flex-shrink-0 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {subsection.code}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {subsection.title}
                                                    </p>
                                                    {subsection.objectiveIds && subsection.objectiveIds.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {subsection.objectiveIds.map(objId => (
                                                                <span
                                                                    key={objId}
                                                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-300"
                                                                >
                                                                    {objId.split('-').pop()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CambridgeBookView;






