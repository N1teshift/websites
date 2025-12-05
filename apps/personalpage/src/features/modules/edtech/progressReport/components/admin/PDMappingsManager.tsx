/**
 * PD Mappings Manager Component
 * Interface for viewing and managing PD assessment mappings to Cambridge objectives
 */

import React, { useState, useMemo } from 'react';
import { PD_MAPPINGS } from '@progressReport/student-data/config/pdKdMappings';

export const PDMappingsManager: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPD, setExpandedPD] = useState<string | null>(null);

    // Convert PD_MAPPINGS to array for display
    const mappingsArray = useMemo(() => {
        return Object.entries(PD_MAPPINGS).map(([pd, objectives]) => ({
            pdNumber: pd,
            objectives,
            objectiveCount: objectives.length
        }));
    }, []);

    // Filter mappings
    const filteredMappings = useMemo(() => {
        if (!searchQuery.trim()) return mappingsArray;

        const query = searchQuery.toLowerCase();
        return mappingsArray.filter(({ pdNumber, objectives }) => {
            const pdMatch = pdNumber.toLowerCase().includes(query);
            const objectivesMatch = objectives.some(obj => obj.toLowerCase().includes(query));
            return pdMatch || objectivesMatch;
        });
    }, [mappingsArray, searchQuery]);

    const toggleExpand = (pd: string) => {
        setExpandedPD(expandedPD === pd ? null : pd);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📋 PD Assessment Mappings
                </h2>
                <p className="text-gray-600">
                    View mappings between PD (Papildomas Darbas) assessments and Cambridge learning objectives
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">
                        {mappingsArray.length}
                    </div>
                    <div className="text-sm text-gray-600">Total PD Assessments</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">
                        {new Set(mappingsArray.flatMap(m => m.objectives)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Objectives</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">
                        {(mappingsArray.reduce((sum, m) => sum + m.objectiveCount, 0) / mappingsArray.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Objectives per PD</div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search PD or Objective Code
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., PD1, 9Ni.01, PD15..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {filteredMappings.length !== mappingsArray.length && (
                    <p className="text-sm text-gray-500 mt-2">
                        Showing {filteredMappings.length} of {mappingsArray.length} mappings
                    </p>
                )}
            </div>

            {/* Mappings List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        PD Mappings
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredMappings.map(({ pdNumber, objectives, objectiveCount }) => (
                        <div key={pdNumber} className="hover:bg-gray-50">
                            <button
                                onClick={() => toggleExpand(pdNumber)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="font-mono font-semibold text-blue-600 text-lg">
                                        {pdNumber}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {objectiveCount} objective{objectiveCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${
                                        expandedPD === pdNumber ? 'transform rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedPD === pdNumber && (
                                <div className="px-4 pb-4 bg-gray-50">
                                    <div className="space-y-2">
                                        {objectives.map(objective => (
                                            <div
                                                key={objective}
                                                className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                                            >
                                                <span className="font-mono text-gray-900 font-medium">
                                                    {objective}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Cambridge Objective
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-sm text-blue-900">
                                            <strong>Usage:</strong> When students complete {pdNumber} assessment,
                                            their scores will automatically update{' '}
                                            {objectiveCount === 1 ? 'this objective' : 'these objectives'} and
                                            any related missions.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* No Results */}
            {filteredMappings.length === 0 && (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Mappings Found
                    </h3>
                    <p className="text-gray-600">
                        Try a different search term
                    </p>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                    📌 About PD Mappings
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• PD mappings are <strong>global</strong> - each PD number tests the same objectives for all students</li>
                    <li>• Mappings are defined in <code className="bg-yellow-100 px-1 rounded">pdKdMappings.ts</code></li>
                    <li>• When Excel data is imported with PD columns, objectives and missions auto-update</li>
                    <li>• Format in Excel: <code className="bg-yellow-100 px-1 rounded">PD3_2025-10-21</code>, <code className="bg-yellow-100 px-1 rounded">PD3 P_2025-10-21</code>, etc.</li>
                </ul>
            </div>
        </div>
    );
};




