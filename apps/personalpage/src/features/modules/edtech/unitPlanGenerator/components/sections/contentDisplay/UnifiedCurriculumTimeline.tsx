import React, { useState } from 'react';
import { BUP_CURRICULUM, BUPGrade, BUPModule } from '../../../data/curriculumBUP';
import { BookStage, BookModule } from '../../../data/cambridgeLearnerBook';

interface UnifiedCurriculumTimelineProps {
    bupGrade: number;
    cambridgeBook: BookStage;
}

const UnifiedCurriculumTimeline: React.FC<UnifiedCurriculumTimelineProps> = ({
    bupGrade,
    cambridgeBook
}) => {
    const [expandedBUPModules, setExpandedBUPModules] = useState<Set<string>>(new Set());
    const [expandedBUPUnits, setExpandedBUPUnits] = useState<Set<string>>(new Set());
    const [expandedCambridgeModules, setExpandedCambridgeModules] = useState<Set<string>>(new Set());
    const [expandedCambridgeUnits, setExpandedCambridgeUnits] = useState<Set<string>>(new Set());

    const bupData: BUPGrade | undefined = BUP_CURRICULUM.find(g => g.grade === bupGrade);

    const toggleBUPModule = (moduleId: string) => {
        setExpandedBUPModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const toggleBUPUnit = (unitId: string) => {
        setExpandedBUPUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    const toggleCambridgeModule = (moduleId: string) => {
        setExpandedCambridgeModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const toggleCambridgeUnit = (unitId: string) => {
        setExpandedCambridgeUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    if (!bupData) {
        return <div>No BUP data available for grade {bupGrade}</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BUP Timeline */}
            <div className="space-y-4">
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg border-2 border-blue-300 shadow-sm">
                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <span>🇱🇹</span>
                        <span>BUP - Grade {bupGrade}</span>
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Lithuanian National Curriculum • {bupData.modules.length} modules
                    </p>
                </div>

                <div className="space-y-3">
                    {bupData.modules.map((curriculumModule: BUPModule, moduleIdx: number) => {
                        const isModuleExpanded = expandedBUPModules.has(curriculumModule.id);
                        
                        return (
                            <div
                                key={curriculumModule.id}
                                className="border-2 border-blue-300 bg-blue-50 rounded-lg overflow-hidden shadow-sm"
                            >
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleBUPModule(curriculumModule.id)}
                                    className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                                                Module {moduleIdx + 1}
                                            </span>
                                            <span className="text-xs text-blue-700">
                                                {curriculumModule.units.length} {curriculumModule.units.length === 1 ? 'unit' : 'units'}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-blue-900">
                                            {curriculumModule.name}
                                        </h4>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 flex-shrink-0 ml-2 transition-transform ${
                                            isModuleExpanded ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Units */}
                                {isModuleExpanded && (
                                    <div className="border-t-2 border-blue-200 bg-white">
                                        <div className="p-3 space-y-2">
                                            {curriculumModule.units.map(unit => {
                                                const isUnitExpanded = expandedBUPUnits.has(unit.id);
                                                
                                                return (
                                                    <div
                                                        key={unit.id}
                                                        className="border border-blue-200 rounded bg-blue-50"
                                                    >
                                                        {/* Unit Header */}
                                                        <button
                                                            onClick={() => toggleBUPUnit(unit.id)}
                                                            className="w-full px-3 py-2 flex items-start justify-between text-left hover:bg-blue-100 transition-colors"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-semibold text-blue-700">
                                                                        Unit
                                                                    </span>
                                                                    <span className="text-xs text-blue-600">
                                                                        {unit.subunits.length} subunits
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-semibold text-blue-900">
                                                                    {unit.name}
                                                                </p>
                                                            </div>
                                                            <svg
                                                                className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${
                                                                    isUnitExpanded ? 'rotate-180' : ''
                                                                }`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                        {/* Subunits */}
                                                        {isUnitExpanded && (
                                                            <div className="border-t border-blue-200 bg-white">
                                                                <div className="p-2 space-y-1">
                                                                    {unit.subunits.map(subunit => (
                                                                        <div
                                                                            key={subunit.id}
                                                                            className="p-2 bg-white border border-blue-100 rounded text-xs hover:shadow-sm transition-shadow"
                                                                        >
                                                                            <p className="font-semibold text-blue-900 mb-1">
                                                                                {subunit.name}
                                                                            </p>
                                                                            <p className="text-gray-700 text-xs line-clamp-2">
                                                                                {subunit.sentences.slice(0, 2).join(' ')}
                                                                            </p>
                                                                            {subunit.sentences.length > 2 && (
                                                                                <p className="text-gray-500 italic text-xs mt-1">
                                                                                    +{subunit.sentences.length - 2} more sentences...
                                                                                </p>
                                                                            )}
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
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cambridge Timeline */}
            <div className="space-y-4">
                <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 rounded-lg border-2 border-green-300 shadow-sm">
                    <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
                        <span>🌍</span>
                        <span>Cambridge - Stage {cambridgeBook.stage}</span>
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                        Lower Secondary Mathematics • {cambridgeBook.modules.length} modules
                    </p>
                </div>

                <div className="space-y-3">
                    {cambridgeBook.modules.map((bookModule: BookModule) => {
                        const isModuleExpanded = expandedCambridgeModules.has(bookModule.id);
                        const moduleUnits = cambridgeBook.units.filter(u => 
                            bookModule.unitIds.includes(u.id)
                        );
                        
                        return (
                            <div
                                key={bookModule.id}
                                className="border-2 border-green-300 bg-green-50 rounded-lg overflow-hidden shadow-sm"
                            >
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleCambridgeModule(bookModule.id)}
                                    className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-200 text-green-900">
                                                Module {bookModule.moduleNumber}
                                            </span>
                                            <span className="text-xs text-green-700">
                                                {moduleUnits.length} {moduleUnits.length === 1 ? 'unit' : 'units'}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-green-900">
                                            {bookModule.name}
                                        </h4>
                                        {bookModule.description && (
                                            <p className="text-xs text-green-700 mt-1">
                                                {bookModule.description}
                                            </p>
                                        )}
                                    </div>
                                    <svg
                                        className={`w-5 h-5 flex-shrink-0 ml-2 transition-transform ${
                                            isModuleExpanded ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Units */}
                                {isModuleExpanded && (
                                    <div className="border-t-2 border-green-200 bg-white">
                                        <div className="p-3 space-y-2">
                                            {moduleUnits.map(unit => {
                                                const isUnitExpanded = expandedCambridgeUnits.has(unit.id);
                                                
                                                return (
                                                    <div
                                                        key={unit.id}
                                                        className="border border-green-200 rounded bg-green-50"
                                                    >
                                                        {/* Unit Header */}
                                                        <button
                                                            onClick={() => toggleCambridgeUnit(unit.id)}
                                                            className="w-full px-3 py-2 flex items-start justify-between text-left hover:bg-green-100 transition-colors"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-semibold text-green-700">
                                                                        Unit {unit.unitNumber}
                                                                    </span>
                                                                    <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-800 rounded">
                                                                        {unit.strand}
                                                                    </span>
                                                                    <span className="text-xs text-green-600">
                                                                        pp. {unit.pages}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-semibold text-green-900">
                                                                    {unit.title}
                                                                </p>
                                                                <p className="text-xs text-green-700 mt-1">
                                                                    {unit.subsections.length} sections
                                                                </p>
                                                            </div>
                                                            <svg
                                                                className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${
                                                                    isUnitExpanded ? 'rotate-180' : ''
                                                                }`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                        {/* Subsections */}
                                                        {isUnitExpanded && (
                                                            <div className="border-t border-green-200 bg-white">
                                                                <div className="p-2 space-y-1">
                                                                    {unit.subsections.map(subsection => (
                                                                        <div
                                                                            key={subsection.id}
                                                                            className="p-2 bg-white border border-green-100 rounded text-xs hover:shadow-sm transition-shadow"
                                                                        >
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="flex-shrink-0 text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                                    {subsection.code}
                                                                                </span>
                                                                                <div className="flex-1">
                                                                                    <p className="font-semibold text-green-900">
                                                                                        {subsection.title}
                                                                                    </p>
                                                                                    {subsection.objectiveIds && subsection.objectiveIds.length > 0 && (
                                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                                            {subsection.objectiveIds.map(objId => (
                                                                                                <span
                                                                                                    key={objId}
                                                                                                    className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-300"
                                                                                                >
                                                                                                    {objId.split('-').pop()}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
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
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UnifiedCurriculumTimeline;






