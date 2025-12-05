import React from 'react';
import { UnitPlanData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import UnifiedCurriculumTimeline from './contentDisplay/UnifiedCurriculumTimeline';
import { getBookByGrade } from '../../data/cambridgeLearnerBook';

interface ContentDisplaySectionProps {
    unitPlan: UnitPlanData;
}

const ContentDisplaySection: React.FC<ContentDisplaySectionProps> = ({ unitPlan }) => {
    const { t } = useFallbackTranslation();

    const isMathematicsYear2or3 = unitPlan.subject === 'mathematics' && (unitPlan.mypYear === 2 || unitPlan.mypYear === 3);

    if (!isMathematicsYear2or3) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-warning-50 border-l-4 border-warning-400 p-6 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg 
                                className="h-6 w-6 text-warning-400" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-warning-800">
                                {t('content_display_not_available_title')}
                            </h3>
                            <div className="mt-2 text-sm text-warning-700">
                                <p>
                                    {t('content_display_not_available_description')}
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="font-semibold">{t('current_settings')}:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>{t('subject')}: <span className="font-medium">{unitPlan.subject || t('not_selected')}</span></li>
                                        <li>{t('myp_year')}: <span className="font-medium">{unitPlan.mypYear || t('not_selected')}</span></li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">{t('required_settings')}:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>{t('subject')}: <span className="font-medium">Mathematics</span></li>
                                        <li>{t('myp_year')}: <span className="font-medium">2 or 3</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine which grade to show based on MYP year
    // MYP Year 2 = Grade 7, MYP Year 3 = Grade 8
    const displayGrade = unitPlan.mypYear === 2 ? 7 : 8;
    const cambridgeStage = displayGrade === 7 ? 8 : 9;
    const cambridgeBook = getBookByGrade(displayGrade);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('content_display_title')}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {t('content_display_description')} - MYP Year {unitPlan.mypYear} (Grade {displayGrade})
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">BUP: Grade {displayGrade}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            Cambridge: Stage {cambridgeStage}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {/* Unified Timeline View */}
                    {cambridgeBook && cambridgeBook.units.length > 0 && cambridgeBook.modules.length > 0 ? (
                        <>
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-2 border-gray-300 rounded-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    📚 {t('curriculum_comparison_title')}
                                </h3>
                                <p className="text-sm text-gray-700">
                                    {t('curriculum_comparison_description')}
                                </p>
                            </div>

                            <UnifiedCurriculumTimeline
                                bupGrade={displayGrade}
                                cambridgeBook={cambridgeBook}
                            />

                            {/* Connection Info */}
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <h4 className="font-semibold text-amber-900 mb-2">💡 {t('how_connections_work')}</h4>
                                <p className="text-sm text-amber-800">
                                    {t('connections_description')}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('cambridge_curriculum_title')}
                            </h3>
                            <p className="text-gray-600">
                                {t('cambridge_book_not_available')} Stage {cambridgeStage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentDisplaySection;




